var canvas = document.getElementById("typingCanvas");
var context = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

adjustForRetina(canvas, context, width, height);

var article = "Leadership is solving problems. The day soldiers stop bringing you their problems is the day you have stopped leading them. They have either lost confidence that you can help or concluded you do not care. Either case is a failure of leadership.\n\nI don't believe you have to be better than everybody else. I believe you have to be better than you ever thought you could be."

words = split(article);
//alert(words.join(" "));

function split(article) {
    var words = [];
    var State = {
        WHITESPACE:0, 
        CHAR:1
    };
    var state = State.WHITESPACE;
    var chars = [];

    function flush() {
        words.push(chars.join(""));
        chars.length = 0;
    }

    for(var i = 0; i < article.length; i++) {
        var c = article.charAt(i);
        if(state == State.CHAR) {
            if(c.match(/\s/)) {
                flush();
                chars.push(c);
                state = State.WHITESPACE;
            } else {
                chars.push(c);
            }
        } else if(state == State.WHITESPACE) {
            flush();
            chars.push(c);
            if(!c.match(/\s/)) {
                state = State.CHAR;
            }
        }
    }
    if(chars.length > 0) flush();
    return words;
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

function newLine() {
    cx = padding.west;
    line++;
}

for(var i = 0; i<words.length; i++) {
    var w = words[i];
    var wordWidth = charWidth * w.length;

    //[ whitespaces should not start a new line
    if((!w.match(/\s/)) && (cx + wordWidth > width - padding.east)) { 
        newLine();
    }
    cy = padding.north + (lineHeight+lineDistance) * line;
    context.strokeStyle = "#CCCCCC";
    context.rect(cx, cy-lineHeight, wordWidth, lineHeight);
    context.stroke();
    if(w == "\n") {
        context.fillText("\u21A9", cx, cy);
        /*
        context.moveTo(cx, cy-lineHeight);
        context.lineTo(cx+wordWidth, cy);
        context.moveTo(cx+wordWidth, cy-lineHeight);
        context.lineTo(cx, cy);
        context.stroke();
        */
        newLine();
    } else {
        context.fillText(words[i], cx, cy);
        cx += wordWidth;
    }
}

//[ from https://gist.github.com/joubertnel/870190
function adjustForRetina(canvas, context, width, height) {
    if (window.devicePixelRatio) {
        //alert(window.devicePixelRatio);
        canvas.width *= window.devicePixelRatio;
        canvas.height *= window.devicePixelRatio;
        canvas.style.width = width+"px";
        canvas.style.height = height+"px";
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
}
function wordCount(string) {
    return string.split(/\s/).length;
}
