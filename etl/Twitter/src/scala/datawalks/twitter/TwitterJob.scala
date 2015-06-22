package datawalks.twitter

import org.apache.spark.SparkConf
import org.apache.spark.SparkContext
import org.elasticsearch.spark._
import org.apache.spark.sql.SQLContext

object TwitterJob {
  private var DB_QUERY = "(SELECT * FROM tname) tname"
  
  def main(args: Array[String]) {
    val conf = new SparkConf().setAppName("Twitter")
    val sc = new SparkContext(conf)
    val sqlContext = new SQLContext(sc)

    val dataFrame = sqlContext.load("jdbc", Map(
      "url" ->"jdbc:postgresql://host/database?user=&password=",
      "dbtable" -> DB_QUERY))

    // For each lat/lon match run TwitterQuery
    val query = new TwitterQuery()
    val tweets = query.execute()

    sc.parallelize(tweets).saveToEs("twitter/tweets")

    sc.stop()
  }
}