// var socket = io('https://iwantthatgame-josherich.c9.io');
// var socket = io('http://198.199.112.127:3000');
var socket = io('http://localhost:3000');
console.log('connect request initiated');
var games = {};
var allgames = {};
var availables = {};

function addgame(name) {
  if (!name) return;
  games[name] = true;
  availables[name] = allgames[name];
  setState();
}

function removegame(name) {
  console.log(name);
  delete games[name];
  delete availables[name];
  setState();
}

function setState() {
  chrome.browserAction.setIcon({path:'logo128.png'});
  for (var key in availables) {
    if (parseInt(availables[key]) > 0) {
      chrome.browserAction.setIcon({path:'logo128-g.png'});
    }
  }
}

socket.on('heartbeat', function(link) {
  console.log('heartbeat');
});

socket.on('change', function(data) {
  console.log('game available: ', data);
  allgames = data;

  for (var key in allgames) {
    if (games[key]) {
      availables[key] = allgames[key];
    }
  }
  setState();
  // var opt = {
  //       type: "basic",
  //       title: "Available",
  //       message: "Watch Dog is available now. http://www.chinagnet.com/bbs/exchangeps4/",
  //       iconUrl: ""
  // }
  // chrome.notifications.create('', opt, function(){});
});