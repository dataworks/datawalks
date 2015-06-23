package datawalks.service

import groovy.sql.Sql
import javax.sql.DataSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class SqlService {
	@Autowired DataSource dataSource
	
	/* getGeoPoints(long, Date, Date)
	 * 
	 * Returns information from the workabledata table, used
	 * for the google heatmap
	 */
	def getGeoPoints(long watchId, Date startDate, Date stopDate) {
        def rows = []
        Sql sql = new Sql(dataSource)
        sql.eachRow("""select deviceid deviceid, latitude latitude,
            longitude longitude, dtime dtime,
            distancemeters distancemeters from workabledata""")
        {
            rows << [deviceid: it.deviceid, latitude: it.latitude,
                longitude: it.longitude, dtime: it.dtime, distancemeters: it.distancemeters]
        }
        return rows
    } 
	
	/* getTotalDistance(long, Date, Date)
	 * 
	 * Returns the max distance for each day in the table workabledata
	 */
	def getTotalDistance(long watchId, Date startDate, Date stopDate){
		def rows = []
		Sql sql = new Sql(dataSource)
		sql.eachRow("""SELECT deviceid did, max(distancemeters) mdistance,to_char(dtime,'yyyy-mm-dd') dtime from workabledata
						GROUP BY to_char(dtime,'yyyy-mm-dd'), did;"""){
			rows << [ dtime: it.dtime, mdistance: it.mdistance, did: it.did]
		}
		return rows
	}	
	
	/* getDeviceId(long, Date, Date)
	 * 
	 * Returns one column of deviceid's for comparison purposes
	 */
	def getDeviceId(long watchId, Date startDate, Date stopDate){
		def rows = []
		Sql sql = new Sql(dataSource)
		sql.eachRow("""SELECT DISTINCT deviceid deviceid FROM workabledata"""){
			rows << [device: it.deviceid]
		}
		return rows
	}
	
	/* getCalorieInfo(long, Date, Date)
	 * 
	 * Returns the Summary information of time and calories from all the runs
	 */
	def getCalorieInfo(long watchId, Date startDate, Date stopDate){
		def rows = []
		Sql sql = new Sql(dataSource)
		sql.eachRow("""SELECT DISTINCT ON(wdata.runid) deviceid did, to_char(dtime,'yyyy-mm-dd') dtime, sum(calories) scal, wdata.runid wrun
						FROM workabledata wdata
						JOIN workabledetails wdetails 
							ON wdata.runid = wdetails.runid
						WHERE calories != 0
						GROUP BY deviceid, dtime, wrun
						ORDER BY wrun""") {
			rows << [dtime: it.dtime, did: it.did, scal: it.scal, wrun: it.wrun]
						
		}
		return rows
	}
	
	/* getTweets(long, Date, Date)
	 * 
	 * Returns the tweet information that are specified as English.
	 * There are several inappropriate tweets in this sample
	 */
	def getTweets(long watchId, Date startDate, Date stopDate){
		def rows = []
		Sql sql = new Sql(dataSource)
		sql.eachRow("""Select username uname, Universal_Time_Stamp uni, tweet_text tweettext, Image img 
						From japanesetweets
						WHERE language = 'en';"""){
			rows << [uname: it.uname, uni: it.uni, tweettext: it.tweettext, img: it.img]
		}
		return rows
	}
}