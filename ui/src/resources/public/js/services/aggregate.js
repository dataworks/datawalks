/**
 * 
 */
services.factory('Aggregate', ['$resource', function($resource) {
        return $resource('watch/:watchId', {}, {
            query: {
                    url: 'watch/aggPoints?id=:id&startDate=:startDate&stopDate=:stopDate',
                    method: 'GET'
            }
        });
}]);