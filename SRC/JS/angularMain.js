/**
 * Created by Balkishan on 4/4/2017.
 */
var myapp = angular.module("MainApp",['ngMaterial']);

//myapp.service('hexafy', function($http) {
//    this.myFunc = function (link,input) {
//
//        $http.post(link,input).success(function (data, status, headers, config) {
//            console.log(data);
//        }).error(function (data, status, headers, config) {
//            console.log(data)
//        })
//    }
//});

myapp.factory('myService', function($http) {
    return {
        async: function(method,link,input) {
            if(method === "POST"){
                return $http.post(link,input);
            }
            else if(method === "GET"){
                return $http.get(link);
            }
            else{
                return null
            }
        }
    };
});

myapp.controller('MainCtrl',['$location','$window','$scope','myService',function ($location,$window,$scope,myService) {
    var baseUrl = $location.$$protocol + '://' + $location.$$host+':'+$location.port();

    $scope.loginFunc = function () {
        myService.async("POST",baseUrl+"/employee//api/v1.0/login",JSON.stringify($scope.loginObj)).success(function (response) {
            $scope.loginObj = {};
            // The then function here is an opportunity to modify the response
            console.log(response);
            // The return value gets picked up by the then in the controller.
            $window.location.href = '/static/html/employeeDashboard.html';
            return response.data;
        }).error(function (response) {
            $scope.loginObj = {};
            console.log(response);
            return response.data;
        });
    };

    $scope.registerUser = function () {
        alert(JSON.stringify($scope.profile.emailId));
        alert(JSON.stringify($scope.profile));
        myService.async("POST",baseUrl+"/employee/api/v1.0/register",JSON.stringify($scope.profile)).success(function (response) {
            $scope.loginObj = {};
            // The then function here is an opportunity to modify the response
            console.log(response);
            alert(JSON.stringify(response));
// The return value gets picked up by the then in the controller.
            $window.location.href = '/static/html/employeeDashboard.html';
            return response.data;
        }).error(function (response) {
            $scope.loginObj = {};
            alert(JSON.stringify(response));
            console.log(response);
            return response.data;
        });
    }

}]);