var typing = (function() {
   'use strict';

   var _defaultArticle = 
      'A fool thinks himself to be wise, ' +
      'but a wise man knows himself to be a fool.';
   
   var Color = {
      red: '#FF0000',
      green: '#00FF00',
      blue: '#0000FF',
      yellow: '#FFFF00',
      black: '#000000',
      white: '#FFFFFF',
      orange: 'FFBF00'
   };

   var _article = '';

   var _carriageReturnSymbol = '\u21A9';

   var _lineHeight = 16,
       _lineDistance = _lineHeight * 0.5;
   var _cursorHeightFactor = 1.3;

   var _width = 640,
       _height = 320;

   var _beginning;

   var _padding = {
      north: 24,
      west: 4,
      east: 4,
      south: 24
   };
   var _done = false;
   var _targetWPM = 70,
       _wordLength = 5,
       _targetCPM = _targetWPM * _wordLength;
   var _words = [],
       _wordIndex,
       _charIndex;
   var _last;
   var _start;
   var _canvas, 
       _context;
   var _charWidth;

   function init(article) {
      _done = false;
      _article = article;
      _words = parse(article);
      _wordIndex = 0;
      _charIndex = 0;
      _last = new Date;
      _start = null;

      _canvas = document.getElementById('typingCanvas');
      _context = _canvas.getContext('2d');
      _canvas.width = _width;
      _canvas.height = _height;
      adjustForRetina(_canvas, _context, _width, _height);

      _context.font = '20px monospace';
      var metrics = _context.measureText('_');
      _charWidth = metrics.width;

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
      
      _context.clearRect(0, 0, _width, _height);
      render(0);
   }

   function getLineCount() { //FIXME: duplicates
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
         if((!w.join('').match(/\s/)) && 
               (cx + wordWidth > width - padding.east)) { 
            newLine();
         }
         cy = padding.north + (lineHeight+lineDistance) * line;

         for(var j = 0; j<w.length; j++) {
            var cc = w[j];
            if(cc.value == '\n') {
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
      var cx = _padding.west
      var cy;
      for(var i = 0; i<_words.length; i++) {
         var w = _words[i];
         var wordWidth = _charWidth * w.length;
         renderWord(w);

      }

      function renderWord(w) {
         //[ whitespaces should not start a new line
         if((!w.join('').match(/\s/)) && 
               (cx + wordWidth > _width - _padding.east)) { 
            newLine();
         }
         cy = _padding.north + (_lineHeight+_lineDistance) * line;

         var timeLimit = w.length * (60 * 1000) / _targetCPM;
         var wordColor = fromTimeToColor(w.timeSpent);

         for(var j = 0; j<w.length; j++) {
            var cc = w[j];
            var isCursor = false;
            _context.clearRect(cx, cy-_lineHeight, 
                  _charWidth, Math.round(_lineHeight*_cursorHeightFactor));
            if(i === _wordIndex && j === _charIndex) {
               isCursor = true;
               drawCursor(Color.black);
               _context.fillStyle = Color.white;
            } else {
               if(cc.typed) {
                  if(cc.typed == cc.value) {
                     _context.fillStyle = wordColor;
                  } else {
                     _context.fillStyle = Color.red;;
                  }
               } else {
                  _context.fillStyle = '#999999';
               }
            }
            if(cc.value == '\n') {
               _context.fillText(_carriageReturnSymbol, cx, cy);
               newLine();
            } else {
               if(cc.typed && cc.typed !== cc.value) {
                  _context.fillStyle = Color.red;
                  if(cc.typed === ' ') {
                     drawCursor(Color.red);
                  } else {
                     _context.fillText(cc.typed, cx, cy);
                  }
               } else {
                  _context.fillText(cc.value, cx, cy);
               }
               cx += _charWidth;
            }
            //console.log(cc.value+' - '+cc['typed']);
         }
         function drawCursor(color) {
            _context.beginPath();
            _context.fillStyle = color;
            _context.rect(cx, cy-_lineHeight, 
                  _charWidth, Math.round(_lineHeight*_cursorHeightFactor));
            _context.fill();
            _context.closePath();
         }
         function fromTimeToColor(timeSpent) {
            if (timeSpent > timeLimit) { 
               return Color.orange;
            } else {
               return Color.black;
            }
         }
      }

      function newLine() {
         cx = _padding.west;
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
         c = filter(c);
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

      function filter(c) {
         if(c == "’") { return "'"; }
         if(c == '  ') { return '  '; }
         else return c;
      }

      function flush() {
         if(chars.length > 0) {
            var w = [];
            for(var i = 0; i<chars.length; i++) {
               w[i] = {
                  value: chars[i],
                  typed: false,
                  toString: function() { return this.value; }
               };
            }
            w.timeSpent = 0;
            w.getDesiredTime = function() {
               return this.length * (60 * 1000) / _targetCPM;
            };
            w.isCorrect = function () {
               for(var ci = 0; ci < this.length; ci++) {
                  if(!this[ci].typed) return false;
                  if(this[ci].typed !== this[ci].value) return false;
                  else return true;
               }
            };
            words.push(w);
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
         canvas.style.width = width+'px';
         canvas.style.height = height+'px';
         context.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
   }
   function wordCount(string) {
      return string.split(/\s/).length;
   }

   function charCount(string) {
      var words = string.split(/\s/);
      var count = 0;
      for(var i = 0; i<words.length; i++) {
         count += words[i].length;
      }
      return count;
   }

   function fromKeycode(code) {
      if(code == 13) { //enter
         return '\n';
      } else {
         return String.fromCharCode(code);
      }
   }

   function handleKey(e) {
      if(!_done) {
         if(e.keyCode === 8) { //backspace
            console.log(e.keyCode);
            if(_charIndex > 0) {
               _charIndex--;
            } else {
               if(_wordIndex > 0) {
                  _wordIndex--;
                  _charIndex = _words[_wordIndex].length - 1;
               }
            }
            _words[_wordIndex][_charIndex].typed = '';
            render();
            e.preventDefault();
         }
      }
   }

   function handleCharacter(e) {
      var now = new Date();

      if(!_beginning) {
         _beginning = now;
      }
      //console.log(String.fromCharCode(e.keyCode));
      var currentWord = _words[_wordIndex];
      var currentChar = currentWord[_charIndex];
      //console.log(e.keyCode);
      var input = fromKeycode(e.keyCode);
      //console.log('got ''+input+'' - ''+currentChar+''');

      if(!_done) {
         if(!_start) {
            _start = now;
         }
         currentChar.typed = input;
         if(_charIndex < currentWord.length - 1) {
            _charIndex++;
         } else {
            //finished a word
            var elapsed = now - _start;
            _words[_wordIndex].timeSpent = elapsed;
            _start = now;

            if(_wordIndex < _words.length - 1) {
               _wordIndex++;
               _charIndex = 0;
            } else{
               //done
               showStatistics(new Date() - _beginning);
               _done = true;
            }
         }
      }
      //console.log(wordIndex + ' - '+charIndex);
      
      render();
      e.preventDefault();
   }

   function showStatistics(total) {
      var wc = wordCount(_article);
      var cc = charCount(_article);
      /*
      var total = 0;
      for(var i = 0; i<words.length; i++) {
         total += words[i].timeSpent;
      }
      */
      var wordsCopy = _words.slice(0);
      wordsCopy.sort(function(a, b) { 
         var at = a.length * (60 * 1000) / _targetCPM;
         var bt = b.length * (60 * 1000) / _targetCPM;
         return b.timeSpent/bt - a.timeSpent/at;
      });
      var hotspots = wordsCopy.slice(0, Math.min(_words.length, 10));
      console.log(join(_words, '  ', 
            function(a) { return "'"+a.join('') +
            "' - "+ formatFloat(a.timeSpent / a.getDesiredTime(), 2)
            }));
      //console.log(total);
      total = total / 1000;
      alert('Typed {0} words in {1} seconds. {2} WPM. {3} CPM. Hotspots: {4}'.format(
            wc, 
            formatFloat(total, 2), 
            formatFloat(wc / total * 60, 2),
            formatFloat(cc / total * 60, 2),
            join(hotspots, '\n', function(a) { return "'"+a.join('') +
                  "' - "+ formatFloat(a.timeSpent / a.getDesiredTime() * 100, 2) + '%'; })
            ));
   }

   function join(arr, sep, f) {
      var res = '';
      if(arr.length <= 0) return res;
      res += sep;
      if(arr.length == 1) return res;
      for(var i = 1; i<arr.length; i++) {
         res += sep;
         res += f(arr[i]);
      }
      return res;
   }

   function formatFloat(f, digits) {
      var m = Math.pow(10, digits);
      return Math.round(f*m)/m; 
   }

   //[ from http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
   String.prototype.format = String.prototype.f = function() {
      var s = this,
         i = arguments.length;

      while (i--) {
         s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
      }
      return s;
   };

   document.body.onpaste = function(e) {
      //alert(e.clipboardData.getData('Text'));
      init(e.clipboardData.getData('Text'));
      e.preventDefault();
   }

   window.addEventListener('keydown', handleKey, false);
   window.addEventListener('keypress', handleCharacter, false);

   init(_defaultArticle);

})();
