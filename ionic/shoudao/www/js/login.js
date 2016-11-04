angular.module('login',['ionic'])
  .controller('LoginCtrl', function ($scope,$http,$rootScope) {
    //for DEBUG
    // $scope.phone="18811112222";
    // $scope.password="sparker1113";


    $scope.phone=store.get('phone');
    $scope.password="";

    $scope.login=function () {
      $http.post(API_URL+'/account/login/',{
        phone:$scope.phone,
        password:$scope.password
      }).then(function (response) {
        if (response.data == 'success') {
          store.set('phone',$scope.phone);
          store.set('password',$scope.password);
          location.href='main.html';
        }else{
          alert(response.data);
        }
      }, function () {
        alert("登录失败");
      });
    };

    $scope.open_signup=function () {
      window.open("http://shoudao.sparker.top/signup/signup.html", '_system', 'location=no');
    }


  });
