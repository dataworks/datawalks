controllers.controller('Display', ['$scope', 'Watch','NewWatch', function($scope, Watch, NewWatch, Display) {
	$scope.map;
	var pointarray;
	var heatmap;
	var heatmaps = [];
	var myMarker = null;
	var latLng = new google.maps.LatLng(38.942892, -77.334012);
    $scope.text = '';
    $scope.endtext = '';
    $scope.curr =[];
    $scope.deviceIds = [];
    $scope.lat = '';
    $scope.long = '';
    var longTw;
    var latTw;
    //Example coordinates
    //40.748441
    //-73.985664    
    $scope.avg = {
    	name: "average",
    	value: false
    };
    $scope.comp = {
    	name: "compare",
    	value: false
    };
      
	/* twitterGeo
	 * 
	 * Launches a new page with the desired coordinates
	 */
	$scope.twitterGeo = function() { 
		var left = (screen.width/2)-(750/2);
		var top = (screen.height/2)-(750/2);
		window.open("https://twitter.com/search?q=geocode%3A" + latTw + "%2C" + longTw +"%2C"+ 5 +"mi&src=typd&vertical=default&f=tweets", 'Tweets', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=750, height=750, top='+top+', left='+left);	
	}
    
	//Creates the heat map
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
		});

		google.maps.event.addListener(myMarker, 'dragstart', function(evt){
			document.getElementById('current').innerHTML = '<p>Currently dragging marker...</p>';
		});
		myMarker.setMap($scope.map);

		$scope.loadIds();
	}

	$scope.compare = function(index)
	{
		var arr = [];
		if(index == 0)
		{
			
		}
		else if(index == 1)
		{
			
		}
	}

	$scope.avgPath = function(index)
	{
		var c = 1;
		var avgLat = 0;
		var avgLon = 0;
		var avgData = [];
		var divCount = 0;
		if($scope.deviceIds[index].avgShown == false)
		{
			if($scope.deviceIds[index].selectDate == false)
			{
				for(var i  = 0; i < $scope.records.rows.length; i++)//naive way to calculate divisor
				{
					if($scope.deviceIds[index].id == $scope.records.rows[i].deviceid)
					{
						divCount++;
					}
				}
				var sqDiv = Math.round(Math.sqrt(divCount));
				for(var i  = 0; i < $scope.records.rows.length; i++)//find average points on path
				{
					if($scope.deviceIds[index].id == $scope.records.rows[i].deviceid)
					{
						if(c == sqDiv)
						{
							avgLat = avgLat+$scope.records.rows[i].latitude;
							avgLon = avgLon+$scope.records.rows[i].longitude;
							avgLat = avgLat/sqDiv;
							avgLon = avgLon/sqDiv;
							avgData.push(new google.maps.LatLng(avgLat, avgLon));
							avgLat = 0;
							avgLon = 0;
							c=1;
						}
						else
						{
							avgLat = avgLat+$scope.records.rows[i].latitude;
							avgLon = avgLon+$scope.records.rows[i].longitude;
							c++;
						}
					}
				}
				avgLat = 0;
				avgLon = 0;
				divCount = 0;
				var pointArray = new google.maps.MVCArray(avgData);
				heatmaps[index] = new google.maps.visualization.HeatmapLayer({
	              data: pointArray
	            });
				heatmaps[index].setMap($scope.map);
				
			}
			else
			{
				for(var i  = 0; i < $scope.records.rows.length; i++)//naive way to calculate divisor
				{
					if($scope.records.rows[i].deviceid == $scope.deviceIds[index].id &&
							$scope.deviceIds[index].stDate <= $scope.records.rows[i].dtime &&
							$scope.deviceIds[index].enDate >= $scope.records.rows[i].dtime)
					{
						divCount++;			
					}
				}
				var sqDiv = Math.round(Math.sqrt(divCount));
				for(var i  = 0; i < $scope.records.rows.length; i++)//naive way to calculate divisor
				{
					if($scope.records.rows[i].deviceid == $scope.deviceIds[index].id &&
							$scope.deviceIds[index].stDate <= $scope.records.rows[i].dtime &&
							$scope.deviceIds[index].enDate >= $scope.records.rows[i].dtime)
					{
						if(c == sqDiv)
						{
							avgLat = avgLat+$scope.records.rows[i].latitude;
							avgLon = avgLon+$scope.records.rows[i].longitude;
							avgLat = avgLat/sqDiv;
							avgLon = avgLon/sqDiv;
							avgData.push(new google.maps.LatLng(avgLat, avgLon));
							avgLat = 0;
							avgLon = 0;
							c=1;
						}
						else
						{
							avgLat = avgLat+$scope.records.rows[i].latitude;
							avgLon = avgLon+$scope.records.rows[i].longitude;
							c++;
						}			
					}
				}
				$scope.deviceIds[index].selectDate = false;
				avgLat = 0;
				avgLon = 0;
				divCount = 0;
				var pointArray = new google.maps.MVCArray(avgData);
				heatmaps[index] = new google.maps.visualization.HeatmapLayer({
	              data: pointArray
	            });
				heatmaps[index].setMap($scope.map);
			}
		}
	}
	
	$scope.matchId = function(ind)
	{
		var e;
		var index;
		var watchData = [];
		if(ind == -1)
		{
			e = document.getElementById("dropdownMenu");
			index = parseInt(e.options[e.selectedIndex].text)-1;
		}		
		else
		{
			index = ind;
		}		
		if($scope.deviceIds[index].value == true){
			$scope.deviceIds[index].value = false;
		}
		else
			$scope.deviceIds[index].value = true;

		if($scope.comp.value == true)
		{
			$scope.compare(index);
		}
		else if($scope.comp.value == false && 
				$scope.avg.value == true && $scope.deviceIds[index].value == true)
		{
			$scope.avgPath(index);
		}
		else
		{
			if(index == 0)
			{
				if($scope.deviceIds[index].value == true)
				{
					for(var i = 0; i < $scope.newRecords.rows4.length; i++)
					{
						watchData.push(new google.maps.LatLng(
								$scope.newRecords.rows4[i].latitude, $scope.newRecords.rows4[i].longitude)); 
					}
					console.log("new Rec "+$scope.newRecords.rows4[0].deviceid);
					console.log("dev " + $scope.deviceIds[index].id);
					var pointArray = new google.maps.MVCArray(watchData);
					heatmaps[index] = new google.maps.visualization.HeatmapLayer({
						data: pointArray
					});
					heatmaps[index].setMap($scope.map);
				}
				else
				{
					heatmaps[index].setMap(null);
				}				
			}
		}

	}

	$scope.loadIds = function()
	{
		for(var i = 0; i < $scope.newRecords.device.length; i++)
		{
			$scope.deviceIds.push({
				index: i+1,
				id: $scope.newRecords.device[i].device,
				stDate: 0,
				enDate: 0,
				selectDate: false,
				avgShown: false,
				value: false
			});	
		}
	}

	$scope.submit = function() 
	{
		var ind = Number(this.endtext.substring(0,1))-1;
		if($scope.deviceIds[ind].value = true)
		{
			heatmaps[ind].setMap(null);
		}
		var date = this.text.substring(3,13);//parse date yyyy-mm-dd
		date = date.split("-");
		var newDate = date[0]+","+date[1]+","+date[2] + " 00:00:00 GMT+0400";//date with commas instead of -
		$scope.deviceIds[ind].stDate = new Date(newDate).getTime();
		var edate = this.endtext.substring(3,13);
		edate = edate.split("-");
		var neweDate = edate[0]+","+edate[1]+","+edate[2] + " 23:59:59 GMT+0400";
		$scope.deviceIds[ind].enDate = new Date(neweDate).getTime();
		$scope.deviceIds[ind].value = true;
		$scope.deviceIds[ind].selectDate = true;
		$scope.matchId(ind);
		$scope.deviceIds[ind].stDate = 0;
		$scope.deviceIds[ind].enDate = 0;
		this.text = '';
		this.endtext = '';

	}
   
   $scope.recordsLoaded = function(results){
	   $scope.loadMap();   
   }
   
   $scope.newRecords = NewWatch.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
			$scope.recordsLoaded);   
}]);