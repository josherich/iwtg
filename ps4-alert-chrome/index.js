var bg = chrome.extension.getBackgroundPage();
var list = document.querySelector('#list');
var add = document.querySelector('#add');
var platform = document.querySelector('#platform');
var input = document.querySelector('#new');

inflate(bg.watched, bg.allgames);

function inflate(availables, allgames) {

  list.innerHTML = "";
  var _platform = platform.value;

  for (var k in availables[_platform]) {
    var item = document.createElement('div');
    var p = document.createElement('p');
    var del = document.createElement('button');

    p.textContent = k + ": " + availables[platform][k];
    del.textContent = '-';
    var cb = function(k) {
      return function() {
        bg.removegame(k);
        this.parentNode.style.display = 'none';
      }
    }
    del.addEventListener('click', cb(k));
    item.appendChild(p);
    item.appendChild(del);

    list.appendChild(item);
  }

  input.innerHTML = "";
  Object.keys(allgames[_platform]).filter(function(e) {
    return e.length > 0;
  }).map(function(e) {
    var option = document.createElement('option');
    option.value = e;
    option.textContent = e;
    input.appendChild(option);
  });
}

platform.addEventListener('change', function(e) {
  bg.setPlatform(platform.value);
  inflate(bg.watched, bg.allgames);
});

add.addEventListener('click', function(e) {
  var name = input.value;
  bg.addgame(name);
  window.close();
});