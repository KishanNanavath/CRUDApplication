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

dashboard.controller('dashCtrl',['$mdBottomSheet','$window','$browser','$location','$scope','myService',function ($mdBottomSheet,$window,$browser,$location,$scope,myService) {
    if(!sessionStorage.userEntity){
        $window.location.href = '/static/html/listEmployees.html';
    }
    $scope.editProfile = false;

    $scope.cancelFunc = function () {
        $scope.editProfile = false;
        $scope.profile = $scope.tempProfile;
        //$scope.profile = {};
    };

    $scope.editFunc = function () {
        $scope.editProfile = true;
        $scope.tempProfile = JSON.parse(JSON.stringify($scope.profile));
    };

    $scope.title = "kishan";
    $scope.date = new Date();
    $scope.updateProfile = function () {
        $scope.editProfile = false;
        myService.async("POST",baseUrl+"/employee/api/v1.0/updateDetails",JSON.stringify($scope.profile)).success(function (response) {
            //alert("logged out");
            //$window.location.href = '/static/html/employeeDashboard.html';
            //$scope.profile = response.message.userEntity;
            $scope.showBottomSheet("Updated Successfully");

            return response.message;
        }).error(function (response) {
            $scope.profile = {};
            $scope.showBottomSheet(response.message);

            return response.data;
        });
    };

    $scope.profile = JSON.parse(sessionStorage.userEntity);
    console.log("Storage data : "+sessionStorage.userEntity);
    console.log(JSON.stringify(sessionStorage));

    $scope.logoutFunc = function () {
        myService.async("GET",baseUrl+"/employee/api/v1.0/logout").success(function (response) {
            delete sessionStorage.userEntity;
            $window.location.href = '/static/html/listEmployees.html';
            return response.message;
        }).error(function (response) {
            return response.data;
        });
    };

    $scope.addLeave = function () {
        var leaveObj = $scope.leave;
        leaveObj.employeeId = $scope.profile.employeeId;
        myService.async("POST",baseUrl+"/employee/api/v1.0/applyLeave",JSON.stringify($scope.leave)).success(function (response) {
            $scope.showBottomSheet(response.message);
            $scope.leave={};
            return response.message;
        }).error(function (response) {
            $scope.showBottomSheet(response.message);
            return response.data;
        });
    };


    var baseUrl = $location.$$protocol + '://' + $location.$$host+':'+$location.port();

    //$scope.profile = {};
    var postInput = JSON.stringify({"empId":$scope.profile.employeeId});
    myService.async("POST",baseUrl+"/employee/api/v1.0/viewProfile",postInput).success(function (response) {
        console.log(response);
        //response.message.joiningDate = new
        $scope.profile = response.message.userEntity;
        console.log("Profile "+JSON.stringify($scope.profile));
        return response.message;
    }).error(function (response) {
        console.log(response.message);
        $scope.profile = {};
        console.log($scope.holidayList);
        return response.data;
    });

    $scope.showBottomSheet= function(message){
        $mdBottomSheet.show({
            template: '<md-bottom-sheet style="background-color: #ff0000">'+message+'</md-bottom-sheet>'
        });
    };

    $scope.listLeaveHistory = function () {
        $scope.leavesList = [];
        var postInput = JSON.stringify({"empId":$scope.profile.employeeId});
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
    };

    $scope.listHolidays = function () {
        $scope.holidayList = [];
        myService.async("GET",baseUrl+"/employee/api/v1.0/listHolidays").success(function (response) {
            console.log(response);
            $scope.holidayList = response.message;
            //alert(JSON.stringify($scope.holidayList));
            console.log($scope.holidayList);
            return response.message;
        }).error(function (response) {
            console.log(response.message);
            $scope.holidayList = [];
            console.log($scope.holidayList);
            return response.data;
        });
    };

    $scope.delLeave = function (leave) {
        console.log(JSON.stringify(leave));
        myService.async("POST",baseUrl+"/employee/api/v1.0/deleteLeave",JSON.stringify(leave)).success(function (response) {
            $scope.listLeaveHistory();
            $scope.showBottomSheet(response.message);

            return response.message;
        }).error(function (response) {
            console.log(response.message);
            $scope.holidayList = [];
            $scope.showBottomSheet(response.message);

            console.log($scope.holidayList);
            return response.data;
        });
    }
}]);
