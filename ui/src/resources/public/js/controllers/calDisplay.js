/**
 * 
 */
controllers.controller('CalDisplay', ['$scope', 'Calories', function($scope, Calories) {
	//Draw bar chart
	$scope.deviceIds = [];
	
	var options = {
			title: 'Calories Burned Over Time',
			subtitle: 'Time(Hr:Mn:Sd:Ms',
			hAxis: {title: 'Calories Burned'},
			vAxis: {title: 'Time Traveled', subtitle: 'H:M:S:MS'},
			width: 900,
			height: 600,
			bar: { groupWidth: '75%' }

	};

	var chart = new google.visualization.BarChart(document.getElementById('calTime'));
	
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
	
	$scope.chartInit = function()
	{
		$scope.loadIds();
		var dataTable = new google.visualization.DataTable();
		dataTable.addColumn('string', "Time");
		dataTable.addColumn('number', "Calories");
		chart.draw(dataTable, options);
	}
	
	$scope.drawBarChart = function(index) {
		index--;
		var dataTable = [];
		dataTable = new google.visualization.DataTable();
		dataTable.addColumn('string', "Time");
		dataTable.addColumn('number', "Calories");
		for(var i = 0; i< $scope.records.calories.length; i++){
			if($scope.deviceIds[index].id == $scope.records.calories[i].did)
			{
				newDate = new Date($scope.records.calories[i].dtime);
				dataTable.addRow([ $scope.records.calories[i].dtime.substring(5), $scope.records.calories[i].scal ]);
			}	
		}
		chart.draw(dataTable, options);
	}
	$scope.recordsLoaded = function(results){
		$scope.chartInit();   
	}

	$scope.records = Calories.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
			$scope.recordsLoaded);
}]);