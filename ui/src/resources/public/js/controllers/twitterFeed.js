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
        
    	$scope.records = Twitter.query({latitude: localLat, longitude: localLong}, 
    			$scope.recordsLoaded);
    });

	/* loadTweets()
	 * 
	 * Load tweets into the twits[] array
	 */
	$scope.loadTweets = function(){
		$scope.twits = [];
		console.log($scope.records.hits.length);
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

	$scope.records = Twitter.query({latitude: localLat, longitude: localLong}, 
			$scope.recordsLoaded);

}]);