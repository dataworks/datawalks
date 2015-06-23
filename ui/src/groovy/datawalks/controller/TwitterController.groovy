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
	public def getTweets(@RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern= "yyyy-MM-dd HH:mm:ss") Date startDate,
			@RequestParam(value = "stopDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date stopDate) {
		esService.search([query: ["match_all":[] ] ] );
	}
}