name := """mediaserver"""
organization := "nico.ed.nnn"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.13.3"

libraryDependencies += guice
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "5.0.0" % Test
libraryDependencies ++= Seq(
  "com.pauldijou" %% "jwt-core" % "4.2.0"
)

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "nico.ed.nnn.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "nico.ed.nnn.binders._"
