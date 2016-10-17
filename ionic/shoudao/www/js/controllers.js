angular.module('shoudao.controllers', [])

  .controller('PeopleCtrl', function($scope,contacts,$rootScope) {
    // contacts.get_contacts();
    $scope.log_contacts=function () {
      $rootScope.people=JSON.stringify(navigator.contacts);
      contacts.get_contacts();
    }
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
      $scope.modal_select_people={
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
