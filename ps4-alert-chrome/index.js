var bg = chrome.extension.getBackgroundPage();
var list = document.querySelector('#list');
var add = document.querySelector('#add');
var input = document.querySelector('#new')
inflate(bg.availables, bg.allgames);

function inflate(availables, allgames) {

  list.innerHTML = "";

  for (var k in availables) {
    var item = document.createElement('div');
    var p = document.createElement('p');
    var del = document.createElement('button');

    p.textContent = k + ": " + availables[k];
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

  Object.keys(allgames).filter(function(e) {
    return e.length > 0;
  }).map(function(e) {
    var option = document.createElement('option');
    option.value = e;
    option.textContent = e;
    input.appendChild(option);
  });
}

add.addEventListener('click', function(e) {
  var name = input.value;
  bg.addgame(name);
  window.close();
});