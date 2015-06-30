services.factory('WatchIds', ['$resource', function($resource) {
        return $resource('watch/:watchId', {}, {
        	query: {
        		url: 'watch/deviceIds',
                method: 'GET'
        	}
        });
}]);