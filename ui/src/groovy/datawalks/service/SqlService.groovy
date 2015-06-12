package datawalks.service

import groovy.sql.Sql

import javax.sql.DataSource

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class SqlService {
	//@Autowired JdbcTemplate jdbcTemplate
	@Autowired DataSource dataSource
	
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
		//sql.eachRow("""select datetime datetime, longitudedegrees longitude, latitudedegrees latitude from dan_drive """) {
			//rows << [datetime: it.datetime, latitude: it.latitude, longitude: it.longitude]
		//}
		return rows
	}
	//create jwc connection
	//take in config files
	
	def getGeoLat() {
		def rows = []
		Sql sql = new Sql(dataSource)
		sql.eachRow("select latitudedegrees latitude from dan_drive where latitudedegrees > ?", [38.956] ) {
			rows << [ latitude: it.latitude]
		}
		return rows
	}
	//returns the latitude degrees greater than 38.956
	
	def makeTable() {
		Sql sql = new Sql(dataSource)
		String create = "create table PROJECT ( id integer not null,name varchar(50),url varchar(100) )"
		sql.execute(create)
		
	}
	
}