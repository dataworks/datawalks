var controllers = angular.module('controllers', []);
var services = angular.module('services', ['ngResource']);

var app = angular.module('datawalks', ['controllers', 'services']);

var serviceId = 'linker';
app.factory(serviceId, ['$rootScope', linker]);

function linker($rootScope) {

    var globalIndex = 0;
    var latitude;
    var longitude;
    var passIndex = false;
    var passPoints = false;
    var passDate = false;
    var passedI = "passed";
    var passedD = "passed";
    var passedL = "passed";
    var globalDate;
    
    var getLatLong = function(lat, long){
    	passPoints = true;
    	$rootScope.$broadcast(passedL, {
    		latitude: lat,
    		longitude: long
    	});
    	
    };
    
    var onGetLatLong = function($scope, handler) {
    	$scope.$on(passedL, function(event, message){
    		if(passPoints == true){
    			handler(message);
    			passPoints = false;
    		}
    	});
    };
    
    var getIndex = function (index) {
    	passIndex = true;
        $rootScope.$broadcast(passedI, {
            globalIndex: index
        });        
    };
    
    var onGetIndex = function ($scope, handler) {
    	$scope.$on(passedI, function (event, message) {
    		if(passIndex == true)
        	{
    			handler(message);
        		passIndex = false;
        	}            
        });       
    };
    
    var getDate = function (date) {
    	passDate = true;
    	$rootScope.$broadcast(passedD, {
            globalDate: date
        });
    };
    var onGetDate = function ($scope, handler) {
    	$scope.$on(passedD, function (event, message) {
    		if(passDate == true)
        	{
    			handler(message);
    			passDate = false;
        	}            
        });    	       
    };
    
    return {
        getIndex: getIndex,
        onGetIndex: onGetIndex,
        getDate: getDate,
        onGetDate: onGetDate,
        getLatLong: getLatLong,
        onGetLatLong: onGetLatLong
    };
}