package datawalks.twitter

import java.util.Collection
import twitter4j.TwitterFactory
import java.util.ArrayList
import twitter4j.Query
import scala.collection.JavaConversions._
import scala.collection.mutable.ListBuffer

class TwitterQuery {
  def setAuthentication() {
  }

  def execute(): Seq[Map[String, Any]] = {
    val tweets = new ListBuffer[Map[String, Any]]()
    val twitter = TwitterFactory.getSingleton()
    val query = new Query("test query")
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
}