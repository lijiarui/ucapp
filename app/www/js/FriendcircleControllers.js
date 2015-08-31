angular.module('starter.friendcirclecontrollers', [])

.controller('FriendcircleCtrl', function($scope, $http, $ionicPopup, Format, $ionicLoading, $state, $rootScope, $window, PersonalHomepageService, IdSearch, $timeout) {
  $scope.clickarray = new Array();
  $scope.friend_id = null;
  $scope.inputshow = false;

  $scope.userbasic = $window.sessionStorage;

  $scope.gomypage = function() {
    $state.go('personalHomepage');
  }

  $scope.gopublisherpage = function(u_id) {
    console.log(u_id);
    $state.go('personalContactHomepage', {contact:u_id})
  }

  $scope.godiscover = function() {
    $state.go('tab.discovery');
  }

  $scope.clearclick = function() {
    $scope.clickarray = new Array();
    $scope.inputshow = false;
  }

  $scope.clickfun = function(num) {
    var user = $window.sessionStorage['user_id'];

    if($scope.infos[num].like){
      if ($scope.infos[num].like.indexOf(user) > -1) {
        $scope.heart_tag =  '取消';
      } else {
        $scope.heart_tag =  '点赞';
      }
    }
    else {
      $scope.heart_tag =  '点赞';
    }
  
    $scope.clickarray[num] = !$scope.clickarray[num];
    $scope.serial_num = num;

  }

  $scope.searchclick = function(num) {
    return $scope.clickarray[num];
  }

  $scope.remark = function(id) {
    $scope.friend_id = id;
    $scope.inputshow = true;
    console.log('id:' + id);
    $timeout(function() {
      // 201508 zixia
      // very strange, focus will not work without timeout
      document.getElementById('inputContent').focus();
    }, 50);
  };

  $scope.sendremark = function() {
    var username = $window.sessionStorage['user_name'];
    var user = $window.sessionStorage['user_id'];
    var remark_content = $scope.inputContent;
    var remark_json = [user,remark_content];
    var serial = $scope.serial_num;//整个数据流中的第几个数据

    contact_id = $scope.infos[serial].uid;
    item_id = $scope.infos[serial].id

    PersonalHomepageService.sendremark(contact_id,item_id,remark_content).success(function(data) {

      if (data.h.r === 0) {
        console.log('success!!');
        console.log($scope.infos[serial].reply);
        $scope.infos[serial].reply.push(remark_json);
        console.log($scope.infos[serial].reply);

        IdSearch.getMainInfo($scope.infos[serial].reply[0]).success(function(data) {

          var fullarray = data.b;
          var list = {'username':username};

          console.log($scope.infos[serial])
        })
      } else {
        alert('评论失败' + data.h.ret)
      }
    })
  }

  $scope.sendheart = function(num) {
    var user = $window.sessionStorage['user_id'];
    var serial = $scope.serial_num;//整个数据流中的第几个数据
    var is_like;//发送是否已经点赞

    item_id =  $scope.infos[serial].id; 

    if ($scope.infos[num].like) {
      if ($scope.infos[num].like.indexOf(user) > -1) {
       is_like = false;
      }
      else
         is_like = true;
    }  
    else{
      is_like = true;
    }  

    console.log(item_id);

    PersonalHomepageService.sendlike(item_id,is_like).success(function(data) {
      if (data.h.ret === 0) {
        if ($scope.infos[serial].like.indexOf(user) > -1) {
          var reply_heart_index = $scope.infos[serial].like.indexOf(user);
          $scope.infos[serial].like.splice(reply_heart_index, 1);
        } else {
          $scope.infos[serial].like.push(user);
        }
        IdSearch.getMainInfo($scope.infos[serial].like).success(function(data) {
          var fullarray = data.b;
          $scope.infos[serial].likelist = fullarray;
        })
      } else {
        alert('点赞失败' + data.h.r);
      }
    })
  }



  $ionicLoading.show({
    template:'<i class = "ion-load-c"><br></i>Loading...'
  });
  PersonalHomepageService.getContentInfo().success(function(data) {
    $scope.infos = data.b;
    console.log($scope.infos);
    if ($scope.infos === undefined) {
      $scope.content = '他很懒，还没有发表过状态';
    } else {
      //将发布朋友圈的人、点赞、评论人id丢入idcache
      var idlistarray = new Array();
      for (var i = 0; i < data.b.length; i++) {
        if (idlistarray.indexOf(data.b[i].uid)== -1) {
          idlistarray.push(data.b[i]['uid']);
        }
        if (data.b[i].like) {
          for(var j = 0; j<data.b[i].like.length;j++){
            if(idlistarray.indexOf(data.b[i].like[j])== -1){
              idlistarray.push(data.b[i].like[j]);
            }
          }
        }
        if (data.b[i].reply) {
          for(var m = 0; m<data.b[i].reply.length;m++){
            if(idlistarray.indexOf(data.b[i].reply[m][0])==-1){
              idlistarray.push(data.b[i].reply[m][0]);
            }
          }
        }    
      };

      var idcache = IdSearch.getMainInfo(idlistarray).success(function(temp){
        $scope.idcache = temp.b;
        //  for (var j = 0; j < $scope.infos.length; j++) {       
        //     (function(jj){
        //       $scope.infos[jj].userinfo = temp.b[$scope.infos[jj].uid];
        //     })(j);
        //     $scope.idcache = temp.b
        // }
      })
    }
  })

  .then(function() {
    $ionicLoading.hide();
  });

  $scope.getstandardtime = function(ts) {
    var timearray = Format.formattimefriendcircle(ts);
    return timearray.timestandard;
  }

  $scope.likeshow = function(like){
    if(like){
      if(like.length >0){
        return true;
      }
      else
        return false;
    }
    else
      return false;
  }

  $scope.showcomma = function(id,idarray){
    if(idarray.indexOf(id) == idarray.length-1){
      return false;
    }
    else
      return true;
  }

  //格式化类,根据收到的图片展示不同的样式
  $scope.formatcell = function(cell) {
    return Format.formatcell(cell);
  }

  $scope.refresh = function() {
    $http.get('http://17salsa.com/home/s.php?rewrite=home-view-all').success(function(data) {
      $scope.infos = data;
    }).then(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
})
