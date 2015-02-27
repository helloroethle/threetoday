angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {

})

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {

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
                      totalTimeEntered: '0:0:0',
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


.controller('ThreesCtrl', function($scope, $state, $ionicPopup, $ionicModal, $ionicLoading, $timeout, $rootScope, $firebase, Tasks, $filter, Stats) {
  
  // Initialize Scope Variables
  $scope.tasks = {};
  $scope.operations = {};
  $scope.viewOptions = {};
  $scope.viewOptions.completed = false;
  $scope.viewOptions.canEdit = false;
  $scope.viewOptions.submitted = false;
  $scope.viewOptions.prelimSubmit = false;
  $scope.viewOptions.showStreak = false;

  $scope.streak = 0;
  $scope.shownTask = false; 
  $scope.hours = 4;
  $scope.minutes = 33;
  $scope.seconds = 14;
  

  // Initialize Controller Variables
  var dateKey = $filter('date')(new Date(), "yyyy-MM-dd");
  // var today = new Date()
  // var dateKey = today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString();
  var three = Tasks.getCurrentThree();

  var initializeTaskObject = function(){
    var task1Object = { 'title':  '', 'accomplished': false };
    var task2Object = { 'title':  '', 'accomplished': false };
    var task3Object = { 'title':  '', 'accomplished': false };
    $scope.tasks = {
      'task1': task1Object,
      'task2': task2Object,
      'task3': task3Object,
      'lastUpdated' : dateKey
    };
  };

  // initialize the task entry page
  three.$loaded().then(function() {
    if(three.lastUpdated && three.lastUpdated == dateKey){
      $scope.viewOptions.submitted = true;
      $scope.tasks = three;
      $rootScope.task1 = three.task1;
      $rootScope.task2 = three.task2;
      $rootScope.task3 = three.task3;
      if($scope.tasks.task1.accomplished && $scope.tasks.task2.accomplished && $scope.tasks.task3.accomplished){
        $scope.viewOptions.completed = true;
      }
    }
    else{
      initializeTaskObject();
    }
  })
  .catch(function(error) {
    console.error("Error:", error);
  });

  // Initialize Three Today Task Completion Modal
  $ionicModal.fromTemplateUrl('templates/tasks-success.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.streakModal = modal;
  });

  $scope.operations.completeTask = function(taskNumber){
    if((taskNumber == 1 && $scope.tasks.task1.accomplished) || 
      (taskNumber == 2 && $scope.tasks.task2.accomplished) || 
      (taskNumber == 3 && $scope.tasks.task3.accomplished)){
      Stats.current.totalTasksComplete += 1;
    }
    else{
      Stats.current.totalTasksComplete += -1;
    }

    Tasks.updateCurrentThree($scope.tasks);
    Tasks.create({'task1': $scope.tasks.task1,'task2': $scope.tasks.task2, 'task3': $scope.tasks.task3});
    if($scope.tasks.task1.accomplished && $scope.tasks.task2.accomplished && $scope.tasks.task3.accomplished){
      // update stats
      Stats.current.currentStreak += 1;
      if(Stats.current.currentStreak > Stats.current.longestStreak){
        Stats.current.longestStreak = Stats.current.currentStreak;
      }
      // streaks, totalTasksCompleted
      $scope.stats = Stats.current;
      $scope.viewOptions.completed = true;
      $scope.streakModal.show();
    }
    else if($scope.viewOptions.completed){
      if(Stats.current.currentStreak == Stats.current.longestStreak){
        Stats.current.longestStreak += -1;
      }
      Stats.current.currentStreak += -1;
      $scope.viewOptions.completed = false;
    }

    Stats.update();
  };

  $scope.operations.viewTimes = function(){
    $state.go('app.timedetails');
    // , { "dateKey": dateKey });
  }

  $scope.operations.awesomeHide = function(){
    $scope.streakModal.hide();
    $ionicLoading.show({
          template: 'Yeah you are!'
      });
    $timeout(function(){
      $ionicLoading.hide();
    }, 1000);
  };

  $scope.operations.swipeLeft = function(index){
    $state.go('app.single', { "taskId": index });
  };

 $scope.operations.showConfirm = function(e) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Confirm',
     template: 'Are you sure these are your three main tasks for the day? You won\'t be able to change edit these until tomorrow'
   });
   confirmPopup.then(function(res) {
     if(res) {
        Stats.current.totalDaysActive += 1;
        Stats.update();
        $scope.viewOptions.submitted = true;
        console.log($scope.tasks);
        Tasks.createCurrentThree($scope.tasks);
        Tasks.create({
          'task1': $scope.tasks.task1,
          'task2': $scope.tasks.task2,
          'task3': $scope.tasks.task3
        })
        $rootScope.task1 = $scope.tasks.task1;
        $rootScope.task2 = $scope.tasks.task2;
        $rootScope.task3 = $scope.tasks.task3;
        $scope.tasks = Tasks.getCurrentThree();
     } else {
       $scope.viewOptions.submitted = false;
       $scope.viewOptions.prelimSubmit = false;
     }
   });
 };

})


















.controller('ThreeCtrl', function($scope, $stateParams, $ionicModal, $filter, $firebase, $rootScope, Time, Stats) {
  var dateKey = $filter('date')(new Date(), "yyyy-MM-dd");

  $ionicModal.fromTemplateUrl('templates/add-time.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.operations = {};
  $scope.options = {};
  $scope.options.showDeleteButtons = false;
  $scope.options.editTime = false;
  $scope.newTime = {};
  $scope.tasks = [$rootScope.task1, $rootScope.task2, $rootScope.task3];

  if($stateParams.taskId){
    $scope.newTime.selectedTaskItem = $scope.tasks[$stateParams.taskId - 1];
  }

  $scope.operations.updateTime = function(){
    console.log('update time called');
    if(!$scope.newTime.newEndTime)
      return;
    if($scope.newTime.newEndTime < $scope.newTime.newStartTime){
      $scope.newTime.newEndTime = $scope.newTime.newStartTime;
    }
    var startHours = $scope.newTime.newStartTime.getHours();
    var startMinutes = $scope.newTime.newStartTime.getMinutes();
    var startSeconds = $scope.newTime.newStartTime.getSeconds();
    var endHours = $scope.newTime.newEndTime.getHours();
    var endMinutes = $scope.newTime.newEndTime.getMinutes();
    var endSeconds = $scope.newTime.newEndTime.getSeconds();
    $scope.newTime.minutes = 0;
    $scope.newTime.hours = 0;
    $scope.newTime.seconds = 0;
    if(startSeconds > endSeconds){
      if(startMinutes > endMinutes){
        $scope.newTime.minutes = (endMinutes + 59) - startMinutes;
        $scope.newTime.hours = (endHours - 1) - startHours;
        $scope.newTime.seconds = (endSeconds + 60) - startSeconds;
      }
      else{
        $scope.newTime.minutes = (endMinutes - 1) - startMinutes;
        $scope.newTime.hours = endHours - startHours;
        $scope.newTime.seconds = (endSeconds + 60) - startSeconds;
      }
    }
    else{
      $scope.newTime.seconds = endSeconds - startSeconds;
      if(startMinutes > endMinutes){
        $scope.newTime.minutes = (endMinutes + 60) - startMinutes;
        $scope.newTime.hours = (endHours - 1) - startHours;
      }
      else{
        $scope.newTime.minutes = endMinutes - startMinutes;
        $scope.newTime.hours = endHours - startHours;
      }
    }

  };


  $scope.timerButtonText = "Start Timer";
  $scope.operations.closeTime = function() {
    $scope.modal.hide();
  };
  $scope.operations.showTimeModal = function() {
    $scope.modal.show();
  };
  $scope.operations.finishTime = function(){
    var selectedTaskIndex = 0;
    for(var i = 0; i < $scope.tasks.length; i++){
      if($scope.tasks[i] == $scope.newTime.selectedTaskItem){
        selectedTaskIndex = i;
      }
    }
    var newTimeEntry = {
        start: $filter('date')($scope.newTime.newStartTime, "mediumTime"),
        end: $filter('date')($scope.newTime.newEndTime, "mediumTime"),
        total: $scope.newTime.hours.toString() + ':' + $scope.newTime.minutes.toString() + ':' + $scope.newTime.seconds.toString(),
        taskIndex: (selectedTaskIndex + 1)
    };
    // var newTimeEntry = {};
    // if($scope.endTime){
    //   newTimeEntry = {
    //     start: $scope.startTime.toString(),
    //     end: $scope.endTime.toString(),
    //     total: $scope.timeEntry.hours.toString() + $scope.timeEntry.minutes.toString(),
    //     taskIndex: 'task' + 1
    //   };
    // }
    // else{
    //     newTimeEntry = {
    //       start: $scope.newTime.newStartTime.toString(),
    //       end: $scope.newTime.newEndTime.toString(),
    //       total: $scope.newTime.hours.toString() + ':' + $scope.newTime.minutes.toString(),
    //       taskIndex: 'task' + 1
    //     };
    // }
    // update stats - total time entered
    var totalTime = addTaskTime(Stats.current.totalTimeEntered, $scope.newTime);
    Stats.current.totalTimeEntered = totalTime.hours + ':' + totalTime.minutes + ':' + totalTime.seconds;
    Stats.update();

    Time.create(newTimeEntry);
    // timeObject.$push(newTimeEntry);
    $scope.modal.hide();
    $scope.startTime = '';
    $scope.endTime = '';
    $scope.newTime = {};
    if($stateParams.taskId){
      $scope.newTime.selectedTaskItem = $scope.tasks[$stateParams.taskId - 1];
    }
    $scope.timerRunning = false;
    $scope.timerStarted = false;
    $scope.$broadcast('timer-clear');
    $scope.timerButtonText = "New Timer";
  };

  $scope.timerRunning = false;
  $scope.timerStarted = false;

  $scope.operations.restartTimer = function(){
    $scope.startTime = new Date();
    $scope.endTime = '';
    $scope.timerRunning = true;
    $scope.$broadcast('timer-stop');
    $scope.$broadcast('timer-start');
    $scope.timerButtonText = "Pause Timer";
  };

  var addTaskTime = function(time, timeObject){
    var timeArray = time.split(':');
    timeObject.seconds += parseInt(timeArray[2]);
    timeObject.minutes += parseInt(timeArray[1]);
    timeObject.hours += parseInt(timeArray[0]);
    if(timeObject.seconds > 59){
      timeObject.minutes += 1;
      timeObject.seconds -= 60;
    }
    if(timeObject.minutes > 59){
      timeObject.hours += 1;
      timeObject.minutes -= 60;
    }
    return timeObject;
  }

  $scope.operations.startResumeTimer = function (){
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


  $scope.operations.stopTimer = function (){
      $scope.$broadcast('timer-stop');
      $scope.timerRunning = false;
      $scope.timerStarted = false;
      $scope.endTime = new Date();
      $scope.newTime.newEndTime = new Date($scope.endTime.setMilliseconds(0));
      $scope.newTime.newStartTime = new Date($scope.startTime.setMilliseconds(0));
      $scope.operations.updateTime();
  };

  $scope.$on('timer-stopped', function (event, data){
    $scope.timeEntry = data;
  });





})




.controller('TimeCtrl', function($scope, $stateParams, $filter, $firebase, $rootScope, Time) {

  $scope.tasks = [$rootScope.task1, $rootScope.task2, $rootScope.task3];
  var dateKey = $filter('date')(new Date(), "yyyy-MM-dd");
  $scope.hours = 0;
  $scope.minutes = 0;
  $scope.seconds = 0;

  // if($stateParams.dateKey){
  //   dateKey = $stateParams.dateKey;
  // }


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

  var addTime = function(time){
    var timeArray = time.split(':');
    $scope.seconds += parseInt(timeArray[2]);
    $scope.minutes += parseInt(timeArray[1]);
    $scope.hours += parseInt(timeArray[0]);
    if($scope.seconds > 59){
      $scope.minutes += 1;
    }
    if($scope.minutes > 59){
      $scope.hours += 1;
    }
  };

  var addTaskTime = function(time, timeObject){
    var timeArray = time.split(':');
    timeObject.seconds += parseInt(timeArray[2]);
    timeObject.minutes += parseInt(timeArray[1]);
    timeObject.hours += parseInt(timeArray[0]);
    if(timeObject.seconds > 59){
      timeObject.minutes += 1;
      timeObject.seconds -= 60;
    }
    if(timeObject.minutes > 59){
      timeObject.hours += 1;
      timeObject.minutes -= 60;
    }
    return timeObject;
  }

  $scope.taskTimes = {};
  $scope.taskTimes.time1 = {'hours':0, 'minutes':0, 'seconds':0};
  $scope.taskTimes.time2 = {'hours':0, 'minutes':0, 'seconds':0};
  $scope.taskTimes.time3 = {'hours':0, 'minutes':0, 'seconds':0};
  $scope.taskTimes.task1 = [];
  $scope.taskTimes.task2 = [];
  $scope.taskTimes.task3 = [];

  Time.getDate(dateKey).$loaded()
    .then(function(timeEntries) {
      for(var i = 0; i < timeEntries.length; i++){
        var item = timeEntries[i];
        addTaskTime(item.total, $scope);
        if(item.taskIndex == '1'){
          addTaskTime(item.total, $scope.taskTimes.time1);
          $scope.taskTimes.task1.push(item);
        }
        else if(item.taskIndex == '2'){
          addTaskTime(item.total, $scope.taskTimes.time2);
          $scope.taskTimes.task2.push(item);
        }
        else if(item.taskIndex == '3'){
          addTaskTime(item.total, $scope.taskTimes.time3);
          $scope.taskTimes.task3.push(item);
        }
      }
    })
    .catch(function(error) {
      console.error("Error:", error);
    });


})




















.controller('HistoryCtrl', function($scope, $filter, $rootScope, $firebase, $state, $filter, Tasks) {
  $scope.groups = [];
  var dateKey = $filter('date')(new Date(), "yyyy-MM-dd");

  $rootScope.$on( "$ionicView.enter", function( scopes, states ) {
            if( states.fromCache && states.stateName == "app.history" ) {
                loadTasks();
            }
        });

  // var ref = new Firebase($rootScope.firebaseUrl);
  // var taskRef = $firebase(ref.child('tasks').child($rootScope.uid));
  // var taskList = taskRef.$asArray();
  $scope.operations = {};

  var loadTasks = function(){
    Tasks.all.$loaded().then(function(taskList) {
      for(var i = 0; i < taskList.length; i++){
        var task = taskList[i];
        var currentDate = getDateFromString(task.$id);
        var status = '';
        if(task.task1.accomplished && task.task2.accomplished && task.task3.accomplished){
            status = 'success';
        }
        else if(task.task1.accomplished || task.task2.accomplished || task.task3.accomplished){
          status = 'partial';
        }
        else{
          status = 'fail';
        }
        $scope.groups[i] = {
          name: $filter('date')(currentDate, 'longDate'),
          items: [taskList[i].task1, taskList[i].task2, taskList[i].task3],
          status: status,
          id: task.$id
        };
      }

    })
    .catch(function(error) {
      console.log("Error:", error);
    });
  }

  loadTasks();




  $scope.options = {};
  $scope.options.query = '';
  $scope.options.showProgress = true;

  var getDateFromString = function(dateString){
  dateArray = dateString.split('-');
  currentDate = new Date(dateArray[0], (dateArray[1] - 1), dateArray[2]);
  return currentDate;
}

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
  };

  $scope.operations.viewTimeDetails = function(newDateKey){
    console.log(newDateKey);
    $state.go('app.timedetails');
    // , { "dateKey": newDateKey });
  };

})

.controller('AccountabilityCtrl', function($scope, $ionicModal, $rootScope, $firebase, Friends) {
  console.log()
  $scope.newFriend = {};
  $scope.acct = {};
  $scope.friends = [];
  $scope.options = {};
  $scope.options.showDeleteButtons = false
  $scope.options.title = "Add Friend";
  $scope.options.editing = false;

  $scope.friends = Friends.all;

  //   Friends.all.$loaded(
  //   function(friends) {
  //     $scope.friends = friends;
  //   },
  //   function(err) {
  //     console.error(err);
  //   }
  // );


  $scope.addFriend = function(){
    if($scope.options.editing){
      Friends.update($scope.newFriend);
    }
    else{
      Friends.create($scope.newFriend);
    }
    
    // $scope.friends.push($scope.newFriend);
    // accountabilityObject.$push($scope.newFriend);
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

  $scope.showFriendModal = function() {
    $scope.options.title = "Add Friend";
    $scope.options.editing = false;
    $scope.friendModal.show();
  };

    $scope.editFriendModal = function(index) {
      $scope.options.editing = true;
      if($scope.options.showDeleteButtons){
        Friends.delete($scope.friends[index]);
        // $scope.friends.splice(index, 1);
      }
      else{
        $scope.options.title = "Edit Friend";
        $scope.newFriend = $scope.friends[index];
        $scope.friendModal.show();
      }

  };



})

.controller('MyInfoCtrl', function($scope, Stats) {
  $scope.stats = Stats.current;
  // var timeArray = Stats.current.totalTimeEntered.split(':');
  // $scope.totalTimeEnteredFormatted = timeArray[0] + ':' + timeArray[1] + ':' + timeArray[2];
})

.controller('SettingsCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
console.log('hello settings controller');

})

.controller('CalendarCtrl', function ($scope, $rootScope, uiCalendarConfig, $compile, Tasks) {
var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    success = '#33cd5f';
    partial = '#886aea';
    fail = '#ef473a';
    $scope.failCount = 0;
    $scope.partialCount = 0;
    $scope.successCount = 0;
var events = [];
$scope.events = [];


// $scope.events = [
// {
//   allDay: true,
//   backgroundColor: "#33cd5f",
//   rendering: "background",
//   start: 'Wed Feb 25 2015 00:00:00 GMT-0600 (CST)'
// }
// ]


// $scope.events = [
//         {
//             start: '2015-02-10T10:00:00',
//             title: 'hello',
//             allDay: true,
//             end: '2014-02-10T16:00:00',
//             rendering: 'background',
//             textColor: 'fff',
//             backgroundColor: success,
//         },
//                 {
//             start: '2015-02-14T10:00:00',
//             title: 'hello',
//             allDay: true,
//             end: '2014-02-10T16:00:00',
//             rendering: 'background',
//             textColor: '#fff',
//             backgroundColor: partial,
//         },
//                 {
//             start: '2015-02-08T10:00:00',
//             title: 'hello',
//             allDay: true,
//             end: '2014-02-10T16:00:00',
//             rendering: 'background',
//             textColor: '#fff',
//             backgroundColor: fail,
//         },
//                 {
//             start: '2015-02-20T10:00:00',
//             title: 'hello',
//             allDay: true,
//             end: '2014-02-10T16:00:00',
//             rendering: 'background',
//             textColor: '#fff',
//             backgroundColor: partial,
//         }
//     ]

  $scope.uiConfig = {
        calendar:{
          height: 375,
          // editable: true,
          header:{
            left: 'prev',
            center: 'title',
            right: 'next'
          },
        }
      };

    $scope.eventSources =  [$scope.events];

    Tasks.all.$loaded().then(function(myTasks) {

      for(var i = 0; i < myTasks.length; i++){
        var color = '';
        var task = myTasks[i];
        var currentDate = getDateFromString(task.$id);
        if(task.task1.accomplished && task.task2.accomplished && task.task3.accomplished){
          color = success;
          $scope.successCount += 1;
        }
        else if(task.task1.accomplished || task.task2.accomplished || task.task3.accomplishd){
          color = partial;
          $scope.partialCount += 1;
        }
        else{
          $scope.failCount += 1;
          color = fail;
        }
        $scope.events.push({
            start: currentDate,
            title: 'hello',
            allDay: true,
            rendering: 'background',
            backgroundColor: color,
        })
      }

  })
  .catch(function(error) {
    console.error("Error:", error);
  });

var getDateFromString = function(dateString){
  dateArray = dateString.split('-');
  currentDate = new Date(dateArray[0], (dateArray[1] - 1), dateArray[2]);
  return currentDate;
}


});
