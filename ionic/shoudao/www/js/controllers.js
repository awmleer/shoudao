angular.module('shoudao.controllers', [])

  .controller('ContactsCtrl', function($scope, Contacts, $rootScope,$http) {
    // $rootScope.contacts={a:1,b:2};
    //for DEBUG
    // $rootScope.contacts=[
    //   {name:'小明',checked:false,phone:18143465393},
    //   {name:'哈哈哈',checked:false,phone:18143465393},
    //   {name:'安',checked:false,phone:18143465393},
    //   {name:'哈哈了',checked:false,phone:18143465393},
    //   {name:'小华',checked:false,phone:18867100642}
    // ];

    $scope.doRefresh= function () {
      $http.get(API_URL+'/groups/all/').then(function (response) {
        $rootScope.groups=response.data;
        $scope.$broadcast('scroll.refreshComplete');
      }, function () {
        alert("获取联系人分组失败");
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

  })

  .controller('ContactsListCtrl', function($scope, Contacts, $rootScope, $stateParams, $http, $ionicHistory,$ionicPopup) {
    if ($stateParams.group_index == 'all') {
      $scope.all=true;
    }else{
      $scope.all=false;
      $scope.group=$rootScope.groups[$stateParams.group_index];
    }
    // $rootScope.contacts=[
    //   {name:'啦啦啦',checked:false,phone:18112345678},
    //   {name:'哈哈哈',checked:false,phone:18122223333}
    // ];
    $scope.delete_group= function () {
      var confirmPopup = $ionicPopup.confirm({
        title: '删除',
        template: '确定要删除该分组吗？',
        okText: '确定',
        cancelText: '取消'
      });
      confirmPopup.then(function(res) {
        if (res) {
          var group_id=$scope.group.group_id;
          console.log($scope.group);
          $http.get(API_URL+'/groups/delete/?group_id='+group_id).then(function (response) {
            if (response.data == 'success') {
              $rootScope.groups=_.reject($rootScope.groups,{group_id:group_id});
              $ionicHistory.goBack();
            }else {
              alert(response.data);
            }
          }, function () {
            alert("请求失败");
          });
        }
      });
    };

    console.log($rootScope.contacts);
    $scope.fresh_contacts=function () {
      Contacts.get_contacts();
    }
  })


  .controller('NewGroupCtrl', function($scope, Contacts, $rootScope, $ionicHistory, $http) {
    $scope.group={
      group_name:'',
      contacts:[]
    };

    //search box
    $scope.search={text:''};
    $scope.clear_search_text= function () {
      $scope.search.text='';
    };

    $scope.new_group=function () {
      if ($scope.group.group_name=='') {
        alert("请输入分组名");
        return;
      }
      $scope.group.contacts=Contacts.get_checked_contacts();
      if ($scope.group.contacts.length==0) {
        alert('请选择要添加到分组的联系人');
        return;
      }
      $http.post(API_URL+'/groups/new/', {
        group_name:$scope.group.group_name,
        contacts:$scope.group.contacts
      }).then(function (response) {
        if (_.isNumber(response.data) || /^[0-9]*$/.test(response.data)) { //如果是数字，则为其ID
          $scope.group.group_id=response.data;
          $rootScope.groups.push($scope.group);
          $ionicHistory.goBack();
        }else {
          alert(response.data);
        }
      }, function () {
        alert("请求失败");
      });

      // $state.go('tab.contacts');
    };

    $scope.$on('$destroy',function(){
      console.log('$destroy');
      Contacts.clear_check();
    });
  })

  .controller('MessageCtrl', function($scope,$http) {
    $scope.doRefresh = function() {
      $http.get(API_URL+'/message/all/', {}).then(function (response) {
        $scope.messages=response.data;
        $scope.$broadcast('scroll.refreshComplete');
      }, function () {
        alert("获取消息列表失败");
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.$on('$ionicView.enter', function(e) {
      $scope.doRefresh();
    });

  })



  .controller('MessageDetailCtrl', function($scope, $stateParams,$http,$ionicHistory) {
    $scope.message_id=$stateParams.message_id;
    // $scope.message={
    //   id:1235324324,
    //   title:'明天开会统计',
    //   send_time:'1477107481158',
    //   recipients:[
    //     {name:'小明',phone:18112345678},
    //     {name:'小华',phone:18122223333}
    //     ],
    //   content:'这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容这是通知的内容',
    //   received:[18122223333]
    // };
    $http.get(API_URL+'/message/detail/?message_id='+$scope.message_id).then(function (response) {
      $scope.message=response.data;
      // for (var i = 0;$scope.message.received[i]; i++) {
      //   for (var j  = 0;$scope.message.recipients[j]; j++) {
      //     if ($scope.message.recipients[j].phone == $scope.message.received[i]) {
      //       $scope.message.recipients[j].received=true;
      //     }
      //   }
      // }
    }, function () {
      alert("获取消息详情失败");
      $ionicHistory.goBack();
    });


  })



  .controller('MessageNewCtrl', function($scope, $rootScope, $ionicModal, $ionicHistory, Contacts, Groups, $http,$ionicLoading,$ionicPopup) {
    $scope.$on('$destroy',function(){
      console.log('$destroy');
      Contacts.clear_check();
      Groups.clear_check();
      $scope.modal.remove();// Cleanup the modal
    });

    //search box
    $scope.search={text:''};
    $scope.clear_search_text= function () {
      $scope.search.text='';
    };


    $scope.group_click=function () {
      console.log(this.group.checked);
      if (this.group.checked) {
        _.forEach(this.group.contacts, function (contact) {
          Contacts.check(contact);
        });
      }else{
        _.forEach(this.group.contacts, function (contact) {
          Contacts.uncheck(contact);
        });
      }
    };

    $scope.contact_click= function () {
      console.log(this.contact.checked);
    };

    $scope.message={
      title:'',
      content:''
    };


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
    $scope.clear_check= function () {
      Contacts.clear_check();
    };


    $scope.send_message= function () {
      if ($scope.message.title=='') {
        $ionicPopup.alert({
          okText: '好的',
          title: '请输入标题',
          template: '通知标题不能为空'
        });
        return;
      }
      if ($scope.message.content=='') {
        $ionicPopup.alert({
          okText: '好的',
          title: '请输入内容',
          template: '通知内容不能为空'
        });
        return;
      }

      var confirmPopup = $ionicPopup.confirm({
        title: '发送消息',
        template: '确定要现在群发消息吗？',
        okText: '发送',
        cancelText: '取消'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $ionicLoading.show({
            template: '<i class="fa fa-spinner fa-spin fa-3x" style="margin-bottom: 6px" ></i><br>发送中…'
          });
          $http.post(API_URL+'/message/new/', {
            type:'notice',
            title:$scope.message.title,
            content:$scope.message.content,
            contacts:Contacts.get_checked_contacts()
          }).then(function (response) {
            $ionicLoading.hide();
            if (response.data == 'success') {
              $ionicPopup.alert({
                okText: '好的',
                title: '发送成功',
                template: '消息已经成功发送'
              });
              Contacts.clear_check();
              $ionicHistory.goBack();
            }else {
              alert(response.data);
            }
          }, function () {
            $ionicPopup.alert({
              okText: '好的',
              title: '失败',
              template: '消息发送失败，请检查网络连接'
            });
            $ionicLoading.hide();
          });
        }
      });


    };

  })



  .controller('AccountCtrl', function($scope,$rootScope,$http,$ionicPopup) {
    $scope.doRefresh= function () {
      $http.get(API_URL+'/account/info/').then(function (response) {
        $rootScope.user_info=response.data;
        $scope.$broadcast('scroll.refreshComplete');
      }, function () {
        alert("请求失败");
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
    $scope.$on('$ionicView.enter', function(e) {
      $scope.doRefresh();
    });

    // $rootScope.user_info={
    //   name:'测试',
    //   phone:'1881112222',
    //   text_sent:130,
    //   text_limit:300,
    //   type:'普通用户'
    // };
  })




.controller('SettingCtrl', function($scope,$rootScope,$http,$ionicPopup) {
  $scope.change_name= function () {
    $ionicPopup.prompt({
      title: '修改名字',
      // template: '请输入你的名字',
      inputType: 'text',
      inputPlaceholder: '四个字以内…',
      cancelText:'取消',
      okText:'确定'
    }).then(function(res) {
      console.log('Your password is', res);
    });
  };

  $scope.change_password= function () {
    $ionicPopup.prompt({
      title: '修改密码',
      template: '请输入新密码',
      inputType: 'password',
      inputPlaceholder: '至少8位…',
      cancelText:'取消',
      okText:'确定'
    }).then(function(res) {
      console.log('Your password is', res);
    });
  };

  $scope.logout= function () {
    var confirmPopup = $ionicPopup.confirm({
      title: '退出登录',
      template: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消'
    });
    confirmPopup.then(function(res) {
      if (res) {
        $http.get(API_URL+'/account/logout/').then(function (response) {
          if (response.data == 'success') {
            store.set('phone','');
            store.set('password','');
            location.href='login.html';
          }else {
            alert(response.data);
          }
        }, function () {
          alert("退出登录失败，请检查网络连接");
        });
      }
    });
  };

  $scope.about= function () {
    $ionicPopup.alert({
      okText: '好的',
      title: '关于',
      template: '版本号：v'+VERSION.major+'.'+VERSION.minor+'.'+VERSION.revision
    });
  };
});
