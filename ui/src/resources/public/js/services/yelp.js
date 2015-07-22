services.factory('Yelp', ['$resource', function($resource) {
        return $resource('/yelp/:getYelps', {}, {
            query: {
                    url: '/yelp/getYelps?latitude=:latitude&longitude=:longitude',
                    method: 'GET'
            }
        });
}]);