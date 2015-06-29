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
 	   tooltip: {isHtml: true},
		calendar: { 
			cellSize: 25
		}
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
		window.confirm("this");
		var selection = chart.getSelection();
		var message = '';
		var it = selection;
		var mon = new Date(selection[0].date);
		mon = mon.getMonth()+1;
		if(mon.toString().length == 1)
		{
			mon = "0"+mon;
		}
		var date = dataTable.getFormattedValue(selection[0].row, 0);
		$scope.portDate = date.replace(/,/, "");
		var arr = $scope.portDate.split(" ");
		var day = arr[1];
		if(day.toString().length ==1)
		{
			day = "0"+day;
		}
		$scope.portDate = arr[2] + "-"+mon+"-"+day;
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
	    dataTable.addColumn({ type: 'string', role: 'tooltip'});
	    var offset;
	 	for(var i = 0; i < $scope.records.aggs.length; i++)
	 	{
	 		if($scope.deviceIds[index].id == $scope.records.aggs[i].did)
	 		{
	 			offset = new Date($scope.records.aggs[i].dtime);
	 			offset.setUTCHours(4); 
	 			dataTable.addRow([ offset, 
	 			                   parseInt($scope.records.aggs[i].mdistance),
	 			                   'This tooltip'] );
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
	    dataTable.addColumn({ type: 'string', role: 'tooltip'});
		chart.draw(dataTable, options);
	}
	
	google.visualization.events.addListener(chart, 'select', selectHandler);
	
	$scope.recordsLoaded = function(results){ $scope.drawChart(); }
	
	$scope.records = Aggregate.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
				$scope.recordsLoaded);
}]);

