services.factory('Watch', ['$resource', function($resource) {
        return $resource('watch/:watchId', {}, {
        	query: {
        		url: 'watch/listPoints?id=:id&startDate=:startDate&stopDate=:stopDate',
                method: 'GET'
        	}
        });
        /*return $resource('watch/:watchId', {}, {
            query: {
                    url: 'watch/aggPoints?id=:id&startDate=:startDate&stopDate=:stopDate',
                    method: 'GET'
            }
        });
        return $resource('watch/:watchId', {}, {
            query: {
                    url: 'watch/twitPoints?id=:id&startDate=:startDate&stopDate=:stopDate',
                    method: 'GET'
            }
        });
        return $resource('watch/:watchId', {}, {
            query: {
                    url: 'watch/calPoints?id=:id&startDate=:startDate&stopDate=:stopDate',
                    method: 'GET'
            }
        });*/
}]);