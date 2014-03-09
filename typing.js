var article = "There was a heck crazy zoo in keyboard events few years ago. Now we live in happy time. Most terrible bugs and inconsistencies are fixed in recent browsers. IE is also pleasant to deal with. There are just several tricks to use."
var canvas = document.getElementById("typingCanvas");
var context = canvas.getContext("2d");

//[ from https://gist.github.com/joubertnel/870190
if (window.devicePixelRatio) {
  //alert(window.devicePixelRatio);
  var width = canvas.width;
  var height = canvas.height;
  canvas.width *= window.devicePixelRatio;
  canvas.height *= window.devicePixelRatio;
  canvas.style.width = width+"px";
  canvas.style.height = height+"px";
  context.scale(window.devicePixelRatio, window.devicePixelRatio);         
}
var lineHeight = 16;
context.font = "20px monospace";
var metrics = context.measureText('_');

var shrink = 1;
var charWidth = metrics.width * shrink;
var lineDistance = lineHeight * .5;
var padding = {
  north: 24,
  west: 4,
  east: 4,
  south: 24
}
var line = 0;
var cx = padding.west
var cy;

context.fillStyle = "#000000";
for(var i = 0; i<article.length; i++) {
  if(cx + charWidth > width - padding.east) {
    cx = padding.west;
    line++;
  }
  cy = padding.north + (lineHeight+lineDistance) * line;
  context.fillText(article.charAt(i), cx, cy);
  context.rect(cx, cy-lineHeight, charWidth, lineHeight);
  context.stroke();
  cx += charWidth;
}
