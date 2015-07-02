/**
 * 
 */
controllers.controller('CalDisplay', ['$scope', 'linker', 'Calories', function($scope, linker, Calories) {
	//Draw bar chart
	$scope.deviceIds = [];
	var localInd;
	var table = new google.visualization.Table(document.getElementById('table_div'));
	var analyticData;
	var maxSpeedThreshold = .2;
	
	/* parseToMinutes(string)
	 * 
	 * Take a time interval as a string and convert it to the
	 * an in as the total minutes. Seconds, and milliseconds are excluded
	 */
	var parseToMinutes = function(toParse){
		totMin = moment.duration(toParse).asMinutes();	
		return totMin;
	}
	
	
	linker.onGetIndex($scope, function (message) {
        localInd = message.globalIndex;
        $scope.drawBarChart(localInd);
    });
	
	linker.onGetDate($scope, function (message) {
        var localDate = message.globalDate;
        $scope.calRateAnalytics(localDate, localInd);
	});	

	$scope.calRateAnalytics = function(localDate, index)
	{
		var localDate = localDate;
		var run = false;
		var analytics;
		for(var i = 0; i< $scope.records.calories.length; i++)
		{
			if($scope.deviceIds[index].id == $scope.records.calories[i].did)
			{
				if(localDate === $scope.records.calories[i].dtime)
				{
					var speed = $scope.records.calories[i].sdist/
						parseToMinutes($scope.records.calories[i].stime);
					if(maxSpeedThreshold >= speed)
					{
						run = true;
						analytics = [{
							runId: $scope.records.calories[i].wrun,
							run: run,
							speed: speed,
							dist: $scope.records.calories[i].sdist,
							cal: $scope.records.calories[i].scal
						}];
					}
					else
					{
						run = false;
						analytics = [{
							runId: $scope.records.calories[i].wrun,
							run: run,
							speed: speed,
							dist: $scope.records.calories[i].sdist,
							cal: $scope.records.calories[i].scal
						}];
					}
				}
			}
		}
		drawAnalyticsTable(analytics);
	}
	
	var options = {
			title: 'Calories Burned Over Time',
			subtitle: 'Time(Hr:Mn:Sd:Ms',
			hAxis: {title: 'Calories Burned'},
			vAxis: {title: 'Time Traveled', subtitle: 'H:M:S:MS'},
			width: 1000,
			height: 500,
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
	var drawAnalyticsTable = function(analytics)
	{
		analyticsTable = new google.visualization.DataTable();
		analyticsTable.addColumn('string', 'Run ID');
		analyticsTable.addColumn('string', 'Mode of Transport');
		analyticsTable.addColumn('string', 'Speed');
		analyticsTable.addColumn('number', 'Distance');
		analyticsTable.addColumn('number', 'Calories');
		for(var i = 0; i < analytics.length; i++)
		{
			if(analytics[i].run == true)
			{
				analyticsTable.addRows([[analytics[i].runId.toString(), "On Foot",
				                        analytics[i].speed.toFixed(2).toString(), analytics[i].dist,
				                        analytics[i].cal],[analytics[i].runId.toString(), "On Foot",
				                                           analytics[i].speed.toFixed(2).toString(), analytics[i].dist,
				                                           analytics[i].cal]]);
			}
			else
			{
				analyticsTable.addRows([[analytics[i].runId.toString(), "Driving",
				                        analytics[i].speed.toFixed(2).toString(), analytics[i].dist,
				                        analytics[i].cal]]);
			}			
		}
		
		table.draw(analyticsTable);
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

		for(var i = 0; i< $scope.records.calories.length; i++)
		{
			if($scope.deviceIds[index].id == $scope.records.calories[i].did)
			{
				dataTable.addRow([ $scope.records.calories[i].dtime.substring(5), 
				                   $scope.records.calories[i].scal ]);
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