angular.module('login',['ionic'])
  .controller('LoginCtrl', function ($scope,$http,$rootScope) {
    //for DEBUG
    $scope.phone="18811112222";
    $scope.password="123456";


    $scope.login=function () {
      $http.post(API_URL+'/account/login/',{
        login_name:$scope.login_name,
        password:$scope.password
      }).then(function (response) {
        // store.set('login_name',response.data.payload.login_name);
        // store.set('device_password',response.data.payload.device_password);
        // location.href='hall.html';
      }, function () {
        alert("登录失败");
      });
    };


  });
