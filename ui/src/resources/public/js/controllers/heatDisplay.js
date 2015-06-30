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
				if(index == 0)
				{
					
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
		console.log(index);
		if($scope.deviceIds[index].value == true && $scope.deviceIds[index].selectDate == false){
			$scope.deviceIds[index].value = false;
		}
		else if($scope.deviceIds[index].value == false && $scope.deviceIds[index].selectDate == false)
		{
			$scope.deviceIds[index].value = true;
		}

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
			loadHeatMap(watchData, index);
		}

	}
	
	function loadHeatMap(watchData, index)
	{
		console.log("load heat "+ index);
		switch(index)
		{
			case 0:
				if($scope.deviceIds[index].value == true)
				{
					for(var i = 0; i < $scope.newRecords.rows4.length; i++)
					{
						
						if($scope.deviceIds[index].stDate <= $scope.newRecords.rows4[i].dtime &&
								$scope.deviceIds[index].enDate >= $scope.newRecords.rows4[i].dtime)
						{
							watchData.push(new google.maps.LatLng(
									$scope.newRecords.rows4[i].latitude, $scope.newRecords.rows4[i].longitude));
						}						 
					}
					var pointArray = new google.maps.MVCArray(watchData);
					heatmaps[index] = new google.maps.visualization.HeatmapLayer({
						data: pointArray
					});
					heatmaps[index].setMap($scope.map);
				}
				else
				{
					
					$scope.deviceIds[index].stDate = 0;
					$scope.deviceIds[index].enDate = Number.MAX_VALUE;
					heatmaps[index].setMap(null);
				}
				break;
			case 1:
				if($scope.deviceIds[index].value == true)
				{
					for(var i = 0; i < $scope.newRecords.rows5.length; i++)
					{
						if($scope.deviceIds[index].stDate <= $scope.newRecords.rows5[i].dtime &&
								$scope.deviceIds[index].enDate >= $scope.newRecords.rows5[i].dtime)
						{
							watchData.push(new google.maps.LatLng(
									$scope.newRecords.rows5[i].latitude, $scope.newRecords.rows5[i].longitude));
						}				 
					}
					var pointArray = new google.maps.MVCArray(watchData);
					heatmaps[index] = new google.maps.visualization.HeatmapLayer({
						data: pointArray
					});
					heatmaps[index].setMap($scope.map);
				}
				else
				{
					$scope.deviceIds[index].stDate = 0;
					$scope.deviceIds[index].enDate = Number.MAX_VALUE;
					heatmaps[index].setMap(null);
				}
				break;
			case 2:
				if($scope.deviceIds[index].value == true)
				{
					for(var i = 0; i < $scope.newRecords.rows3.length; i++)
					{
						if($scope.deviceIds[index].stDate <= $scope.newRecords.rows3[i].dtime &&
								$scope.deviceIds[index].enDate >= $scope.newRecords.rows3[i].dtime)
						{
							watchData.push(new google.maps.LatLng(
									$scope.newRecords.rows3[i].latitude, $scope.newRecords.rows3[i].longitude));
						}				 
					}
					var pointArray = new google.maps.MVCArray(watchData);
					heatmaps[index] = new google.maps.visualization.HeatmapLayer({
						data: pointArray
					});
					heatmaps[index].setMap($scope.map);
				}
				else
				{
					$scope.deviceIds[index].stDate = 0;
					$scope.deviceIds[index].enDate = Number.MAX_VALUE;
					heatmaps[index].setMap(null);
				}
				break;
			case 3:
				if($scope.deviceIds[index].value == true)
				{
					for(var i = 0; i < $scope.newRecords.rows1.length; i++)
					{
						if($scope.deviceIds[index].stDate <= $scope.newRecords.rows1[i].dtime &&
								$scope.deviceIds[index].enDate >= $scope.newRecords.rows1[i].dtime)
						{
							watchData.push(new google.maps.LatLng(
									$scope.newRecords.rows1[i].latitude, $scope.newRecords.rows1[i].longitude));
						}				
					}
					var pointArray = new google.maps.MVCArray(watchData);
					heatmaps[index] = new google.maps.visualization.HeatmapLayer({
						data: pointArray
					});
					heatmaps[index].setMap($scope.map);
				}
				else
				{
					console.log("dag");
					$scope.deviceIds[index].stDate = 0;
					$scope.deviceIds[index].enDate = Number.MAX_VALUE;
					heatmaps[index].setMap(null);
				}
				break;
			case 4:
				
				if($scope.deviceIds[index].value == true)
				{
					console.log("four");
					for(var i = 0; i < $scope.newRecords.rows2.length; i++)
					{
						if($scope.deviceIds[index].stDate <= $scope.newRecords.rows2[i].dtime &&
								$scope.deviceIds[index].enDate >= $scope.newRecords.rows2[i].dtime)
						{
							watchData.push(new google.maps.LatLng(
									$scope.newRecords.rows2[i].latitude, $scope.newRecords.rows2[i].longitude));
						}				 
					}
					var pointArray = new google.maps.MVCArray(watchData);
					heatmaps[index] = new google.maps.visualization.HeatmapLayer({
						data: pointArray
					});
					heatmaps[index].setMap($scope.map);
				}
				else
				{
					console.log("bad");
					$scope.deviceIds[index].stDate = 0;
					$scope.deviceIds[index].enDate = Number.MAX_VALUE;
					heatmaps[index].setMap(null);
				}
				break;				
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
				enDate: Number.MAX_VALUE,
				selectDate: false,
				avgShown: false,
				value: false
			});	
		}
	}

	$scope.submit = function() 
	{
		if(this.text == '' && this.endtext == '')
		{
			window.alert("enter date for at least 1 of them");
		}
		else
		{
			var ind;
			var date;
			var edate;			
			if(this.text == '')
			{				
				$scope.deviceIds[ind].stDate = 0;
			}
			else
			{
				ind = Number(this.text.substring(0,1))-1;
				date = moment(this.text.substring(3,13)).format("YYYY,MM,DD");//parse date yyyy-mm-dd
				console.log(date);
				$scope.deviceIds[ind].stDate = new Date(date).getTime();
			}		
			if(this.endtext == '')
			{
				$scope.deviceIds[ind].enDate = Number.MAX_VALUE;
			}
			else
			{
				ind = Number(this.endtext.substring(0,1))-1;
				edate = moment(this.endtext.substring(3,13)).format("YYYY,MM,DD");
				edate = moment(edate).add(23, 'h').add(59, 'm');
				console.log(edate);
				$scope.deviceIds[ind].enDate = new Date(edate).getTime();
			}
			
			if($scope.deviceIds[ind].value == true)
			{
				heatmaps[ind].setMap(null);
			}
			
			$scope.deviceIds[ind].value = true;
			$scope.deviceIds[ind].selectDate = true;
			
			$scope.matchId(ind);
			$scope.deviceIds[ind].stDate = 0;
			$scope.deviceIds[ind].enDate = Number.MAX_VALUE;
			$scope.deviceIds[ind].selectDate = false;
			this.text = '';
			this.endtext = '';
		}
	}
   
   $scope.recordsLoaded = function(results){
	   $scope.loadMap();   
   }
   
   $scope.newRecords = NewWatch.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
			$scope.recordsLoaded);   
}]);