controllers.controller('Display', ['$scope', 'linker', 'Watch', 'WatchIds', function($scope, linker, Watch, WatchIds) {
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
    // Example coordinates
    // 40.748441
    // -73.985664
    $scope.avg = {
    	name: "average",
    	value: false
    };
    $scope.comp = {
    	name: "compare",
    	value: false
    };
      
    
	// Creates the heat map
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
			linker.getLatLong(latTw, longTw);
		});

		google.maps.event.addListener(myMarker, 'dragstart', function(evt){
			document.getElementById('current').innerHTML = '<p>Currently dragging marker...</p>';
		});
		myMarker.setMap($scope.map);

		$scope.loadIds();
	}

	$scope.compare = function(index)
	{

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
				for(var i  = 0; i < $scope.records.rows.length; i++)
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
				for(var i  = 0; i < $scope.records.rows.length; i++)// naive way
																	// to
																	// calculate
																	// divisor
				{
					if($scope.records.rows[i].deviceid == $scope.deviceIds[index].id &&
							$scope.deviceIds[index].stDate <= $scope.records.rows[i].dtime &&
							$scope.deviceIds[index].enDate >= $scope.records.rows[i].dtime)
					{
						divCount++;			
					}
				}
				var sqDiv = Math.round(Math.sqrt(divCount));
				for(var i  = 0; i < $scope.records.rows.length; i++)// naive way
																	// to
																	// calculate
																	// divisor
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
		if(ind == -1)
		{
			e = document.getElementById("dropdownMenu");
			index = parseInt(e.options[e.selectedIndex].text)-1;
		}		
		else
		{
			index = ind;
		}
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
			loadHeatMap(index);
		}

	}
	
	function loadHeatMap(index)
	{
		$scope.records = Watch.query({id: $scope.deviceIds[index].id, 
			startDate:'2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, devLoaded);
	}
	var devLoaded = function(results){
		var watchData = [];
		var index;
		for(var i = 0; i < results.rows.length; i++)
		{
			watchData.push(new google.maps.LatLng(results.rows[i].latitude, 
					results.rows[i].longitude));
		}
		for(var i = 0; i < $scope.deviceIds.length; i++)
		{
			if($scope.deviceIds[i].id == results.rows[0].deviceid)
			{			
				index = $scope.deviceIds[i].index-1;
			}
		}
		
		var pointArray = new google.maps.MVCArray(watchData);
		heatmaps[index] = new google.maps.visualization.HeatmapLayer({
			data: pointArray});
		heatmaps[index].setMap($scope.map);
	}
	
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
	 
	deviceSelected = function(){
		   var arraySelected = []
		   for (var i = 0; i < $scope.deviceIds.length;i++){
			   if( $scope.deviceIds[i].value == true)
				   arraySelected.push($scope.deviceIds[i].id);
		   }
		   return arraySelected;
	   }
   
   $scope.recordsLoaded = function(results){
	   $scope.loadMap();    
   }
	
   $scope.devicesLoaded = function(results){
	   $scope.selectedDeviceIds = []
	   for(var i=0; i< results.rows.length; i++){
			$scope.selectedDeviceIds.push(results.rows[i].device);
	   }
	   
	   $scope.records = Watch.query({id: $scope.selectedDeviceIds , startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
				$scope.recordsLoaded);
   }
   
   WatchIds.query( {}, $scope.devicesLoaded );
   
}]);