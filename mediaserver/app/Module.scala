import java.time.Clock

import com.google.inject.AbstractModule
import domain.repository.VideoRepository
import infrastructure.repository.VideoRepositoryImpl
import play.api.{Configuration, Environment}

class Module(environment: Environment,
             configuration: Configuration) extends AbstractModule {

  override def configure() = {
    bind(classOf[Clock]).toInstance(Clock.systemUTC())
    bind(classOf[VideoRepository]).to(classOf[VideoRepositoryImpl])
  }
}