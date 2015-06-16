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
		sql.eachRow("""SELECT max(distancemeters) mdistance,to_char(dtime,'yyyy-mm-dd') dtime from workabledata
						GROUP BY to_char(dtime,'yyyy-mm-dd');"""){
			rows << [ dtime: it.dtime, mdistance: it.mdistance]
		}
		return rows
	}	
}