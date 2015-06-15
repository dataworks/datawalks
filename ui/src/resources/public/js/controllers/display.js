controllers.controller('Display', ['$scope', 'Watch', function($scope, Watch) {
	$scope.map;
	var pointarray;
	var heatmap;
	var watchData = [];
	
	$scope.loadMap = function() {

	  var mapOptions = {
	    zoom: 13,
	    center: new google.maps.LatLng($scope.records.rows[0].latitude, $scope.records.rows[0].longitude)
	  };
	  $scope.map = new google.maps.Map(document.getElementById('map-canvas'),
	      mapOptions);
	  for(var i = 0; i < $scope.records.rows.length; i++)
	  {
	  	watchData.push(new google.maps.LatLng($scope.records.rows[i].latitude, $scope.records.rows[i].longitude));
	  }
	  
	  var pointArray = new google.maps.MVCArray(watchData);
	  heatmap = new google.maps.visualization.HeatmapLayer({
		    data: pointArray
		  });

	  heatmap.setMap($scope.map);
	  
	  
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
		console.log(heatmap.getData().WeightedLocation.weight);
		
		//heatmap.set('radius', heatmap.get('radius')? null:20)
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
	 
   //Draw the CalendarChart
   $scope.drawChart = function() {
	   
       var dataTable = new google.visualization.DataTable();
       dataTable.addColumn({ type: 'date', id: 'Date' });
       dataTable.addColumn({ type: 'number', id: 'distance' });
       
 	   for(var i = 0; i < $scope.records.aggs.length; i++)
 		  {
 	       	 dataTable.addRow( [ new Date(Date.parse($scope.records.aggs[i].dtime)), parseInt($scope.records.aggs[i].mdistance) ] );
 		  }
 	       
 	   var chart = new google.visualization.Calendar(document.getElementById('calendar_basic'));
 	
 	   var options = {
 	         title: "Distance",
 	         height: 1000,
 	         width: 1200,
		    tooltip: {
		    	isHtml: false
		    	}
 	       };
 	
 	   chart.draw(dataTable, options); 
   }
   
   $scope.recordsLoaded = function(results){
	   $scope.loadMap();
	   $scope.drawChart(); 
   }
   
   $scope.records = Watch.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
			$scope.recordsLoaded);
}]);