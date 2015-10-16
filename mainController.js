
var mongoose = require('mongoose');   
var ipc = require('ipc');
var goalApp = angular.module('myApp', ['ngMaterial'])

.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('orange');
 $mdThemingProvider.theme('dark', 'default')
      .primaryPalette('indigo')
      .dark();

})

.controller('goalController', function($scope, $http, $mdDialog) {
    
        ipc.on('reply', function(arg) {
            console.log(arg);
        });
    
        ipc.on('*', function(arg) {
            $scope.goals = arg;
        });
    
    
        ipc.on('getAllGoals', function(arg) {
          $scope.goals = arg;
            console.log(arg);
        });
    
        $scope.getGoals = function(){
            console.log("Current goals tab")
             ipc.send('*');
        }
      
         $scope.createGoal = function() {
            console.log("button press")
            var sD = new Date($scope.startDate);
            var startDay = sD.toTimeString
            var eD = new Date( $scope.endDate.toISOString);
             ipc.send('createGoal', $scope.title, $scope.desc, false, startDay, eD );
             console.log(startDay)
        }
        console.log($scope.startDate)

    $scope.showAlert = function(arg,ev) {
         console.log("Deleting:"+ arg)
            ipc.send('deleteGoal', arg);
            ipc.send('*');

            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('This is an alert title')
                    .content('You can specify some description text in here.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                    .targetEvent(ev)
                );
    };
    

})
