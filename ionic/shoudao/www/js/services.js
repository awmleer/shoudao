angular.module('shoudao.services', [])

    .service('contacts',function ($rootScope) {
      var self=this;
      self.get_contacts= function () {
        var fields = ["displayName", "name", "phoneNumbers"];
        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        navigator.contacts.find(fields, self.get_contacts_success, self.get_contacts_error, options);
      };


      self.get_contacts_success= function (contacts) {
        $rootScope.people=contacts;
        console.log($rootScope.people);
        // $rootScope.people=JSON.stringify(contacts);//for DEBUG
        $rootScope.$apply();
        // 联系人与电话号码 全写在这儿
        // var aResult = [];
        // for (var i = 0; contacts[i]; i++) {
        //   console.log("Display Name = " + contacts[i].displayName);
        //   if (contacts[i].phoneNumbers && contacts[i].phoneNumbers.length) {
        //     var contactPhoneList =[];
        //     for (var j = 0; contacts[i].phoneNumbers[j]; j++) {
        //       // alert(contacts[i].phoneNumbers[j].type+"    "+contacts[i].displayName+"---------" + contacts[i].phoneNumbers[j].value );
        //       contactPhoneList.push(
        //           {
        //             'type' :  contacts[i].phoneNumbers[j].type,
        //             'value' : contacts[i].phoneNumbers[j].value
        //           }
        //       );
        //     };
        //     aResult.push({
        //       name:contacts[i].displayName,
        //       phone:contactPhoneList
        //     });
        //   };
        //   //
        // }

        //迭代获取 联系人和号码
        // for (var i = 0; aResult[i]; i++) {
        //   for (var j = 0 ; aResult[i].phone[j]; j++) {
        //     alert(aResult[i].name +"--------"+ aResult[i].phone[j].type+"-----"+aResult[i].phone[j].value
        //     );
        //   };
        // };
      };

      self.get_contacts_error= function () {
        alert("获取联系人失败");
      };

    })


    .factory('Chats', function() {
      // Might use a resource here that returns a JSON array

      // Some fake testing data
      var chats = [{
        id: 0,
        name: 'Ben Sparrow',
        lastText: 'You on your way?',
        face: 'img/ben.png'
      }, {
        id: 1,
        name: 'Max Lynx',
        lastText: 'Hey, it\'s me',
        face: 'img/max.png'
      }, {
        id: 2,
        name: 'Adam Bradleyson',
        lastText: 'I should buy a boat',
        face: 'img/adam.jpg'
      }, {
        id: 3,
        name: 'Perry Governor',
        lastText: 'Look at my mukluks!',
        face: 'img/perry.png'
      }, {
        id: 4,
        name: 'Mike Harrington',
        lastText: 'This is wicked good ice cream.',
        face: 'img/mike.png'
      }];

      return {
        all: function() {
          return chats;
        },
        remove: function(chat) {
          chats.splice(chats.indexOf(chat), 1);
        },
        get: function(chatId) {
          for (var i = 0; i < chats.length; i++) {
            if (chats[i].id === parseInt(chatId)) {
              return chats[i];
            }
          }
          return null;
        }
      };
    });



