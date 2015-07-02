services.factory('Twitter', ['$resource', function($resource) {
        return $resource('twitter/:getTweets', {}, {
            query: {
                    url: 'twitter/getTweets?id=:id&startDate=:startDate&stopDate=:stopDate',
                    method: 'GET'
            }
        });
}]);