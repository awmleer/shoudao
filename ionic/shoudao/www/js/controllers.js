angular.module('shoudao.controllers', [])

  .controller('ContactsCtrl', function($scope,contacts,$rootScope) {
    // $rootScope.contacts={a:1,b:2};
    $rootScope.contacts=[
      {name:'小明',checked:false,phone:18112345678},
      {name:'小华',checked:false,phone:18122223333}
    ];
  })

  .controller('ContactsListCtrl', function($scope,contacts,$rootScope,$stateParams) {
    if ($stateParams.group_id == 'all') {
      $scope.all=true;
    }else{
      $scope.all=false;
      $scope.group=$rootScope.groups[$stateParams.group_id];
    }
    // $rootScope.contacts=[
    //   {name:'啦啦啦',checked:false,phone:18112345678},
    //   {name:'哈哈哈',checked:false,phone:18122223333}
    // ];

    console.log($rootScope.contacts);
    $scope.fresh_contacts=function () {
      contacts.get_contacts();
    }
  })


  .controller('NewGroupCtrl', function($scope,contacts,$rootScope,$ionicHistory) {
    $scope.group={
      group_name:'',
      contacts:[]
    };
    $scope.new_group=function () {
      if ($scope.group.group_name=='') {
        alert("请输入分组名");
        return;
      }
      $scope.group.contacts=contacts.get_checked_contacts();
      if ($scope.group.contacts==[]) {
        alert('请选择要添加到分组的联系人');
        return;
      }
      $rootScope.groups.push($scope.group);
      $ionicHistory.goBack();
      // $state.go('tab.contacts');
    };

    $scope.$on('$destroy',function(){
      console.log('$destroy');
      contacts.clear_check();
    });
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
    $scope.message={
      id:1235324324,
      title:'明天开会统计',
      send_time:'2016-1-23 12:43',
      recipients:[
        {name:'小明',phone:18112345678},
        {name:'小华',phone:18122223333}
        ],
      content:'这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容',
      received:[18122223333]
    };
    for (var i = 0;$scope.message.received[i]; i++) {
      for (var j  = 0;$scope.message.recipients[j]; j++) {
        if ($scope.message.recipients[j].phone == $scope.message.received[i]) {
          $scope.message.recipients[j].received=true;
        }
      }
    }

  })



  .controller('MessageNewCtrl', function($scope,$ionicModal,contacts) {
    $scope.$on('$destroy',function(){
      console.log('$destroy');
      contacts.clear_check();
    });

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



  .controller('AccountCtrl', function($scope,$rootScope) {
    $rootScope.user_info={
      name:'测试',
      phone:'1881112222',
      text_sent:130,
      text_limit:300,
      type:'普通用户'
    };
  });
