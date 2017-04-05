/**
 * Created by Balkishan on 4/5/2017.
 */
var dashboard = angular.module("dashApp",['ngMaterial']);
dashboard.factory('myService', function($http) {
    console.log("insied");
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

dashboard.controller('dashCtrl',['$window','$browser','$location','$scope','myService',function ($window,$browser,$location,$scope,myService) {
    $scope.title = "kishan";
    $scope.date = new Date();
    $scope.updateProfile = function () {
        myService.async("GET",baseUrl+"/employee/api/v1.0/updateDetails").success(function (response) {
            //alert("logged out");
            $window.location.href = '/static/html/employeeDashboard.html';
            $scope.profile = {};

            return response.message;
        }).error(function (response) {
            $scope.profile = {};

            return response.data;
        });
    };

    $scope.logoutFunc = function () {
        myService.async("GET",baseUrl+"/employee/api/v1.0/logout").success(function (response) {
            //alert("logged out");
            $window.location.href = '/static/html/listEmployees.html';
            return response.message;
        }).error(function (response) {
            return response.data;
        });
    };

    var baseUrl = $location.$$protocol + '://' + $location.$$host+':'+$location.port();

    $scope.holidayList = [];
    myService.async("GET",baseUrl+"/employee/api/v1.0/listHolidays").success(function (response) {
        console.log(response);
        $scope.holidayList = response.message;
        console.log($scope.holidayList);
        return response.message;
    }).error(function (response) {
        console.log(response.message);
        $scope.holidayList = [];
        console.log($scope.holidayList);
        return response.data;
    });

    $scope.leavesList = [];
    var postInput = JSON.stringify({"empId":"EMP170012"});
    myService.async("POST",baseUrl+"/employee/api/v1.0/listLeaves",postInput).success(function (response) {
        console.log(response);
        $scope.leavesList = response.message;
        console.log($scope.holidayList);
        return response.message;
    }).error(function (response) {
        console.log(response.message);
        $scope.leavesList = [];
        console.log($scope.holidayList);
        return response.data;
    });

    $scope.profile = {};
    var postInput = JSON.stringify({"empId":"EMP170012"});
    myService.async("POST",baseUrl+"/employee/api/v1.0/viewProfile",postInput).success(function (response) {
        console.log(response);
        $scope.profile = response.message.userEntity;
        console.log($scope.holidayList);
        return response.message;
    }).error(function (response) {
        console.log(response.message);
        $scope.profile = {};
        console.log($scope.holidayList);
        return response.data;
    });
}]);
