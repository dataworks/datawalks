/**
 * Controller for the twitter display
 */
controllers.controller('TwitDisplay', ['$scope', '$sce', 'linker', 'Twitter', function($scope, $sce, linker, Twitter){
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
					//new
					text: $sce.trustAsHtml(getHashtags($scope.records.hits[i].text)),
					img: $scope.records.hits[i].image,
					handle: $scope.records.hits[i].handle
				});
			}
		}
	}
	//new
	
	//https://twitter.com/USER
	
	function getHashtags(text) {
		//in progress
		//var regex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	    //text.replace(regex, '<a href="$1" target="_blank">$1</a>');

		text = text.replace(/#(\S+)/g, '<a href="http://twitter.com/search?q=%23$1&src=typd">#$1</a>')
		
		//test for handles
		//.replace(/@(\S+)/g, '<a href="https://twitter.com/#!/$1">@$1</a>')
		return text;
	}
	
	
	$scope.recordsLoaded = function(results){
		$scope.loadTweets();   
	}

	$scope.records = Twitter.query({latitude: localLat, longitude: localLong, fromDate: startDates, endDate: endDates}, 
			$scope.recordsLoaded);

}]);