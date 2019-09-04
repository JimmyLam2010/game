var express = require('express'),  //一个mvc框架
    io = require('socket.io')  //通信协议服务


//创建一个应用
var app = express();  //var food = angular.module()

//记录客户的数组
var players = [];

//第一位进入服务器的玩家
var firstPlayer;

//设置应用的运行的端口
var server = app.listen(3000,function(){
  console.log('服务已启动');
});


//设置监听socket服务   让socket去监听哪个服务
var ws = io.listen(server);

//检测昵称重复的方法
var checkNickname = function(nickname)
{
  // nickname = "demo1";
  // var arr = [
  //   {nickname:"demo1"},
  //   {nickname:"demo2"},
  //   {nickname:"demo3"},
  //   {nickname:"demo4"},
  // ];

  //ws.sockets.sockets 这个里面存放的是所有连接的客户端
  for(var k in ws.sockets.sockets)
  {
    if (ws.sockets.sockets[k].nickname == nickname)
    {
      //如果有走进来if 说明这个人已经存在了
      return true;
    }
  }

  //这个人不存在
  return false;
}

//检测是否有用户连接上来    on绑定 emit 执行

//connection 当有客户端链接上来的时候会触发
ws.on('connection',function(client, obj){
  //client 链接过来的客户端用户 对象
  console.log("有人链接上来了");
  // console.log(ws.sockets.sockets);

  //定义一个事件，让服务器接收客户端给过来的昵称
  client.on('nickname',function(nickname){
    if (checkNickname(nickname))
    {
      //已经存在，让客户重新输入用户名
      //服务器主动给客户端
      client.emit('nickname');
    }else{
      //说明该用户不存在
      client.nickname = nickname;  //给这个人增加一个自定义属性
      if(players.length==0){
        firstPlayer = nickname;
      }
      ws.sockets.emit('checkFirstPlayer', firstPlayer);
      console.log("第一位玩家："+firstPlayer);
      players.push(nickname);
      console.log("在线的客户："+players);
      ws.sockets.emit('getPlayerList',players);
      //创建所有角色
      // ws.sockets.emit('addPlayer', nickname, players);
    }
  });

  // client.emit('initPlayer', function(players){
  //   ws.sockets.emit('initPlayer', players);
  // })

  // client.on('getPlayerList', function(players){
  //   ws.sockets.emit('getPlayerList',players);
  // })

  //当有人离开聊天室
  client.on('disconnect',function(){
    for(i=0;i<players.length;i++){
      if(players[i]==client.nickname){
        players.splice(i,1);
      }
    }
    client.broadcast.emit('playerLeave', client.nickname, players);
  });
 
  // client.on('addPlayer',function(players){
  //   client.broadcast.emit('addPlayer', players);
  // })
  
  client.on('down', function(obj){
    client.broadcast.emit('down',obj);
    // console.log(obj);

  })

  client.on('up', function(obj){
    client.broadcast.emit('up',obj);
    // console.log(obj);
  })

  client.on('getItemX', function(obj){
    client.broadcast.emit('getItemX', obj);
  })

  client.on('getItemIndex', function(obj){
    client.broadcast.emit('getItemIndex', obj);
  })

  client.on('startGame', function(){
    client.broadcast.emit('startGame');
  })

  client.on('endGame', function(){
    // console.log('send');
    client.broadcast.emit('endGame');
  })

  client.on('getPoint', function(obj){
    client.broadcast.emit('getPoint', obj);
  })

  client.on('getHp', function(obj){
    client.broadcast.emit('getHp', obj);
  })

  // client.on('hit', function(){
  //   client.broadcast.emit('hit');
  // })
});