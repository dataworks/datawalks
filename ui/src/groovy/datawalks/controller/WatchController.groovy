package datawalks.controller

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

import datawalks.service.SqlService

@RestController
class WatchController {
	private static final Logger logger = LoggerFactory.getLogger(WatchController.class)
	
	@Autowired SqlService sqlService
	
	@RequestMapping("/watch/listPoints")
	public def listPoints(@RequestParam(value = "id", required = false, defaultValue = "0") long id,
		@RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern= "yyyy-MM-dd HH:mm:ss") Date startDate,
		@RequestParam(value = "stopDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date stopDate) {
			def points = sqlService.getGeoPoints(id, startDate, stopDate)
			[rows: points, total: points.size()]
	}
}