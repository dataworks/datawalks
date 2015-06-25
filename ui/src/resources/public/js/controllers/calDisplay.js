/**
 * 
 */
controllers.controller('CalDisplay', ['$scope', 'linker', 'Calories', function($scope, linker, Calories) {
	//Draw bar chart
	$scope.deviceIds = [];
	$scope.localInd;
	$scope.localDate;
	var justInd = false;
	var justDate = false;
	
	linker.onGetIndex($scope, function (message) {
        $scope.localInd = message.globalIndex;
        justInd = true;
        $scope.drawBarChart($scope.localInd);
    });
	
	linker.onGetDate($scope, function (message) {
		justDate = true;
        $scope.localDate = message.globalDate;
        $scope.drawBarChart($scope.localInd);
    });
	
	var options = {
			title: 'Calories Burned Over Time',
			subtitle: 'Time(Hr:Mn:Sd:Ms',
			hAxis: {title: 'Calories Burned'},
			vAxis: {title: 'Time Traveled', subtitle: 'H:M:S:MS'},
			width: 1000,
			height: 300,
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
		var dataTable = [];
		dataTable = new google.visualization.DataTable();
		dataTable.addColumn('string', "Time");
		dataTable.addColumn('number', "Calories");
		if(justDate == true)
		{
			for(var i = 0; i< $scope.records.calories.length; i++){
				if($scope.deviceIds[index].id === $scope.records.calories[i].did)
				{
					if($scope.localDate === $scope.records.calories[i].dtime)
					{
						newDate = new Date($scope.records.calories[i].dtime);
						dataTable.addRow([ $scope.records.calories[i].dtime.substring(5), 
						                   $scope.records.calories[i].scal ]);
					}					
				}	
			}
			justDate = false;
		}
		else if(justInd == true)
		{
			for(var i = 0; i< $scope.records.calories.length; i++){
				if($scope.deviceIds[index].id == $scope.records.calories[i].did)
				{
					newDate = new Date($scope.records.calories[i].dtime);
					dataTable.addRow([ $scope.records.calories[i].dtime.substring(5), $scope.records.calories[i].scal ]);
				}	
			}
			justInd = false;
		}
		
		chart.draw(dataTable, options);
	}
	$scope.recordsLoaded = function(results){
		$scope.chartInit();   
	}

	$scope.records = Calories.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
			$scope.recordsLoaded);
}]);