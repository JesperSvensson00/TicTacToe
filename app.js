var express = require("express");
var app = express();
var serv = require("http").Server(app);

var defaulUserNames = ["Ko", "Gris", "Katt", "Hund", "Häst", "Duva", "Varg", "Ren", "Groda", "Räv", "Utter", "Älg", "Järv", "Mus", "Björn", "Hjort", "Bäver", "Ekorre"];

console.log("#####" + defaulUserNames.length);

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
      socket.color = "red";
    }
  }
  console.log(PLAYER_LIST);
  console.log(PLAYER_LIST.length);
  //Prints to the console
  console.log("Player " + socket.id + " joined");

  //If some client disconnects
  socket.on("disconnect", function () {
    delete SOCKET_LIST[socket.id];
    let index = PLAYER_LIST.indexOf(socket.id);
    PLAYER_LIST.splice(index, 1);
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
      let index = Math.floor(Math.random()*18);
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
  //Checks if somwone has won
  console.log('\x1b[36m%s\x1b[0m', checkWon() + " has won!");
}

function checkWon() {
  //Checks if someone has won
  console.log(board);
  //Checks cols
  for (let i = 0; i < board.length; i++) {
    let colSame = true;
    for (let j = 0; j < board[i].length - 1; j++) {
      console.log(i + ", " + j);
      console.log('\x1b[36m%s\x1b[0m', board[i][0] + " & " + board[i][1] + " & " + board[i][2]);
      if (board[i][j] != board[i][j + 1 && board[i][j] != -1]) {
        colSame = false;
      }
    }
    if (colSame) {
      if (board[0][i] == 0) {
        return "blue | ";
      } else if (board[0][i] == 1) {
        return "red";
      }
    }
  }

  //Checks rows
  for (let i = 0; i < board[0].length; i++) {
    let rowSame = true;
    for (let j = 0; j < board.length - 1; j++) {
      if (board[j][i] != board[j + 1][i] && board[j][i] != -1) {
        rowSame = false;
      }
    }
    if (rowSame) {
      if (board[1][i] == 0) {
        return "blue - ";
      } else if (board[1][i] == 1) {
        return "red";
      }
    }
  }

  //Checks diagonal
  let diagSame = true;
  //Checks \
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i][i] != board[i + 1][i + 1] && board[i][i] != -1) {
      diagSame = false;
    }
  }

  if (diagSame) {
    if (board[1][1] == 0) { //Hard coded
      return "blue /";
    } else if (board[1][1] == 1) {
      return "red";
    }
  }

  //Checks / --- Hard coded
  if (board[2][0] == board[1][1] && board[1][1] == board[0][2]) {
    if (board[1][1] == 0) { //Hard coded
      return "blue /";
    } else if (board[1][1] == 1) {
      return "red";
    }
  }
  //  for (let i = 0; i < board.length - 1; i++) {
  //    if (board[(i - 2) * -1][i] != board[(i + 1 - 2) * -1][i + 1] && board[(i + 1 - 2) * -1][i] != -1) {
  //      diagSame = false;
  //    }
  //  }
  //  if (diagSame) {
  //    if (board[1][1] == 0) { //Hard coded
  //      return "blue -";
  //    } else if (board[1][1] == 1) {
  //      return "red";
  //    }
  //  }

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
