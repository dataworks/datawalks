services.factory('NewWatch', ['$resource', function($resource) {
        return $resource('watch/:watchId', {}, {
        	query: {
        		url: 'watch/devicePoints?id=:id&startDate=:startDate&stopDate=:stopDate',
                method: 'GET'
        	}
        });
}]);