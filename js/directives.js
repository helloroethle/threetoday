angular.module('starter.directives', [])
// .directive('myDirective', function($filter) {
//   return {
//     require: 'ngModel',
//     link: function(scope, element, attrs, ngModelController) {
//       ngModelController.$parsers.push(function(data) {
//         //convert data from view format to model format

//         return data; //converted
//       });

//       ngModelController.$formatters.push(function(data) {
//         //convert data from model format to view format
//         $filter('date')('shortTime', data);
//         return data; //converted
//       });
//     }
//   }
// });


.directive( 'timeInput', function($filter) {
    return {
        require: 'ngModel',
        // template: '<input type="date"></input>',
        // replace: true,
        link: function(scope, elm, attrs, ngModelCtrl) {
            ngModelCtrl.$formatters.unshift(function (modelValue) {
                console.log('hello directive');
                return $filter('date')(modelValue, 'shortTime');
            });

            // ngModelCtrl.$parsers.unshift(function(viewValue) {
            //     return new Date(viewValue);
            // });
        },
    };
    });