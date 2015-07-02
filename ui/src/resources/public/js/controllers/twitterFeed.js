/**
 * Controller for the twitter display
 */
controllers.controller('TwitDisplay', ['$scope', 'linker', 'Twitter', function($scope, linker, Twitter){
	//Take the coordinates for the tweets and display them in a new window
	$scope.twits = [];
	$scope.lat = '';
	$scope.long = '';
	$scope.radius = '';
	var localLat = 38.942892; //starting location for tweets
	var localLong = -77.334012;
	var kmRadius = 0.08; //Roughly 5 miles
	
	
	linker.onGetLatLong($scope, function (message) {
        localLat = message.latitude;
        localLong = message.longitude;
        $scope.loadTweets();
        $scope.$apply();
    });

	/* loadTweets()
	 * 
	 * Load tweets into the twits[] array
	 */
	$scope.loadTweets = function(){
		if (localLat == null){
			localLat = 38.942892;
			localLong = -77.334012;
		}
		$scope.twits = [];
		console.log($scope.records.hits.length);
		for(var i = ($scope.records.hits.length - 1); i > -1; i--)
		{	
			if($scope.records.hits[i].latitude != null && $scope.records.hits[i].longitude != null)
			{
				if(  (localLat > $scope.records.hits[i].latitude.toFixed(3) - kmRadius ) && (localLat < $scope.records.hits[i].latitude.toFixed(3) + kmRadius ) &&
						( localLong > $scope.records.hits[i].longitude.toFixed(3) - kmRadius ) && (localLong > $scope.records.hits[i].longitude.toFixed(3) + kmRadius) ) 
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
	}
	
	$scope.recordsLoaded = function(results){
		$scope.loadTweets();   
	}

	$scope.records = Twitter.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
			$scope.recordsLoaded);

}]);