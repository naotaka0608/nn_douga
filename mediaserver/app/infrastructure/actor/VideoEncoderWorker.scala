package infrastructure.actor

import java.time.Clock

import akka.actor.Actor
import domain.entity.Video
import domain.repository.VideoRepository
import play.Logger
import play.api.Configuration

import scala.concurrent.ExecutionContext.Implicits.global

case class EncodeToH264ACC(video: Video)

case class ExtractAudio(video: Video)

case class Extract720Video(video: Video)

case class Extract360Video(video: Video)

case class EncodeToMpegDash(video: Video)

class VideoEncoderWorker(videoRepository: VideoRepository,
                         configuration: Configuration,
                         clock: Clock
                        ) extends Actor {

  override def receive = {
    case EncodeToH264ACC(video) => {
      Logger.debug(s"${self.path} : EncodeToH264ACC received! ${video}")
      self ! ExtractAudio(video)
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