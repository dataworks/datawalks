/**
 * Controller for the twitter display
 */
controllers.controller('TwitDisplay', ['$scope', 'ElasticTwitter', function($scope, ElasticTwitter){
	//Take the coordinates for the tweets and display them in a new window
	$scope.twits = [];
	$scope.lat = '';
	$scope.long = '';
	$scope.radius = '';

	/* loadTweets()
	 * 
	 * Load tweets into the twits[] array. Unless the language is null
	 */
	$scope.loadTweets = function(){
		for(var i = $scope.records.hits.length-1; i > -1; i--){
			var newDate = new Date($scope.records.hits[i].date);
			$scope.twits.push({
				uname: $scope.records.hits[i].user,
				tStamp: newDate,
				text: $scope.records.hits[i].text,
				img: $scope.records.hits[i].image
			});
		}
	}
	
	/* twitterGeo
	 * 
	 * Launches a new page with the desired coordinates
	 */
	$scope.twitterGeo = function() { 
		var left = (screen.width/2)-(750/2);
		var top = (screen.height/2)-(750/2);
		if($scope.lat =='' || $scope.long=='')
			window.alert("Please enter a latitude and longitude");
		else
			window.open("https://twitter.com/search?q=geocode%3A" + $scope.lat + "%2C" + $scope.long +"%2C"+ $scope.radius +"mi&src=typd&vertical=default&f=tweets", 
					'Tweets', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=750, height=750, top='+top+', left='+left);	
	}
	
	$scope.recordsLoaded = function(results){
		$scope.loadTweets();   
	}

	$scope.records = ElasticTwitter.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
			$scope.recordsLoaded);

}]);