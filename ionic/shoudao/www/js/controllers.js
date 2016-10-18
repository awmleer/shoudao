angular.module('shoudao.controllers', [])

  .controller('ContactsCtrl', function($scope,contacts,$rootScope) {
    // $rootScope.contacts={a:1,b:2};
    $rootScope.contacts=[
      {name:'小明',checked:false,phone:18112345678},
      {name:'小华',checked:false,phone:18122223333}
    ];
    $scope.log_contacts=function () {
      contacts.get_contacts();
    }
  })

  .controller('ContactsAllCtrl', function($scope,contacts,$rootScope) {
    // $rootScope.contacts=[
    //   {name:'啦啦啦',checked:false,phone:18112345678},
    //   {name:'哈哈哈',checked:false,phone:18122223333}
    // ];

    console.log($rootScope.contacts);
    $scope.fresh_contacts=function () {
      contacts.get_contacts();
    }
  })


  .controller('NewGroupCtrl', function($scope,contacts,$rootScope) {

  })

  .controller('MessageCtrl', function($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function(chat) {
      Chats.remove(chat);
    };
  })



  .controller('MessageDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.message_id=$stateParams.message_id;
  })



  .controller('MessageNewCtrl', function($scope,$ionicModal) {
    $ionicModal.fromTemplateUrl('templates/modal-select-recipients.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal_select_contacts={
        title:'请勾选收件人',
        show_group:true
      };
      $scope.modal = modal;
    });
    $scope.select_recipients = function() {
      $scope.modal.show();
    };
    $scope.commit_select_recipients = function() {
      $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
  })



  .controller('AccountCtrl', function($scope) {
    $scope.settings = {
      enableFriends: true
    };
  });
