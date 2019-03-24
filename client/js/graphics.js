var c = document.getElementById("canvas");
var width = 400;
var height = 400;
c.setAttribute('width', width);
c.setAttribute('height', height);
var ctx = c.getContext("2d");

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function circle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

function fill(color){
  ctx.fillStyle = "" + color;
  ctx.fill();
}

function stroke(color){
  ctx.strokeStyle = "" + color;
  ctx.fill();
}

function noStroke(){
  strokeWeight(0);
}

function strokeWeight(weight){
  ctx.lineWidth = weight;
}

function clearCanvas() {
  ctx.clearRect(0, 0, width, height);
}
