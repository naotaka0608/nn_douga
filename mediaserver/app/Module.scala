import java.time.Clock

import com.google.inject.AbstractModule
import domain.repository.VideoRepository
import infrastructure.repository.VideoRepositoryImpl
import infrastructure.actor.VideoEncoder
import play.api.{Configuration, Environment}
import play.api.libs.concurrent.AkkaGuiceSupport

class Module(environment: Environment,
             configuration: Configuration) extends AbstractModule with AkkaGuiceSupport {

  override def configure() = {
    bind(classOf[Clock]).toInstance(Clock.systemUTC())
    bind(classOf[VideoRepository]).to(classOf[VideoRepositoryImpl])
    bindActor[VideoEncoder]("video-encoder")
  }
}