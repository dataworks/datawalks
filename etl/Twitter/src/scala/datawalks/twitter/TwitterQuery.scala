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
import twitter4j.QueryResult
import twitter4j.Twitter

/*
 * Class to build a query against Twitter.
 */
class TwitterQuery {

  // Initialize a null Configuration to be filled later
  private var config: Configuration = null

  /*
   * Method to set the OAuth authentication properties required to pull tweets.
   * Properties pulled from run.properties file.
   */
  def setAuthentication(properties: Properties) {
    var cb = new ConfigurationBuilder()
    cb.setOAuthConsumerKey(properties.getProperty("twitter.consumerKey"))
    cb.setOAuthConsumerSecret(properties.getProperty("twitter.consumerSecret"))
    cb.setOAuthAccessToken(properties.getProperty("twitter.accessToken"))
    cb.setOAuthAccessTokenSecret(properties.getProperty("twitter.accessTokenSecret"))

    config = cb.build()
  }

 /*
  * Method to build the query and search Twitter.
  */
  def execute(latitude: Double, longitude: Double, date: Date): Seq[Map[String, Any]] = {

    //initialize empty ListBuffer and TwitterFactory
    val tweets = new ListBuffer[Map[String, Any]]()
    val twitter = new TwitterFactory(config).getInstance();

    //using lat and lon parameters, build the GeoLocation to be searched around
    val locus = new GeoLocation(latitude, longitude)

    //initialize query using date passed, 50 tweets per page 
    var query = new Query(getDateQuery(date)).count(50)

    //add the geolocation, radius, and unit of measurement to the query
    query = query.geoCode(locus, 2, "mi")

    //execute search
    var result = twitter.search(query)

    /*
     * Iteratively grab tweets with properties:
     * 
     *  user - Name of the user             handle - user's twitter handle
     *  id - tweet's numerical id           text - text of grabbed tweet
     *  date - date tweet was created       latitude - latitude of tweet
     *  longitude - longitude of tweet      image - get user's profile picture
     *  
     * Concatenate each tweet record to Map 
     */
    do {
      result.getTweets().foreach { status =>
        val hasGeoLocation = status.getGeoLocation() != null
        val record = Map("user" -> status.getUser().getName(),
          "handle" -> status.getUser().getScreenName(),
          "id" -> status.getId(),
          "text" -> status.getText(),
          "date" -> status.getCreatedAt(),
          "latitude" -> (if (hasGeoLocation) status.getGeoLocation().getLatitude() else null),
          "longitude" -> (if (hasGeoLocation) status.getGeoLocation().getLongitude() else null),
          "image" -> status.getUser().getOriginalProfileImageURL)

        tweets += record
      }
      result = getNextResult(twitter, result)
    } while (result != null)

    return tweets
  }

  /*
   * Build date query - looking from date specified, until immediately subsequent date
   */
  private def getDateQuery(date: Date): String = {
    var query = "since:"
    query += new SimpleDateFormat("yyyy-MM-dd").format(date)
    query += " until:"
    query += new SimpleDateFormat("yyyy-MM-dd").format(addDays(date, 1))
    return query
  }

  /*
   * Method for adding Days to SimpleDateFormat Dates.
   */
  private def addDays(date: Date, days: Integer): Date = {
    val cal = Calendar.getInstance();
    cal.setTime(date);
    cal.add(Calendar.DATE, days);
    return cal.getTime();
  }

  /*
   * Method to check if more results are present, and if so, return them.
   */
  private def getNextResult(twitter: Twitter, result: QueryResult): QueryResult = {
    if (result.hasNext()) {
      return twitter.search(result.nextQuery())
    }
    return null
  }
}