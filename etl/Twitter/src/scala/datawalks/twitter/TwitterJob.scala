package datawalks.twitter

import java.io.FileInputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Properties
import org.apache.spark.SparkConf
import org.apache.spark.SparkContext
import org.apache.spark.sql.SQLContext
import org.elasticsearch.spark.sparkRDDFunctions
import java.io.PrintWriter
import java.io.File
import java.util.Calendar
import scala.io.Source

object TwitterJob {
  private var DB_QUERY = """(SELECT * FROM(
    SELECT round(cast(latitude AS NUMERIC), 4) latitude, round(cast(longitude AS NUMERIC), 4) longitude, TO_CHAR(dtime, 'YYYY-MM-DD') dtime, COUNT(*) frequency, dateinserted dateinserted FROM workabledata  
    WHERE dateinserted > 'DATE_INSERTED'
    GROUP BY round(cast(latitude AS NUMERIC), 4), round(cast(longitude AS NUMERIC), 4), TO_CHAR(dtime, 'YYYY-MM-DD'), dateinserted
    ORDER BY COUNT(*) DESC) AS toppoints
    WHERE frequency >= 5) dbquery"""

  def main(args: Array[String]) {
    if (args.length < 1) {
      println("Usage: TwitterJob <PropertyFile>")
      System.exit(1)
    }

    val properties = new Properties()
    properties.load(new FileInputStream(args(0)))

    val recentDate = Source.fromFile("recentDate.txt").mkString

    val conf = new SparkConf().setAppName("Twitter").setMaster("local[2]")
      .set("es.nodes", properties.getProperty("es.nodes"))
    val sc = new SparkContext(conf)
    val sqlContext = new SQLContext(sc)

    val dataFrame = sqlContext.load("jdbc", Map(
      "url" -> properties.getProperty("db.url"),
      "dbtable" -> DB_QUERY.replaceAll("DATE_INSERTED", recentDate)))

    val pw = new PrintWriter(new File("recentDate.txt"))
    val format = new SimpleDateFormat("yyyy-MM-dd")
    pw.write(format.format(Calendar.getInstance().getTime()))
    pw.close()

    val esIndex = properties.getProperty("es.resource")

    // For each lat/lon match run TwitterQuery
    dataFrame.collect().foreach { r =>
      val date = new SimpleDateFormat("yyyy-MM-dd").parse(r.getString(2))
      val query = new TwitterQuery()
      query.setAuthentication(properties)
      val tweets = query.execute(r.getDecimal(0).doubleValue(), r.getDecimal(1).doubleValue(), date)
      sc.parallelize(tweets).saveToEs(esIndex)
    }
    sc.stop()
  }
}