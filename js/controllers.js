angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
  // // Form data for the login modal
  // $scope.loginData = {};

  // // Create the login modal that we will use later
  // $ionicModal.fromTemplateUrl('templates/login.html', {
  //   scope: $scope
  // }).then(function(modal) {
  //   $scope.modal = modal;
  // });

  // // Triggered in the login modal to close it
  // $scope.closeLogin = function() {
  //   $scope.modal.hide();
  // };

  // // Open the login modal
  // $scope.login = function() {
  //   $scope.modal.show();
  // };

  // // Perform the login action when the user submits the login form
  // $scope.doLogin = function() {
  //   console.log('Doing login', $scope.loginData);

  //   // Simulate a login delay. Remove this and replace with your login
  //   // code if using a login system
  //   $timeout(function() {
  //     $scope.closeLogin();
  //   }, 1000);
  // };
})


.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
    //console.log('Login Controller Initialized');

    var ref = new Firebase($scope.firebaseUrl);
    var auth = $firebaseAuth(ref);

    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.createUser = function (user) {
        console.log("Create User Function called");
        if (user && user.email && user.password && user.displayname) {
            $ionicLoading.show({
                template: 'Signing Up...'
            });

            auth.$createUser({
                email: user.email,
                password: user.password
            }).then(function (userData) {
                alert("User created successfully!");
                var today = new Date();
                var dateKey = today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString();
                ref.child("users").child(userData.uid).set({
                    email: user.email,
                    displayName: user.displayname,
                    created: Firebase.ServerValue.TIMESTAMP,
                    overviewStats: {
                      currentStreak: 0,
                      longestStreak: 0,
                      totalTasksComplete: 0,
                      totalTimeEntered: 0,
                      totalDaysActive: 0
                    },
                    currentThree: {
                      task1: '',
                      task2: '',
                      task3: '',
                      lastUpdated: dateKey
                    }
                });
                $ionicLoading.hide();
                $scope.modal.hide();
            }).catch(function (error) {
                alert("Error: " + error);
                $ionicLoading.hide();
            });
        } else
            alert("Please fill all details");
    }

    $scope.signIn = function (user) {

        if (user && user.email && user.pwdForLogin) {
            $ionicLoading.show({
                template: 'Signing In...'
            });
            auth.$authWithPassword({
                email: user.email,
                password: user.pwdForLogin
            }).then(function (authData) {
                console.log("Logged in as:" + authData.uid);
                ref.child("users").child(authData.uid).once('value', function (snapshot) {
                    var val = snapshot.val();
                    // To Update AngularJS $scope either use $apply or $timeout
                    $scope.$apply(function () {
                        $rootScope.displayName = val;
                        $rootScope.email = user.email;
                        console.log('user id');
                        console.log(authData.uid);
                        $rootScope.uid = authData.uid;
                    });
                });
                $ionicLoading.hide();
                $state.go('app.threes');
            }).catch(function (error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }
})

.controller('HistoryCtrl', function($scope, $filter, $rootScope, $firebase, $state) {
  $scope.groups = [];
  var today = new Date();
  var dateKey = today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString();
  var ref = new Firebase($rootScope.firebaseUrl);
  var taskRef = $firebase(ref.child('tasks').child($rootScope.uid));
  var taskList = taskRef.$asArray();
  taskList.$loaded()
  .then(function() {
    console.log('loaded task list');
    for(var i = 0; i < taskList.length; i++){
      $scope.groups[i] = {
        name: taskList[i].$id,
        items: [taskList[i].task1, taskList[i].task2, taskList[i].task3],
        status: 'success'
      };
    }
    // taskList.forEach(function(task){
    //   console.log(task.task1.title);
    //   console.log(task.task1.accomplished);
    //   console.log(taskList.length);
    //   console.log(task.$id);
    // });
  })
  .catch(function(error) {
    console.log("Error:", error);
  });


  $scope.options = {};
  $scope.options.query = '';
  // $scope.options.showDeleteButtons = false;
  $scope.options.showProgress = true;

  $scope.search = function ( item ){
    if (item.name.toLowerCase().indexOf($scope.options.query.toLowerCase())!=-1){
        return true;
    }
    for(var i = 0; i < item.items.length; i++){
      if(item.items[i].title.toLowerCase().indexOf($scope.options.query.toLowerCase())!=-1){
        return true;
      }
    }
    return false;
  };


// Accordion
  // for (var i=0; i<10; i++) {
  //   var yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - (i + 1));
  //   $scope.groups[i] = {
  //     name: $filter('date')(yesterday, "MM/dd/yyyy"),
  //     items: [],
  //     status: 'success'
  //   };
  //   for (var j=0; j<3; j++) {
  //     $scope.groups[i].items.push('task-' + j);
  //   }
  //   yesterday.setDate(yesterday.getDate() - 1);
  // }
  
  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };

  $scope.viewCalendar = function(){
    $state.go('app.calendar');
  }

})

.controller('AccountabilityCtrl', function($scope, $ionicModal, $rootScope, $firebase, Friends) {
  console.log()
  $scope.newFriend = {};
  $scope.acct = {};
  $scope.friends = [];
  // $scope.friends.push({'first':'hello', 'last':'goodbye', 'email':'email@email.com'});
  $scope.options = {};
  $scope.options.showDeleteButtons = false
  $scope.options.title = "Add Friend";

  // var ref = new Firebase($rootScope.firebaseUrl);
  // var accountabilityObject = $firebase(ref.child('accountability').child($rootScope.uid));
  // var friendList = accountabilityObject.$asArray();
  // friendList.$loaded()
  // .then(function() {
  //   $scope.friends = friendList;
  // })
  // .catch(function(error) {
  //   console.log("Error:", error);
  // });

  $scope.friends = Friends.all;

  //   Friends.all.$loaded(
  //   function(friends) {
  //     $scope.friends = friends;
  //   },
  //   function(err) {
  //     console.error(err);
  //   }
  // );


  $scope.options.editFriend = function(){
    $scope.showFriendModal();
  };

  $scope.addFriend = function(){
    $scope.friends.push($scope.newFriend);
    accountabilityObject.$push($scope.newFriend);
    $scope.newFriend = {};
  };


  $ionicModal.fromTemplateUrl('templates/add-friend.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.friendModal = modal;
  });

  $scope.cancelFriendModal = function(){
    $scope.newFriend = {};
    $scope.friendModal.hide();
  };

  $scope.saveFriendModal = function() {
    $scope.addFriend();
    $scope.friendModal.hide();
  };

  // Open the login modal
  $scope.showFriendModal = function() {
    $scope.options.title = "Add Friend";
    $scope.friendModal.show();
  };

    $scope.editFriendModal = function(index) {
      if($scope.options.showDeleteButtons){
        $scope.friends.splice(index, 1);
      }
      else{
        $scope.options.title = "Edit Friend";
        $scope.newFriend = $scope.friends[index];
        $scope.friendModal.show();
      }

  };



})

.controller('MyInfoCtrl', function($scope) {
  $scope.newFriend = {};
  $scope.acct = {};
  $scope.friends = [];
  $scope.friends.push({'first':'hello', 'last':'goodbye', 'email':'email@email.com'});

  $scope.addFriend = function(){
    console.log('add friend called');
    console.log($scope.newFriend);
    $scope.friends.push($scope.newFriend);
    $scope.newFriend = {};
  };

})

.controller('SettingsCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
console.log('hello settings controller');

})

.controller('CalendarCtrl', function ($scope, $rootScope, uiCalendarConfig, $compile) {
var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    success = '#33cd5f';
    partial = '#886aea';
    fail = '#ef473a';

$scope.events = [
        {
            start: '2015-02-10T10:00:00',
            title: 'hello',
            allDay: true,
            end: '2014-02-10T16:00:00',
            rendering: 'background',
            textColor: 'fff',
            backgroundColor: success,
        },
                {
            start: '2015-02-14T10:00:00',
            title: 'hello',
            allDay: true,
            end: '2014-02-10T16:00:00',
            rendering: 'background',
            textColor: '#fff',
            backgroundColor: partial,
        },
                {
            start: '2015-02-08T10:00:00',
            title: 'hello',
            allDay: true,
            end: '2014-02-10T16:00:00',
            rendering: 'background',
            textColor: '#fff',
            backgroundColor: fail,
        },
                {
            start: '2015-02-20T10:00:00',
            title: 'hello',
            allDay: true,
            end: '2014-02-10T16:00:00',
            rendering: 'background',
            textColor: '#fff',
            backgroundColor: partial,
        }
    ]

$scope.uiConfig = {
      calendar:{
        height: 350,
        // editable: true,
        header:{
          left: 'prev',
          center: 'title',
          right: 'next'
        },
      }
    };

    $scope.eventSources =  [$scope.events];
    // $scope.chartObject = {};
    // $scope.chartObject.type = 'BarChart';
    // $scope.chartObject.data = {"cols": [
    //     {id: "t",  type: "string"},
    //     {id: "s", type: "number"}
    // ], "rows": 
    // [
    //     {c: [
    //         {v: "Mushrooms"},
    //         {v: 3},
    //     ]},
    //     {c: [
    //     {v: "Onions"},
    //     {v: 3},
    // ]},
    //     {c: [
    //         {v: "Olives"},
    //         {v: 31}
    //     ]},
    //     {c: [
    //         {v: "Zucchini"},
    //         {v: 1},
    //     ]},
    //     {c: [
    //         {v: "Pepperoni"},
    //         {v: 2},
    //     ]}
    // ]};


    // $routeParams.chartType == BarChart or PieChart or ColumnChart...
    
    // // $scope.chartObject.options = {
    // //     'title': 'How Much Pizza I Ate Last Night'
    // // }

})

.controller('ThreesCtrl', function($scope, $state, $ionicPopup, $ionicModal, $ionicLoading, $timeout, $rootScope, $firebase, Tasks) {
  $scope.tasks = [];
  $scope.viewOptions = {};
  $scope.viewOptions.completed = false;
  $scope.viewOptions.submitted = false;
  $scope.viewOptions.prelimSubmit = false;
  $scope.viewOptions.showStreak = false;
  $scope.streak = 0;
  $scope.shownTask = false;  

  var today = new Date();
  var dateKey = today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString();
  var three = Tasks.getCurrentThree();
  three.$loaded()
  .then(function() {
    if(three.lastUpdated && three.lastUpdated == dateKey){
      $scope.viewOptions.submitted = true;
      $scope.tasks.firstTask = three.task1.title;
      $scope.tasks.secondTask = three.task2.title;
      $scope.tasks.thirdTask = three.task3.title;  
      $scope.tasks.firstComplete = three.task1.accomplished;
      $scope.tasks.secondComplete = three.task2.accomplished;
      $scope.tasks.thirdComplete = three.task3.accomplished;
      $rootScope.task1 = three.task1;
      $rootScope.task2 = three.task2;
      $rootScope.task3 = three.task3;
    }
  })
  .catch(function(error) {
    console.error("Error:", error);
  });

  // $scope.tasks.push({
  //   'title' : 'task 1',
  //   'items' : [{'start': new Date(2015, 1,23,12,53),
  //   'end': new Date(2015, 1,23,13,27)}],
  //   'total' : '01:52'
  // });

  // $scope.tasks.push({
  //   'title' : 'task 2',
  //   'items' : [{'start': new Date(2015, 1,23,16,21),
  //   'end': new Date(2015, 1,23,17,28)}],
  //   'total' : '00:47'
  // });

  // $scope.tasks.push({
  //   'title' : 'task 3',
  //   'items' : [{
  //   'start': new Date(2015, 1,23,4,28),
  //   'end': new Date(2015, 1,23,4,53),
  // },{
  //   'start': new Date(2015, 1,23,18,27),
  //   'end': new Date(2015, 1,23,19,53),
  // },{
  //   'start': new Date(2015, 1,23,23,28),
  //   'end': new Date(2015, 1,23,23,53),
  // }],
  //   'total' : '03:01'
  // });

  $scope.hours = 4;
  $scope.minutes = 33;
  $scope.seconds = 14;


  $scope.toggleTask = function(task) {
    if ($scope.isTaskShown(task)) {
      $scope.shownTask = null;
    } else {
      $scope.shownTask = task;
    }
  };
  $scope.isTaskShown = function(task) {
    return $scope.shownTask === task;
  };


  $ionicModal.fromTemplateUrl('templates/tasks-success.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.streakModal = modal;
  });

  $scope.tasks.completeTask = function(taskNumber){
    if($scope.tasks.firstComplete && $scope.tasks.secondComplete && $scope.tasks.thirdComplete){
      $scope.streakModal.show();
    }
  }

  $scope.awesomeHide = function(){
    $scope.streakModal.hide();
    $ionicLoading.show({
          template: 'Yeah you are!'
      });
    $timeout(function(){
      $ionicLoading.hide();
    }, 1000);
  };


  $scope.tasks.swipeLeft = function(index){
    $state.go('app.single', { "taskId": index });
  };

  // A confirm dialog
 $scope.showConfirm = function(e) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Confirm',
     template: 'Are you sure these are your three main tasks for the day? You won\'t be able to change edit these until tomorrow'
   });
   confirmPopup.then(function(res) {
     if(res) {
        $scope.viewOptions.submitted = true;
        // var ref = new Firebase($rootScope.firebaseUrl);
        // var userTaskObject = $firebase(ref.child('users').child($rootScope.uid).child("currentThree"));
        // userObject.$loaded()
        //   .then(function(data) {
        //     userObject.currentThree.task1 = $scope.tasks.firstTask;
        //     userObject.currentThree.task2 = $scope.tasks.secondTask;
        //     userObject.currentThree.task3 = $scope.tasks.thirdTask;
        //     userObject.$save();
        //   })
        //   .catch(function(error) {
        //     console.error("Error:", error);
        //   });
        var task1Object = {
          'title':  $scope.tasks.firstTask,
          'accomplished': false
        };
        var task2Object = {
          'title':  $scope.tasks.secondTask,
          'accomplished': false
        };
        var task3Object = {
          'title':  $scope.tasks.thirdTask,
          'accomplished': false
        };

        $rootScope.task1 = task1Object;
        $rootScope.task2 = task2Object;
        $rootScope.task3 = task3Object;

        Tasks.saveCurrentThree({
          'task1': task1Object,
          'task2': task2Object,
          'task3': task3Object,
          'lastUpdated' : dateKey
        });
        // userTaskObject.$set({
        //   'task1': task1Object,
        //   'task2': task2Object,
        //   'task3': task3Object,
        //   'lastUpdated' : dateKey
        // });
        Tasks.create({
          'task1': task1Object,
          'task2': task2Object,
          'task3': task3Object
        });

        // var tasks = $firebase(ref.child('tasks').child($rootScope.uid).child(dateKey));
        // tasks.$set({
        //   'task1': task1Object,
        //   'task2': task2Object,
        //   'task3': task3Object
        // });
        // tasks.$set(taskObject);
     } else {
       $scope.viewOptions.submitted = false;
       $scope.viewOptions.prelimSubmit = false;
     }
   });
 };

})

.controller('ThreeCtrl', function($scope, $stateParams, $ionicModal, $filter, $firebase, $rootScope) {
    // Create the login modal that we will use later
  var today = new Date();
  var dateKey = $filter('date')(today, "yyyy-MM-dd");
  // var dateKey = today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString();
  var ref = new Firebase($rootScope.firebaseUrl);
  var timeObject = $firebase(ref.child('times').child($rootScope.uid).child(dateKey));

  $ionicModal.fromTemplateUrl('templates/add-time.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.options = {};
  $scope.newTime = {};
  $scope.tasks = [$rootScope.task1, $rootScope.task2, $rootScope.task3];
  $scope.newTime.task1 = $rootScope.task1;
  $scope.newTime.task2 = $rootScope.task2;
  $scope.newTime.task3 = $rootScope.task3;
  $scope.options.showDeleteButtons = false;
  $scope.options.editTime = false;
  $scope.startTimeEdit = '';
  $scope.timeEntries = [];
  $scope.timeEntries.push({
    'task':'task 1', 
    'start': new Date(),
    'end': new Date(),
    'description':'test description',
  });


  $scope.newTime.selectedTaskItem = $stateParams.taskId;
  console.log($scope.newTime.selectedTaskItem);

  $scope.newTime.updateTime = function(){
    console.log('updating time yo');
    if(!$scope.newTime.newEndTime)
      return;
    if($scope.newTime.newEndTime < $scope.newTime.newStartTime){
      $scope.newTime.newEndTime = $scope.newTime.newStartTime;
    }
    var startHours = $scope.newTime.newStartTime.getHours();
    var startMinutes = $scope.newTime.newStartTime.getMinutes();
    var endHours = $scope.newTime.newEndTime.getHours();
    var endMinutes = $scope.newTime.newEndTime.getMinutes();
    $scope.newTime.minutes = (endMinutes + 60) - startMinutes;
    $scope.newTime.hours = endHours - startHours;
    if(startMinutes > endMinutes){
      $scope.newTime.minutes = (endMinutes + 60) - startMinutes;
      $scope.newTime.hours = (endHours - 1) - startHours;
    }
    else{
      $scope.newTime.minutes = endMinutes - startMinutes;
      $scope.newTime.hours = endHours - startHours;
    }
  };

  // $scope.options = {
  //   format: 'yyyy-mm-dd', // ISO formatted date
  //   onClose: function(e) {
  //     // do something when the picker closes   
  //   }
  // }

  // $scope.prepareUpdateStartTime = function(){
  //   $scope.options.startTimeEdit = $filter('date')($scope.startTime, 'shortTime');
  //   $scope.options.editTime  = true;
  // };

  // $scope.updateStartTime = function(){
  //   var testValue = $scope.options.startTimeEdit.trim().slice(0,-2).trim();
  //   console.log(testValue);
  //   var pattern = /^\d{2}:\d{2}$/;
  //   if(pattern.test(testValue)){
  //     console.log('passes test');
  //     $scope.startTime = $scope.options.startTimeEdit;
  //   }
  //   $scope.options.startTimeEdit = '';
  //   $scope.options.editTime = false;
  // };

  $scope.timerButtonText = "Start Timer";
    // Triggered in the login modal to close it
  $scope.closeTime = function() {
    $scope.modal.hide();
  };

  $scope.showTimeModal = function() {
    $scope.modal.show();
  };

  $scope.finishTime = function(){

    var newTimeEntry = {
      start: $scope.startTime,
      end: $scope.endTime,
      total: '01:45:13',
      taskIndex: 1
    };
    timeObject.$push(newTimeEntry);
    $scope.modal.hide();
    $scope.startTime = '';
    $scope.endTime = '';
    $scope.timerRunning = false;
    $scope.timerStarted = false;
    $scope.$broadcast('timer-clear');
    $scope.timerButtonText = "New Timer";
  };

  $scope.timerRunning = false;
  $scope.timerStarted = false;

  $scope.restartTimer = function(){
    $scope.startTime = new Date();
    $scope.endTime = '';
    $scope.timerRunning = true;
    $scope.$broadcast('timer-stop');
    $scope.$broadcast('timer-start');
    $scope.timerButtonText = "Pause Timer";
  };

  $scope.startResumeTimer = function (){
      if($scope.timerStarted == false){
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
        $scope.timerStarted = true;
        $scope.startTime = new Date();
        $scope.timerButtonText = "Pause Timer";
      }
      else if($scope.timerRunning){
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
        $scope.timerButtonText = "Start Timer";
      }
      else if($scope.timerRunning == false){
        $scope.$broadcast('timer-resume');
        $scope.timerRunning = true;
        $scope.timerButtonText = "Pause Timer";
      }
  };


  $scope.stopTimer = function (){
      $scope.$broadcast('timer-stop');
      $scope.timerRunning = false;
      $scope.timerStarted = false;
      $scope.endTime = new Date();
  };

  $scope.$on('timer-stopped', function (event, data){
    $scope.timeEntry = data;
  });


  // $scope.$watch('startTime', function (newValue) {
  //     $scope.workerDetail.dateOfBirth = $filter('date')(newValue, 'YYYY/MM/DD'); 
  // });

  // $scope.$watch('workerDetail.dateOfBirth', function (newValue) {
  //     $scope.mydateOfBirth = $filter('date')(newValue, 'YYYY/MM/DD'); 
  // });


});
