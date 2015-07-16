package datawalks.service

import groovyx.net.http.HttpResponseException
import groovyx.net.http.RESTClient

import org.springframework.stereotype.Service

@Service
class ElasticsearchService {
	def url = "http://172.31.62.129:9200/twitter/tweet/";

	/**
	 * Returns a document by path
	 * @param path Path to document
	 * @return _source of document if found
	 */
	def getDocument(path) {
		def client = new RESTClient("http://172.31.62.129:9200/twitter/tweet/")
		client.handler.failure = {}

		def resp = client.get([:])
		resp?.status == 200 && resp.data.found ? resp.data._source : null
	}

	/**
	 * Searches ES with the given optional param map:
	 *
	 * query - Query map
	 * filter - Filter map
	 * size - Max results to return
	 * sort - Sort map
	 *
	 * @return List of _source maps
	 */
	def search(params = [:]) {
		def client = new RESTClient("http://172.31.62.129:9200/twitter/tweet/") //using 'url' didnt work for some reason
		def size = params.size ?: 200
		def from = params.from ?: 0
		def body = [size: size, from: from]
		def query = params.query ?: [match_all: []]

		if (params.filter) {
			body.query = [
				filtered: [query: query, filter: params.filter]
			]
		} else {
			body.query = query
		}

		if (params.aggs) {
			body.aggs = params.aggs
		}

		if (params.sort) {
			body.sort = params.sort
		}

		def resp = client.post(path: '_search',
		requestContentType : 'application/json',
		body: body
		)

		assert resp.status == 200
		assert resp.data."_shards".failed == 0

		long resultId = from + 1
		[hits: resp.data.hits.hits.collect { it."_source" + [resultId: resultId++] }, aggs: resp.data.aggregations, total: resp.data.hits.total]
	}
}