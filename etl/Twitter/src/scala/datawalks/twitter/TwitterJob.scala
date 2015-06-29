package datawalks.twitter

import java.io.FileInputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Properties
import org.apache.spark.SparkConf
import org.apache.spark.SparkContext
import org.apache.spark.sql.SQLContext
import org.elasticsearch.spark.sparkRDDFunctions

object TwitterJob {
  private var DB_QUERY = """(SELECT * FROM(
    SELECT round(cast(latitude AS NUMERIC), 4) latitude, round(cast(longitude AS NUMERIC), 4) longitude, TO_CHAR(dtime, 'YYYY-MM-DD') dtime, COUNT(*) frequency, dateinserted dateinserted FROM workabledata  
    GROUP BY round(cast(latitude AS NUMERIC), 4), round(cast(longitude AS NUMERIC), 4), TO_CHAR(dtime, 'YYYY-MM-DD'), dateinserted
    ORDER BY COUNT(*) DESC) AS toppoints
    WHERE frequency >= 20) dbquery"""

  def main(args: Array[String]) {
    if (args.length < 1) {
      println("Usage: TwitterJob <PropertyFile>")
      System.exit(1)
    }
    
    val properties = new Properties()
    properties.load(new FileInputStream(args(0)))

    val conf = new SparkConf().setAppName("Twitter").setMaster("local[2]")
      .set("es.nodes", properties.getProperty("es.nodes"))
    val sc = new SparkContext(conf)
    val sqlContext = new SQLContext(sc)

    val dataFrame = sqlContext.load("jdbc", Map(
      "url" -> properties.getProperty("db.url"),
      "dbtable" -> DB_QUERY))

//    val recentDate = new Date(sc.textFile("recentDate.txt").first())
//    val insertdateCol = dataFrame("dateinserted")

    //    dataFrame.filter()

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

  //  def parseDate(value: String) = {
  //    try {
  //      Some(new SimpleDateFormat("yyyy-MM-dd").parse(value))
  //    } catch {
  //      case e: Exception => None
  //    }
  //  }
}