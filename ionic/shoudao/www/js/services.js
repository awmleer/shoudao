angular.module('shoudao.services', [])

  .service('Contacts',function ($rootScope) {
    var self=this;
    self.get_contacts= function () {
      var fields = ["displayName", "name", "phoneNumbers"];
      var options = new ContactFindOptions();
      options.filter = "";
      options.multiple = true;
      navigator.contacts.find(fields, self.get_contacts_success, self.get_contacts_error, options);
    };


    self.get_contacts_success= function (contacts) {

      // $rootScope.contacts=contacts;
      console.log(contacts);
      // $rootScope.contacts=JSON.stringify(contacts);//for DEBUG
      // var aResult = [];
      $rootScope.contacts=[];
      for (var i = 0; i<contacts.length; i++) {
        if (contacts[i].phoneNumbers.length) {
          for (var j = 0;  j < contacts[i].phoneNumbers.length; j++) {
            $rootScope.contacts.push({
              phone:contacts[i].phoneNumbers[j].value.replace(/ /g,'').replace(/-/g,''),//去除掉空格和-
              name:contacts[i].displayName,
              checked:false
            });
            // $rootScope.contacts[contacts[i].phoneNumbers[j].value]={
            //   name:contacts[i].displayName,
            //   checked:false
            // };
          }
        }
      }
      console.log($rootScope.contacts);
      $rootScope.$apply();
    };

    self.get_contacts_error= function () {
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





  .filter("object_length",function () {
    return function (input) {
      // console.log(input);
      if (typeof (input) == undefined || input == null) {
        return '';
      }
      var array_tmp=Object.keys(input);
      return array_tmp.length;
    }
  })

  .filter("checked_count",function () {
    return function (input) {
      // console.log(input);
      if (typeof (input) == undefined || input == null) {
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
  })



