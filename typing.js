var carriageReturnSymbol = "\u21A9";
var canvas = document.getElementById("typingCanvas");
var context = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

adjustForRetina(canvas, context, width, height);

var article = "Leadership is solving problems. The day soldiers stop bringing you their problems is the day you have stopped leading them. They have either lost confidence that you can help or concluded you do not care. Either case is a failure of leadership.\n\nI don't believe you have to be better than everybody else. I believe you have to be better than you ever thought you could be."

words = split(article);
//alert(words.join(" "));

var lineHeight = 16;
var heightFactor = 1.3;
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

function start() {
    var bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = width;
    bufferCanvas.height = height;
    var bufferContext = bufferCanvas.getContext("2d");
    var width = bufferCanvas.width;
    var height = bufferCanvas.height;
    adjustForRetina(bufferCanvas, context, width, height);

}

function render(delta) {
    //context.clearRect(0, 0, width, height);
    var line = 0;
    var cx = padding.west
    var cy;
    for(var i = 0; i<words.length; i++) {
        var w = words[i];
        var wordWidth = charWidth * w.length;
        //console.log(w.active?w.join(""):"");
        renderWord(w);

    }

    function renderWord(w) {
        //[ whitespaces should not start a new line
        if((!w.join("").match(/\s/)) && 
                (cx + wordWidth > width - padding.east)) { 
            newLine();
        }
        cy = padding.north + (lineHeight+lineDistance) * line;

/*
        if(w.active) {
            context.strokeStyle = "#FF0000";
            //context.moveTo(cx, cy);
            //context.lineTo(cx+wordWidth, cy);
            context.rect(cx, cy-lineHeight, wordWidth, lineHeight);
            context.stroke();
        } else {
            context.clearRect(cx, cy-lineHeight, wordWidth, lineHeight);
            //context.strokeStyle = "#CCCCCC";
            //context.rect(cx, cy-lineHeight, wordWidth, lineHeight);
            //context.stroke();
        }
*/

        for(var j = 0; j<w.length; j++) {
            var cc = w[j];
            context.clearRect(cx, cy-lineHeight, 
                    charWidth, Math.round(lineHeight*heightFactor));
            if(cc.typed) {
                context.fillStyle = "#000000";
            } else {
                if(w.active && j == charIndex) {
                    context.beginPath();
                    context.fillStyle = "#000000";
                    context.rect(cx, cy-lineHeight, 
                            charWidth, Math.round(lineHeight*heightFactor));
                    context.fill();
                    context.closePath();
                    context.fillStyle = "#FFFFFF";
                } else {
                    context.fillStyle = "#999999";
                }
            }
            if(cc.value == "\n") {
                context.fillText(carriageReturnSymbol, cx, cy);
                newLine();
            } else {
                context.beginPath();
                context.fillText(cc.value, cx, cy);
                context.closePath();
                cx += charWidth;
            }
            //console.log(cc.value+" - "+cc["typed"]);
        }
    }
    function newLine() {
        cx = padding.west;
        line++;
    }
    function drawCross(x, y, w, h) {
        context.moveTo(x, cy-h);
        context.lineTo(x+w, cy);
        context.moveTo(x+w, cy-h);
        context.lineTo(cx, cy);
        context.stroke();
    }

}

function split(article) {
    var words = [];
    var State = {
        WHITESPACE:0, 
        CHAR:1
    };
    var state = State.WHITESPACE;
    var chars = [];

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

    function flush() {
        if(chars.length > 0) {
            var word = [];
            for(var i = 0; i<chars.length; i++) {
                word[i] = {
                    value: chars[i],
                    typed: false,
                    toString: function() { return this.value; }
                };
            }
            word["active"] = false;
            words.push(word);
            chars.length = 0;
        }
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


function update(delta) {
    //console.log(delta);
}

render(0);
var wordIndex = 0;
var charIndex = 0;
var current;
var last = new Date;
words[wordIndex].active = true;

function handleKey(e) {
    //alert(String.fromCharCode(e.keyCode));
    var currentWord = words[wordIndex];
    var currentChar = currentWord[charIndex];
    console.log(e.keyCode);
    var char;
    if(e.keyCode == 13) { //enter
        char = "\n";
    } else {
        char = String.fromCharCode(e.keyCode);
    }
    //console.log("got '"+char+"' - '"+currentChar+"'");
    if(currentChar == char) {
        currentWord[charIndex].typed = true
        if(charIndex < currentWord.length - 1) {
            charIndex++;
        } else if(wordIndex < words.length - 1) {
            words[wordIndex].active = false;
            wordIndex++;
            charIndex = 0;
            words[wordIndex].active = true;
        } else{
            //done
        }
    }
    //console.log(wordIndex + " - "+charIndex);
    
    current = new Date;
    var delta = current - last;
    update(delta);
    render(delta);
    last = current;
}

window.addEventListener('keypress', handleKey, false);

