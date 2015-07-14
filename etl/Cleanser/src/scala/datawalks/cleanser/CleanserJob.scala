package datawalks.cleanser

import scala.beans.BeanInfo
import org.apache.spark.SparkConf
import org.apache.spark.SparkContext
import org.apache.spark.SparkContext._
import org.apache.spark.ml.Pipeline
import org.apache.spark.ml.classification.LogisticRegression
import org.apache.spark.ml.feature.Tokenizer
import org.apache.spark.mllib.classification.NaiveBayes
import org.apache.spark.mllib.feature.HashingTF
import org.apache.spark.mllib.feature.Word2Vec
import org.apache.spark.mllib.linalg.Vector
import org.apache.spark.mllib.regression.LabeledPoint
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.SQLContext
import org.elasticsearch.spark._
import org.apache.spark.sql.Row

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

    val htf = new HashingTF(10000)
    val tokenizer = new LuceneTokenizer()

    val training = sc.textFile("/dataworks/internship-2015/etl/Cleanser/naughty.csv")
    val parsedTraining = training.map { line =>
      val parts = line.split(',')
      LabeledPoint(parts(1).toDouble, htf.transform(tokenizer.tokenize(parts(0))))
    }

    val model = NaiveBayes.train(parsedTraining, lambda = 1.0, modelType = "multinomial")

    val results = rdd.map { row =>
      val wordVecs = htf.transform(tokenizer.tokenize(row.text))
      (model.predict(wordVecs), row.text)
    }
    results.foreach{ x =>
      println("score: " + x._1 + ", text: " + x._2)
    }
    sc.stop()
  }

  private def getData(row: (String, scala.collection.Map[String, AnyRef])): Document = {
    var text = row._2.get("text").get +
    " " + row._2.get("user").get +
    " " + row._2.get("handle").get
    return Document(row._1.toLong, text)
  }
}