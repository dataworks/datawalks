controllers.controller('Display', ['$scope', 'linker', 'Watch', 'WatchIds', function($scope, linker, Watch, WatchIds) {
	$scope.map;
	var pointarray;
	var arr = [4, 6, 12, 15.1, 15.5, 15.8, 19.1, 19.4, 19.9, 21, 28, 30];
	var heatmap;
	var heatmaps = [];
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
		/*$(document).ready(function () {                
			// create jqxcalendar.
			$("#jqxCalendar").jqxCalendar({width: 240, height: 220, selectionMode: 'range'});
			$('#jqxCalendar').on('change', function (event) {
				var selection = event.args.range;
				console.log(selection.from.toLocaleDateString());
			});
		});*/
		
		myMarker.setMap($scope.map);
		$scope.loadIds();
	}

	$(document).ready(function () {                
		// create jqxcalendar.
		$("#jqxCalendar").jqxCalendar({width: 240, height: 220, 
			selectionMode: 'range', theme: 'energyblue'});
		$('#jqxCalendar').on('change', function (event) {
			var selection = event.args.range;
			console.log(selection.from.toLocaleDateString());
		});
	});
	
	function binSearch(val, results)
	{
		var low = 0;
		var high = results.rows.length - 1;

		while (low <= high) {
			var mid = Math.floor(low + ((high - low) / 2));
			
			var midVal = results.rows[mid].dtime;
					
			if ((results.rows[mid-1].dtime <= val && results.rows[mid+1].dtime >= val))
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
			for(var i = 0; i < results.rows.length; i++)
			{
				if($scope.deviceIds[index].enDate > results.rows[i].dtime
						&&$scope.deviceIds[index].stDate < results.rows[i].dtime)
				{
					console.log(results.rows[i].dtime + 
							moment(results.rows[i].dtime).format("YYYY-MM-DD"));
				}
			}
			
			if($scope.deviceIds[index].enDate < results.rows[results.rows.length-1].dtime)
			{
				console.log("end " + $scope.deviceIds[index].enDate)
				endInd = binSearch($scope.deviceIds[index].enDate, results);
				console.log("b " + moment(results.rows[endInd-1].dtime).format("YYYY-MM-DD") + 
						" " + moment($scope.deviceIds[index].enDate).format("YYYY-MM-DD"));		
				
			}
			else if($scope.deviceIds[index].enDate < results.rows[0].dtime)
			{
				window.alert("date doesnt exist");
			}
			else
			{
				endInd = results.rows[results.rows.length-1].dtime;
			}
			splitDate = moment(results.rows[endInd-1]).format("YYYY-MM-DD");
			splitDate = new Date(splitDate).getTime();
			console.log(splitDate + " " + moment(splitDate).format("YYYY-MM-DD"));
			if($scope.deviceIds[index].stDate > results.rows[0].dtime)
			{
				stDate = moment($scope.deviceIds[index].stDate).format("YYYY-MM-DD");
				stDate = new Date(stDate).getTime();
				
				startInd = binSearch(stDate, results);
			}
			else if($scope.deviceIds[index].stDate > results.rows[results.rows.length-1].dtime)
			{
				window.alert("date doesnt exist");
			}
			else if($scope.deviceIds[index].stDate < results.rows[0].dtime)
			{
				stDate = results.rows[0].dtime;
				startInd = 0;
			}
			if(splitDate < results.rows[0].dtime|| 
					splitDate > results.rows[results.rows.length-1].dtime)
			{
				window.alert("entry doesnt exist");
			}
			else
			{
				console.log("spD " + splitDate + " " + moment(splitDate).format("YYYY-MM-DD"));
				splitInd = binSearch(splitDate, results);
			}
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
			$('#jqxCalendar').jqxCalendar('clear'); 
			heatmaps[index].setMap(null);
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
			for(var i = 0; i < results.rows.length; i++)
			{
				if($scope.deviceIds[index].stDate <= results.rows[i].dtime && 
						$scope.deviceIds[index].enDate >= results.rows[i].dtime)
				{
					var date1 = new Date();
					date1.setDate(results.rows[i].dtime);
					$("#jqxCalendar").jqxCalendar('addSpecialDate', date1, '', 'run');
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
				value: false,
				name: displayNames[i]
			});	
		}
	}
    
	$scope.submit = function() 
	{
		if(this.text == '' && this.endtext == '')
		{
			window.alert("Enter a date for at least one of the fields!");
		}
		else
		{
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
				date = moment(this.text.substring(3,13)).format("YYYY,MM,DD");
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
			$scope.deviceIds[ind].value = true;
			$scope.deviceIds[ind].selectDate = true;
			
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