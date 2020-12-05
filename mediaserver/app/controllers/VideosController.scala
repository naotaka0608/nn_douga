package controllers

import javax.inject._
import play.api.Configuration
import play.api.mvc._
import play.api.libs.json.Json

import pdi.jwt.{Jwt, JwtAlgorithm}

import scala.util.Success
import scala.concurrent.Future

@Singleton
class VideosController @Inject()(cc: ControllerComponents,
                                 configuration: Configuration) extends AbstractController(cc) {

  val secret = configuration.get[String]("nnDouga.secret")

  val originalStoreDirPath = configuration.get[String]("nnDouga.filesystem.original")

  def post() = Action.async { implicit request: Request[AnyContent] =>
    request.body.asMultipartFormData match {
      case Some(form) =>
        (form.file("file"), form.dataParts.get("apiToken")) match {
          case (Some(file), Some(Seq(apiToken))) =>
            val decoded = Jwt.decodeRawAll(apiToken, secret, Seq(JwtAlgorithm.HS256))
            (file.contentType, decoded) match {
              case (Some(ct), Success((_, jsonString, _))) =>
                val json = Json.parse(jsonString)
                val userId = (json \ "userId").validate[Long].get
                val expire = (json \ "expire").validate[Long].get
                Future.successful(Ok(s"userId:${userId}, expire:${expire}"))
            }
        }
      case _ => Future.successful(BadRequest("Need form data."))
    }
  }

}