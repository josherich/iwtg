// var socket = io('https://iwantthatgame-josherich.c9.io');
var socket = io('http://198.199.112.127:3000');
// var socket = io('http://localhost:3000');
console.log('connect request initiated');
var watched = restoreWatched() || {
  ps4: {},
  ps3: {},
  psv: {},
  xbox: {}
};

var allgames = {};

if (!localStorage.platform) localStorage.platform = 'ps4';
var platform = localStorage.platform || 'ps4';

function setPlatform(p) {
  if (!p) return;
  platform = p;
  localStorage.platform = p;
}

function addgame(name) {
  if (!name) return;
  watched[platform][name] = allgames[platform][name];
  setState();
  saveWatched(watched);
}

function removegame(name) {
  delete watched[platform][name];
  setState();
  saveWatched(watched);
}

function setState() {
  chrome.browserAction.setIcon({path:'logo128.png'});
  for (var key in watched[platform]) {
    if (parseInt(watched[platform][key]) > 0) {
      chrome.browserAction.setIcon({path:'logo128-g.png'});
    }
  }
}

function saveWatched(watched) {
  try {
    localStorage.watched = JSON.stringify(watched);
  } catch (e) {
    console.log('parse error');
  }
}

function restoreWatched() {
  var watched;
  try {
    watched = JSON.parse(localStorage.watched);
  } catch (e) {
    console.log('parse error');
    return null;
  }
  return watched;
}

socket.on('heartbeat', function(link) {
  console.log('heartbeat');
});

socket.on('change', function(data) {
  console.log('game available: ', data);
  allgames = data;

  for (var key in allgames) {
    if (watched[platform][key]) {
      watched[platform][key] = allgames[platform][key];
    }
  }
  saveWatched(watched);
  setState();
  // var opt = {
  //       type: "basic",
  //       title: "Available",
  //       message: "Watch Dog is available now. http://www.chinagnet.com/bbs/exchangeps4/",
  //       iconUrl: ""
  // }
  // chrome.notifications.create('', opt, function(){});
});