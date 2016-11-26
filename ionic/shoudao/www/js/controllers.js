angular.module('shoudao.controllers', [])
//todo separate these controllers

  .controller('ContactsCtrl', function($scope, Contacts, $rootScope,$http) {
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

  .controller('ContactsListCtrl', function($scope, Contacts, $rootScope, $stateParams, $http, $ionicHistory,$ionicPopup,Popup,$ionicModal,Groups) {
    if ($stateParams.group_index == 'all') {
      $scope.all=true;
    }else{
      $scope.all=false;
      $scope.group=$rootScope.groups[$stateParams.group_index];
    }

    $scope.modifying=false;
    $scope.modify_group_contacts={
      modify:function () {
        $scope.group_contacts_tmp=$scope.group.contacts;
        $scope.modify_group_contacts.commit_loading=false;
        $scope.modifying=true;
      },
      add:function () {
        $ionicModal.fromTemplateUrl('templates/modal-select-contacts.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal_select_contacts = modal;
          modal.show();
          $scope.select_contacts = function() {
            $scope.modal_select_contacts.show();
          };
          $scope.commit_select_contacts = function() {
            $scope.modal_select_contacts.hide();
            _.forEach(Contacts.get_checked_contacts(),function (contact) {
              $scope.group_contacts_tmp.push(contact);
            })
          };
        });
      },
      commit_loading:false,
      commit: function () {
        $scope.modify_group_contacts.commit_loading=true;
        $http.post(API_URL+'/groups/update_contacts/', {
          group_id:$scope.group.group_id,
          contacts:$scope.group.contacts
        }).then(function (response) {
          if (response.data == 'success') {
            Groups.refresh();
            $scope.group.contacts=$scope.group_contacts_tmp;
            $scope.modifying=false;
          }else {
            Popup.alert('失败',response.data);
          }
        }, function () {
          alert("请求失败");
        });
      },
      cancel: function () {
        $scope.modifying=false;
      }
    };


    $scope.change_group_name= function () {
      $ionicPopup.prompt({
        title: '修改分组名',
        template: '请输入新的分组名',
        inputType: 'text',
        inputPlaceholder: '',
        okText:'确定',
        cancelText:'取消'
      }).then(function(res) {
        if (_.isUndefined(res))return;
        console.log('Your password is', res);
        $http.post(API_URL+'/groups/change_name/', {
          group_id:$scope.group.group_id,
          new_group_name:res
        }).then(function (response) {
          if (response.data == 'success') {
            $scope.group.group_name=res;
            $rootScope.groups[$stateParams.group_index].group_name=res;
            Popup.alert('成功','修改分组名成功');
          }else {
            Popup.alert('失败',response.data);
          }
        }, function () {
          alert("请求失败");
        });
      });
    };

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
    $scope.showing_all_contacts=false;

    $scope.$watch('search.text', function(newValue, oldValue) {
        $scope.showing_all_contacts=false;
    });
    $scope.show_all_contacts= function () {
      $scope.showing_all_contacts=true;
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
    $scope.add_contact_multi=function () {
      Contacts.add_contact_multi($scope,true);
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



  .controller('MessageDetailCtrl', function($scope, $stateParams,$http,$ionicHistory,$ionicPopup,$ionicLoading,Popup) {
    $scope.message_id=$stateParams.message_id;

    $ionicLoading.show({
      template: '<i class="fa fa-spinner fa-spin fa-3x" style="margin-bottom: 6px" ></i><br>加载中…'
    });

    $scope.doRefresh = function() {
      $http.get(API_URL+'/message/detail/?message_id='+$scope.message_id).then(function (response) {
        $scope.message=response.data;
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide();
      }, function () {
        alert("获取消息详情失败");
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide();
        $ionicHistory.goBack();
      });
    };
    $scope.doRefresh();

    $scope.alert_tip= function () {
      Popup.alert('提示','向左滑动联系人可以显示更多选项');
    };
    $scope.remind_one=function (recipient) {
      console.log(recipient);
      $http.get(API_URL+'/message/remind/one/?message_id='+$scope.message_id+'&phone='+recipient.phone).then(function (response) {
        if (response.data == 'success') {
          Popup.alert('成功','已成功提醒'+recipient.name);
        }else {
          Popup.alert('失败', response.data);
        }
      }, function () {
        Popup.alert('失败', '请求失败');
      });
    };

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

    $scope.new_comment={text:''};
    $scope.comment= function () {
      $http.post(API_URL+'/message/comment/', {
        message_id:$scope.message_id,
        text:$scope.new_comment.text
      }).then(function (response) {
        if (response.data == 'success') {
          $scope.doRefresh();
          $scope.new_comment.text='';
          alert("发表成功");
        }else {
          alert(response.data);
        }
      }, function () {
        alert("请求失败");
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

    $scope.dirty_check= function () {
      if ($scope.message.title != '' || $scope.message.content != '' || Contacts.get_checked_contacts().length > 0) return true;
      if ($scope.message.type=='notice_p' && $scope.buttons.length>0) return true;
      return false;
    };

    var destory_event_listener=$scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      console.log(toState);
      if (toState.name != 'tab.message-new') {
        return;
      }
      if ($scope.dirty_check()==true) {
        event.preventDefault();
        $ionicPopup.confirm({
          title: '注意',
          template: '您确定要返回吗？输入的内容将不会被保存',
          okText:'确定',
          cancelText:'取消'
        }).then(function (res) {
          if (res){
            // $scope.$on('$stateChangeStart',null);
            destory_event_listener();
            $ionicHistory.goBack();
          }
        });
      }
    });

    $scope.$on('$destroy',function(){
      Contacts.clear_check();
      Groups.clear_check();
      $scope.modal_select_contacts.remove();// Cleanup the modal
      $scope.modal_preview.remove();
    });


    $ionicModal.fromTemplateUrl('templates/modal-select-contacts.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal_select_contacts = modal;
      $scope.select_contacts = function() {
        $scope.modal_select_contacts.show();
      };
      $scope.commit_select_contacts = function() {
        $scope.modal_select_contacts.hide();
      };
    });


    $scope.make_obj= function () {
      var obj={
        type:$scope.message.type,
        title:$scope.message.title,
        content:$scope.message.content,
        comment_able:$scope.message.comment_able,
        contacts:Contacts.get_checked_contacts()
      };
      if($scope.message.type=='notice_p')obj.buttons=$scope.buttons;
      return obj;
    };

    $scope.send_message= function () {
      if ($scope.message.title=='') {
        $ionicPopup.alert({
          okText: '好的',
          title: '注意',
          template: '标题不能为空'
        });
        return;
      }
      if ($scope.message.content=='') {
        $ionicPopup.alert({
          okText: '好的',
          title: '注意',
          template: '内容不能为空'
        });
        return;
      }
      if ($scope.message.type=='notice_p') {
        if ($scope.buttons.length==0) {
          $ionicPopup.alert({
            okText: '好的',
            title: '注意',
            template: '选项按钮不能一个都没有'
          });
          return;
        }
      };
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
          var obj=$scope.make_obj();
          $http.post(API_URL+'/message/new/', obj).then(function (response) {
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

    if ($scope.message.type=='notice_p') {
      $ionicModal.fromTemplateUrl('templates/modal-set-buttons.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal_set_buttons = modal;
      });
      $scope.buttons=[];
      $scope.set_buttons= function () { //设置按钮
        $scope.modal_set_buttons.show();
      };
      $scope.commit_set_buttons = function() {
        $scope.modal_set_buttons.hide();
      };
    }


    $ionicModal.fromTemplateUrl('templates/modal-preview.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal_preview = modal;

    });

    $scope.show_preview= function () {
      $scope.modal_preview.show();
      $scope.iframe_load_done=false;
      // document.getElementById("input_json").value=angular.toJson($scope.make_obj());
      // document.getElementById("form_preview").submit();
      $scope.iframe_height=window.screen.height-44;
      $http.post(API_URL+'/m/preview/', $scope.make_obj()).then(function (response) {
        document.getElementById('iframe_preview').srcdoc=response.data;
        $scope.iframe_load_done=true;
      }, function () {
        alert("请求失败");
      });
    };
    $scope.hide_preview= function () {
      document.getElementById('iframe_preview').srcdoc='';
      $scope.modal_preview.hide();
    };


  })


  .controller('SelectContactsCtrl',function ($scope, Contacts) {
    //search box
    $scope.search={text:''};
    $scope.clear_search_text= function () {
      $scope.search.text='';
    };

    $scope.showing_all_contacts=false;

    $scope.$watch('search.text', function(newValue, oldValue) {
      $scope.showing_all_contacts=false;
    });
    $scope.show_all_contacts= function () {
      $scope.showing_all_contacts=true;
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

    $scope.clear_check= function () {
      Contacts.clear_check();
    };

    $scope.add_contact= function () {
      Contacts.add_contact(true);
    };
    $scope.add_contact_multi=function () {
      Contacts.add_contact_multi($scope,true);
    };
    $scope.contact_click= function () {
      if(this.contact.checked)Contacts.history.enqueue(this.contact);
      console.log(this.contact.checked);
    };
  })



  .controller('SetButtonsCtrl', function ($scope,$ionicPopup) {
    $scope.reorder_buttons= function (button, fromIndex, toIndex) {
      console.log(button);
      console.log(fromIndex);
      console.log(toIndex);
      $scope.buttons.splice(fromIndex, 1);
      $scope.buttons.splice(toIndex, 0, button);
    };

    $scope.add_button= function () {
      if ($scope.buttons.length>=5) {
        $ionicPopup.alert({
          okText: '好的',
          title: '添加失败',
          template: '最多只能创建5个按钮'
        });
        return;
      }
      $ionicPopup.prompt({
        title: '增加按钮',
        template: '请输入选项按钮的标题',
        inputType: 'text',
        inputPlaceholder: '10个字以内',
        okText:'确定',
        cancelText:'取消'
      }).then(function(res) {
        if (_.isUndefined(res)) return;
        console.log('Your password is', res);
        if (res == '') {
          alert("请输入标题");
          return;
        }
        if (res.length > 10) {
          alert("按钮的标题过长");
          return;
        }
        $scope.buttons.push({'button_name':res});
      });
    };
  })

  .controller('AccountCtrl', function($scope,$rootScope,$http,$ionicPopup) {
    $scope.doRefresh= function () {
      $http.get(API_URL+'/account/info/').then(function (response) {
        $rootScope.user_info=response.data;
        if($rootScope.pre_release==false){
          if (response.data.type == '样例账户') {
            $rootScope.pre_release=true;
          }
        }
        $scope.$broadcast('scroll.refreshComplete');
      }, function () {
        alert("请求失败");
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.daily_sign= function () {
      $http.get(API_URL + '/account/daily_sign/').then(function (response) {
        if (response.data.status == 'fail') {
          $ionicPopup.alert({
            okText: '好的',
            title: '注意',
            template: response.data.message
          });
        }else{
          $ionicPopup.alert({
            okText: '好的',
            title: '成功',
            template: '签到成功，您获得了'+response.data.got+'条短信量'
          });
          $scope.doRefresh();
        }
      }, function () {
        alert("请求失败");
      });
    };

    $scope.$on('$ionicView.enter', function(e) {
      $scope.doRefresh();
    });
    $scope.redeem= function () {
      $ionicPopup.prompt({
        title: '兑换',
        template: '请输入兑换码',
        inputType: 'text',
        inputPlaceholder: '',
        okText:'确定',
        cancelText:'取消'
      }).then(function(res) {
        if (_.isUndefined(res) || res=='') return;
        $http.get(API_URL+'/account/redeem/'+res+'/', {}).then(function (response) {
          if (response.data == 'success') {
            $ionicPopup.alert({
              okText: '好的',
              title: '成功',
              template: '恭喜，兑换成功'
            });
            $scope.doRefresh();
          }else {
            alert(response.data);
          }
        }, function () {
          alert("兑换失败，请检查网络连接或稍后再试");
        });
      });
    };

  })


  .controller('UpgradeCtrl', function($scope,$rootScope,$http,$ionicPopup,$ionicHistory) {
    $http.get(API_URL+'/items/upgrade/').then(function (response) {
      $scope.items=response.data;
    }, function () {
      alert("获取列表失败，请检查网络连接或稍后再试");
    });

    $http.get(API_URL+'/information/upgrade_notice/text/', {}).then(function (response) {
      $scope.notice=response.data;
    }, function () {});


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
    $http.get(API_URL+'/items/packs/').then(function (response) {
      $scope.items=response.data;
    }, function () {
      alert("获取列表失败，请检查网络连接或稍后再试");
    });

    $http.get(API_URL+'/information/packs_notice/text/', {}).then(function (response) {
      $scope.notice=response.data;
    }, function () {});


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


  .controller('BellListCtrl', function ($scope,$http,Popup,$rootScope) {
    $scope.doRefresh= function () {
      $http.get(API_URL+'/bell/all/').then(function (response) {
        $rootScope.bells=response.data;
        $scope.$broadcast('scroll.refreshComplete');
      }, function () {
        Popup.alert('失败','获取消息列表失败');
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.$on('$ionicView.enter', function(e) {
      $scope.doRefresh();
    });

    $scope.mark_all_read= function () {
      Popup.confirm('确认','是否要将所有消息标记为已读？','是','否', function () {
        $http.get(API_URL+'/bell/mark_all_read/', {}).then(function (response) {
          if (response.data == 'success') {
            _.forEach($rootScope.bells, function (bell) {
              bell.status='read';
            });
          }else {
            alert(response.data);
          }
        }, function () {
          alert("请求失败");
        });
      });
    };


  })


  .controller('BellDetailCtrl', function ($scope,$http,Popup,$stateParams) {
    $http.get(API_URL+'/bell/'+$stateParams.bell_id+'/detail/').then(function (response) {
      $scope.bell=response.data;
    }, function () {
      Popup.alert('失败','获取消息详情失败');
    });
  })


  .controller('FeedbackCtrl', function ($scope,$http,Popup,$ionicHistory) {
    $scope.fb_content={
      name:'',
      contact_info:'',
      message:'',
      score:0
    };
    $scope.rate= function (score) {
      $scope.fb_content.score=score;
    };
    $scope.fb_send=function () {
      $http.post(API_URL+'/feedback/', $scope.fb_content).then(function (response) {
        if (response.data == 'success') {
          Popup.alert('成功','我们已收到您的反馈，谢谢支持~');
          $ionicHistory.goBack();
        }else {
          Popup.alert('失败',response.data);
        }
      }, function () {
        Popup.alert('失败','请求失败');
      });
    };
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
      if (_.isUndefined(res)) return;
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
