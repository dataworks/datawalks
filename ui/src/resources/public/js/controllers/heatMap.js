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
				zoom: 8,
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
		//buildRecs();
		$scope.loadIds();
	}
	
	function binSearch(val, results)
	{
		var low = 0;
		var high = results.rows.length - 1;

		while (low <= high) {
			var mid = low + ((high - low) / 2);
			var midVal = results.rows[mid];

			if (midVal < val
				low = mid + 1
				else if (midVal > val)
					high = mid - 1;
				else
					return mid; // key found
		}
		return -(low + 1);  // key not found.
	}

	$scope.compare = function(results, index)
	{
		var count = 1;
		var compData1 = [];
		var compLat1 = 0;
		var compLon1 = 0;
		var div1 = 0;
		
		var splitDate;
		var compData2 = [];
		var compLat2 = 0;
		var compLon2 = 0;
		var div2 = 0;
		var splitDate;
		var splitInd;
		
		if($scope.deviceIds[index].selectDate == true)
		{
			splitDate = moment($scope.deviceIds[index].enDate).format("YYYY-MM-DD");
			splitDate = new Date(splitDate).getTime();
			
			splitInd = (results.rows.length-1) - div2;
			div1 = Math.floor(Math.sqrt(div1));
			div2 = Math.floor(Math.sqrt(div2));
		}
		else
		{
			splitDate = moment(results.rows[results.rows.length-1].dtime).format("YYYY-MM-DD");
			splitDate = new Date(splitDate).getTime();
			for(var i = results.rows.length-1; i > 0; i--)
			{
				if(splitDate >= results.rows[i].dtime)
				{
					div2++;
				}
				else
				{
					break;
				}
			}
			splitInd = (results.rows.length-1) - div2;
			div1 = Math.floor(Math.sqrt(splitInd));
			div2 = Math.floor(Math.sqrt(div2));
		}
	}

	$scope.avgPath = function(results, index)
	{
		var count = 1;
		var avgData = [];
		var avgLat = 0;
		var avgLon = 0;
		var div = 0;
		if($scope.deviceIds[index].selectDate == true)
		{
			for(i = 0; i < results.rows.length; i++)
			{
				if($scope.deviceIds[index].stDate <= results.rows[i].dtime && 
						$scope.deviceIds[index].enDate >= results.rows[i].dtime)
				{
					div++;
				}
			}
			div = Math.floor(Math.sqrt(div));
		}
		else
		{
			div = Math.floor(Math.sqrt(results.rows.length));
		}
		
		for(var i = 0; i < results.rows.length; i++)
		{
			if($scope.deviceIds[index].stDate <= results.rows[i].dtime && 
					$scope.deviceIds[index].enDate >= results.rows[i].dtime)
			{
				if(count == div)
				{
					avgLat = avgLat + results.rows[i].latitude;
					avgLon = avgLon + results.rows[i].longitude;
					avgLat = avgLat/count;
					avgLon = avgLon/count;
					avgData.push(new google.maps.LatLng(avgLat, avgLon));
					count = 1;
					avgLat = 0;
					avgLon = 0;
				}
				else if(i == results.rows.length-1)
				{
					avgLat = avgLat + results.rows[i].latitude;
					avgLon = avgLon + results.rows[i].longitude;
					avgLat = avgLat/count;
					avgLon = avgLon/count;
					avgData.push(new google.maps.LatLng(avgLat, avgLon));
				}
				else 
				{
					avgLat = avgLat + results.rows[i].latitude;
					avgLon = avgLon + results.rows[i].longitude;
					count++;
				}
			}
		}
		return avgData;
	}
	
	$scope.matchId = function()
    {
        var watchData = [];

        var e = document.getElementById("dropdownMenu");
        var index = parseInt(e.options[e.selectedIndex].text);
        index -= 1;
        if($scope.deviceIds[index].value == true){
            $scope.deviceIds[index].value = false;
        }
        else
            $scope.deviceIds[index].value = true;
        
        if($scope.avg.value == true && $scope.deviceIds[index].value == true)
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
		if($scope.deviceIds[index].value == true && $scope.deviceIds[index].selectDate == false)
		{
			$scope.deviceIds[index].value = false;
		}
		else if($scope.deviceIds[index].value == false && $scope.deviceIds[index].selectDate == false)
		{
			$scope.deviceIds[index].value = true;
		}
		
		loadHeatMap(index);
	}
	
	function loadHeatMap(index)
	{	
		if($scope.deviceIds[index].value == true)
		{
			$scope.records = Watch.query({id: $scope.deviceIds[index].id, 
				startDate:'2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, devLoaded);
		}
		else
		{
			heatmaps[index].setMap(null);
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
		for(var i = 0; i < $scope.deviceIds.length; i++)
		{
			if($scope.deviceIds[i].id == results.rows[0].deviceid)	
			{
				index = $scope.deviceIds[i].index-1;
			}
		}
		if($scope.comp.value == true)
		{
			watchData = $scope.compare(results, index);
		}
		else if($scope.comp.value == false && 
				$scope.avg.value == true && $scope.deviceIds[index].value == true)
		{
			watchData = $scope.avgPath(results, index);
			
		}
		else
		{
			for(var i = 0; i < results.rows.length; i++)
			{
				if($scope.deviceIds[index].stDate <= results.rows[i].dtime && 
						$scope.deviceIds[index].enDate >= results.rows[i].dtime)
				{
					watchData.push(new google.maps.LatLng(results.rows[i].latitude, 
							results.rows[i].longitude));
				}			
			}
		}
		var pointArray = new google.maps.MVCArray(watchData);
		heatmaps[index] = new google.maps.visualization.HeatmapLayer({
			data: pointArray});
		heatmaps[index].setMap($scope.map);
		$scope.deviceIds[index].stDate = 0;
		$scope.deviceIds[index].enDate = Number.MAX_VALUE;
		$scope.deviceIds[index].selectDate = false;
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
		console.log("why");
		if(this.text == '' && this.endtext == '')
		{
			window.alert("enter date for at least 1 of them");
		}
		else
		{
			$scope.deviceIds[ind].value = true;
			$scope.deviceIds[ind].selectDate = true;
			var ind;
			var date;
			var edate;			
			if(this.text == '')
			{
				ind = Number(this.endtext.substring(0,1))-1;
				$scope.deviceIds[ind].stDate = 0;
			}
			else
			{
				ind = Number(this.text.substring(0,1))-1;
				date = moment(this.text.substring(3,13)).format("YYYY,MM,DD");//parse date yyyy-mm-dd
				$scope.deviceIds[ind].stDate = new Date(date).getTime();
			}		
			if(this.endtext == '')
			{
				ind = Number(this.text.substring(0,1))-1;
				$scope.deviceIds[ind].enDate = Number.MAX_VALUE;
			}
			else
			{
				ind = Number(this.endtext.substring(0,1))-1;
				edate = moment(this.endtext.substring(3,13)).format("YYYY,MM,DD");
				edate = moment(edate).add(23, 'h').add(59, 'm');
				$scope.deviceIds[ind].enDate = new Date(edate).getTime();
			}
			if($scope.deviceIds[ind].value == true)
			{
				heatmaps[ind].setMap(null);
			}
			
			$scope.matchId(ind);
			
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