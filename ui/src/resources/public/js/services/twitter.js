/**
 * 
 */
services.factory('Twitter', ['$resource', function($resource) {
        return $resource('watch/:watchId', {}, {
            query: {
                    url: 'watch/twitPoints?id=:id&startDate=:startDate&stopDate=:stopDate',
                    method: 'GET'
            }
        });
}]);