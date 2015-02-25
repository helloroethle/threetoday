angular.module('starter.services', ['firebase'])
    .factory("Auth", ["$firebaseAuth", "$rootScope",
    function ($firebaseAuth, $rootScope) {
            var ref = new Firebase(firebaseUrl);
            return $firebaseAuth(ref);
}])

.factory('Tasks', function ($firebase, $filter, $rootScope) {
  var uid = $rootScope.uid
  var today = new Date();
  var datekey = $filter('date')(today, "yyyy-MM-dd");
  var ref = new Firebase(firebaseUrl);
  var allTasks = $firebase(ref.child('tasks').child(uid)).$asArray();
  var todayTasks = $firebase(ref.child('tasks').child(uid).child(datekey)).$asObject();
  var currentThree = $firebase(ref.child('users').child(uid).child('currentThree')).$asObject();

  var Task = {
    all: allTasks,
    create: function (newTasks) {
      return todayTasks.$save(newTasks);
    },
    get: function () {
      return todayTasks;
    },
    getCurrentThree: function(){
      return currentThree;
    },
    saveCurrentThree: function(newCurrentThree){
      return currentThree.$save(newCurrentThree);
    },
    delete: function () {
      return todayTasks.$remove();
    }
  };

  return Task;
})

.factory('Time', function ($firebase, $filter, $rootScope) {
  var uid = $rootScope.uid
  var today = new Date();
  var datekey = $filter('date')(today, "yyyy-MM-dd");
  var ref = new Firebase(firebaseUrl);
  var allTimes = $firebase(ref.child('times').child(uid)).$asArray();
  var todayTimes = $firebase(ref.child('times').child(uid).child(datekey)).$asArray();

  var Time = {
    all: allTimes,
    create: function (time) {
      return todayTimes.$add(time);
    },
    update: function (time) {
      return todayTimes.$save(time);
    },
    delete: function (time) {
      return todayTimes.$remove(time);
    }
  };

  return Time;
})

.factory('Friends', function ($firebase, $filter, $rootScope) {
  var uid = $rootScope.uid
  var today = new Date();
  var datekey = $filter('date')(today, "yyyy-MM-dd");
  var ref = new Firebase(firebaseUrl);
  var friends = $firebase(ref.child('accountability').child(uid)).$asArray();
  var Friend = {
    all: friends,
    create: function (friend) {
      return friends.$add(friend);
    },
    update: function (friend) {
      return friends.$save(friend);
    },
    delete: function (friend) {
      return friends.$remove(friend);
    }
  };

  return Friend;
})

.factory('Stats', function ($firebase, $filter, $rootScope) {
  var uid = $rootScope.uid
  var ref = new Firebase(firebaseUrl);
  var stats = $firebase(ref.child('users').child(uid).child('overviewStats')).$asObject();

  var Stat = {
    get: function (friend) {
      return stats;
    },
    update: function (newStats) {
      return stats.$save(newStats);
    }
  };

  return Stat;
})




// // https://www.firebase.com/docs/web/libraries/angular/quickstart.html
// .factory('Chats', function ($firebase, Rooms) {

//     var selectedRoomId;

//     var ref = new Firebase(firebaseUrl);
//     var chats;

//     return {
//         all: function () {
//             return chats;
//         },
//         remove: function (chat) {
//             chats.$remove(chat).then(function (ref) {
//                 ref.key() === chat.$id; // true item has been removed
//             });
//         },
//         get: function (chatId) {
//             for (var i = 0; i < chats.length; i++) {
//                 if (chats[i].id === parseInt(chatId)) {
//                     return chats[i];
//                 }
//             }
//             return null;
//         },
//         getSelectedRoomName: function () {
//             var selectedRoom;
//             if (selectedRoomId && selectedRoomId != null) {
//                 selectedRoom = Rooms.get(selectedRoomId);
//                 if (selectedRoom)
//                     return selectedRoom.name;
//                 else
//                     return null;
//             } else
//                 return null;
//         },
//         selectRoom: function (roomId) {
//             console.log("selecting the room with id: " + roomId);
//             selectedRoomId = roomId;
//             if (!isNaN(roomId)) {
//                 chats = $firebase(ref.child('rooms').child(selectedRoomId).child('chats')).$asArray();
//             }
//         },
//         send: function (from, message) {
//             console.log("sending message from :" + from.displayName + " & message is " + message);
//             if (from && message) {
//                 var chatMessage = {
//                     from: from.displayName,
//                     message: message,
//                     createdAt: Firebase.ServerValue.TIMESTAMP
//                 };
//                 chats.$add(chatMessage).then(function (data) {
//                     console.log("message added");
//                 });
//             }
//         }
//     }
// })

// /**
//  * Simple Service which returns Rooms collection as Array from Salesforce & binds to the Scope in Controller
//  */
// .factory('Rooms', function ($firebase) {
//     // Might use a resource here that returns a JSON array
//     var ref = new Firebase(firebaseUrl);
//     var rooms = $firebase(ref.child('rooms')).$asArray();

//     return {
//         all: function () {
//             return rooms;
//         },
//         get: function (roomId) {
//             // Simple index lookup
//             return rooms.$getRecord(roomId);
//         }
//     }
// });