var bg = chrome.extension.getBackgroundPage();
var list = document.querySelector('#list');
var add = document.querySelector('#add');
var input = document.querySelector('#new')
inflate(bg.availables);

function inflate(availables) {

  list.innerHTML = "";

  for (var k in availables) {
    var item = document.createElement('div');
    var p = document.createElement('p');
    var del = document.createElement('button');

    p.textContent = decodeURIComponent(escape(window.atob(k))) + ": " + availables[k];
    del.textContent = '-';
    del.addEventListener('click', function(e) {
      bg.removegame(k);
      this.parentNode.style.display = 'none';
    });
    item.appendChild(p);
    item.appendChild(del);

    list.appendChild(item);
  }
}

add.addEventListener('click', function(e) {
  var name = input.value;
  if (name.length === 0) return;
  bg.addgame(name);
  input.value = "";
  window.close();
});