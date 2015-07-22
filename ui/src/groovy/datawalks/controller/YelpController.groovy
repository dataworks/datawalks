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
class YelpController {
	private static final Logger logger = LoggerFactory.getLogger(YelpController.class)

	@Autowired ElasticsearchService esYelpService

	@RequestMapping("/yelp/getPlaces")
	public def getTweets(@RequestParam(value = "latitude", required = false) String latitude,
			@RequestParam(value = "longitude", required = false) String longitude) {
		esYelpService.search(
			[query: [filtered: [
					query: [match_all: []],
					filter: [
									[
										geo_distance: [
											distance: "2mi",
											location: [
												lat: latitude,
												lon: longitude
												]
											]
									]
								
						 ]
					]
				]
			]
		)
	}
}