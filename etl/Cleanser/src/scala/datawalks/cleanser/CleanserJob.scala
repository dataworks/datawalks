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
import java.util.Properties
import java.io.FileInputStream
import scala.collection.mutable.ListBuffer

// case class to hold tweet: id, tweet text, and profanity record
@BeanInfo
case class Document(id: Long, text: String, record: scala.collection.mutable.Map[String, AnyRef])

/*
 * Check tweets to make sure no naughty words are present
 */
object CleanserJob {

  def main(args: Array[String]) {

    // check that arguments for properties and spark library are provided
    if (args.length < 1) {
      println("Usage: CleanserJob <PropertyFile>")
      System.exit(1)
    }

    // load the properties file
    val properties = new Properties()
    properties.load(new FileInputStream(args(0)))

    /*
     * Set up Spark Config, Context, Elasticsearch RDD, and a SQL Context
     */
    val conf = new SparkConf().setAppName("CleanserJob").setMaster("local[2]")
      .set("es.nodes", properties.getProperty("es.nodes"))
      .set("es.resource", properties.getProperty("es.resource"))
      .set("es.mapping.id", "id")
    val sc = new SparkContext(conf)
    val rdd = sc.esRDD(properties.getProperty("es.resource")).map(row => getData(row))
    val sqlContext = new SQLContext(sc)
    import sqlContext.implicits._

    // Create a Hashing Transform, and tokenizer to separate words
    val htf = new HashingTF(10000)
    val tokenizer = new LuceneTokenizer()

    // Open and parse training data. Create labeled points with scores and text
    // to be trained on.
    val training = sc.textFile(properties.getProperty("training.path"))
    val parsedTraining = training.map { line =>
      val parts = line.split(',')
      LabeledPoint(parts(1).toDouble, htf.transform(tokenizer.tokenize(parts(0))))
    }

    // Train a Naive Bayes model to learn and act on subsequent data.
    val model = NaiveBayes.train(parsedTraining, lambda = 1.0, modelType = "multinomial")

    /*
     *  tokenize the word vectors, and use the Naive Bayes model to predict
     *  the profanity level of other tweets
     */
    val results = rdd.map { row =>
      val wordVecs = htf.transform(tokenizer.tokenize(row.text))
      (model.predict(wordVecs), row.record, row.text)
    }

    // create a list buffer to be filled
    val records = new ListBuffer[scala.collection.Map[String, AnyRef]]()

    // update profanity level, add to records
    results.collect().foreach { x =>
      x._2("profane") = x._1.asInstanceOf[AnyRef]
      records += x._2
    }
    
    // parallelize, and write to Elasticsearch
    sc.parallelize(records).saveToEs(properties.getProperty("es.resource"))
    sc.stop()
  }

  // method to get rows from Elasticsearch
  private def getData(row: (String, scala.collection.Map[String, AnyRef])): Document = {
    var text = row._2("text") +
      " " + row._2("user") +
      " " + row._2("handle")
    val map = collection.mutable.Map(row._2.toSeq: _*)
    return Document(row._1.toLong, text, map)
  }
}