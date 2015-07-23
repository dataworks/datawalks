/*
 * Controller for Yelp
 * 
 * Add linker to controller arguments for dynamic display with the maps marker
 */
controllers.controller('YelpDisplay', ['$scope', 'Yelp', 'linker', function($scope, Yelp, linker){
	$scope.business = [];
	var localLat = 38.942892; 
	var localLong = -77.334012;
	
	
	linker.onYelpLatLong($scope, function (message) {
        localLat = message.latitude;
        localLong = message.longitude;
        
    	$scope.records = Yelp.query({latitude: localLat, longitude: localLong}, $scope.loadYelps);
    });
	
	/* recordsLoaded()
	 * 
	 *  Load records of the businesses into $scope.business
	 */
	$scope.loadYelps = function(results){
		$scope.business = [];
		for( var i = 0; i < results.hits.length; i++){
			$scope.business.push({
				name: results.hits[i].name,
				img: results.hits[i].image,
				ratPic: results.hits[i].ratingPic,
				street: results.hits[i].street,
				phone: results.hits[i].phone,
				website: results.hits[i].mobile
			});
		}
	}
	
	$scope.records = Yelp.query({latitude: localLat, longitude: localLong}, $scope.loadYelps);
}]);