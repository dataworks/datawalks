package datawalks.service

import org.springframework.stereotype.Service

@Service
class SqlService {
	def getGeoPoints(long watchId, Date startDate, Date stopDate) {
		return [
			[id: 1, lat: 38.942914, lon: -77.334032, date: new Date()],
			[id: 1, lat: 38.942914, lon: -77.334032, date: new Date().getTime() + 10000],
			[id: 1, lat: 38.942914, lon: -77.334032, date: new Date().getTime() + 20000],
			[id: 1, lat: 38.942914, lon: -77.334032, date: new Date().getTime() + 60000]
		]
	}
}