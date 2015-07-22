controllers.controller('Display', ['$scope', 'linker', 'Watch', 'WatchIds', 'BinSearch', 'Compare', 
                                   function($scope, linker, Watch, WatchIds, BinSearch, Compare) {
	$scope.map;
	var heatmaps = [];
	var circles = [];
	var specDateHolder = [];
	var myMarker = null;
	var latLng = new google.maps.LatLng(38.942892, -77.334012);
    $scope.deviceIds = [];
    $scope.lat = '';
    $scope.long = '';
    $scope.calendar;
    var startDate="2015-06-01T00:00:00";
    var endDate="2016-06-01T00:00:00";
    var longTw;
    var latTw;
    $scope.ownerNames = [];
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
			if(clearReady == false)
			{
				var selection = event.args.range;
				startDate = parseToDateString(selection.from.toLocaleDateString());
				endDate = parseToDateString(selection.to.toLocaleDateString());
				var i = 0;
				for(var k = 0; k < $scope.deviceIds.length; k++)
				{
					if($scope.deviceIds[k].active == true)
					{
						i = k;
					}
				}
				if($scope.deviceIds.length != 0){
					if(specDateHolder[i].length != 0){
						var stCheck = 
							BinSearch.binSearch(new Date(moment(selection.from.toLocaleDateString())
									.subtract(1, 'm').add(24, 'h')).getTime()
									, specDateHolder[i]);
						var enCheck = 
							BinSearch.binSearch(new Date(moment(selection.to.toLocaleDateString())
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
			}			
		});
	});
	
	var ctr = 0;
    var prevInd;
    var clearReady = false;
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
            	clearReady = true;
                $scope.deviceIds[prevInd].active = false;
                $('#jqxCalendar').jqxCalendar('clear');
                
            }
            prevInd = index;
            clearReady = false;
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
			watchData = Compare.compare(results, index, $scope.deviceIds, specDateHolder);
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
			if(watchData.length == 3)
			{
				latlngBounds.extend(watchData[0].location);
				latlngBounds.extend(watchData[1].location);
				latlngBounds.extend(watchData[2].location);
				watchData.shift();
				watchData.shift();
			}
			latlngBounds.extend(watchData[0].location);
			watchData.shift();
			circles[index] = new google.maps.Circle(circle);
			circles[index].setMap($scope.map);
		}
		else
		{
			var st = 0;
			var en = results.rows.length;
			if($scope.deviceIds[index].selectDate == true)
			{
				st = BinSearch.binStPrep($scope.deviceIds[index].stDate, results);
				en = BinSearch.binEnPrep($scope.deviceIds[index].enDate, results);
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
		
		if(watchData.length < 1000)
		{
			for (var i = 0; i < watchData.length; i++)
				latlngBounds.extend(watchData[i].location);
		}
		else
		{
			j = watchData.length -1;
			for (var i = 0; i < j; i++, j--) {
				latlngBounds.extend(watchData[i].location);
				latlngBounds.extend(watchData[j].location);
			}
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
	 * Associated with the clear button.
	 */
	$scope.clear = function()
	{
		$scope.map.panTo(new google.maps.LatLng(38.942892, -77.334012));
		$scope.map.setZoom(10);
		for(var i = 0; i < $scope.deviceIds.length; i++)
		{
			if(specDateHolder[i].length != 0)
			{				
				specDateHolder[i] = [];
				var sD = $("#jqxCalendar").jqxCalendar('specialDates');
		        sD = [];
		        $("#jqxCalendar").jqxCalendar({ specialDates: sD });
				heatmaps[i].setMap(null);
				if(circles[i].length != 0)
				{
					circles[i].setMap(null);
				}
				
				heatmaps[i] = [];
				circles[i] = [];
				$scope.deviceIds[i].value = false;
			}
		}
		clearReady = true;
		$('#jqxCalendar').jqxCalendar('clear');
		clearReady = false;
		
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