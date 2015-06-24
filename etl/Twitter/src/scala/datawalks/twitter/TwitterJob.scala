package datawalks.twitter

import org.apache.spark.SparkConf
import org.apache.spark.SparkContext
import org.elasticsearch.spark._
import org.apache.spark.sql.SQLContext
import java.text.SimpleDateFormat
import java.util.Properties
import java.io.FileInputStream

object TwitterJob {
  private var DB_QUERY = """(SELECT * FROM(
    SELECT round(cast(latitude AS NUMERIC), 4) latitude, round(cast(longitude AS NUMERIC), 4) longitude, TO_CHAR(dtime, 'YYYY-MM-DD') dtime, COUNT(*) frequency FROM workabledata  
    GROUP BY round(cast(latitude AS NUMERIC), 4), round(cast(longitude AS NUMERIC), 4), TO_CHAR(dtime, 'YYYY-MM-DD')
    ORDER BY COUNT(*) DESC) AS toppoints
    WHERE frequency >= 20) dbquery"""

  def main(args: Array[String]) {
    if (args.length < 1) {
      println("Usage: TwitterJob <PropertyFile>")
      System.exit(1)
    }
    val conf = new SparkConf().setAppName("Twitter").setMaster("local[2]")
    val sc = new SparkContext(conf)
    val sqlContext = new SQLContext(sc)

    val properties = new Properties()
    properties.load(new FileInputStream(args(0)))

    val dataFrame = sqlContext.load("jdbc", Map(
      "url" -> properties.getProperty("db.url"),
      "dbtable" -> DB_QUERY))

    // For each lat/lon match run TwitterQuery
    dataFrame.collect().foreach { r =>
      val date = new SimpleDateFormat("yyyy-MM-dd").parse(r.getString(2))
      val query = new TwitterQuery()
      query.setAuthentication(properties)
      val tweets = query.execute(r.getDecimal(0).doubleValue(), r.getDecimal(1).doubleValue(), date)
      sc.parallelize(tweets).saveToEs("twitter/tweets")
    }

    sc.stop()
  }
}