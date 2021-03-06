function cellClick(x, y) {
  socket.emit("move", {
    x: x,
    y: y
  });
}

function sendMsg() {
  let msg = document.getElementById("chatInput").value;
  document.getElementById("chatInput").value = "";
  socket.emit("msg", msg);
}

function login() {
  let name = document.getElementById("nameInput").value;
  socket.emit("login", name);
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("game").style.display = "block";
  
  document.title = "TicTacToe - " + name;
  console.log("Logged in with name " + name);
}

function keyPressed(event) {
  if (event.keyCode == 13) { //Enter
    let element = document.activeElement;
    if (element.id == "nameInput") {
      login();
    } else if (element.id == "chatInput") {
      sendMsg();
    }
  }
}

function mouseClicked(event) {
  let cellX = Math.floor(event.offsetX / (width / 3));
  let cellY = Math.floor(event.offsetY / (height / 3));

  cellClick(cellX, cellY);
}

function drawGrid() {
  //Draws the grid
  strokeWeight(2);
  stroke("rgb(75, 58, 50)");
  //Verticall
  line(width / 3, 0, width / 3, height);
  line(2 * width / 3, 0, 2 * width / 3, height);
  //Horizontal
  line(0, height / 3, width, height / 3);
  line(0, 2 * height / 3, width, 2 * height / 3);
}

function onlineListUpdate(data) {
  onlineList.innerHTML = "";
  let title = document.createElement("p");
  title.innerHTML = "Online:";
  title.setAttribute("id", "onlineTitle");
  onlineList.appendChild(title);

  for (var i = 0; i < data.length; i++) {
    let playerName = document.createElement("p");
    playerName.innerHTML = data[i].name;
    playerName.setAttribute("id", "playerName");
    if (data[i].color == "blue") {
      playerName.style.color = "#3498db";
    } else if (data[i].color == "red") {
      playerName.style.color = "#e74c3c";
    } else {
      playerName.style.color = "black";
    }
    onlineList.appendChild(playerName);
  }
}

function printMessage(element_, id, txt){
  let element = document.getElementById(element_);

  let msg = document.createElement("p");
  msg.setAttribute("id", id);
  msg.innerHTML = txt;

  element.appendChild(msg);
}
