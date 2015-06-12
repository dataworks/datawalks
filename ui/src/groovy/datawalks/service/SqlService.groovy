package datawalks.service

import groovy.sql.Sql
import javax.sql.DataSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service


@Service
class SqlService {
	@Autowired DataSource dataSource
	
	def getGeoPoints(long watchId, Date startDate, Date stopDate) {
		def rows = []
		Sql sql = new Sql(dataSource)
		sql.eachRow("""select deviceid device, latitude latitude, longitude longitude   
						from workabledata""") 
		{
			rows << [device: it.device, latitude: it.latitude, longitude: it.longitude ]
		}
		return rows
	}
	//create jwc connection
	//take in config
	
	/* def - getTotalDistance()
	 * Returns the max distance for each day in the table workabledata
	 * Not currently in use
	 */
	def getTotalDistance(long watchId, Date startDate, Date stopDate){
		def rows = []
		Sql sql = new Sql(dataSource)
		sql.eachRow("""SELECT max(distancemeters) mdistance,to_char(dtime,'yyyy-mm-dd') dtime from workabledata
						GROUP BY to_char(dtime,'yyyy-mm-dd');"""){
			rows << [ dtime: it.dtime, mdistance: it.mdistance]
		}
		return rows
	}
	

	
	
	
}