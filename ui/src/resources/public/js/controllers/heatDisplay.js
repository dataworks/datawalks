controllers.controller('Display', ['$scope', 'Watch', function($scope, Watch) {
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
    var longTw;;
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
	   center: new google.maps.LatLng($scope.records.rows[0].latitude, $scope.records.rows[0].longitude)
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
		var c = 1;
		var ind;
		var avgLat = 0;
		var avgLon = 0;
		var avgData = [];
		var pastCount = 0;
		var currCount = 0;
		
		for(var i  = 0; i < $scope.records.rows.length; i++)//naive way to calculate divisor
		{
			if($scope.deviceIds[index].id == $scope.records.rows[i].deviceid)
			{
				pastCount++;
			}
			ind = i;
		}
		console.log(ind);
		console.log("id " + $scope.records.rows[ind].deviceid + " " +$scope.records.rows[ind].dtime);
		var date = moment.unix($scope.records.rows[ind].dtime/1000).format("YYYY/MM/DD");
		console.log(date);
		var unxTS = moment().format(date, "X");
		console.log(unxTS);
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
	
	$scope.matchId = function(index)
	{
		var watchData = [];
		if($scope.comp.value == true)
		{
			$scope.compare(index);
		}
		else if($scope.avg.value == true && $scope.deviceIds[index].value == true)
		{
			$scope.avgPath(index);
		}
		else
		{
			if($scope.deviceIds[index].value == true)
			{
				for(var i = 0; i < $scope.records.rows.length; i++)
				{
					if($scope.deviceIds[index].selectDate == false)
					{
						if($scope.records.rows[i].deviceid == $scope.deviceIds[index].id)
						{
							//console.log(dt.getDate());
							watchData.push(new google.maps.LatLng(
								$scope.records.rows[i].latitude, $scope.records.rows[i].longitude));
						}
					}
					else
					{
						if($scope.records.rows[i].deviceid == $scope.deviceIds[index].id &&
								$scope.deviceIds[index].stDate <= $scope.records.rows[i].dtime &&
								$scope.deviceIds[index].enDate >= $scope.records.rows[i].dtime)
						{
							
							watchData.push(new google.maps.LatLng(
								$scope.records.rows[i].latitude, $scope.records.rows[i].longitude));
						}
					}
				}
				$scope.deviceIds[index].selectDate = false;
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
	
	$scope.loadIds = function()
	{
		for(var i = 0; i < $scope.records.device.length; i++)
		{
			$scope.deviceIds.push({
				index: i+1,
				id: $scope.records.device[i].device,
				stDate: 0,
				enDate: 0,
				selectDate: false,
				avgShown: false,
				value: false
			});
			
		}
	}
	
	
	 $scope.toggleSelection = function toggleSelection(identifier){
		 	if($scope.test[identifier]){
		 		console.log($scope.records.device[identifier]);
		 		$scope.test[identifier]=false;
		 	}
		 	else{
		 		console.log("Unselect");
		 		$scope.test[identifier]=true;
		 	}

		  };
    
    $scope.submit = function() 
    {
    	if($scope.deviceIds[Number(this.endtext.substring(0,1))-1].value = true)
    	{
    		heatmaps[Number(this.endtext.substring(0,1))-1].setMap(null);
    	}
    	var date = this.text.substring(3,13);//parse date yyyy-mm-dd
    	date = date.split("-");
    	var newDate = date[0]+","+date[1]+","+date[2] + " 00:00:00 GMT+0400";//date with commas instead of -
    	$scope.deviceIds[Number(this.text.substring(0,1))-1].stDate = new Date(newDate).getTime();
    	var edate = this.endtext.substring(3,13);
    	edate = edate.split("-");
    	var neweDate = edate[0]+","+edate[1]+","+edate[2] + " 23:59:59 GMT+0400";
    	$scope.deviceIds[Number(this.endtext.substring(0,1))-1].enDate = new Date(neweDate).getTime();
    	$scope.deviceIds[Number(this.endtext.substring(0,1))-1].value = true;
    	$scope.deviceIds[Number(this.endtext.substring(0,1))-1].selectDate = true;
    	$scope.matchId(Number(this.text.substring(0,1))-1);
    	$scope.deviceIds[Number(this.text.substring(0,1))-1].stDate = 0;
    	$scope.deviceIds[Number(this.endtext.substring(0,1))-1].enDate = 0;
    	this.text = '';
    	this.endtext = '';
    	
    }
	
	$scope.toggleHeatmap = function() {
		  heatmap.setMap(heatmap.getMap() ? null : $scope.map);
		}

	$scope.changeGradient = function() {
		  var gradient = [
		    'rgba(0, 255, 255, 0)',
		    'rgba(0, 255, 255, 1)',
		    'rgba(0, 191, 255, 1)',
		    'rgba(0, 127, 255, 1)',
		    'rgba(0, 63, 255, 1)',
		    'rgba(0, 0, 255, 1)',
		    'rgba(0, 0, 223, 1)',
		    'rgba(0, 0, 191, 1)',
		    'rgba(0, 0, 159, 1)',
		    'rgba(0, 0, 127, 1)',
		    'rgba(63, 0, 91, 1)',
		    'rgba(127, 0, 63, 1)',
		    'rgba(191, 0, 31, 1)',
		    'rgba(255, 0, 0, 1)'
		  ]
		  heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
		}
	
	$scope.invert = function()
	{
		heatmap.set('radius', heatmap.get('radius')? null:20)
	}
	
	$scope.changeRadius = function() {
		  heatmap.set('radius', heatmap.get('radius') ? null : 20);
		}

	$scope.changeOpacity = function() {
		  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
		}

	 $scope.parseDate = function(input){
  	   var parts = input.split('-');
  	   return new Date(parts[0], parts[1]-1, parts[2]); 
     }
   
   $scope.recordsLoaded = function(results){
	   $scope.loadMap();   
   }
   
   $scope.records = Watch.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
			$scope.recordsLoaded);
}]);