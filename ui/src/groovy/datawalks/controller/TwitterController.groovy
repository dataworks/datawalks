package datawalks.controller

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

import datawalks.service.ElasticsearchService

@RestController
class TwitterController {
	private static final Logger logger = LoggerFactory.getLogger(TwitterController.class)

	@Autowired ElasticsearchService esService

	@RequestMapping("/twitter/getTweets")
	public def getTweets(@RequestParam(value = "latitude", required = false) String latitude,
			@RequestParam(value = "longitude", required = false) String longitude,
			@RequestParam(value = "fromDate", required = false) String fromDate,
			@RequestParam(value = "endDate", required = false) String endDate) {
		esService.search(
			[query: [filtered: [
					query: [match_all: []],
					filter: [
							and: [ 
									[
										geo_distance: [
											distance: "2mi",
											location: [
												lat: latitude,
												lon: longitude
												]
											]
									],
								   [
										range : [
											date : [
												gte: fromDate,
												lte: endDate
												]
											]
									]
								]
						 ]
					]
				],
			from: 0,
			size: 1000,
			sort : [
				[ date : [order : "desc"]]
			]
			]
		)
	}	
}