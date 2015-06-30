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

/*
 * Job to build Spark job that:
 *  -creates a twitter query based on database information from PostgreSQL
 *  -grab tweets from twitter's REST api
 *  -save tweet information to elasticsearch index
 *  -keep record of what tweets are already indexed
 */
object TwitterJob {

  //SQL statement to grab information from Postgres
  private var DB_QUERY = """(SELECT * FROM(
    SELECT round(cast(latitude AS NUMERIC), 4) latitude, round(cast(longitude AS NUMERIC), 4) longitude, TO_CHAR(dtime, 'YYYY-MM-DD') dtime, COUNT(*) frequency, dateinserted dateinserted FROM workabledata  
    WHERE dateinserted > 'DATE_INSERTED'
    GROUP BY round(cast(latitude AS NUMERIC), 4), round(cast(longitude AS NUMERIC), 4), TO_CHAR(dtime, 'YYYY-MM-DD'), dateinserted
    ORDER BY COUNT(*) DESC) AS toppoints
    WHERE frequency >= 5) dbquery"""

  def main(args: Array[String]) {
    
    //check to make sure property file is being passed in from command line
    if (args.length < 1) {
      println("Usage: TwitterJob <PropertyFile>")
      System.exit(1)
    }

    //load properties file
    val properties = new Properties()
    properties.load(new FileInputStream(args(0)))

    //read the most recent date of twitter acquisition
    val recentDate = Source.fromFile("recentDate.txt").mkString

    /*
     * Build Spark Config and Context, and SQL Context
     * set where Elasticsearch server information is located in properties file
     */
    val conf = new SparkConf().setAppName("Twitter").setMaster("local[2]")
      .set("es.nodes", properties.getProperty("es.nodes"))
    val sc = new SparkContext(conf)
    val sqlContext = new SQLContext(sc)

    /*
     * Build dataframe from Postgres using URL from properties file
     * Run query specified above
     */
    val dataFrame = sqlContext.load("jdbc", Map(
      "url" -> properties.getProperty("db.url"),
      "dbtable" -> DB_QUERY.replaceAll("DATE_INSERTED", recentDate)))

    //write current date to text file
    val pw = new PrintWriter(new File("recentDate.txt"))
    val format = new SimpleDateFormat("yyyy-MM-dd")
    pw.write(format.format(Calendar.getInstance().getTime()))
    pw.close()

    //grab Elasticsearch index to populate
    val esIndex = properties.getProperty("es.resource")

    // For each lat/lon match run TwitterQuery, and save to Elasticsearch
    dataFrame.collect().foreach { r =>
      val date = new SimpleDateFormat("yyyy-MM-dd").parse(r.getString(2))
      val query = new TwitterQuery()
      query.setAuthentication(properties)
      val tweets = query.execute(r.getDecimal(0).doubleValue(), r.getDecimal(1).doubleValue(), date)
      sc.parallelize(tweets).saveToEs(esIndex)
    }
    //stop spark context
    sc.stop()
  }
}