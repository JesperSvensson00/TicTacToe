//## MAIN ##//
var turnDisplay = document.getElementById("turn");
var onlineList = document.getElementById("onlineList");

canvas.addEventListener("mousedown", mouseClicked, false);

drawGrid();

//Setups the connectionhandler
var socket = io();
console.log("Connected!");

//Updates onlinelist
socket.on("info", function (data) {
  onlineListUpdate(data);
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
  printMessage("chatBox", "err", data);
});

//Handles regular messages
socket.on("msg", function (data) {
  printMessage("chatBox", "reg", data);
});

//Handles restart event
socket.on("restart", function () {
  clearCanvas();
  drawGrid();
});
