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
import org.elasticsearch.hadoop.mr.EsInputFormat
import java.text.BreakIterator

case class LabeledDocument(id: Long, text: String, label: Double)
case class Document(id: Long, text: String)

/*
 * Check tweets to make sure no naughty words are present
 */
object CleanserJob {

  def main(args: Array[String]) {
    val conf = new SparkConf().setAppName("CleanserJob").setMaster("local[2]")
      .set("es.nodes", "es-server:9200").set("es.resource", "twitter/tweet")
    val sc = new SparkContext(conf)
    val rdd = sc.esRDD("twitter/tweet", "?q=match_all").collect()

    val stopWords = "/dataworks/internship-2015/etl/Cleanser/naughty.txt"

    //shortest length of word allowed
    val minWordLen = 3

    val tokenizer = new SimpleTokenizer(sc, stopWords)
    val tokenized: RDD[(Long, IndexedSeq[String])] = rdd.zipWithIndex().map {
      case (text, id) =>
        id -> tokenizer.getWords(text)
    }
    tokenized.cache()

    sc.stop()
  }
  private class SimpleTokenizer(sc: SparkContext, stopwordFile: String) extends Serializable {

    val stopwords: Set[String] = if (stopwordFile.isEmpty) {
      Set.empty[String]
    } else {
      val stopwordText = sc.textFile(stopwordFile).collect()
      stopwordText.flatMap(_.stripMargin.split("\\s+")).toSet
    }

    // Matches sequences of Unicode letters
    private val allWordRegex = "^(\\p{L}*)$".r

    // Ignore words shorter than this length.
    private val minWordLength = 3

    def getWords(text: String): IndexedSeq[String] = {

      val words = new mutable.ArrayBuffer[String]()

      // Use Java BreakIterator to tokenize text into words.
      val wb = BreakIterator.getWordInstance
      wb.setText(text)

      // current,end index start,end of each word
      var current = wb.first()
      var end = wb.next()
      while (end != BreakIterator.DONE) {
        // Convert to lowercase
        val word: String = text.substring(current, end).toLowerCase
        // Remove short words and strings that aren't only letters
        word match {
          case allWordRegex(w) if w.length >= minWordLength && !stopwords.contains(w) =>
            words += w
          case _ =>
        }

        current = end
        try {
          end = wb.next()
        } catch {
          case e: Exception =>
            // Ignore remaining text in line.
            // This is a known bug in BreakIterator (for some Java versions),
            // which fails when it sees certain characters.
            end = BreakIterator.DONE
        }
      }
      words
    }
  }

}