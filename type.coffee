type = () -> 
   console.log('hi')
   _defaultArticle = 
          'A fool thinks himself to be wise, ' +
          'but a wise man knows himself to be a fool.'
   
   Color = {
      red: '#FF0000',
      green: '#00FF00',
      blue: '#0000FF',
      yellow: '#FFFF00',
      black: '#000000',
      white: '#FFFFFF',
      orange: 'FFBF00'
   }

   _article = ''

   _carriageReturnSymbol = '\u21A9'

   _lineHeight = 16
   _lineDistance = _lineHeight * 0.5
   _cursorHeightFactor = 1.3

   _width = 640
   _height = 320

   _beginning = 0

   _padding = {
      north: 24,
      west: 4,
      east: 4,
      south: 24
   }
   _done = false
   _targetWPM = 70
   _wordLength = 5
   _targetCPM = _targetWPM * _wordLength
   _words = []
   _wordIndex = 0
   _charIndex = 0
   _last = 0
   _start = 0
   _canvas = null
   _context = null
   _charWidth = 0

   init = (article) ->
      _done = false
      _article = article
      _words = parse(article)
      _wordIndex = 0
      _charIndex = 0
      _last = new Date
      _start = null

      _canvas = document.getElementById('typingCanvas')
      _context = _canvas.getContext('2d')
      _canvas.width = _width
      _canvas.height = _height
      adjustForRetina(_canvas, _context, _width, _height)

      _context.font = '20px monospace'
      metrics = _context.measureText('_')
      _charWidth = metrics.width

      _context.clearRect(0, 0, _width, _height)
      render(0)

   getLineCount = () -> #FIXME: duplicates
      line = 0
      cx = padding.west
      cy = 0

      for w in words
         wordWidth = charWidth * w.length
         renderWord(w)

      renderWord = (w) ->
         #[ whitespaces should not start a new line

         if((!w.join('').match(/\s/)) && 
               (cx + wordWidth > width - padding.east))  
            newLine()
         cy = padding.north + (lineHeight+lineDistance) * line

         for cc in w
            if(cc.value == '\n') 
               newLine()
            else
               cx += charWidth
      newLine = () ->
         cx = padding.west
         line++
      return line

   render = () ->
      # context.clearRect(0, 0, width, height)
      line = 0
      cx = _padding.west
      cy = 0
      newLine = () -> 
         cx = _padding.west
         line++
      
      drawCross = (x, y, w, h) ->
         context.moveTo(x, cy-h)
         context.lineTo(x+w, cy)
         context.moveTo(x+w, cy-h)
         context.lineTo(cx, cy)
         context.stroke()

      renderWord = (w) ->
         #[ whitespaces should not start a new line
         if((!w.join('').match(/\s/)) && 
               (cx + wordWidth > _width - _padding.east)) 
            newLine()
         
         cy = _padding.north + (_lineHeight+_lineDistance) * line

         drawCursor = (color) ->
            _context.beginPath()
            _context.fillStyle = color
            _context.rect(cx, cy-_lineHeight, 
                  _charWidth, Math.round(_lineHeight*_cursorHeightFactor))
            _context.fill()
            _context.closePath()

         fromTimeToColor = (timeSpent) -> 
            if (timeSpent > timeLimit)
               return Color.orange
            else
               return Color.black

         timeLimit = w.length * (60 * 1000) / _targetCPM
         wordColor = fromTimeToColor(w.timeSpent)

         for j in [0..w.length-1]
            cc = w[j]
            # console.log w[j]
            isCursor = false
            _context.clearRect(cx, cy-_lineHeight, 
                  _charWidth, Math.round(_lineHeight*_cursorHeightFactor))
            if i is _wordIndex and j is _charIndex
               isCursor = true
               drawCursor(Color.black)
               _context.fillStyle = Color.white
            else 
               if(cc.typed) 
                  if(cc.typed is cc.value) 
                     _context.fillStyle = wordColor
                  else
                     _context.fillStyle = Color.red
               else 
                  _context.fillStyle = '#999999'
            if(cc.value == '\n') 
               _context.fillText(_carriageReturnSymbol, cx, cy)
               newLine()
            else 
               if cc.typed and (cc.typed isnt cc.value)
                  _context.fillStyle = Color.red
                  if cc.typed is ' ' 
                     drawCursor(Color.red)
                  else 
                     _context.fillText(cc.typed, cx, cy)
               else 
                  _context.fillText(cc.value, cx, cy)
               cx += _charWidth
            # console.log(cc.value+' - '+cc['typed'])
         
      # (console.log c for c in w) for w in _words
      for i in [0.._words.length-1]
         w = _words[i]
         console.log w.join('') if w
         wordWidth = _charWidth * w.length
         renderWord (w)



   parse = (article) ->
      words = []
      State = {
         WHITESPACE:0, 
         CHAR:1
      }
      state = State.WHITESPACE
      chars = []
      flush = () ->
         if chars.length > 0 
            w = []
            for c in chars
               w.push {
                  value: c,
                  typed: undefined,
                  toString: () -> return this.value 
               }
            
            w.timeSpent = 0
            w.getDesiredTime = () -> this.length * (60 * 1000) / _targetCPM
            w.isCorrect = () ->
               for ci in [0..this.length-1]
                  if (!this[ci].typed) then return false
                  if (this[ci].typed isnt this[ci].value) then return false
                  else return true
            words.push(w)
            chars.length = 0


      filter = (c) ->
         if c == "’" then "'" 
         else if c == '\t' then '    ' 
         else return c

      for i in [0..article.length-1]
         c = article.charAt(i)
         c = filter(c)
         if(state == State.CHAR) 
            if(c.match(/\s/)) 
               flush()
               chars.push(c)
               state = State.WHITESPACE
            else 
               chars.push(c)
         else if(state == State.WHITESPACE) 
            flush()
            chars.push(c)
            if(!c.match(/\s/)) 
               state = State.CHAR
      if(chars.length > 0) 
         flush()
      # (console.log c for c in w) for w in words
      return words

   # [ from https://gist.github.com/joubertnel/870190
   adjustForRetina = (canvas, context, width, height) ->
      if window.devicePixelRatio 
         # alert(window.devicePixelRatio)
         canvas.width = width * window.devicePixelRatio
         canvas.height = height * window.devicePixelRatio
         canvas.style.width = width+'px'
         canvas.style.height = height+'px'
         context.scale(window.devicePixelRatio, window.devicePixelRatio)

   wordCount = (str) -> str.split(/\s/).length

   charCount = (str) ->
      words = str.split(/\s/)
      count = 0
      for w in words
         count += w.length
      return count

   fromKeycode = (code) ->
      if code is 13  #enter
         return '\n'
      else 
         return String.fromCharCode(code)
   

   handleKey = (e) ->
      if(!_done) 
         if(e.keyCode is 8) #backspace
            console.log(e.keyCode)
            if(_charIndex > 0)
               _charIndex--
            else 
               if(_wordIndex > 0) 
                  _wordIndex--
                  _charIndex = _words[_wordIndex].length - 1
            _words[_wordIndex][_charIndex].typed = ''
            render()
            e.preventDefault()

   handleCharacter = (e) ->
      now = new Date()

      if(!_beginning) 
         _beginning = now
      # console.log(String.fromCharCode(e.keyCode))
      currentWord = _words[_wordIndex]
      currentChar = currentWord[_charIndex]
      # console.log(e.keyCode)
      input = fromKeycode(e.keyCode)
      # console.log('got ''+input+'' - ''+currentChar+''')

      if(!_done) 
         if(!_start) 
            _start = now
         currentChar.typed = input
         if(_charIndex < currentWord.length - 1) 
            _charIndex++
         else 
            # finished a word
            elapsed = now - _start
            _words[_wordIndex].timeSpent = elapsed
            _start = now

            if(_wordIndex < _words.length - 1) 
               _wordIndex++
               _charIndex = 0
            else
               # done
               showStatistics(new Date() - _beginning)
               _done = true
      # console.log(wordIndex + ' - '+charIndex)
      
      render()
      e.preventDefault()

   showStatistics = (total) ->
      wc = wordCount(_article)
      cc = charCount(_article)
      wordsCopy = _words.slice(0)
      wordsCopy.sort((a, b) -> 
         at = a.length * (60 * 1000) / _targetCPM
         bt = b.length * (60 * 1000) / _targetCPM
         return b.timeSpent/bt - a.timeSpent/at
      )
      hotspots = wordsCopy.slice(0, Math.min(_words.length, 10))
      console.log(join(_words, '  ', 
            (a) -> return "'"+a.join('') +
            "' - "+ formatFloat(a.timeSpent / a.getDesiredTime(), 2)
            ))
      # console.log(total)
      total = total / 1000
      alert('Typed {0} words in {1} seconds. {2} WPM. {3} CPM. Hotspots: {4}'.
            format(wc, 
               formatFloat(total, 2), 
               formatFloat(wc / total * 60, 2),
               formatFloat(cc / total * 60, 2),
               join(hotspots, '\n', 
                  (a) -> "'"+a.join('') + "' - " + formatFloat(a.timeSpent / a.getDesiredTime() * 100, 2) + '%'
      )))

   join = (arr, sep, f) ->
      res = ''
      if arr.length <= 0 then return res
      res += sep
      if arr.length == 1 then return res
      for i in [0..arr.length-1]
         res += sep
         res += f(arr[i])
      return res

   formatFloat = (f, digits) ->
      m = Math.pow(10, digits)
      return Math.round(f*m)/m 

   #[ from http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
   String.prototype.format = String.prototype.f = () ->
      s = this
      i = arguments.length

      for i in [arguments.length-1..0]
         s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i])
      return s

   document.body.onpaste = (e) ->
      # alert(e.clipboardData.getData('Text'))
      init(e.clipboardData.getData('Text'))
      e.preventDefault()

   window.addEventListener('keydown', handleKey, false)
   window.addEventListener('keypress', handleCharacter, false)

   init(_defaultArticle)

type()
