services.service('Compare', function(BinSearch)
{
	this.compare = function(results, index, deviceIds, specDateHolder)
	{
		var count = 1;
		var avgData = [];
		var avgLat = 0;
		var avgLon = 0;
		var div2 = 0;
		var stDate;
		var startInd;
		var endInd;
		var stHolder;
		var centroids = [];
		
		if(deviceIds[index].selectDate == true)
		{
			endInd = BinSearch.binEnPrep(deviceIds[index].enDate, results);
			stHolder = BinSearch.binSearch(new Date(moment(deviceIds[index].stDate).add(23, 'h').add(59, 'm')).getTime(), 
					specDateHolder[index]);
			startInd = BinSearch.binStPrep(deviceIds[index].stDate, results);
			div2 = Math.floor(Math.sqrt(endInd));
		}
		else
		{
			startInd = 0;
			stHolder = 0;
			endInd = results.rows.length-1;
			div2 = Math.floor(Math.sqrt(endInd));
		}
		var c = 1;
		var centLat = 0;
		var centLon = 0;
		var ind = 0;
		var latlngBounds = new google.maps.LatLngBounds();
		for(var i = startInd; i < endInd+1; i++)
		{
			if(results.rows[i].dtime < new Date(specDateHolder[index][stHolder]).getTime())
			{
				centLat = centLat + results.rows[i].latitude;
				centLon = centLon + results.rows[i].longitude;
				c++;
			}
			else if(results.rows[i].dtime > new Date(specDateHolder[index][stHolder]).getTime() ||
					i == endInd)
			{
				centLat = (centLat + results.rows[i].latitude)/c;
				centLon = (centLon + results.rows[i].longitude)/c;
				stHolder++;
				if(centroids.length != 0)
				{
					
					if(Math.abs(centroids[ind].lat.toFixed(2) - centLat.toFixed(2)) > .2 || 
							Math.abs(centroids[ind].lon - centLon.toFixed(2))>.2)
					{
						ind++;
						centroids.push({
							lat: centLat,
							lon: centLon,
							weight: 1
						});
					}
					else
					{
						centroids[ind].lat = (centroids[ind].lat + centLat)/2;
						centroids[ind].lon = (centroids[ind].lon + centLon)/2;
						centroids[ind].weight++;
					}
				}
				else
				{
					centroids.push({
						lat: centLat,
						lon: centLon,
						weight: 1
					});
				}
				c = 1;
				centLat = 0;
				centLon = 0;
			}
		}
		centLat = 0;
		centLon = 0;
		var greatestWeight = 0;
		var totWeight = 0;
		for(var i = 0; i < centroids.length; i++)
		{
			if(centroids[i].weight >2)
			{				
				centroids[i].weight = centroids[i].weight*2;
			}
			else
			{
				centroids[i].weight = centroids[i].weight/10;
			}
			if(centroids[i].weight > greatestWeight)
			{
				greatestWeight = centroids[i].weight;
			}
			centLat = centLat + (centroids[i].lat*centroids[i].weight);
			centLon = centLon + (centroids[i].lon*centroids[i].weight);
			totWeight = totWeight + centroids[i].weight;
		}
		centLat = centLat/totWeight;
		centLon = centLon/totWeight;
		avgData.push({location: new google.maps.LatLng(centLat, centLon), weight: 1});
		var prevDist = 0;
		var p1Lat = .2;
		var p1Lon = .2;
		var p2Lat = 0;
		var p2Lon = 0;
		if(centroids.length > 1)
		{
			for(var i = 0; i < centroids.length; i++)
			{
				var dist= 0;
				if(centroids[i].weight> 2)
				{
					dist = Math.sqrt(Math.pow(centroids[i].lat - centLat, 2) 
							+ Math.pow(centroids[i].lon - centLon, 2));
					if(dist > prevDist)
					{
						prevDist = dist;
						p1Lat = centroids[i].lat;
						p1Lon = centroids[i].lon;
					}
				}			
			}
			prevDist = 0;
			
			for(var i = 0; i < centroids.length; i++)
			{
				var dist= 0;
				if(centroids[i].weight> 2)
				{
					dist = Math.sqrt(Math.pow(centroids[i].lat - p1Lat, 2) 
							+ Math.pow(centroids[i].lon - p1Lon, 2));
					if(dist > prevDist)
					{
						prevDist = dist;
						p2Lat = centroids[i].lat;
						p2Lon = centroids[i].lon;
					}
				}		
			}
			if(p2Lat == 0 && p2Lon == 0)
			{
				p2Lat = p1Lat - .2;
				p2Lon = p1Lon - .2;
			}
			if(Math.abs(p1Lat - p2Lat) < .1 && Math.abs(p1Lon - p2Lon) < .1)
			{
				if(p1Lat - p2Lat > 0 && p1Lon - p2Lon > 0)
				{
					p1Lat += .2;
					p1Lon +=.2;
				}
				else if(p2Lat - p1Lat > 0 && p2Lon - p1Lon > 0)
				{
					p2Lat += .2;
					p2Lon += .2;
				}
			}			
		}
		var R = 6371; // Radius of the earth in km
		var dLat = Math.abs(p2Lat - p1Lat) * Math.PI / 180;  // deg2rad below
		var dLon = Math.abs(p2Lon - p1Lon) * Math.PI / 180;
		var a = 
			0.5 - Math.cos(dLat)/2 + 
			Math.cos(p1Lat * Math.PI / 180) * Math.cos(p2Lat * Math.PI / 180) * 
			(1 - Math.cos(dLon))/2;
		avgData[0].weight = (R * 2 * Math.asin(Math.sqrt(a)));
		var baseDist = Math.sqrt(Math.pow((dLat*(180/Math.PI))/2, 2) 
				+ Math.pow((dLon*(180/Math.PI))/2, 2));
		for(var i = startInd; i < endInd; i++)
		{
			var dist = Math.sqrt(Math.pow(results.rows[i].latitude - centLat, 2) 
					+ Math.pow(results.rows[i].longitude - centLon, 2));
			if(dist > baseDist/2)
			{
				avgData.push({location: new google.maps.LatLng(results.rows[i].latitude, results.rows[i].longitude)
				, weight: Math.pow(dist+5, 6)});
			}		
		}
		if(avgData.length == 1)
		{
			avgData.push({location: new google.maps.LatLng(centLat- .1, centLon -.1)
			, weight: 0});
			avgData.push({location: new google.maps.LatLng(centLat+ .1, centLon +.1)
			, weight: 0});
		}
		
		return avgData;
	};
});