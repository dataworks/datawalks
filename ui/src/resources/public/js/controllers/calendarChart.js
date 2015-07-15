/**
 * 
 */

controllers.controller('ChartDisplay', ['$scope', 'linker', 'Aggregate', 
                                        function($scope, linker, Aggregate) {
	//Draw the CalendarChart
	$scope.deviceIds = [];
	$scope.globalIndex;
	var dataTable = [];
	$scope.ownerNames = [];
	var chart = new google.visualization.Calendar(document.getElementById('calendar_basic'));
	var options = 
 	{
 		title: "Distance",
 		subtitle: "(Meters)",
 	    height: 300,
 	    width: 2000,
 	   tooltip: {isHtml: true},
		calendar: { 
			cellSize: 25
		},
 	  colorAxis: {
 		  colors: ['#ADD8E6', '#0000FF']
 	  }
 	 };
	
	$scope.loadIds = function()
	{
		for(var i = 0; i < $scope.records.device.length; i++)
		{
			$scope.deviceIds.push({
				index: i+1,
				id: $scope.records.device[i].device,
				value: false,
				name: $scope.ownerNames[i]
			});
		}
	}
	
	function selectHandler() {
		var selection = chart.getSelection();
		console.log(selection);
		var date = moment(selection[0].date).format("YYYY-MM-DD");
		linker.getDate(date);
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
	    
	    var offset;
	 	for(var i = 0; i < $scope.records.aggs.length; i++)
	 	{
	 		if($scope.deviceIds[index].id == $scope.records.aggs[i].did)
	 		{
	 			offset = moment($scope.records.aggs[i].dtime).add(12, 'h').format("YYYY-MM-DD");
	 			offset = new Date(offset);
	 			dataTable.addRow([ offset, 
	 			                   parseInt($scope.records.aggs[i].mdistance)] );
	 		}
	 	}
	 	chart.draw(dataTable, options);
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
	
	$scope.recordsLoaded = function(results){
		for(var i =0; i < results.ownerNames.length; i++)
			$scope.ownerNames.push(results.ownerNames[i].ownerName);
		$scope.drawChart();
		}
	
	$scope.records = Aggregate.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
				$scope.recordsLoaded);
}]);

