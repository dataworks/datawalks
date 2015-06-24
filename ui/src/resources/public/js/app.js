var controllers = angular.module('controllers', []);
var services = angular.module('services', ['ngResource']);

var app = angular.module('datawalks', ['controllers', 'services']);

var serviceId = 'linker';
app.factory(serviceId, ['$rootScope', linker]);

function linker($rootScope) {

    var globalIndex = 0;
    var passIndex = false;
    var passed = "passed";
    var globalDate;
    
    var getIndex = function (index) {

        $rootScope.$broadcast(passed, {
            globalIndex: index
        });
        
    };
    
    var onGetIndex = function ($scope, handler) {
    	console.log("huh");
        $scope.$on(passed, function (event, message) {
        	console.log("ind " + globalIndex);
        	console.log("slkdf"+message);
            handler(message);
        });
    };
    var setIndex = function()
    {
    	return globalIndex;
    };
    var getDate = function (date) {
    	globalDate = date;
    };
    var setDate = function()
    {
    	return globalDate;
    };

    return {
        getIndex: getIndex,
        onGetIndex: onGetIndex,
        setIndex: setIndex,
        passIndex: passIndex
    };
}