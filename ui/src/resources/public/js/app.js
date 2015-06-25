var controllers = angular.module('controllers', []);
var services = angular.module('services', ['ngResource']);

var app = angular.module('datawalks', ['controllers', 'services']);

var serviceId = 'linker';
app.factory(serviceId, ['$rootScope', linker]);

function linker($rootScope) {

    var globalIndex = 0;
    var passIndex = false;
    var passDate = false;
    var passedI = "passed";
    var passedD = "passed";
    var globalDate;
    
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
        onGetDate: onGetDate
    };
}