/**
 * Controller for the twitter display
 */
controllers.controller('TwitDisplay', ['$scope', 'linker', 'Twitter', function($scope, linker, Twitter){
	$scope.twits = [];
	$scope.radius = '';
	
	//starting location for tweets
	var localLat = 38.942892; 
	var localLong = -77.334012;
	var startDates = "2015-06-01T00:00:00";
	var endDates = "2016-06-01T00:00:00";
	
	/* 
	 * 
	 * 
	 */
	linker.onGetLatLong($scope, function (message) {
        localLat = message.latitude;
        localLong = message.longitude;
        startDates = message.fromDate;
        endDates = message.endDate;
        
    	$scope.records = Twitter.query({latitude: localLat, longitude: localLong, fromDate: startDates, endDate: endDates}, 
    			$scope.recordsLoaded);
    });

	/* loadTweets()
	 * 
	 * Load tweets into the twits[] array
	 */
	$scope.loadTweets = function(){
		$scope.twits = [];
		for(var i = 0; i < $scope.records.hits.length; i++)
		{	
			if($scope.records.hits[i].location != null)
			{
				var newDate = new Date($scope.records.hits[i].date);
				$scope.twits.push({
					uname: $scope.records.hits[i].user,
					tStamp: newDate,
					text: $scope.records.hits[i].text,
					img: $scope.records.hits[i].image,
					handle: $scope.records.hits[i].handle
				});
			}
		}
	}
	
	$scope.recordsLoaded = function(results){
		$scope.loadTweets();   
	}

	$scope.records = Twitter.query({latitude: localLat, longitude: localLong, fromDate: startDates, endDate: endDates}, 
			$scope.recordsLoaded);

}]);