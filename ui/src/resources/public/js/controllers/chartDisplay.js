/**
 * 
 */

controllers.controller('ChartDisplay', ['$scope', 'Aggregate', function($scope, Aggregate) {
	//Draw the CalendarChart
	$scope.deviceIds = [];
	var dataTables = [];
	var chart = new google.visualization.Calendar(document.getElementById('calendar_basic'));
	var options = 
 	{
 		title: "Distance",
 	    height: 300,
 	    width: 2000,
 	    tooltip: 
 	    {
		   	isHtml: false
		},
		   	calendar: { cellSize: 25 }
 	 };
	
	$scope.loadIds = function()
	{
		for(var i = 0; i < $scope.records.device.length; i++)
		{
			$scope.deviceIds.push({
				index: i+1,
				id: $scope.records.device[i].device,
				value: false
			});
		}
	}
	
	$scope.showIds = function(index)
	{
		index--;
		var dataTable = [];
	    dataTable = new google.visualization.DataTable();
	    dataTable.addColumn({ type: 'date', id: 'Date' });
	    dataTable.addColumn({ type: 'number', id: 'distance' });
	       
	 	for(var i = 0; i < $scope.records.aggs.length; i++)
	 	{
	 		if($scope.deviceIds[index].id == $scope.records.aggs[i].did)
	 		{
	 			dataTable.addRow( [ new Date(Date.parse($scope.records.aggs[i].dtime)), 
	 			                            parseInt($scope.records.aggs[i].mdistance)] );
	 		}
	 	}
	 	chart.draw(dataTable, options);
	 	//$scope.updateChart(index);
	}
	
	$scope.drawChart = function() 
	{
		$scope.loadIds();
		
		var dataTable = new google.visualization.DataTable();
		
		dataTable.addColumn({ type: 'date', id: 'Date' });
	    dataTable.addColumn({ type: 'number', id: 'distance' });
		chart.draw(dataTable, options);
	}
	$scope.recordsLoaded = function(results)
	{
	   //$scope.loadMap();
	  // $scope.loadTweets();
	   $scope.drawChart(); 
	   //$scope.drawBarChart();   
	}
	$scope.records = Aggregate.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
				$scope.recordsLoaded);
}]);

