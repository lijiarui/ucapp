angular.module('starter.accountcontrollers', [])

.controller('AccountCtrl', function($scope,AuthService,$state,$window) {
    $scope.user = $window.sessionStorage;

    $scope.logout = function(){
        AuthService.logout();
        $state.go("login");
    }
})



.controller('LoginCtrl',function($scope,$rootScope,AuthService,$ionicPopup){
    $scope.checklogin = false;
    $scope.login = function(username,password){
         AuthService.login(username,password)
        .then(function(res){
            if (res.ret === true) {
                //console.log("resresres");
                console.log(res);
                $rootScope.$broadcast(res);
            }
            else{
                $rootScope.$broadcast("login failed");
                // showAlert();
                $scope.checklogin = true;
            }
            
        },function(){
            $rootScope.$broadcast("transimit failed wuwuwu");
        });
    }

    // var showAlert = function() {
    //    var alertPopup = $ionicPopup.alert({
    //      template: '用户名或密码错误'
    //    });
    //    alertPopup.then(function(res) {
    //      console.log('Thank you for not eating my delicious ice cream cone');
    //    });
    //  };

    $scope.logout = function(){
        AuthService.logout();
    }

})
