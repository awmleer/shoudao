// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('shoudao', ['ionic', 'shoudao.controllers', 'shoudao.services'])

  .run(function($ionicPlatform, $rootScope, Contacts, Groups) {
    contacts_service=Contacts;

    $rootScope.version=VERSION;

    if (typeof ($rootScope.contacts) == undefined || $rootScope.contacts==null) {
      $rootScope.contacts=[];
      console.log('contacts init ');
    }
    if (typeof ($rootScope.groups) == undefined || $rootScope.groups==null) {
      $rootScope.groups=[];
      console.log('groups init ');
    }


    Groups.refresh();//刷新联系人分组

    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

    $ionicConfigProvider.backButton.text('返回');
    $ionicConfigProvider.backButton.icon('ion-chevron-left');
    $ionicConfigProvider.views.transition('platform');
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.form.checkbox('circle');
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.form.toggle('large');
    // $ionicConfigProvider.;
    // $ionicConfigProvider.;



    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.contacts', {
        url: '/contacts',
        views: {
          'tab-contacts': {
            templateUrl: 'templates/tab-contacts.html',
            controller: 'ContactsCtrl'
          }
        }
      })
      .state('tab.contacts-newgroup', {
        url: '/contacts/newgroup',
        views: {
          'tab-contacts': {
            templateUrl: 'templates/tab-contacts-newgroup.html',
            controller: 'NewGroupCtrl'
          }
        }
      })
      .state('tab.contacts-list', {
        url: '/contacts/list/:group_index',
        views: {
          'tab-contacts': {
            templateUrl: 'templates/tab-contacts-list.html',
            controller: 'ContactsListCtrl'
          }
        }
      })

      .state('tab.message', {
        url: '/message',
        views: {
          'tab-message': {
            templateUrl: 'templates/tab-message.html',
            controller: 'MessageCtrl'
          }
        }
      })
      .state('tab.message-new', {
        url: '/message/new',
        views: {
          'tab-message': {
            templateUrl: 'templates/tab-message-new.html',
            controller: 'MessageNewCtrl'
          }
        }
      })
      .state('tab.message-new-notice', {
        url: '/message/new/notice/:type',
        views: {
          'tab-message': {
            templateUrl: 'templates/tab-message-new-notice.html',
            controller: 'MessageNewSendCtrl'
          }
        }
      })
      .state('tab.message-new-noticep', {
        url: '/message/new/noticep/:type',
        views: {
          'tab-message': {
            templateUrl: 'templates/tab-message-new-noticep.html',
            controller: 'MessageNewSendCtrl'
          }
        }
      })
      .state('tab.message-detail', {
        url: '/message/:message_id',
        views: {
          'tab-message': {
            templateUrl: 'templates/tab-message-detail.html',
            controller: 'MessageDetailCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      })

      .state('tab.upgrade', {
        url: '/upgrade',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-upgrade.html',
            controller: 'UpgradeCtrl'
          }
        }
      })

      .state('tab.packs', {
        url: '/packs',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-packs.html',
            controller: 'PacksCtrl'
          }
        }
      })

      .state('tab.setting', {
        url: '/setting',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-setting.html',
            controller: 'SettingCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/message');

  });
