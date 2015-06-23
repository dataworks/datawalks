/**
 * 
 */
services.factory('Calories', ['$resource', function($resource) {
        return $resource('watch/:watchId', {}, {
            query: {
                    url: 'watch/calPoints?id=:id&startDate=:startDate&stopDate=:stopDate',
                    method: 'GET'
            }
        });
}]);