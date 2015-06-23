/**
 * 
 */
controllers.controller('TwitDisplay', ['$scope', 'Twitter', function($scope, Twitter){
	//Take the coordinates for the tweets and display them in a new window
	$scope.twits = [];

	$scope.loadTweets = function(){
		for(var i =0; i < 10; i++){
			var newDate = new Date($scope.records.twitter[i].uni);
			$scope.twits.push({
				uname: $scope.records.twitter[i].uname,
				tStamp: newDate,
				text: $scope.records.twitter[i].tweettext,
				img:  $scope.records.twitter[i].img
			});
		}

	}
	$scope.twitterGeo = function() { 
		var left = (screen.width/2)-(750/2);
		var top = (screen.height/2)-(750/2);
		if($scope.lat =='' || $scope.long=='')
			window.alert("Please enter a latitude and longitude");
		else
			window.open("https://twitter.com/search?q=geocode%3A" + $scope.lat + "%2C" + $scope.long +"%2C1mi&src=typd&vertical=default&f=tweets", 'Tweets', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=750, height=750, top='+top+', left='+left);	
	}
	$scope.recordsLoaded = function(results){
		$scope.loadTweets();   
	}

	$scope.records = Twitter.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'}, 
			$scope.recordsLoaded);

}]);