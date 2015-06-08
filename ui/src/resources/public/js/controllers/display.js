controllers.controller('Display', ['$scope', 'Watch', function($scope, Watch) {
	$scope.records = Watch.query({id: 1, startDate: '2015-06-08 00:00:00', stopDate: '2015-06-08 23:59:59'});
}]);