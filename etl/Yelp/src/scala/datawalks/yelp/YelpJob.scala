package datawalks.yelp;

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
import org.json4s
import org.json4s.jackson.JsonMethods._
import org.json4s._
import org.json4s.JsonDSL._
import scala.collection.mutable.ListBuffer

object YelpJob {

  //SQL statement to grab information from Postgres
  private var DB_QUERY = """(SELECT * FROM(
    SELECT round(cast(latitude AS NUMERIC), 3) latitude, round(cast(longitude AS NUMERIC), 3) longitude, COUNT(*) frequency 
    FROM workabledata  
    GROUP BY round(cast(latitude AS NUMERIC), 3), round(cast(longitude AS NUMERIC), 3)
    ORDER BY COUNT(*) DESC) AS toppoints
    WHERE frequency >= 60) dbquery"""

  def main(args: Array[String]) {

    //check to make sure property file is being passed in from command line
    if (args.length < 1) {
      println("Usage: YelpJob <PropertyFile>")
      System.exit(1)
    }

    //load properties file
    val properties = new Properties()
    properties.load(new FileInputStream(args(0)))

    /*
     * Build Spark Config and Context, and SQL Context
     * set where Elasticsearch server information is located in properties file
     */
    val conf = new SparkConf().setAppName("Yelp").setMaster("local[2]")
      .set("es.nodes", properties.getProperty("es.nodes")).set("es.mapping.id", "mobile")
    val sc = new SparkContext(conf)
    val sqlContext = new SQLContext(sc)

    /*
     * Build dataframe from Postgres using URL from properties file
     * Run query specified above
     */
    val dataFrame = sqlContext.load("jdbc", Map(
      "url" -> properties.getProperty("db.url"),
      "dbtable" -> DB_QUERY))

    //grab Elasticsearch index to populate
    val esIndex = properties.getProperty("es.resource")

    dataFrame.collect().foreach { r =>
      val query = new YelpAPI(
        properties.getProperty("oauth.consumer_key"),
        properties.getProperty("oauth.consumer_secret"),
        properties.getProperty("oauth.token"),
        properties.getProperty("oauth.token_secret"))

      val result = query.searchForBusinessesByLocation(r.getDecimal(0).doubleValue(), r.getDecimal(1).doubleValue())
      val businesses = parse(result) \ "businesses"
      val yelps = new ListBuffer[Map[String, Any]]()

      businesses.children.foreach { r =>
        val record = Map("name" -> (r \ "name").values,
          "mobile" -> (r \ "mobile_url").values,   
          "image" -> (r \ "image_url").values,
          "phone" -> (r \ "display_phone").values,
          "location" -> buildLocation(r \ "location" \ "coordinate"),
          "street" -> (r \ "location" \ "display_address" ).children.head.values,
          "fullAddress" -> (r \ "location" \ "display_address").children.tail.values,
          "ratingPic" -> (r \ "rating_img_url").values)
        
          //println(record)
          yelps += record
      }

      sc.parallelize(yelps).saveToEs(esIndex)
    }
    //stop spark context
    sc.stop()
  }

  private def buildLocation(coordinate: JValue): Map[String, Any] = {
    return Map("lat" -> (coordinate \ "latitude").values,
      "lon" -> (coordinate \ "longitude").values)
  }
}
