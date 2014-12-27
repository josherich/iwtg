var socket = io('https://iwantthatgame-josherich.c9.io');
// var socket = io('http://localhost');
console.log('connect request initiated');
var games = [];
var availables = {};

function addgame(name) {
  var _name = btoa(unescape(encodeURIComponent(name)));
  if (games.indexOf(_name) > -1) return;

  games.push(_name);
  console.log(games.join(','))
  socket.emit('changename', games.join(','));
}

function removegame(name) {

  var i = games.indexOf(name);
  if (i === -1) return;
  delete availables[name];
  games.splice(i, 1);
  console.log(games.join(','))
  socket.emit('changename', games.join(','));
}

socket.on('heartbeat', function(link) {
  console.log('heartbeat');
  var opt = {
    type: "basic",
    title: "Not Available",
    message: "Watch Dog is not available now.",
    iconUrl: ""
  }
});

socket.on('change', function(data) {
  console.log('game available: ', data);
  for (var k in data) {
    availables[k] = data[k];
  }
  for (var j in availables) {
    if (parseInt(availables[j]) > 0) {
      chrome.browserAction.setIcon({path:'logo128-g.png'});
      return;
    }
  }
  chrome.browserAction.setIcon({path:'logo128.png'});

      // var opt = {
      //       type: "basic",
      //       title: "Available",
      //       message: "Watch Dog is available now. http://www.chinagnet.com/bbs/exchangeps4/",
      //       iconUrl: ""
      // }
      // chrome.notifications.create('', opt, function(){});
    });