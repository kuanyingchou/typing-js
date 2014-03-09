var article = "Leadership is solving problems. The day soldiers stop bringing you their problems is the day you have stopped leading them. They have either lost confidence that you can help or concluded you do not care. Either case is a failure of leadership.\n\nI don't believe you have to be better than everybody else. I believe you have to be better than you ever thought you could be."
//var article = "Leadership is solving problems."

var carriageReturnSymbol = "\u21A9";
var lineHeight = 16;
var lineDistance = lineHeight * .5;
var cursorHeightFactor = 1.3;
var width = 640;
var height = 320;

var padding = {
    north: 24,
    west: 4,
    east: 4,
    south: 24
}
var done = false;
var Color = {
    red: "#FF0000",
    green: "#00FF00",
    blue: "#0000FF",
    yellow: "#FFFF00",
    black: "#000000",
    white: "#FFFFFF",
    orange: "FFBF00"
};
var targetWPM = 70;
var wordLength = 5;
var targetCPM = targetWPM * wordLength;

function init(article) {
    window.words = parse(article);
    window.wordIndex = 0;
    window.charIndex = 0;
    window.current;
    window.last = new Date;
    window.start = null;
    window.words[wordIndex].active = true;

    window.canvas = document.getElementById("typingCanvas");
    window.context = canvas.getContext("2d");
    canvas.width = window.width;
    canvas.height = window.height;
    adjustForRetina(canvas, context, width, height);

    window.context.font = "20px monospace";
    window.metrics = context.measureText('_');
    window.charWidth = metrics.width;

/*
    var lineCount = getLineCount();
    canvas.height = padding.north + 
            (lineCount - 1) * lineDistance + 
            lineCount * lineHeight + 
            padding.south;
    window.height = canvas.height;
    //context.scale(.5, .5);
    adjustForRetina(canvas, context, width, height);
*/
    
    context.clearRect(0, 0, width, height);
    render(0);
}

//function init() {
//    var bufferCanvas = document.createElement('canvas');
//    bufferCanvas.width = width;
//    bufferCanvas.height = height;
//    var bufferContext = bufferCanvas.getContext("2d");
//    var width = bufferCanvas.width;
//    var height = bufferCanvas.height;
//    adjustForRetina(bufferCanvas, context, width, height);
//}
function getLineCount() { //>>> duplicates
    var line = 0;
    var cx = padding.west
    var cy;
    for(var i = 0; i<words.length; i++) {
        var w = words[i];
        var wordWidth = charWidth * w.length;
        renderWord(w);

    }
    function renderWord(w) {
        //[ whitespaces should not start a new line
        if((!w.join("").match(/\s/)) && 
                (cx + wordWidth > width - padding.east)) { 
            newLine();
        }
        cy = padding.north + (lineHeight+lineDistance) * line;

        for(var j = 0; j<w.length; j++) {
            var cc = w[j];
            if(cc.value == "\n") {
                newLine();
            } else {
                cx += charWidth;
            }
        }
    }
    function newLine() {
        cx = padding.west;
        line++;
    }
    return line;
}

function render() {
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

        var timeLimit = w.length * (60 * 1000) / targetCPM;
        for(var j = 0; j<w.length; j++) {
            var cc = w[j];
            context.clearRect(cx, cy-lineHeight, 
                    charWidth, Math.round(lineHeight*cursorHeightFactor));
            if(cc.typed) {
                setColor(w.timeSpent);
            } else {
                if(w.active && j == charIndex) {
                    drawCursor();
                    context.fillStyle = Color.white;
                } else {
                    context.fillStyle = "#999999";
                }
            }
            if(cc.value == "\n") {
                context.fillText(carriageReturnSymbol, cx, cy);
                newLine();
            } else {
                context.fillText(cc.value, cx, cy);
                cx += charWidth;
            }
            //console.log(cc.value+" - "+cc["typed"]);
        }
        function drawCursor() {
            context.beginPath();
            context.fillStyle = Color.black;
            context.rect(cx, cy-lineHeight, 
                    charWidth, Math.round(lineHeight*cursorHeightFactor));
            context.fill();
            context.closePath();
        }
        function setColor(timeSpent) {
            if (timeSpent > timeLimit) { 
                context.fillStyle = Color.orange;
            } else {
                context.fillStyle = Color.black;
            }

            /*
            if(timeSpent >  timeLimit * 1.5) {
                context.fillStyle = Color.red;
            } else if (timeSpent > timeLimit) { 
                context.fillStyle = Color.orange;
            } else if (timeSpent <= timeLimit * .8 &&
                    timeSpent > 0) { 
                context.fillStyle = Color.green;
            } else {
                context.fillStyle = Color.black;
            }
            */
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

function parse(article) {
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
            word["timeSpent"] = 0;
            words.push(word);
            chars.length = 0;
        }
    }

}


//[ from https://gist.github.com/joubertnel/870190
function adjustForRetina(canvas, context, width, height) {
    if (window.devicePixelRatio) {
        //alert(window.devicePixelRatio);
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = width+"px";
        canvas.style.height = height+"px";
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
}
function wordCount(string) {
    return string.split(/\s/).length;
}

function handleKey(e) {
    if(!start) {
        start = new Date();
    }
    //alert(String.fromCharCode(e.keyCode));
    var currentWord = words[wordIndex];
    var currentChar = currentWord[charIndex];
    //console.log(e.keyCode);
    var input;
    if(e.keyCode == 13) { //enter
        input = "\n";
    } else {
        input = String.fromCharCode(e.keyCode);
    }
    //console.log("got '"+input+"' - '"+currentChar+"'");
    if(currentChar == input) {
        currentWord[charIndex].typed = true
        if(charIndex < currentWord.length - 1) {
            charIndex++;
        } else {
            //finished a word
            var now = new Date();
            var elapsed = now-start;
            words[wordIndex].timeSpent = elapsed;
            start = now;

            words[wordIndex].active = false;
            if(wordIndex < words.length - 1) {
                wordIndex++;
                charIndex = 0;
                words[wordIndex].active = true;
            } else{
                //done
                //alert("typped "+wordCount(article)+" words in "+elapsed/1000+"s!");
                done = true;
            }
        }
    }
    //console.log(wordIndex + " - "+charIndex);
    
    render();
}

document.body.onpaste = function(e) {
    //alert(e.clipboardData.getData("Text"));
    init(e.clipboardData.getData("Text"));
    e.preventDefault();
}

window.addEventListener('keypress', handleKey, false);

init(article);
