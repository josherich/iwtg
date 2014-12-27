var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

// var Keen = require('keen.io');
// Configure instance. Only projectId and writeKey are required to send data.
// var client = Keen.configure({
//     projectId: "53b4cd2e80a7bd2cdf000002",
//     writeKey: "53690d047286021b1c65087fbd052aa01036992af96c51ff2fff3ae1728761fcbc872a87ddeeb2bb6218a373115fbf50b9b966ebb812bd9c8a5d98fc2b6b63701648ced389e959d77af58e763ba9951d85ac42233b06f99373ddd7c01e8414831cb7f808da1db219d9c4961fd194290a"
// });

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];

var urls = [
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=7',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=6',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=5',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=4',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=3',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=2',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=1'];

var selector = '.item span';
var gamenames = {};

var text = '';
var timer = null, timer2 = null, launched = null;

function check(url, cb) {
  var allnames = {};
  for (var id in gamenames) {
    for (var n in gamenames[id]) {
      allnames[gamenames[id][n]] = true;
    }
  }

  if (Object.keys(allnames).length === 0) return;
  // console.log(allnames);
  request({
    url: url,
    encoding: null
  }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var html = iconv.decode(body, 'GB2312');
        var $ = cheerio.load(html);
        var items = $('.item');
        for (var i = 0; i < items.length; i++) {
          var item = $(items[i]);
          var anchor = $(item.find('h3'));
          var result = {};

          Object.keys(allnames).map(function(e) {
            var name = new Buffer(e, 'base64').toString();
            if (anchor.length && anchor.text().indexOf(name) >= 0) {
              var _text = $(item.find('span')[1]).text();
              _text = parseInt(_text.split('：')[1]);
              result[e] = _text;
            }
          });
          // console.log('scan result all: ', result);

          for (var r in result) {
            for (var id in gamenames) {
              if (gamenames[id] && gamenames[id].indexOf(r) > -1) {
                cb(result, id);
                continue; //gamenames for loop should be outside
              }
            }
          }

         }
      }
    });
}

io.on('connection', function(socket) {
  var self = this;
  var id = socket.id;
  sockets.push(socket);

  // console.log('timer init');
  var emit = function(res, id) {
    sockets.forEach(function (socket) {
      if (socket.id == id) {
        socket.emit('change', res);
      }
    });
  };

  if (!launched) {
    urls.map(function(e) {
      setInterval(check.bind(self, e, emit), 1000*60);
    });
    launched = 1;
  }

  setInterval(function() {
    broadcast('heartbeat');
  } , 1000*60);

  socket.on('changename',function(data) {
    // console.log(data);
    gamenames[id] = data.split(',');
    // console.log(gamenames[id]);
  });
});

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

