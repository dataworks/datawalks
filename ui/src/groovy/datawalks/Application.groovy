package datawalks

import datawalks.service.ElasticsearchService
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan

@EnableAutoConfiguration
@ComponentScan
class Application {
	
	@Bean
	public ElasticsearchService esTwitterService() {
	def esService = new ElasticsearchService()
	esService.url = twitterUrl
	return esService
	}
	
	@Bean
	public ElasticsearchService esYelpService() {
	def esService = new ElasticsearchService()
	esService.url = yelpUrl
	return esService
	}
	
	static void main(String[] args) throws Exception {
		SpringApplication.run(Application.class, args)
	}
	
	@Value('${twitter.url}')
	def twitterUrl
	
	@Value('${yelp.url}')
	def yelpUrl
}