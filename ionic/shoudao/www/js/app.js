// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('shoudao', ['ionic', 'shoudao.controllers', 'shoudao.services'])

  .run(function($ionicPlatform,$rootScope,contacts) {
    contacts_service=contacts;

    if (typeof ($rootScope.people) == undefined) {
      $rootScope.people={};
    }

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

      .state('tab.people', {
        url: '/people',
        views: {
          'tab-people': {
            templateUrl: 'templates/tab-people.html',
            controller: 'PeopleCtrl'
          }
        }
      })
      .state('tab.people-newgroup', {
        url: '/people/newgroup',
        views: {
          'tab-people': {
            templateUrl: 'templates/tab-people-newgroup.html',
            controller: 'NewGroupCtrl'
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
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/message');

  });
