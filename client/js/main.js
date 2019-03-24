//## MAIN ##//
var turnDisplay = document.getElementById("turn");
var onlineList = document.getElementById("onlineList");

canvas.addEventListener("mousedown", mouseClicked, false);

//Draws the grid
strokeWeight(2);
stroke("rgb(75, 58, 50)");
//Verticall
line(width / 3, 0, width / 3, height);
line(2 * width / 3, 0, 2 * width / 3, height);
//Horizontal
line(0, height / 3, width, height / 3);
line(0, 2 * height / 3, width, 2 * height / 3);




//Setups the connectionhandler
var socket = io();
console.log("Connected!");

//Updates canvas
socket.on("info", function (data) {
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
});

//Gets the board updates
socket.on("update", function (data) {
  let turnTxt = "";
  if (data.blueTurn) {
    turnTxt = "Blue's";
  } else {
    turnTxt = "Red's";
  }
  turnTxt += " turn!";
  turnDisplay.innerHTML = turnTxt;

  //Drawing the circles and crosses
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let cell = data.board[i][j];
      let x = i * (width / 3) + width / 6;
      let y = j * (height / 3) + height / 6;
      let r = width / 9;
      if (cell == 0) {
        //Draws a circle
        strokeWeight(2);
        stroke("rgb(75, 58, 50)");
        fill("cornsilk");
        circle(x, y, r);
      } else if (cell == 1) {
        //Draws a cross
        strokeWeight(2);
        stroke("rgb(75, 58, 50)");
        line(x - r, y - r, x + r, y + r);
        line(x + r, y - r, x - r, y + r);
      }
    }
  }
});

//Handles error messages
socket.on("errorMsg", function (data) {
  let chatBox = document.getElementById("chatBox");

  let msg = document.createElement("p");
  msg.setAttribute("id", "err");
  msg.innerHTML = data;

  chatBox.appendChild(msg);
});

//Handles regular messages
socket.on("msg", function (data) {
  let chatBox = document.getElementById("chatBox");

  let msg = document.createElement("p");
  msg.setAttribute("id", "reg");
  msg.innerHTML = data;

  chatBox.appendChild(msg);
});

//Handles restart event
socket.on("restart", function () {
  clearCanvas();
  //Draws the grid
  strokeWeight(2);
  stroke("rgb(75, 58, 50)");
  //Verticall
  line(width / 3, 0, width / 3, height);
  line(2 * width / 3, 0, 2 * width / 3, height);
  //Horizontal
  line(0, height / 3, width, height / 3);
  line(0, 2 * height / 3, width, 2 * height / 3);
});

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
