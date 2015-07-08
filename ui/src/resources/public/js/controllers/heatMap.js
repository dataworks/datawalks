controllers.controller('Display', ['$scope', 'linker', 'Watch', 'WatchIds', function($scope, linker, Watch, WatchIds) {
	$scope.map;
	var pointarray;
	var arr = [4, 6, 12, 15.1, 15.5, 15.8, 19.1, 19.4, 19.9, 21, 28, 30];
	var heatmap;
	var heatmaps = [];
	var specDateHolder = [];
	var myMarker = null;
	var latLng = new google.maps.LatLng(38.942892, -77.334012);
    $scope.text = '';
    $scope.endtext = '';
    $scope.deviceIds = [];
    $scope.lat = '';
    $scope.long = '';
    $scope.calendar;
    var longTw;
    var latTw;
    var displayNames = ["Dave", "Lindsay", "Bobby", "Hayato", "Chuck", "Danny"];
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
	$(document).ready(function () { 
		// create jqxcalendar.
		$("#jqxCalendar").jqxCalendar({width: 240, height: 220, 
			selectionMode: 'range', theme: 'energyblue'});
		$('#jqxCalendar').on('change', function (event) {
			var selection = event.args.range;
			
			for(var i = 0; i < $scope.deviceIds.length; i++)
			{				
				if($scope.deviceIds[i].value == true)
				{
					console.log("st " + selection.from.toLocaleDateString() + 
							" END " + selection.to.toLocaleDateString() + " " + specDateHolder[i][0]);
					var stCheck = 
						binSearch(new Date(selection.from.toLocaleDateString()).getTime()
								, specDateHolder[i]);
					var enCheck = 
						binSearch(new Date(selection.to.toLocaleDateString()).getTime()
								, specDateHolder[i]);
					console.log("b " + stCheck + " "  + enCheck)
					if(stCheck < 0 || enCheck < 0)
					{
						window.alert("please select date with entries")
					}
					else
					{
						$scope.deviceIds[i].stDate = 
							new Date(selection.from.toLocaleDateString()).getTime();
						var en = moment(selection.to.toLocaleDateString()
								).add(23, 'h').add(59 , 'm');
						$scope.deviceIds[i].enDate = new Date(en).getTime();
						$scope.deviceIds[i].selectDate = true;
						$scope.matchId(i);
					}										
				}
			}					
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
				console.log("dtime");
				midVal = results[mid].dtime;
				midSub = results[mid-1].dtime;
				midPlus = results[mid+1].dtime;
			}
			else
			{
				midVal = moment(results[mid]).subtract(20, 'h');
				midVal = new Date(midVal).getTime();
				midSub = null;
				midPlus = null;
			}
			console.log("there" + mid + " mv " + midVal + " " + val);
					
			if ((midSub <= val && midPlus >= val)
					||midVal == val)
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
		if(split < results.rows[0].dtime|| 
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
			endInd = results.rows[results.rows.length-1].dtime;
		}
		return endInd;
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
		var stDate;
		var splitInd;
		var startInd;
		var endInd;
		
		if($scope.deviceIds[index].selectDate == true)
		{
			endInd = binEnPrep($scope.deviceIds[index].enDate, results);
			
			splitDate = moment(results.rows[endInd]).format("YYYY-MM-DD");
			splitDate = new Date(splitDate).getTime();
			console.log(splitDate + " " + moment(splitDate).format("YYYY-MM-DD"));
			
			splitInd = binSplitPrep(splitDate, results);
			
			div1 = Math.floor(Math.sqrt(splitInd - startInd));
			div2 = Math.floor(Math.sqrt(endInd - splitInd));
		}
		else
		{
			splitDate = moment(results.rows[results.rows.length-1].dtime).format("YYYY-MM-DD");
			splitDate = new Date(splitDate).getTime();
			splitInd = binSearch(splitDate, results);
			startInd = 0;
			endInd = results.rows.length-1;
			div1 = Math.floor(Math.sqrt(splitInd));
			div2 = Math.floor(Math.sqrt(endInd - splitInd));
		}
		console.log("st " + startInd + " split " + splitInd + " end " + endInd);
		console.log("stv " + results.rows[startInd].dtime + 
				" spv " + results.rows[splitInd].dtime + 
				" env " + results.rows[endInd-1].dtime);
		console.log("stv " + moment(results.rows[startInd].dtime).format("YYYY-MM-DD") + 
				" spv " + moment(results.rows[splitInd].dtime).format("YYYY-MM-DD") + 
				" env " + moment(results.rows[endInd].dtime).format("YYYY-MM-DD"));
		
		console.log("div1 " + div1 + " div2 "+ div2);
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
				else if(i == endInd)
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
	
	
	$scope.matchId = function(ind)
	{
		var e;
		var index;
		if(ind == -1)
		{
			e = document.getElementById("dropdownMenu");
			index = displayNames.indexOf(e.options[e.selectedIndex].text);
		}		
		else
		{
			index = ind;
		}
		
		if(heatmaps[index].length === 0)
		{
			console.log("hlhj");
			$scope.deviceIds[index].value = true;
			loadHeatMap(index);
		}
		else if($scope.deviceIds[index].selectDate = true)
		{
			heatmaps[index].setMap(null);
			loadHeatMap(index);
		}
		if($scope.deviceIds[index].selectDate == false)
		{
			loadCalendar(index);
		}
		
	}
	
	function loadHeatMap(index)
	{	
			$scope.records = Watch.query({id: $scope.deviceIds[index].id, 
				startDate:'2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, devLoaded);
	}
	function loadCalendar(index)
	{
		console.log("loadCla " + specDateHolder[index].length)
		if($scope.deviceIds[index].selectDate == false)
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
	}
	
	var devLoaded = function(results){
		
		var watchData = [];
		var index;
		for(var i = 0; i < $scope.deviceIds.length; i++)
			if($scope.deviceIds[i].id == results.rows[0].deviceid)	
				index = $scope.deviceIds[i].index-1;
		
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
			var st = 0;
			var en = results.rows.length;
			if($scope.deviceIds[index].selectDate == true)
			{
				st = binStPrep($scope.deviceIds[index].stDate, results);
				en = binEnPrep($scope.deviceIds[index].enDate, results);
				console.log("dev st " + st + " en " + en);
			}
			
			for(var i = st; i < en; i++)
			{
				if($scope.deviceIds[index].stDate <= results.rows[i].dtime && 
						$scope.deviceIds[index].enDate >= results.rows[i].dtime)
				{
					
					watchData.push(new google.maps.LatLng(results.rows[i].latitude, 
							results.rows[i].longitude));
				}			
			}			
		}
		if($scope.deviceIds[index].selectDate == false)
		{
			if(specDateHolder[index].length == 0)
	        {
				console.log("here");
				var c = 0;
	        	for(var i = 0; i < results.uniqueDates.length; i++)
				{
					if(results.uniqueDates[i].devid === $scope.deviceIds[index].id)
					{
						console.log("there");
						//console.log(new Date(results.uniqueDates[i].dtime));
						specDateHolder[index][c] = new Date(results.uniqueDates[i].dtime);
						c++;
					}		
				}
	        }
			loadCalendar(index);
		}
		
		var pointArray = new google.maps.MVCArray(watchData);
		heatmaps[index] = new google.maps.visualization.HeatmapLayer({
			data: pointArray});
		heatmaps[index].setMap($scope.map);
		$scope.deviceIds[index].stDate = 0;
		$scope.deviceIds[index].enDate = Number.MAX_VALUE;
		$scope.deviceIds[index].selectDate = false;
	}
	
	$scope.clear = function()
	{
		for(var i = 0; i < $scope.deviceIds.length; i++)
		{
			if($scope.deviceIds[i].value == true)
			{				
				specDateHolder[i] = [];
				var sD = $("#jqxCalendar").jqxCalendar('specialDates');
		        sD = [];
		        $("#jqxCalendar").jqxCalendar({ specialDates: sD });
				heatmaps[i].setMap(null);
			}
		}
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
				value: false,
				name: displayNames[i]
			});
			specDateHolder[i] = [];
			heatmaps[i] = [];
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