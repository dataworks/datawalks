/**
 * 
 */

controllers.controller('ChartDisplay', ['$scope', 'linker', 'Aggregate', 
                                        function($scope, linker, Aggregate) {
	//Draw the CalendarChart
	$scope.deviceIds = [];
	$scope.globalIndex;
	var dataTable = [];
	$scope.portDate;
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
	
	function selectHandler() {
		var selection = chart.getSelection();
		var message = '';
		var it = selection;
		var mon = new Date(selection[0].date);
		mon = mon.getMonth()+1;
		console.log(mon);
		var date = dataTable.getFormattedValue(selection[0].row, 0);
		$scope.portDate = date.replace(/,/, "");
		var arr = $scope.portDate.split(" ");
		console.log(arr);
		var month = 
		$scope.portDate = arr[2] + "-"+"0"+mon+"-"+arr[1];
		console.log("ch" + $scope.portDate);
		linker.getDate($scope.portDate);
	}

	$scope.showIds = function(index)
	{
		index--;
		$scope.globalIndex = index;
		linker.getIndex($scope.globalIndex);
		dataTable = [];
	    dataTable = new google.visualization.DataTable();
	    dataTable.addColumn({ type: 'date', id: 'Date' });
	    dataTable.addColumn({ type: 'number', id: 'distance' });
	 	for(var i = 0; i < $scope.records.aggs.length; i++)
	 	{
	 		if($scope.deviceIds[index].id == $scope.records.aggs[i].did)
	 		{
	 			dataTable.addRow([ new Date(Date.parse($scope.records.aggs[i].dtime)), 
	 			                            parseInt($scope.records.aggs[i].mdistance)] );
	 		}
	 	}
	 	chart.draw(dataTable, options);
	 	//$scope.updateChart(index);
	}
	
	$scope.drawChart = function() 
	{
		$scope.loadIds();
		dataTable = new google.visualization.DataTable();
		
		dataTable.addColumn({ type: 'date', id: 'Date' });
	    dataTable.addColumn({ type: 'number', id: 'distance' });
		chart.draw(dataTable, options);
	}
	
	google.visualization.events.addListener(chart, 'select', selectHandler);
	
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

