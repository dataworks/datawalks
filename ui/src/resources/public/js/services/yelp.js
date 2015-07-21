services.factory('Yelp', ['$resource', function($resource) {
        return $resource('/yelp/:getPlaces', {}, {
            query: {
                    url: '/yelp/getPlaces?latitude=:latitude&longitude=:longitude',
                    method: 'GET'
            }
        });
}]);