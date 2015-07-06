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

	@RequestMapping("/watch/aggPoints")
	public def aggPoints(@RequestParam(value = "id", required = false, defaultValue = "0") long id,
			@RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern= "yyyy-MM-dd HH:mm:ss") Date startDate,
			@RequestParam(value = "stopDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date stopDate) {
		[aggs: sqlService.getTotalDistance(id, startDate, stopDate),
			device: sqlService.getDeviceId()]
	}

	@RequestMapping("/watch/calPoints")
	public def calPoints(@RequestParam(value = "id", required = false, defaultValue = "0") long id,
			@RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern= "yyyy-MM-dd HH:mm:ss") Date startDate,
			@RequestParam(value = "stopDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date stopDate) {
		[device: sqlService.getDeviceId(),
			calories: sqlService.getCalorieInfo(id, startDate, stopDate)]
	}

	@RequestMapping("/watch/devicePoints")
	public def devicePoints(@RequestParam(value = "id", required = false, defaultValue = "0") String id,
			@RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern= "yyyy-MM-dd HH:mm:ss") Date startDate,
			@RequestParam(value = "stopDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date stopDate) {
		def points = sqlService.getDevicePoints(id, startDate, stopDate)
		[rows: points, uniqueDates: sqlService.getDatePerDevice()]
	}

	@RequestMapping("/watch/deviceIds")
	public def deviceIds() {
		def points = sqlService.getDeviceId()
		[rows: points]
	}
}