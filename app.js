var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

var mongojs = require('mongojs');
var db = mongojs('ps_alert', ['games']);
db.games.ensureIndex({'createdAt': 1});

db.on('error',function(err) {
    console.log('database error', err);
});
db.on('ready',function() {
    console.log('database connected');
});
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
var sockets = [];
var games = {
  ps4: {},
  ps3: {},
  psv: {},
  xbox: {}
};

var urls_ps4 = [
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=7',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=6',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=5',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=4',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=3',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=2',
'http://www.chinagnet.com/bbs/exchangeps4/index.php?page_c=1&search_name=&gametype=&gamelang=&page=1'];

var urls_ps3 = [
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=1',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=2',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=3',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=4',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=5',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=6',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=7',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=8',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=9',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=10',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=11',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=12',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=13',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=14',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=15',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=16',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=17',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=18',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=19',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=20',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=21',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=22',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=23',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=24',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=25',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=26',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=27',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=28',
  'http://www.chinagnet.com/bbs/exchangeps3/index.php?page_c=1&search_name=&gametype=&gamelang=&page=29'
];

var urls_xbox = [
  'http://www.chinagnet.com/bbs/exchangeone/index.php?page_c=1&search_name=&gametype=&gamelang=&page=1',
  'http://www.chinagnet.com/bbs/exchangeone/index.php?page_c=1&search_name=&gametype=&gamelang=&page=2',
  'http://www.chinagnet.com/bbs/exchangeone/index.php?page_c=1&search_name=&gametype=&gamelang=&page=3',
  'http://www.chinagnet.com/bbs/exchangeone/index.php?page_c=1&search_name=&gametype=&gamelang=&page=4',
  'http://www.chinagnet.com/bbs/exchangeone/index.php?page_c=1&search_name=&gametype=&gamelang=&page=5',
  'http://www.chinagnet.com/bbs/exchangeone/index.php?page_c=1&search_name=&gametype=&gamelang=&page=6',
];

var urls_psv = [
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=1',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=2',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=3',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=4',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=5',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=6',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=7',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=8',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=9',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=10',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=11',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=12',
  'http://www.chinagnet.com/bbs/exchange/index.php?page_c=1&search_name=&gametype=&gamelang=&page=13',
];

function collect(url, platform) {
  request({
    url: url,
    encoding: null
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var html = iconv.decode(body, 'GB2312');
      var $ = cheerio.load(html);
      var items = $('.item');

      for (var i = 0; i < items.length; i++) {
        var item = $(items[i]);
        var anchor = $(item.find('h3'));
        var _text = $(item.find('span')[1]).text();
        if (_text.indexOf('：') > -1) {
          var key = anchor.text();
          var quan = _text.split('：')[1];
          if (games[platform][key]) {
            if (games[platform][key] != quan) {
              games[platform][key] = quan;
              save(key, quan, platform);
              notifyall();
            }
          } else {
            games[platform][key] = quan;
            save(key, quan, platform);
          }
        } else {
          games[platform][_text] = null;
        }
      }
    }
  });
}

function notifyall() {
  console.log('notifyall');
  broadcast('change', games);
}

function notify(socket) {
  socket.emit('change', games);
}

function save(key, quan, platform) {
  console.log('key saved: ' + key + ': ', quan);
  db.games.save({
    name: key,
    quan: quan,
    platform: platform,
    createdAt: Date.now()
  });
}

io.on('connection', function(socket) {
  var self = this;
  var id = socket.id;
  sockets.push(socket);
  notify(socket);
});

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

setInterval(function() {
  broadcast('heartbeat');
}, 1000*60);

// setInterval(function() {
//   notifyall();
// }, 1000*6);

setInterval(function() {
  urls_ps4.map(function(url) {
    collect(url, 'ps4');
  });
  urls_ps3.map(function(url) {
    collect(url, 'ps3');
  });
  urls_psv.map(function(url) {
    collect(url, 'psv');
  });
  urls_xbox.map(function(url) {
    collect(url, 'xbox');
  });
}, 1000*60);

urls_ps4.map(function(url) {
  collect(url, 'ps4');
});
urls_ps3.map(function(url) {
  collect(url, 'ps3');
});
urls_psv.map(function(url) {
  collect(url, 'psv');
});
urls_xbox.map(function(url) {
  collect(url, 'xbox');
});