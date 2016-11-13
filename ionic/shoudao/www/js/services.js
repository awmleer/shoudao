angular.module('shoudao.services', [])

  .service('Contacts',function ($rootScope,$ionicPopup) {
    var self=this;
    self.get_contacts= function () {
      var fields = ["displayName", "name", "phoneNumbers"];
      var options = new ContactFindOptions();
      options.filter = "";
      options.multiple = true;
      navigator.contacts.find(fields, self.get_contacts_success, self.get_contacts_error, options);
    };

    self.get_contacts_success= function (contacts) {
      // console.log(contacts);
      // $rootScope.contacts_raw=JSON.stringify(contacts);//for DEBUG
      $rootScope.contacts=[];
      for (var i = 0; i<contacts.length; i++) {
        if(_.isUndefined(contacts[i].phoneNumbers))continue; //如果是undefined
        if (!_.isArray(contacts[i].phoneNumbers))continue; //如果不是数组
        if (contacts[i].phoneNumbers.length)
          for (var j = 0;  j < contacts[i].phoneNumbers.length; j++) {
            try {
              $rootScope.contacts.push({
                phone:contacts[i].phoneNumbers[j].value.replace(/ /g,'').replace(/-/g,'').replace(/\+86/g,'').replace(/\(/g,'').replace(/\)/g,''),//去除掉空格 - +86 ( )
                name:_.isNull(contacts[i].displayName)?contacts[i].name.formatted:contacts[i].displayName,
                checked:false
              });
            }
            catch(err) {}

          }
      }
      self.history.init();
      $rootScope.$apply();
    };

    self.get_contacts_error= function () {
      Contacts.history.init();
      $rootScope.$apply();
      alert("获取联系人失败");
    };


    self.check=function (c) {
      var has_this_contact=false;
      _.forEach($rootScope.contacts, function (contact) {
        if (contact.phone==c.phone) {
          contact.checked=true;
          has_this_contact=true;
        }
      });
      if (!has_this_contact) {//如果这个contact不存在
        $rootScope.contacts.push({
          name:c.name,
          phone:c.phone,
          checked:true
        })
      }
    };

    self.uncheck=function (c) {
      _.forEach($rootScope.contacts, function (contact) {
        if (contact.phone==c.phone) {
          contact.checked=false;
        }
      })
    };

    self.clear_check=function () {
      _.forEach($rootScope.contacts, function (contact) {
        contact.checked=false;
      });
      _.forEach($rootScope.groups, function (group) {
        group.checked=false;
      })
    };

    self.get_checked_contacts= function () {
      return _.filter($rootScope.contacts,{checked: true});
    };

    self.get_checked_phones= function () {
      var contacts=[];
      _.forEach($rootScope.contacts, function (contact) {
        if (contact.checked) {
          contacts.push(contact.phone);
        }
      });
      return contacts;
    };

    self.push_to_contacts= function (new_contact) {
      for (var i = 0; i<$rootScope.contacts.length; i++) {
        if ($rootScope.contacts[i].phone==new_contact.phone) { //如果已经存在这个手机号，就仅更新姓名和checked属性
          $rootScope.contacts[i]=new_contact;
          return;
        }
      }
      $rootScope.contacts.push(new_contact);
    };

    self.add_contact= function (checked) {
      $rootScope.new_contact={name:'',phone:''};
      $ionicPopup.show({
        template: '<input type="text" ng-model="new_contact.name" placeholder="姓名" style="margin-bottom: 12px"><input type="number" ng-model="new_contact.phone" placeholder="电话号码">',
        title: '创建联系人',
        scope: $rootScope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$rootScope.new_contact.name || !$rootScope.new_contact.phone) {
                //   不允许用户关闭
                e.preventDefault();
              } else {
                var contact_tmp={name:$rootScope.new_contact.name,phone:$rootScope.new_contact.phone,checked:checked};
                self.push_to_contacts(contact_tmp);
                self.history.enqueue(contact_tmp);
              }
            }
          }
        ]
      });
    };

    self.add_contact_multi=function ($scope,checked) {
      $scope.data_add_contact_multi={
        showing_help:false,
        toggle_help: function () {
          $scope.data_add_contact_multi.showing_help=!$scope.data_add_contact_multi.showing_help;
        },
        text:''
      };
      $ionicPopup.show({
        template: '<textarea ng-show="!data_add_contact_multi.showing_help" ng-model="data_add_contact_multi.text" placeholder="请按照标准格式输入或粘贴联系人列表" style="margin-bottom: 12px;height: 6em"></textarea>' +
        '<div ng-if="data_add_contact_multi.showing_help">输入格式：<p class="radius-gray-in-popup">姓名 电话号码</p>或者<p class="radius-gray-in-popup">电话号码 姓名</p>姓名和电话之间用空格分隔，联系人和联系人之间换行分隔。例如：<p class="radius-gray-in-popup">张三 18811111111<br>李四 18822222222</p></div>'+
        '<div style="text-align: center"><button class="button button-small button-clear button-dark" ng-click="data_add_contact_multi.toggle_help()"><i class="icon ion-help-circled"></i> {{data_add_contact_multi.showing_help?"收起":"查看"}}帮助</button></div>',
        title: '批量添加联系人',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data_add_contact_multi.text) {
                //不允许用户关闭
                e.preventDefault();
              } else {
                return 'invoke';
              }
            }
          }
        ]
      }).then(function(res) {
        if (res != 'invoke') {
          return;
        }
        var contacts_raw=$scope.data_add_contact_multi.text.split('\n');
        var reg_phone=/1\d{10}/;
        var phone_array;
        console.log(contacts_raw);
        _.forEach(contacts_raw, function (contact_raw) {
          if (contact_raw == '')return;
          phone_array=reg_phone.exec(contact_raw);
          if (phone_array==null)return;
          var contact_tmp={name:'',phone:'',checked:checked};
          contact_tmp.phone=phone_array[0];
          contact_raw=contact_raw.replace(contact_tmp.phone,'');
          contact_tmp.name=contact_raw.replace(/ +/g,"");
          console.log(contact_tmp);
          self.push_to_contacts(contact_tmp);
        })
      });
    };

    self.history={
      init: function () {
        $rootScope.contacts_history=store.get('contacts_history');
        if ($rootScope.contacts_history == '' || _.isUndefined($rootScope.contacts_history)) {
          $rootScope.contacts_history=[];
        }
        this.unfreeze();
        console.log($rootScope.contacts_history);
      },
      enqueue:function (contact) {
        //先判断是不是已经存在队列里了
        var existence=false;
        for (var i = 0; $rootScope.contacts_history[i]; i++) {
          if($rootScope.contacts_history[i].phone==contact.phone){ //如果是存在的话
            for (var j = i; j>0 ; j--) {
              $rootScope.contacts_history[j]=$rootScope.contacts_history[j-1];
            }
            $rootScope.contacts_history[0]={phone:contact.phone,name:contact.name};
            existence=true;
          }
        }
        if (!existence) {
          $rootScope.contacts_history.unshift({phone:contact.phone,name:contact.name});
          while ($rootScope.contacts_history.length>10){
            $rootScope.contacts_history.pop();
          }
        }
        store.set('contacts_history',eval(angular.toJson($rootScope.contacts_history)));
      },
      unfreeze: function () {
        var existence=false;
        _.forEach($rootScope.contacts_history, function (h) {
          existence=false;
          _.forEach($rootScope.contacts, function (c) {
            if (c.phone == h.phone)existence=true;
          });
          if (!existence) {
            $rootScope.contacts.push({phone:h.phone,name:h.name,checked:false});
          }
        })
      }
    };



  })



  .service('Groups',function ($rootScope, $http) {
    this.refresh=function () {
      $http.get(API_URL+'/groups/all/').then(function (response) {
        $rootScope.groups=response.data;
      }, function () {
        alert("获取联系人分组失败");
      });
    };

    this.clear_check= function () {
      _.forEach($rootScope.groups, function (group) {
        group.checked=false;
      })
    }
  })

  .service('Account',function ($rootScope,$http) {
    this.refresh_user_info= function () {
      $http.get(API_URL+'/account/info/').then(function (response) {
        $rootScope.user_info=response.data;
      });
    };
  })




  // && /[a-z]/.test(search.text)
  .filter("object_length",function () {
    return function (input) {
      // console.log(input);
      if (_.isUndefined(input) || input == null) {
        return '';
      }
      var array_tmp=Object.keys(input);
      return array_tmp.length;
    }
  })

  .filter("search_valid",function () {
    return function (input) {
      return !(_.isUndefined(input) || input == null || input=='' || /[a-z]/.test(input))
    }
  })

  .filter("contact_in_history",function ($rootScope) {
    return function (input) {
      var array=[];
      _.forEach($rootScope.contacts_history, function (h) {
        for (var i = 0; i < input.length; i++) {
          if (h.phone == input[i].phone) {
            array.push(input[i]);
            break;
          }
        }
      });
      return array;
    }
  })

  .filter("checked_count",function () {
    return function (input) {
      // console.log(input);
      if (_.isUndefined(input) || input == null) {
        return '';
      }
      var count=0;
      _.forEach(input, function (obj) {
        if (obj.checked) {
          count++;
        }
      });
      return count;
    }
  });



