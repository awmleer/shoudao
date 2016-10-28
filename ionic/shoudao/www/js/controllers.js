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

    $scope.add_contact= function () {
      Contacts.add_contact(true);
    };

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



  .controller('MessageDetailCtrl', function($scope, $stateParams,$http,$ionicHistory,$ionicPopup) {
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
    }, function () {
      alert("获取消息详情失败");
      $ionicHistory.goBack();
    });

    $scope.remind_all= function () {
      var message_count=0;
      _.forEach($scope.message.recipients, function (recipient) {
        if (!recipient.received) {
          message_count++;
        }
      });
      $ionicPopup.confirm({
        title: '发送消息',
        template: '确定要提醒所有未收到的成员吗？这将消耗'+message_count+'条短信余量。',
        okText: '发送',
        cancelText: '取消'
      }).then(function(res) {
        if(res) {
          $http.get(API_URL+'/message/remind/all/?message_id='+$scope.message_id).then(function (response) {
            if (response.data == 'success') {
              alert("提醒成功");
            }else {
              alert(response.data);
            }
          }, function () {
            alert("请求失败");
          });
        }
      });
    };


  })



  .controller('MessageNewCtrl', function($scope, $stateParams,$http,$ionicHistory){

  })



  .controller('MessageNewSendCtrl', function($scope,$stateParams, $rootScope, $ionicModal, $ionicHistory, Contacts, Groups, $http,$ionicLoading,$ionicPopup) {
    $scope.message={
      type:$stateParams.type,
      title:'',
      content:'',
      comment_able:true
    };

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
      if(this.contact.checked)Contacts.history.enqueue(this.contact);
      console.log(this.contact.checked);
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


    $scope.add_contact= function () {
      Contacts.add_contact(true);
    };


    $scope.send_message= function () {
      if ($scope.message.title=='') {
        $ionicPopup.alert({
          okText: '好的',
          title: '请输入标题',
          template: '标题不能为空'
        });
        return;
      }
      if ($scope.message.content=='') {
        $ionicPopup.alert({
          okText: '好的',
          title: '请输入内容',
          template: '内容不能为空'
        });
        return;
      }

      $ionicPopup.confirm({
        title: '发送消息',
        template: '确定要现在群发消息吗？',
        okText: '发送',
        cancelText: '取消'
      }).then(function(res) {
        if(res) {
          $ionicLoading.show({
            template: '<i class="fa fa-spinner fa-spin fa-3x" style="margin-bottom: 6px" ></i><br>发送中…'
          });
          $http.post(API_URL+'/message/new/', {
            type:$scope.message.type,
            title:$scope.message.title,
            content:$scope.message.content,
            comment_able:$scope.message.comment_able,
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
              $ionicHistory.goBack(-2);
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

  //
  // .controller('MessageNewNoticePCtrl', function($scope, $rootScope, $ionicModal, $ionicHistory, Contacts, Groups, $http,$ionicLoading,$ionicPopup) {
  //
  //   $scope.message={
  //     title:'',
  //     content:'',
  //     comment_able:true
  //   };
  //
  //   $scope.$on('$destroy',function(){
  //     console.log('$destroy');
  //     Contacts.clear_check();
  //     Groups.clear_check();
  //     $scope.modal.remove();// Cleanup the modal
  //   });
  //
  //   //search box
  //   $scope.search={text:''};
  //   $scope.clear_search_text= function () {
  //     $scope.search.text='';
  //   };
  //
  //   $scope.group_click=function () {
  //     console.log(this.group.checked);
  //     if (this.group.checked) {
  //       _.forEach(this.group.contacts, function (contact) {
  //         Contacts.check(contact);
  //       });
  //     }else{
  //       _.forEach(this.group.contacts, function (contact) {
  //         Contacts.uncheck(contact);
  //       });
  //     }
  //   };
  //
  //   $scope.contact_click= function () {
  //     console.log(this.contact.checked);
  //   };
  //
  //   $ionicModal.fromTemplateUrl('templates/modal-select-recipients.html', {
  //     scope: $scope,
  //     animation: 'slide-in-up'
  //   }).then(function(modal) {
  //     $scope.modal_select_contacts={
  //       title:'请勾选收件人',
  //       show_group:true
  //     };
  //     $scope.modal = modal;
  //   });
  //   $scope.select_recipients = function() {
  //     $scope.modal.show();
  //   };
  //   $scope.commit_select_recipients = function() {
  //     $scope.modal.hide();
  //   };
  //   $scope.clear_check= function () {
  //     Contacts.clear_check();
  //   };
  //
  //
  //   $scope.send_message= function () {
  //     if ($scope.message.title=='') {
  //       $ionicPopup.alert({
  //         okText: '好的',
  //         title: '请输入标题',
  //         template: '通知标题不能为空'
  //       });
  //       return;
  //     }
  //     if ($scope.message.content=='') {
  //       $ionicPopup.alert({
  //         okText: '好的',
  //         title: '请输入内容',
  //         template: '通知内容不能为空'
  //       });
  //       return;
  //     }
  //
  //     var confirmPopup = $ionicPopup.confirm({
  //       title: '发送消息',
  //       template: '确定要现在群发消息吗？',
  //       okText: '发送',
  //       cancelText: '取消'
  //     });
  //
  //     confirmPopup.then(function(res) {
  //       if(res) {
  //         $ionicLoading.show({
  //           template: '<i class="fa fa-spinner fa-spin fa-3x" style="margin-bottom: 6px" ></i><br>发送中…'
  //         });
  //         $http.post(API_URL+'/message/new/', {
  //           type:'notice',
  //           title:$scope.message.title,
  //           content:$scope.message.content,
  //           comment_able:$scope.message.comment_able,
  //           contacts:Contacts.get_checked_contacts()
  //         }).then(function (response) {
  //           $ionicLoading.hide();
  //           if (response.data == 'success') {
  //             $ionicPopup.alert({
  //               okText: '好的',
  //               title: '发送成功',
  //               template: '消息已经成功发送'
  //             });
  //             Contacts.clear_check();
  //             $ionicHistory.goBack(-2);
  //           }else {
  //             alert(response.data);
  //           }
  //         }, function () {
  //           $ionicPopup.alert({
  //             okText: '好的',
  //             title: '失败',
  //             template: '消息发送失败，请检查网络连接'
  //           });
  //           $ionicLoading.hide();
  //         });
  //       }
  //     });
  //
  //
  //   };
  //
  // })



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
  })

  .controller('UpgradeCtrl', function($scope,$rootScope,$http,$ionicPopup,$ionicHistory) {
    $scope.items=[
      {
        item_id:'',
        title:'免费账户',
        content:'这里是内容',
        can_buy:false,
        price:0,
        footer:'￥0 /月<span class="float-right">免费使用</span>',
        footer_style:''
      },
      {
        item_id:'account_standard',
        title:'标准账户',
        content:'这里是内容',
        can_buy:true,
        price:5,
        footer:'￥5 /月<span class="float-right">现在购买</span>',
        footer_style:'calm'
      },
      {
        item_id:'account_advance',
        title:'高级账户',
        content:'这里是内容',
        can_buy:true,
        price:15,
        footer:'￥15 /月<span class="float-right">现在购买</span>',
        footer_style:'positive'
      }
    ];



    $scope.buy_upgrade= function () {
      if (this.item.can_buy == false) {
        return;
      }
      $scope.buy_obj_tmp={
        amount:1,
        price:this.item.price,
        item:this.item.item_id
      };
      $ionicPopup.show({
        template: '<p style="text-align: center">请输入购买的月数</p><input type="number" ng-model="buy_obj_tmp.amount" style="text-align: center;margin-bottom: 5px" ><p><span>共计</span><span style="float: right;">￥{{buy_obj_tmp.price*buy_obj_tmp.amount}}</span></p>',
        title: '升级账户',
        // subTitle: '请输入购买的月数',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.buy_obj_tmp.amount) {
                //不允许用户关闭
                e.preventDefault();
              } else {
                return 'start_pay';
              }
            }
          }
        ]
      }).then(function(res) {
        if (res != 'start_pay') {
          return;
        }
        $http.post(API_URL+'/account/buy/', {
          item:$scope.buy_obj_tmp.item,
          amount:$scope.buy_obj_tmp.amount
        }).then(function (response) {
          if (response.data.status == 'success') {
            confirm_pay_done(response.data.order_id);
            window.open(response.data.url, '_system', 'location=no');
          }else{
            alert(response.data.message);
          }
        }, function () {
          alert("请求失败");
        });
      });

      function confirm_pay_done(order_id) {
        $ionicPopup.alert({
          title: '请在网页中完成支付',
          template: '完成支付后，请点击下面的确认按钮',
          okText:'我已完成支付'
        }).then(function(res) {
          $http.get(API_URL+'/account/buy_done_check/?order_id='+order_id).then(function (response) {
            if (response.data == 'success') {
              alert("支付成功");
            }else {
              alert("支付似乎出了一点问题，若遇到问题可以联系客服");
            }
            $ionicHistory.goBack();
          }, function () {
            alert("请求失败");
          });
        });
      }
    }
  })




  .controller('PacksCtrl', function($scope,$rootScope,$http,$ionicPopup,$ionicHistory) {
    $scope.items=[
      {
        item_id:'',
        title:'100条短信包',
        content:'这里是内容',
        can_buy:true,
        price:0,
        footer:'￥3<span class="float-right">现在购买</span>',
        footer_style:'energized'
      },
      {
        item_id:'account_standard',
        title:'300条短信包',
        content:'这里是内容',
        can_buy:true,
        price:5,
        footer:'￥5<span class="float-right">现在购买</span>',
        footer_style:'calm'
      },
      {
        item_id:'account_advance',
        title:'500条短信包',
        content:'这里是内容',
        can_buy:true,
        price:15,
        footer:'￥15<span class="float-right">现在购买</span>',
        footer_style:'positive'
      }
    ];



    $scope.buy_pack= function () {
      if (this.item.can_buy == false) {
        return;
      }
      $scope.buy_obj_tmp={
        amount:1,
        price:this.item.price,
        item:this.item.item_id
      };
      $ionicPopup.show({
        template: '<p style="text-align: center">请输入购买的数量</p><input type="number" ng-model="buy_obj_tmp.amount" style="text-align: center;margin-bottom: 5px" ><p><span>共计</span><span style="float: right;">￥{{buy_obj_tmp.price*buy_obj_tmp.amount}}</span></p>',
        title: '购买',
        // subTitle: '请输入购买的月数',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.buy_obj_tmp.amount) {
                //不允许用户关闭
                e.preventDefault();
              } else {
                return 'start_pay';
              }
            }
          }
        ]
      }).then(function(res) {
        if (res != 'start_pay') {
          return;
        }
        $http.post(API_URL+'/account/buy/', {
          item:$scope.buy_obj_tmp.item,
          amount:$scope.buy_obj_tmp.amount
        }).then(function (response) {
          if (response.data.status == 'success') {
            confirm_pay_done(response.data.order_id);
            window.open(response.data.url, '_system', 'location=no');
          }else{
            alert(response.data.message);
          }
        }, function () {
          alert("请求失败");
        });
      });

      function confirm_pay_done(order_id) {
        $ionicPopup.alert({
          title: '请在网页中完成支付',
          template: '完成支付后，请点击下面的确认按钮',
          okText:'我已完成支付'
        }).then(function(res) {
          $http.get(API_URL+'/account/buy_done_check/?order_id='+order_id).then(function (response) {
            if (response.data == 'success') {
              alert("支付成功");
            }else {
              alert("支付似乎出了一点问题，若遇到问题可以联系客服");
            }
            $ionicHistory.goBack();
          }, function () {
            alert("请求失败");
          });
        });
      }
    }
  })




  .controller('SettingCtrl', function($scope,$rootScope,$http,$ionicPopup,Account,$ionicHistory) {
  $scope.change_name= function () {
    $ionicPopup.prompt({
      title: '修改名字',
      // template: '请输入你的名字',
      inputType: 'text',
      inputPlaceholder: '四个字以内…',
      cancelText:'取消',
      okText:'确定'
    }).then(function(res) {
      $http.get(API_URL+'/account/change_name/?new_name='+res).then(function (response) {
        if (response.data == 'success') {
          Account.refresh_user_info();
          alert("名字修改成功");
        }else {
          alert(response.data);
        }
      }, function () {
        alert("修改失败");
      });
    });
  };

  $scope.change_password= function () {
    $scope.req_obj={
      new_password:''
    };
    $ionicPopup.show({
      template: '<p style="text-align: center">长度需大于等于八位</p><input type="password" ng-model="req_obj.new_password" style="text-align: center;margin-bottom: 5px" >',
      title: '修改密码',
      subTitle: '请输入新密码',
      scope: $scope,
      buttons: [
        { text: '取消' },
        {
          text: '<b>确定</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.req_obj.new_password) {
              //不允许用户关闭
              e.preventDefault();
            } else {
              $http.post(API_URL+'/account/change_password/', {
                new_password:$scope.req_obj.new_password
              }).then(function (response) {
                if (response.data == 'success') {
                  alert("修改成功，请重新登录");
                  $http.get(API_URL+'/account/logout/').then(function (response) {
                    store.set('password','');
                    location.href='login.html';
                  }, function () {
                    location.href='login.html';
                  });
                }else {
                  alert(response.data);
                }
              }, function () {
                alert("请求失败");
              });
            }
          }
        }
      ]
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
