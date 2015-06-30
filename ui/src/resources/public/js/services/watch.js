services.factory('Watch', ['$resource', function($resource) {
        return $resource('watch/:watchId', {}, {
        	query: {
        		url: 'watch/listPoints?id=:id&startDate=:startDate&stopDate=:stopDate',
                method: 'GET'
        	}
        });
}]);