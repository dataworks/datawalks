package datawalks.twitter

import scala.collection.JavaConversions.asScalaBuffer
import scala.collection.mutable.ListBuffer
import twitter4j.GeoLocation
import twitter4j.Query
import twitter4j.TwitterFactory
import twitter4j.conf.ConfigurationBuilder
import java.util.Date
import java.util.Calendar
import java.text.SimpleDateFormat
import java.util.Properties
import twitter4j.conf.Configuration

class TwitterQuery {
  private var config : Configuration = null

  def setAuthentication(properties: Properties){
    var cb = new ConfigurationBuilder()
    cb.setOAuthConsumerKey(properties.getProperty("twitter.consumerKey"))
    cb.setOAuthConsumerSecret(properties.getProperty("twitter.consumerSecret"))
    cb.setOAuthAccessToken(properties.getProperty("twitter.accessToken"))
    cb.setOAuthAccessTokenSecret(properties.getProperty("twitter.accessTokenSecret"))
    
    config = cb.build()
  }

  def execute(latitude: Double, longitude: Double, date: Date): Seq[Map[String, Any]] = {
    val tweets = new ListBuffer[Map[String, Any]]()
    val twitter = new TwitterFactory(config).getInstance();

    val locus = new GeoLocation(latitude, longitude)
    var query = new Query(getDateQuery(date))
    query = query.geoCode(locus, 1, "mi")
    val result = twitter.search(query)
    result.getTweets().foreach { status =>
      val hasGeoLocation = status.getGeoLocation() != null
      val record = Map("user" -> status.getUser().getName(), "text" -> status.getText(), "date" -> status.getCreatedAt(),
        "latitude" -> (if (hasGeoLocation) status.getGeoLocation().getLatitude() else null),
        "longitude" -> (if (hasGeoLocation) status.getGeoLocation().getLongitude() else null))

      tweets += record
    }

    return tweets
  }

  private def getDateQuery(date: Date): String = {
    var query = "since:"
    query += new SimpleDateFormat("yyyy-MM-dd").format(date)
    query += " until:"
    query += new SimpleDateFormat("yyyy-MM-dd").format(addDays(date, 1))
    return query
  }

  private def addDays(date: Date, days: Integer) : Date = {
    val cal = Calendar.getInstance();
    cal.setTime(date);
    cal.add(Calendar.DATE, days);
    return cal.getTime();
  }
}