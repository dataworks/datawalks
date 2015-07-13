package datawalks.cleanser

import java.io.StringReader
import java.util.ArrayList
import org.apache.lucene.analysis.standard.StandardAnalyzer
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute
import scala.collection.mutable.ListBuffer
import org.apache.spark.ml.UnaryTransformer
import org.apache.spark.ml.param.ParamMap
import org.apache.spark.sql.types.StringType
import org.apache.spark.sql.types.ArrayType
import org.apache.spark.sql.types.DataType
import org.apache.spark.ml.util.Identifiable
import java.util.UUID
import org.apache.lucene.analysis.en.EnglishAnalyzer

class LuceneTokenizer(override val uid: String) extends UnaryTransformer[String, Seq[String], LuceneTokenizer] {
  def this() = this("tok_" + UUID.randomUUID().toString.takeRight(12))

  override protected def createTransformFunc: String => Seq[String] = {
    tokenize(_)
  }

  override protected def validateInputType(inputType: DataType): Unit = {
    require(inputType == StringType, s"Input type must be string type but got $inputType.")
  }

  override protected def outputDataType: DataType = new ArrayType(StringType, false)

  def tokenize(string: String): Seq[String] = {
    var result = new ListBuffer[String]()
    var stream = new EnglishAnalyzer().tokenStream(null, new StringReader(string))
    stream.reset()
    while (stream.incrementToken()) {
      result += stream.getAttribute(classOf[CharTermAttribute]).toString()
    }
    return result.asInstanceOf[Seq[String]];
  }
}