services.factory('Twitter', ['$resource', function($resource) {
        return $resource('twitter/:getTweets', {}, {
            query: {
                    url: 'twitter/getTweets?latitude=:latitude&longitude=:longitude',
                    method: 'GET'
            }
        });
}]);