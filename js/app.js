// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var firebaseUrl = "https://resplendent-inferno-3368.firebaseio.com";
// 'googlechart'
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'timer', 'angular-svg-round-progress', 'firebase', 'ui.calendar' ])
.run(function($ionicPlatform, $rootScope, $location, Auth, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

        $rootScope.firebaseUrl = firebaseUrl;
        $rootScope.displayName = null;
        $rootScope.email = null;
        $rootScope.uid = null;

        Auth.$onAuth(function (authData) {
            if (authData) {
                console.log("Logged in as:", authData.uid);
                $rootScope.uid = authData.uid;
            } else {
                console.log("Logged out");
                $ionicLoading.hide();
                $location.path('/login');
            }
        });

        $rootScope.logout = function () {
            console.log("Logging out from the app");
            $ionicLoading.show({
                template: 'Logging Out...'
            });
            Auth.$unauth();
            $rootScope.displayName = '';
            $rootScope.email = '';
            $rootScope.uid = '';
        }


        $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === "AUTH_REQUIRED") {
                $location.path("/login");
            }
        });


  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider


    // State to represent Login View
    .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl',
        resolve: {
            // controller will not be loaded until $waitForAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return Auth.$waitForAuth();
        }]
        }
    })

  .state('app', {
    url: "/app",
    abstract: true,
    controller: 'AppCtrl',
    templateUrl: "templates/menu.html",
        resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
      }]
        }
  })

  .state('app.compare', {
    url: "/compare",
    views: {
      'menuContent': {
        templateUrl: "templates/compare.html",
        controller: 'CompareCtrl',
      }
    }
  })

  .state('app.myinfo', {
    url: "/my-info",
    views: {
      'menuContent': {
        templateUrl: "templates/my-info.html",
        controller: 'MyInfoCtrl'
      }
    }
  })

  .state('app.history', {
    url: "/history",
    views: {
      'menuContent': {
        templateUrl: "templates/history.html",
        controller: 'HistoryCtrl'
      }
    }
  })
    .state('app.threes', {
      url: "/threes",
      views: {
        'menuContent': {
          templateUrl: "templates/threes.html",
          controller: 'ThreesCtrl'
        }
      }
    })

    .state('app.accountability', {
      url: "/accountability",
      views: {
        'menuContent': {
          templateUrl: "templates/accountability.html",
          controller: 'AccountabilityCtrl'
        }
      }
    })

    .state('app.settings', {
      url: "/settings",
      views: {
        'menuContent': {
          templateUrl: "templates/settings.html",
          controller: 'SettingsCtrl'
        }
      }
    })

  .state('app.single', {
    url: "/enter-time/:taskId",
    views: {
      'menuContent': {
        templateUrl: "templates/three-detail.html",
        controller: 'ThreeCtrl'
      }
    }
  })
  .state('app.calendar', {
    url: "/calendar",
    views: {
      'menuContent': {
        templateUrl: "templates/calendar.html",
        controller: 'CalendarCtrl'
      }
    }
  })
  .state('app.timedetails', {
    url: "/time-entries",
    views: {
      'menuContent': {
        templateUrl: "templates/time-details.html",
        controller: 'ThreeCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  // $urlRouterProvider.otherwise('app/threes');
  $urlRouterProvider.otherwise('/login');
});
