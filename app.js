var express = require("express");
var app = express();
var serv = require("http").Server(app);

var defaulUserNames = ["Ko", "Gris", "Katt", "Hund", "Häst", "Duva", "Varg", "Ren", "Groda", "Räv", "Utter", "Älg", "Järv", "Mus", "Björn", "Hjort", "Bäver", "Ekorre"];

//Starts the server
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

serv.listen(2000);
console.log("Started server!");

//Connection list
var SOCKET_LIST = {};
var PLAYER_LIST = [];
var board = [];
for (let i = 0; i < 3; i++) {
  board[i] = [];
  for (let j = 0; j < 3; j++) {
    board[i][j] = -1;
  }
}

var blueTurn = true;

//Setups the connectionhandler
var io = require("socket.io")(serv, {});
//On connection
io.sockets.on("connection", function (socket) {
  console.log("Socket: Connection!");
  //Creates an unique(random) ID
  socket.id = Math.floor(Math.random() * 10000);
  socket.color = "none";
  socket.name = "";
  SOCKET_LIST[socket.id] = socket;
  if (PLAYER_LIST.length < 2) {
    PLAYER_LIST.push(socket.id);
    if (PLAYER_LIST.length == 1) {
      socket.color = "blue";
    } else if (PLAYER_LIST.length == 2) {
      if (SOCKET_LIST[PLAYER_LIST[0]].color == "blue") {
        socket.color = "red";
      } else {
        socket.color = "blue";
      }

    }
  }
  console.log(PLAYER_LIST);
  //Prints to the console
  console.log("Player " + socket.id + " joined");

  //If some client disconnects
  socket.on("disconnect", function () {
    delete SOCKET_LIST[socket.id];
    let index = PLAYER_LIST.indexOf(socket.id);
    PLAYER_LIST.splice(index, 1);
    moveClient();
    console.log("Player " + socket.id + " disconnected!");
  });

  //Recives the client moves
  socket.on("move", function (data) {
    onMove(socket, data);
  });

  //Recives message from client
  socket.on("msg", function (data) {
    if (data.substring(0, 1) != "/") {
      for (let i in SOCKET_LIST) {
        let socket2 = SOCKET_LIST[i];
        socket2.emit("msg", socket.name + ": " + data);
      }
      return;
    } else { //Command
      let index = data.indexOf(" ");
      if (index == -1) {
        index = data.length;
      }
      let command = data.substring(1, index);
      console.log(socket.id + ": " + command);
      if (command == "restart") {
        restart();
        return;
      }
    }
  });

  //Client loging
  socket.on("login", function (data) {
    if (data.length > 0) {
      socket.name = data;
    } else {
      let index = Math.floor(Math.random() * 18);
      socket.name = defaulUserNames[index];
    }
  });
});

//Loops every 40ms sends to clients
setInterval(function () {
  var pack = [];
  //Creates data and put into a package for every connection
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    pack.push({
      id: socket.id,
      name: socket.name,
      color: socket.color
    });
  }
  //Sends data to every connection
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    //Sends info
    socket.emit("info", pack);
    //Sends the playing board
    socket.emit("update", {
      blueTurn: blueTurn,
      board: board
    });
  }
}, 1000 / 25);

//Server loop
setInterval(function () {
  console.log(PLAYER_LIST)
  console.log("Length: " + PLAYER_LIST.length);
  console.log("Blue's turn: " + blueTurn);

}, 1000000);

function onMove(socket, data) {
  //Checks wich color the client has
  if(board[data.x][data.y] < 0){
    if (socket.color == "blue" && blueTurn) {
      
        board[data.x][data.y] = 0;
        blueTurn = !blueTurn;
    } else if (socket.color == "red" && !blueTurn) {
      board[data.x][data.y] = 1;
      blueTurn = !blueTurn;
    } else if (socket.color == "blue" && !blueTurn) {
      socket.emit("errorMsg", "It's not your turn!");
    } else if (socket.color == "red" && blueTurn) {
      socket.emit("errorMsg", "It's not your turn!");
    } else {
      //Send error message
      socket.emit("errorMsg", "You are not playing!");
    }
  } else {
    //Send error message
    socket.emit("errorMsg", "You can not select an already selected tile!");
  }
  //Checks if somwone has won
  if (checkWon() == "blue") {
    console.log("\x1b[34m", "Blue won!");
    socket.emit("gameOver", "blue");
    console.log("\x1b[0m", "");
    restart();
  } else if (checkWon() == "red") {
    console.log("\x1b[31m", "Red won!");
    socket.emit("gameOver", "red");
    console.log("\x1b[0m", "");
    restart();
  } else if (checkWon() == "gameOver") {
    console.log("\x1b[31m", "Game over!");
    socket.emit("gameOver", "none");
    console.log("\x1b[0m", "");
    restart();
  }
}

function checkWon() {
  //Checks if someone has won
  for (let i = 0; i < board.length; i++) {
    let colSame = true;
    let lastCell = board[i][0];
    for (let j = 1; j < board[i].length; j++) {
      if (lastCell != board[i][j]) {
        colSame = false;
      }
      lastCell == board[i][j];
    }
    if (colSame) {
      if (lastCell == 0) {
        return "blue";
      } else if (lastCell == 1) {
        return "red";
      }
    }
  }

  //Checks rows
  let Tboard = transformMatrix(board);
  for (let i = 0; i < Tboard.length; i++) {
    let colSame = true;
    let lastCell = Tboard[i][0];
    for (let j = 1; j < Tboard[i].length; j++) {
      if (lastCell != Tboard[i][j]) {
        colSame = false;
      }
      lastCell == Tboard[i][j];
    }
    if (colSame) {
      if (lastCell == 0) {
        return "blue";
      } else if (lastCell == 1) {
        return "red";
      }
    }
  }

  let diagSame = true;
  let lastCell = board[0][0];
  for (let i = 1; i < board.length; i++) {
    if (lastCell != board[i][i]) {
      diagSame = false;
    }
    lastCell == board[i][i];
  }
  if (diagSame) {
    if (lastCell == 0) {
      return "blue";
    } else if (lastCell == 1) {
      return "red";
    }
  }

  diagSame = true;
  lastCell = board[0][2];
  for (let i = 1; i < board.length; i++) {
    if (lastCell != board[i][2 - i]) {
      diagSame = false;
    }
    lastCell == board[i][2 - i];
  }
  if (diagSame) {
    if (lastCell == 0) {
      return "blue";
    } else if (lastCell == 1) {
      return "red";
    }
  }

  let gameOver = true;
  for (let i = 0; i < board.length; i++) {
    for (let j = 1; j < board[i].length; j++) {
      if (board[i][j] == -1) {
        gameOver = false;
      }
    }
  }
  if (gameOver) {
    return "gameOver";
  }

  //If noone has won
  return "none";
}

function restart() {
  //Resets the board
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[i][j] = -1;
    }
  }
  //Choose the who start
  if (Math.floor(Math.random() * 2) == 0) {
    blueTurn = true;
  } else {
    blueTurn = false;
  }
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit("restart");
  }
  console.log("Restarted");
}

function transformMatrix(TwoDArray) {
  let newMatrix = [];
  for (let i = 0; i < TwoDArray.length; i++) {
    newMatrix[i] = [];
    for (let j = 0; j < TwoDArray.length; j++) {
      newMatrix[i][j] = 0;
    }
  }
  for (let i = 0; i < TwoDArray.length; i++) {
    for (let j = 0; j < TwoDArray[0].length; j++) {
      newMatrix[i][j] = TwoDArray[j][i];
    }
  }
  return newMatrix;
}

function moveClient() {
  if (PLAYER_LIST.length < 2) {
    for (let i in SOCKET_LIST) {
      let socket = SOCKET_LIST[i];
      if (socket.id != PLAYER_LIST[0]) {
        PLAYER_LIST.push(socket.id);
        if (SOCKET_LIST[PLAYER_LIST[0]].color == "blue") {
          socket.color = "red";
        } else {
          socket.color = "blue";
        }
      }
    }
  }
}
