package datawalks.cleanser

import org.apache.spark.SparkConf
import org.apache.spark.SparkContext
import org.apache.spark.SparkContext._
import org.apache.spark.ml.Pipeline
import org.apache.spark.ml.classification.LogisticRegression
import org.apache.spark.ml.feature.HashingTF
import org.apache.spark.ml.feature.Tokenizer
import org.apache.spark.mllib.feature.Word2Vec
import org.apache.spark.mllib.linalg.Vector
import org.apache.spark.rdd.RDD
import org.elasticsearch.spark._
import org.apache.spark.sql.SQLContext
import scala.beans.BeanInfo
import org.apache.spark.sql.Row

@BeanInfo
case class LabeledDocument(text: String, label: Double)

@BeanInfo
case class Document(id: Long, text: String)

/*
 * Check tweets to make sure no naughty words are present
 */
object CleanserJob {

  def main(args: Array[String]) {
    val conf = new SparkConf().setAppName("CleanserJob").setMaster("local[2]")
      .set("es.nodes", "es-server:9200").set("es.resource", "twitter/tweet")
    val sc = new SparkContext(conf)
    val rdd = sc.esRDD("twitter/tweet").map(row => getData(row))
    val sqlContext = new SQLContext(sc)
    import sqlContext.implicits._

    // .txt file containing bad words. OPEN AT OWN RISK
    val training = sc.textFile("/dataworks/internship-2015/etl/Cleanser/naughty.csv")
      .map(word => getRow(word))

    val tokenizer = new Tokenizer()
      .setInputCol("text")
      .setOutputCol("words")
    val hashingTF = new HashingTF()
      .setNumFeatures(1000)
      .setInputCol(tokenizer.getOutputCol)
      .setOutputCol("features")
    val lr = new LogisticRegression()
      .setMaxIter(10)
      .setRegParam(0.001)
    val pipeline = new Pipeline()
      .setStages(Array(tokenizer, hashingTF, lr))

    val model = pipeline.fit(training.toDF())

    model.transform(rdd.toDF())
      .select("id", "text", "probability", "prediction")
      .collect()
      .foreach {
        case Row(id: Long, text: String, prob: Vector, prediction: Double) =>
          println(s"text: $text, prob=$prob, prediction=$prediction")
      }

    sc.stop()
  }

  private def getData(row: (String, scala.collection.Map[String, AnyRef])): Document = {
    var text = row._2.get("text").toString()
    text += " " + row._2.get("user").toString()
    text += " " + row._2.get("handle").toString()
    return Document(row._1.toLong, text)
  }
  
  private def getRow(row: String) : LabeledDocument = {
    val values = row.split(",")
    return LabeledDocument(values(0), values(1).toDouble)
  }
}