/*
 * Controller for Yelp
 * 
 * Add linker to controller arguments for dynamic display with the maps marker
 */
controllers.controller('YelpDisplay', ['$scope', 'Yelp', function($scope, Yelp){
	$scope.business = [];
	var localLat = 38.942892; 
	var localLong = -77.334012;
	
	/* recordsLoaded()
	 * 
	 *  Load records of the businesses into $scope.business
	 */
	$scope.recordsLoaded = function(results){
		for( int i =0; i < results.hits.length; i ++)
			$scope.business.push(results.hits[i]);
	}
	
	$scope.records = Yelp.query({latitude: localLat, longitude: localLong}, 
			$scope.recordsLoaded);
}]);