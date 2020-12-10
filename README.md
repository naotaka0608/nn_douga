# 環境
node v12.18.2

npm v6.14.7

java v14 or v15

sbt v1.4.4


# nn_douga 起動方法

## 動画保存先

```bash
$ mkdir -p nn-douga/mediaserver/filesystem/original
$ mkdir -p nn-douga/mediaserver/filesystem/h264acc
$ mkdir -p nn-douga/mediaserver/filesystem/mpegdash
```

## Dockerの起動
MySQLにユーザーや動画情報を保存
Redisにセッションを保存

FFmpeg
MP4Boxで動画エンコード

```bash
$ cd nn-douga
$ docker-compose up -d
$ docker-compose exec mysql mysql -u root -pmysql

$ mysql> create database nn_douga
```

## MediaServerの起動
```
$ cd mediaserver
$ sbt run
```


## WebServerの起動

```bash
$ cd nn-douga/webserver
$ npm install
$ npm run build
$ npm run start
```

http://localhost:3000


## その他
### ubuntuに javaとsbt のインストール

Dockerのインストール
```bash
$ sudo apt install docker-compose
```

Javaのインストール
```bash
$ sudo apt install openjdk-14-jdk
```

sbtのインストール
```bash
$ echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list
$ curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
$ sudo apt-get update
$ sudo apt-get install sbt
```
https://www.scala-sbt.org/1.x/docs/ja/Installing-sbt-on-Linux.html

### メモリ不足？？
AWSの無料枠でデプロイしたときに、sbt run が途中で止まる。
おそらく、メモリ不足が原因。メモリの上限を決めておく。

.bashrcに下記を追記する。
```bash
export _JAVA_OPTIONS='-Xms128m -Xmx200m'
```
bashrcの更新
```bash
source ~/.bashrc
```
https://qiita.com/v2okimochi/items/f78cb91b50773ed19767
