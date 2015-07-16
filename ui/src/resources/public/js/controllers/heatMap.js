controllers.controller('Display', ['$scope', 'linker', 'Watch', 'WatchIds', function($scope, linker, Watch, WatchIds) {
	$scope.map;
	var heatmaps = [];
	var circles = [];
	var specDateHolder = [];
	var myMarker = null;
	var latLng = new google.maps.LatLng(38.942892, -77.334012);
    $scope.text = '';
    $scope.endtext = '';
    $scope.deviceIds = [];
    $scope.lat = '';
    $scope.long = '';
    $scope.calendar;
    var startDate="2015-06-01T00:00:00";
    var endDate="2016-06-01T00:00:00";
    var longTw;
    var latTw;
    $scope.ownerNames = [];
    $scope.avg = {
    	name: "average",
    	value: false
    };
    $scope.comp = {
    	name: "compare",
    	value: false
    };
      
    
	/* loadMap
	 * 
	 * Creates the heatmap and the marker at the office. Calls loadIds()
	 */
	$scope.loadMap = function() 
	{
		var mapOptions = {
				zoom: 10,
				center: new google.maps.LatLng(38.942892, -77.334012)
		};

		$scope.map = new google.maps.Map(document.getElementById('map-canvas'),
				mapOptions); 

		myMarker = new google.maps.Marker({
			position: latLng,
			draggable: true,
		});

		google.maps.event.addListener(myMarker, 'dragend', function(evt){
			document.getElementById('current').innerHTML = '<p>Marker dropped: Current Lat: ' + evt.latLng.lat().toFixed(3) + ' Current Lng: ' + evt.latLng.lng().toFixed(3) + '</p>';
			latTw = evt.latLng.lat().toFixed(3);
			longTw = evt.latLng.lng().toFixed(3);
			linker.getLatLong(latTw, longTw, startDate, endDate);
		});

		google.maps.event.addListener(myMarker, 'dragstart', function(evt){
			document.getElementById('current').innerHTML = '<p>Currently dragging marker...</p>';
		});
		myMarker.setMap($scope.map);
		$scope.loadIds();
	}
	
	/* parseToDateString
	 * 
	 * Convert date from 6/7/2015 to 2015-06-07T23:00:00
	 */
	var parseToDateString = function(dt){
        var rep = dt.split("/");
        rep4 = rep[0];
        rep[0] = rep[2];
        rep[2] = rep[1];
        rep[1] = rep4;
        ret = rep.join("-")+"T23:00:00";
        return ret;
    }


	$(document).ready(function () {                
		$("#jqxCalendar").jqxCalendar({width: 240, height: 220, 
			selectionMode: 'range', theme: 'energyblue'});
		$('#jqxCalendar').on('change', function (event) {
			var selection = event.args.range;
			startDate = parseToDateString(selection.from.toLocaleDateString());
			endDate = parseToDateString(selection.to.toLocaleDateString());
			var i = 0;
			for(var k = 0; k < $scope.deviceIds.length; k++)
			{
				if($scope.deviceIds[k].active === true)
				{
					i = k;
				}
			}
			if($scope.deviceIds.length != 0){
				if(specDateHolder[i].length != 0){
					var stCheck = 
						binSearch(new Date(moment(selection.from.toLocaleDateString())
								.subtract(1, 'm').add(24, 'h')).getTime()
								, specDateHolder[i]);
					var enCheck = 
						binSearch(new Date(moment(selection.to.toLocaleDateString())
								.subtract(1, 'm').add(24, 'h')).getTime()
								, specDateHolder[i]);
					if(stCheck < 0 || enCheck < 0)
					{
						window.alert("please select date with entries");
					}
					else
					{
						$scope.deviceIds[i].stDate = 
							new Date(selection.from.toLocaleDateString()).getTime();
						var en = moment(selection.to.toLocaleDateString()
								).add(23, 'h').add(59 , 'm');
						$scope.deviceIds[i].enDate = new Date(en).getTime();
						$scope.deviceIds[i].selectDate = true;
						$scope.deviceIds[i].value = true;
						$scope.matchId(i);
					}										
				}
			}
			$('#jqxCalendar').jqxCalendar('clear');
		});
	});	
	
	function binSearch(val, results)
	{
		var low = 0;
		var high = results.length - 1;

		while (low <= high) {
			var mid = Math.floor(low + ((high - low) / 2));
			var midVal;
			var midSub;
			var midPlus;
			if (results[mid].hasOwnProperty("dtime") == true)
			{
				midVal = results[mid].dtime;
				midSub = results[mid-1].dtime;
				midPlus = results[mid+1].dtime;
			}
			else
			{
				midVal = new Date(results[mid]).getTime();
				midSub = null;
				midPlus = null;
			}
			if ((midSub <= val && midPlus >= val)
					||midVal === val)
			{				
				return mid;		
			}
			else if (midVal > val)
			{
				high = mid - 1;
			}				
			else if(midVal < val)
			{
				low = mid + 1;
			}				
		}
		return -(low + 1);  // key not found.
	}
	
	function binStPrep(st, results)
	{
		var startInd;
		if(st > results.rows[0].dtime)
		{
			startInd = binSearch(st, results.rows);
			if(results.rows[startInd].dtime < startInd)
			{
				startInd--;
			}
			else
			{
				startInd++;
			}
			
		}
		else if(st > results.rows[results.rows.length-1].dtime)
		{
			window.alert("date doesnt exist");
		}
		else if(st < results.rows[0].dtime)
		{
			startInd = 0;
		}
		return startInd;
	}
	
	function binSplitPrep(split, results)
	{
		var splitInd;
		if(split < results.rows[0].dtime || 
				split > results.rows[results.rows.length-1].dtime)
		{
			window.alert("entry doesnt exist");
		}
		else
		{
			splitInd = binSearch(split, results.rows);
		}
		return splitInd;
	}
	function binEnPrep(en, results)
	{
		var endInd;
		if(en < results.rows[results.rows.length-1].dtime)
		{
			endInd = binSearch(en, results.rows);
			if(results.rows[endInd] > en)
			{
				endInd++;
			}
			else
			{
				endInd--;
			}
		}
		else if(en < results.rows[0].dtime)
		{
			window.alert("date doesnt exist");
		}
		else
		{
			endInd = results.rows.length-1;
		}
		return endInd;
	}
	
	$scope.compare = function(results, index)
	{
		var count = 1;
		var avgData = [];
		var avgLat = 0;
		var avgLon = 0;
		var div1 = 0;
		
		var splitDate;
		var div2 = 0;
		var splitDate;
		var stDate;
		var splitInd;
		var startInd;
		var endInd;
		var stHolder;
		
		if($scope.deviceIds[index].selectDate == true)
		{
			endInd = binEnPrep($scope.deviceIds[index].enDate, results);
			splitDate = moment(results.rows[endInd-1].dtime).format("YYYY-MM-DD");
			stHolder = binSearch(moment($scope.deviceIds[index].stDate).format("YYYY-MM-DD"));
			splitDate = new Date(splitDate).getTime();
			splitInd = binSplitPrep(splitDate, results);
			startInd = binStPrep($scope.deviceIds[index].stDate, results);
			div1 = Math.floor(Math.sqrt(splitInd - startInd));
			div2 = Math.floor(Math.sqrt(endInd - splitInd));
		}
		else
		{
			splitDate = moment(results.rows[results.rows.length-1].dtime).format("YYYY-MM-DD");
			splitDate = new Date(splitDate).getTime();
			splitInd = binSplitPrep(splitDate, results);
			startInd = 0;
			stHolder = 0;
			endInd = results.rows.length-1;
			div1 = Math.floor(Math.sqrt(splitInd));
			div2 = Math.floor(Math.sqrt(endInd - splitInd));
		}
		centroids = [];
		var c = 0;
		var avg = 1;
		var centLat = 0;
		var centLon = 0;
		var ind = 0;
		for(var i = startInd; i < splitInd+1; i++)
		{
			if(i == splitInd)
			{
				if(avg != 1)
					avg--;
				if(Math.abs(centroids[ind].lat.toFixed(2) - (centLat/avg).toFixed(2)) > .3 || 
						Math.abs(centroids[ind].lon - (centLon/avg).toFixed(2))>.3)
				{
					ind++;
					centroids.push({
						lat: centLat/avg,
						lon: centLon/avg,
						weight: 1
					});
				}
				else
				{
					centroids[ind].lat = (centroids[ind].lat + (centLat/avg))/2;
					centroids[ind].lon = (centroids[ind].lon + (centLon/avg))/2;
					centroids[ind].weight++;
				}
			}
			if(results.rows[i].dtime < new Date(specDateHolder[index][stHolder]).getTime())
			{				
				centLat = centLat + results.rows[i].latitude;
				centLon = centLon + results.rows[i].longitude;
				avg++;
			}
			else
			{
				if(avg != 1)
					avg--;
				stHolder++;
				if(centroids.length != 0)
				{
					if(Math.abs(centroids[ind].lat.toFixed(2) - (centLat/avg).toFixed(2)) > .3 || 
							Math.abs(centroids[ind].lon - (centLon/avg).toFixed(2))>.3)
					{
						ind++;
						centroids.push({
							lat: centLat/avg,
							lon: centLon/avg,
							weight: 1
						});
					}
					else
					{
						centroids[ind].lat = (centroids[ind].lat + (centLat/avg))/2;
						centroids[ind].lon = (centroids[ind].lon + (centLon/avg))/2;
						centroids[ind].weight++;
					}
				}
				else
				{
					centroids.push({
						lat: centLat/avg,
						lon: centLon/avg,
						weight: 1
					});
				}
				centLat = 0;
				centLon = 0;
				avg=1;
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
				console.log("1");
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
		console.log(centLat + " " + centLon);
		avgData.push({location: new google.maps.LatLng(centLat, centLon), weight: 1});
		console.log(greatestWeight);
		var prevDist = 0;
		var p1Lat;
		var p1Lon;
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
		var p2Lat = 0;
		var p2Lon = 0;
		for(var i = 0; i < centroids.length; i++)
		{
			var dist= 0;
			if(centroids[i].weight> 2)
			{
				dist = Math.sqrt(Math.pow(centroids[i].lat - p1Lat, 2) 
						+ Math.pow(centroids[i].lon - p1Lon, 2));
				console.log(dist);
				if(dist > prevDist)
				{
					console.log("bull");
					prevDist = dist;
					p2Lat = centroids[i].lat;
					p2Lon = centroids[i].lon;
				}
			}		
		}
		console.log("points " + p1Lat + " " + p1Lon + " " + p2Lat + " " + p2Lon);
		if(p2Lon == 0 && p2Lat ==0)
		{
			p2Lat = p1Lat - .3;
			p2Lon = p1Lon - .3;
		}
		var baseDist = Math.sqrt(Math.pow(p2Lat - p1Lat, 2) 
				+ Math.pow(p2Lon - p1Lon, 2));
		var R = 6371; // Radius of the earth in km
		var dLat = Math.abs(p2Lat - p1Lat) * Math.PI / 180;  // deg2rad below
		var dLon = Math.abs(p2Lon - p1Lon) * Math.PI / 180;
		var a = 
			0.5 - Math.cos(dLat)/2 + 
			Math.cos(p1Lat * Math.PI / 180) * Math.cos(p2Lat * Math.PI / 180) * 
			(1 - Math.cos(dLon))/2;

		avgData[0].weight = (R * 2 * Math.asin(Math.sqrt(a)));
		console.log(avgData[0].weight);
		count = 1;
		for(var i = splitInd; i < endInd; i++)
		{
			if(count == div2)
			{
				var w;
				avgLat = avgLat + results.rows[i].latitude;
				avgLon = avgLon + results.rows[i].longitude;
				avgLat = avgLat/count;
				avgLon = avgLon/count;
				var dist = Math.sqrt(Math.pow(avgLat - centLat, 2) + Math.pow(avgLon - centLon, 2));
				if(dist > baseDist/2)
				{
					avgData.push({location: new google.maps.LatLng(avgLat, avgLon), weight: Math.pow(dist, 6) + 5});
				}				
				count = 1;
				avgLat = 0;
				avgLon = 0;
			}
			else if(i == endInd-1)
			{
				avgLat = avgLat + results.rows[i].latitude;
				avgLon = avgLon + results.rows[i].longitude;
				avgLat = avgLat/count;
				avgLon = avgLon/count;
				var dist = Math.sqrt(Math.pow(avgLat - centLat, 2) + Math.pow(avgLon - centLon, 2));
				avgData.push({location: new google.maps.LatLng(avgLat, avgLon), weight: Math.pow(dist, 3) + 5});
			}
			else 
			{
				avgLat = avgLat + results.rows[i].latitude;
				avgLon = avgLon + results.rows[i].longitude;
				count++;
			}
		}
		return avgData;
	}

	$scope.avgPath = function(results, index)
	{
		var count = 1;
		var avgData = [];
		var avgLat = 0;
		var avgLon = 0;
		var div = 0;
		var stInd = 0;
		var endInd = results.rows.length;
		if($scope.deviceIds[index].selectDate == true)
		{
			stInd = binStPrep($scope.deviceIds[index].stDate, results);
			endInd = binEnPrep($scope.deviceIds[index].enDate, results);
			div = Math.floor(Math.sqrt(endInd - stInd));
		}
		else
		{
			div = Math.floor(Math.sqrt(results.rows.length));
		}
		
		for(var i = stInd; i < endInd; i++)
		{
			if(count == div)
			{
				avgLat = avgLat + results.rows[i].latitude;
				avgLon = avgLon + results.rows[i].longitude;
				avgLat = avgLat/count;
				avgLon = avgLon/count;
				avgData.push({location: new google.maps.LatLng(avgLat, avgLon), weight: 1});
				count = 1;
				avgLat = 0;
				avgLon = 0;
			}
			else if(i == endInd)
			{
				avgLat = avgLat + results.rows[i].latitude;
				avgLon = avgLon + results.rows[i].longitude;
				avgLat = avgLat/count;
				avgLon = avgLon/count;
				avgData.push({location: new google.maps.LatLng(avgLat, avgLon), weight: 1});
			}
			else 
			{
				avgLat = avgLat + results.rows[i].latitude;
				avgLon = avgLon + results.rows[i].longitude;
				count++;
			}
		}
		return avgData;
	}
	
	var ctr = 0;
	var prevInd;
	/* matchId
	 * 
	 * Gets the selected device from the dropdown
	 */
	$scope.matchId = function(ind)
	{
		var e;
		var index;
		if(ind == -1)
		{
			e = document.getElementById("dropdownMenu");
			index = $scope.ownerNames.indexOf(e.options[e.selectedIndex].text);
			$scope.deviceIds[index].active = true;
			if(prevInd == null)
			{
				prevInd = index;
			}
			if(prevInd != index)
			{
				$scope.deviceIds[prevInd].active = false;
			}
			prevInd = index;
		}		
		else
		{
			index = ind;
		}
		$scope.deviceIds[index].value = true;
		if(heatmaps[index].length === 0)
		{
			$scope.deviceIds[index].value = true;
			loadHeatMap(index);
		}
		else if($scope.deviceIds[index].selectDate == true)
		{
			loadHeatMap(index);
		}
		if($scope.deviceIds[index].value = true 
				&& $scope.deviceIds[index].selectDate == false)
		{
			updateCalendar(index);
		}
	}
	
	function loadHeatMap(index)
	{
		$scope.records = Watch.query({id: $scope.deviceIds[index].id, 
			startDate:'2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, devLoaded);
	}

	function updateCalendar(index)
	{
		var sD = $("#jqxCalendar").jqxCalendar('specialDates');
        sD = [];
        $("#jqxCalendar").jqxCalendar({ specialDates: sD });
		
		for(var i = 0; i < specDateHolder[index].length; i++)
		{
			$("#jqxCalendar").jqxCalendar('addSpecialDate', specDateHolder[index][i], 
					'jqx-calendar-cell-specialDate1', 'run');
		}
	}

	
	var devLoaded = function(results){
		for(var i = 0; i < $scope.deviceIds.length; i++)
			if($scope.deviceIds[i].id == results.rows[0].deviceid)	
				index = $scope.deviceIds[i].index-1;
		if($scope.deviceIds[index].selectDate == false)
		{
			if(specDateHolder[index].length == 0)
	        {
				var c = 0;
	        	for(var i = 0; i < results.uniqueDates.length; i++)
				{
					if(results.uniqueDates[i].devid === $scope.deviceIds[index].id)
					{
						specDateHolder[index][c] = 
							new Date(moment(results.uniqueDates[i].dtime).add(23, 'h').add(59, 'm'));
						c++;
					}		
				}
	        }
			var sD = $("#jqxCalendar").jqxCalendar('specialDates');
	        sD = [];
	        $("#jqxCalendar").jqxCalendar({ specialDates: sD });
	        for(var i = 0; i < specDateHolder[index].length; i++)
			{
				$("#jqxCalendar").jqxCalendar('addSpecialDate', specDateHolder[index][i], 
						'jqx-calendar-cell-specialDate1', 'run');
			}
		}
		var watchData = [];
		var index;
		var latlngBounds = new google.maps.LatLngBounds();
		
		if(heatmaps[index].length != 0)
		{
			heatmaps[index].setMap(null);
			
		}
		if(circles[index].length!= 0)
		{
			circles[index].setMap(null);
		}
		if($scope.comp.value == true)
		{
			watchData = $scope.compare(results, index);
			var circle = {
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#FF0000',
					fillOpacity: 0.35,
					map:$scope.map,
					center: watchData[0].location,
					radius: watchData[0].weight * 100
			};
			latlngBounds.extend(watchData[0].location);
			watchData.shift();
			circles[index] = new google.maps.Circle(circle);
			circles[index].setMap($scope.map);
		}
		else if($scope.comp.value == false && 
				$scope.avg.value == true && $scope.deviceIds[index].value == true)
		{
			watchData = $scope.avgPath(results, index);			
		}
		else
		{
			var st = 0;
			var en = results.rows.length;
			if($scope.deviceIds[index].selectDate == true)
			{
				st = binStPrep($scope.deviceIds[index].stDate, results);
				en = binEnPrep($scope.deviceIds[index].enDate, results);
			}
			var j = en-1;
			for(var i = st; i < j; i+=5, j-=5)
			{
				watchData.push({location: new google.maps.LatLng(results.rows[i].latitude, 
						results.rows[i].longitude), weight: 2.5});	
				watchData.push({location: new google.maps.LatLng(results.rows[j].latitude, 
						results.rows[j].longitude), weight: 2.5});
			}			
		}
		
		j = watchData.length -1;
		for (var i = 0; i < j; i++, j--) {
			latlngBounds.extend(watchData[i].location);
			latlngBounds.extend(watchData[j].location);
		}
		
		var pointArray = new google.maps.MVCArray(watchData);
		heatmaps[index] = new google.maps.visualization.HeatmapLayer({
			data: pointArray});
		heatmaps[index].setMap($scope.map);

		//Fit the map to show all points 
		$scope.map.setCenter(latlngBounds.getCenter());
		$scope.map.fitBounds(latlngBounds);

		$scope.deviceIds[index].stDate = 0;
		$scope.deviceIds[index].enDate = Number.MAX_VALUE;
		$scope.deviceIds[index].selectDate = false;
	}
	
	/* clear()
	 * 
	 * Associated with the clear button. Self-explanatory
	 */
	$scope.clear = function()
	{
		for(var i = 0; i < $scope.deviceIds.length; i++)
		{
			if(specDateHolder[i].length != 0)
			{				
				specDateHolder[i] = [];
				var sD = $("#jqxCalendar").jqxCalendar('specialDates');
		        sD = [];
		        $("#jqxCalendar").jqxCalendar({ specialDates: sD });
				heatmaps[i].setMap(null);
				circles[i].setMap(null);
				heatmaps[i] = [];
				circles[i] = [];
				$scope.deviceIds[i].value = false;
			}
		}
	}
	
	/* loadIds()
	 * 
	 * Load devices and other variables into deviceIds[]
	 */
	$scope.loadIds = function()
	{
		for(var i = 0; i < $scope.selectedDeviceIds.length; i++)
		{
			$scope.deviceIds.push({
				index: i+1,
				id: $scope.selectedDeviceIds[i],
				stDate: 0,
				enDate: Number.MAX_VALUE,
				selectDate: false,
				avgShown: false,
				value: false,
				active: false,
				name: $scope.ownerNames[i]
			});
			specDateHolder[i] = [];
			heatmaps[i] = [];
			circles[i] = [];
		}
	}
	 
	deviceSelected = function(){
		   var arraySelected = []
		   for (var i = 0; i < $scope.deviceIds.length;i++){
			   if( $scope.deviceIds[i].value == true)
				   arraySelected.push($scope.deviceIds[i].id);
		   }
		   return arraySelected;
	   }
   
	$scope.recordsLoaded = function(results){
		for(var i = 0; i < results.ownerNames.length; i++)
			$scope.ownerNames.push(results.ownerNames[i].ownerName);
		$scope.loadMap();    
	}

   $scope.devicesLoaded = function(results){
	   $scope.selectedDeviceIds = []
	   for(var i=0; i< results.rows.length; i++)
			$scope.selectedDeviceIds.push(results.rows[i].device);
	   
	   $scope.records = Watch.query({id: $scope.selectedDeviceIds , startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
				$scope.recordsLoaded);
   }
   
   WatchIds.query( {}, $scope.devicesLoaded );
   
}]);