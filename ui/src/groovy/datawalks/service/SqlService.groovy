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
		sql.eachRow("select time, latitudedegrees latitude, longitudedegrees longitude from dan_drive") {
			rows << [time: it.time, latitude: it.latitude, longitude: it.longitude]
		}
		return rows
	}
	//create jwc connection
	//take in config files
}