package infrastructure.actor

import java.nio.file.{FileSystems, Files}
import java.time.{Clock, LocalDateTime}

import akka.actor.Actor
import domain.entity.{Video, VideoStatus}
import domain.repository.VideoRepository
import play.Logger
import play.api.Configuration

import scala.concurrent.ExecutionContext.Implicits.global
import scala.sys.process.{Process, ProcessLogger}

case class EncodeToH264ACC(video: Video)

case class ExtractAudio(video: Video)

case class Extract720Video(video: Video)

case class Extract360Video(video: Video)

case class EncodeToMpegDash(video: Video)

class VideoEncoderWorker(videoRepository: VideoRepository,
                         configuration: Configuration,
                         clock: Clock
                        ) extends Actor {

  val originalStoreDirPath = configuration.get[String]("nnDouga.filesystem.original")
  val h264accStoreDirPath = configuration.get[String]("nnDouga.filesystem.h264acc")
  val mpegdashStoreDirPath = configuration.get[String]("nnDouga.filesystem.mpegdash")
  val dockerCommand = configuration.get[String]("nnDouga.dockerCommand")

  val processLogger = ProcessLogger(out => {
    Logger.debug(s"${self.path} out : ${out}")
  }, err =>{
    Logger.debug(s"${self.path} err : ${err}")
  })

  override def receive = {
    case EncodeToH264ACC(video) => {
      Logger.debug(s"${self.path} : EncodeToH264ACC received! ${video}")

      val startEncodingVideo = video.copy(status = VideoStatus.EncodingToH264ACC, updatedAt = LocalDateTime.now(clock))
      videoRepository.update(startEncodingVideo).failed.foreach {case e => Logger.debug(s"${self.path} DB Store failed. ${e}")}

      val originalFilepath =  FileSystems.getDefault.getPath(originalStoreDirPath, video.videoId).toString
      val h264accFilepath = FileSystems.getDefault.getPath(h264accStoreDirPath, video.videoId).toString + ".mp4"

      val args: Seq[String] = Seq(
        dockerCommand, "run","--rm", "-v", FileSystems.getDefault.getPath(".").toAbsolutePath.toString + ":/tmp/workdir",
        "jrottenberg/ffmpeg:3.3", "-i",
        originalFilepath,
        "-vcodec","libx264","-vb","448k","-r","30","-x264opts","no-scenecut","-g","15","-acodec","aac",
        "-strict","experimental","-ac","2","-ab","128k","-frag_duration","5000000","-movflags","empty_moov",
        h264accFilepath)

      val processH264ACC = Process(args)
      Logger.debug(s"start processH264ACC: ${processH264ACC}")
      processH264ACC !< processLogger

      if (Files.exists(FileSystems.getDefault.getPath(h264accFilepath))) {
        val encodedVideo = video.copy(status = VideoStatus.ExtractingAudio, updatedAt = LocalDateTime.now(clock))
        val future = videoRepository.update(encodedVideo)
        future.foreach { case () => self ! ExtractAudio(encodedVideo)}
        future.failed.foreach { case e => Logger.debug(s"${self.path} DB Store failed. ${e}")}
      } else {
        val failedVideo = video.copy(status = VideoStatus.FailedInEncodingToH264ACC, updatedAt = LocalDateTime.now(clock))
        videoRepository.update(failedVideo).failed.foreach {case e => Logger.debug(s"${self.path} DB Store failed. ${e}")}
      }
    }
    case ExtractAudio(video) => {
      Logger.debug(s"${self.path} : ExtractAudio received! ${video}")
      self ! Extract720Video(video)
    }
    case Extract720Video(video) => {
      Logger.debug(s"${self.path} : Extract720Video received! ${video}")
      self ! Extract360Video(video)
    }
    case Extract360Video(video) => {
      Logger.debug(s"${self.path} : Extract360Video received! ${video}")
      self ! EncodeToMpegDash(video)
    }
    case EncodeToMpegDash(video) => {
      Logger.debug(s"${self.path} : EncodeToMpegDash recieved! ${video}")
    }
  }
}