/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * IDEAS:
 *  - make the text box read-only while the simulation is playing
 *  - add break points
 *  - have the text box highlight the line that is currently being executed
 *
 * TODO: see if there is more sophisticated gutter mechanisms to
 * present comments and errors to the user
 * http://codemirror.net/doc/upgrade_v3.html#gutters
 *
 * TODO: listen for changes in the document and automatically update gutter
 * with comments and errors
 *
 * TODO: how to keep width of gutter constant?
 *
 * IDEA: breakpoints, see http://codemirror.net/demo/marker.html
 *
 * TODO: error text usually needs to be more verbose. Perhaps add a link to
 * a popup that explains the error and gives references.
 *
 * IDEA: put drop-down boxes in comment section so you can fit more text there
 *
 */

// lineComments is a map where line index points to comment for that line
function addLineComments(codeMirrorBox, lineComments) {
  codeMirrorBox.clearGutter("note-gutter")
  for (i in lineComments) {
      var comment = lineComments[i]
      codeMirrorBox
        .setGutterMarker(
          parseInt(i),
          "note-gutter",
          comment)
  }
}/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO: careful unit testing

Opcode = {
  MOVE: 0,
  TURN: 1,
  GOTO: 2
}

function RobocomInstruction(
    // value must be in the Opcode enum
    opcode,
    // data object, whose type is determined by opcode
    data,
    // from program text
    lineIndex
    ) {
  this.opcode = opcode
  this.data = data
  this.lineIndex = lineIndex
}

function RobocomProgram(
    // string
    programText,
    // array of instruction objects (or null if there was an error)
    instructions,
    // maps lineNumber to comment for that line
    lineComments) {
  this.programText = programText
  this.instructions = instructions
  this.lineComments = lineComments
}

function newErrorComment(text, uri) {
  var newlink = document.createElement('a')
  newlink.setAttribute('href', uri)
  newlink.setAttribute('class', "errorLink")
  newlink.appendChild(newComment(text))
  return newlink
}

// TODO: make all comments hyperlinks, though the non-errors should be styled
// as if they're not hyperlinks (until you hover)
function newComment(text) {
  return document.createTextNode(text)
}

function removeComment(tokens) {
  var commentToken = -1
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    var commentCharIndex = token.indexOf("//")
    if (commentCharIndex == 0) {
      // completely exclude this token
      return tokens.slice(0, i)
    } else if (commentCharIndex > 0) {
      // trim this token and exclude the rest
      tokens[i] = token.substr(0, commentCharIndex)
      return tokens.slice(0, i + 1)
    }
  }
  return tokens
}

// returns [tokens, label]
// if a label is removed from tokens, then label is a string
// otherwise it is null
function removeLabel(tokens) {
  if (tokens.length == 0) {
    return [tokens, null]
  } else {
    var head = tokens[0]
    var colonIndex = head.indexOf(":")
    if (colonIndex <= 0) {
      return [tokens, null]
    } else if (colonIndex == head.length - 1) {
      var label = head.substr(0, head.length - 1)
      var newTokens = tokens.slice(1, tokens.length)
      return [newTokens, label]
    } else {
      var label = head.substr(0, colonIndex)
      var newHead = head.substr(colonIndex + 1, head.length)
      // asert newHead.length > 0
      tokens[0] = newHead
      return [tokens, label]
    }
  }
}

function compileMove(tokens) {
  var instruction = null
  var comment = null
  var error = false

  // assert tokens[0] == "move"
  if (tokens.length == 1) {
    instruction = new RobocomInstruction(Opcode.MOVE, null)
    comment = newComment("Move forward one square")
  } else {
    instruction = null
    comment = newErrorComment("Malformed 'move' instruction", "#")
    error = true
  }

  return [instruction, comment, error]
}

function compileTurn(tokens) {
  var instruction = null
  var comment = null
  var error = false

  // assert tokens[0] == "move"
  if (tokens.length != 2) {
    instruction = null
    comment = newErrorComment("The 'turn' instruction is missing a direction", "#")
    error = true
  } else {
    var direction = tokens[1]
    if (direction == "left") {
      instruction = new RobocomInstruction(Opcode.TURN, Direction.LEFT)
      comment = newComment("Rotate counter-clockwise 90 degrees")
    } else if (direction == "right") {
      instruction = new RobocomInstruction(Opcode.TURN, Direction.RIGHT)
      comment = newComment("Rotate clockwise 90 degrees")
    } else {
      instruction = null
      comment = newErrorComment("'" + direction + "' is not a valid direction", "#")
      error = true
    }
  }

  return [instruction, comment, error]
}



// TODO: make sure the label is sane: i.e. not a reserved word and conforms
// to identifier regex
function compileGoto(tokens) {
  var instruction = null
  var comment = null
  var error = false

  // TODO: this error message doesn't make sense if length > 2
  if (tokens.length != 2) {
    instruction = null
    comment = newErrorComment("The 'goto' instruction is missing a label", "#")
    error = true
  } else {
    var label = tokens[1]
    if (!isValidLabel(label)) {
      instruction = null
      comment = newErrorComment("'" + label + "' is not a valid label", "#")
      error = true
    } else {
      instruction = new RobocomInstruction(Opcode.GOTO, label)
      // this comment is filled in on the second pass
      comment = null
      error = false
    }
  }
  return [instruction, comment, error]
}

function tokenize(line) {
  return line
    .replace(/\s+/g, " ")
    .replace(/(^\s+)|(\s+$)/g, "")
    .split(" ")
}

function isValidLabel(label) {
  return label.length > 0 &&
    label.length < 20 &&
    !(label in RESERVED_WORDS) &&
    IDENT_REGEX.test(label)
}

/**
 * Returns [instruction, comment, error, label], where:
 *  instruction is a RobocomInstruction and comment is a string
 *    instruction is set to null if there was an error compiling the
 *    instruction, or if the line is a no-op
 *  label is a string or null
 *  comment is a DOM node, or null
 *  error is true iff there was an error compiling this line
 */
function compileLine(line, lineIndex, labels) {
  
  tokens = tokenize(line)
  tokens = removeComment(tokens)
  tokensLabel = removeLabel(tokens)
  tokens = tokensLabel[0]
  label = tokensLabel[1]

  if (label != null) {
    if (!isValidLabel(label)) {
      var abbrevLabel = label.substr(0, 20)
      comment = newErrorComment("'" + label + "' is not a valid label", "#")
      return [null, comment, true, null]
    } else if (label in labels) {
      // TODO: get labels
      comment = newErrorComment("label '" + label + "' is already defined", "#")
      return [null, comment, true, null]
    }
  }

  if (tokens.length == 0 ||
      (tokens.length == 1 && tokens[0] == "")) {
    return [null, null, false, label]
  }

  var opcode = tokens[0]
  var result = undefined
  if (opcode == "move") {
    result = compileMove(tokens).concat([label])
  } else if (opcode == "turn") {
    result = compileTurn(tokens).concat([label])
  } else if (opcode == "goto") {
    result = compileGoto(tokens).concat([label])
  } else {
    comment = newErrorComment("'" + opcode + "' is not an instruction", "#")
    result = [null, comment, true, null]
  }
  var instruction = result[0]
  if (instruction != null) {
    instruction.lineIndex = lineIndex
  }
  return result

}

// Compiles a programText into a RobocomProgram object
function compileRobocom(programText) {
  var lines = programText.split("\n")
  var instructions = []
  var lineComments = {}

  // map from label-string to instruction pointer for that label
  var labels = {}

  // map from label-string to line number for that label
  var labelLineNumbers = {}

  var error = false

  // first pass: do everything except finalize GOTO statements
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var compiledLine = compileLine(line, i, labels)
    var instruction = compiledLine[0]
    var comment = compiledLine[1]
    var lineError = compiledLine[2]
    var label = compiledLine[3]

    if (label != null) {
      // TODO: make sure that GOTO pointing past last instruction works well
      labels[label] = instructions.length
      labelLineNumbers[label] = i + 1
    }

    if (instruction != null) {
      instruction.lineIndex = i
      instructions.push(instruction)
    }

    if (comment != null) {
      lineComments[i] = comment
    }

    error = error || lineError


  }

  // second pass: finalize GOTO statements
  for (var i = 0; i < instructions.length; i++) {
    var instruction = instructions[i]
    if (instruction.opcode == Opcode.GOTO) {
      var label = instruction.data
      if (label in labels) {
        // replace string label with numeric label
        instruction.data = labels[label]
        // TODO: better comment
        lineComments[instruction.lineIndex] =
          newComment("resume execution at line " + labelLineNumbers[label])
      } else {
        error = true
        lineComments[instruction.lineIndex] =
          newErrorComment("the label '" + label + "' does not exist", "#")
      }
    }
  }

  if (error) {
    return new RobocomProgram(programText, null, lineComments)
  } else {
    return new RobocomProgram(programText, instructions, lineComments)
  }
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// some functions useful for debugging

// add size functions to selections and transitions
d3.selection.prototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};

 d3.transition.prototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};

function assert(bool, message) {
  if (!bool) {
    alert(message)
  }
}

function assertLazy(func, message) {
  if (DEBUG) {
    assert(func(), message)
  }
}

// the index of the current test case
var TC_I = undefined
// the current test case
var TC = undefined
// the actual result of the tested function
var RESULT = undefined
// the filename of the current test
var TEST_FILENAME = undefined

function test(bool) {
  if (!bool) {
    alert("Failed test. See console logs for error messages.")
    console.error("Failed TC_I=" + TC_I +" in " + TEST_FILENAME)
    console.log("Test case:")
    console.dir(TC)
    console.log("Result:")
    console.dir(RESULT)
  }
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Direction = {
  NUM_DIRECTIONS: 4,
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
}

function rotateLeft(direction) {
  if (direction == Direction.LEFT) {
    return Direction.DOWN
  } else if (direction == Direction.DOWN) {
    return Direction.RIGHT
  } else if (direction == Direction.RIGHT) {
    return Direction.UP
  } else if (direction == Direction.UP) {
    return Direction.LEFT
  } else {
    // assert false
  }
}

function rotateRight(direction) {
  if (direction == Direction.LEFT) {
    return Direction.UP
  } else if (direction == Direction.UP) {
    return Direction.RIGHT
  } else if (direction == Direction.RIGHT) {
    return Direction.DOWN
  } else if (direction == Direction.DOWN) {
    return Direction.LEFT
  } else {
    // assert false
  }
}

function rotateDirection(oldFacing, rotateDirection) {
  if (rotateDirection == Direction.LEFT) {
    return rotateLeft(oldFacing)
  } else if (rotateDirection == Direction.RIGHT) {
    return rotateRight(oldFacing)
  } else {
    // assert false
  }
}

function oppositeDirection(direction) {
  return rotateLeft(rotateLeft(direction))
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO: this code is becoming a mess. Needs good refactoring.

// These event handlers are registered in main.js and in index.html
function windowOnLoad() {

  // Defines a syntax highlighter for the robocom language
  CodeMirror.defineMIME("text/x-robocom", {
    name: "clike",
    keywords: RESERVED_WORDS,
    blockKeywords: {},
    atoms: {},
    hooks: {
      "@": function(stream) {
        stream.eatWhile(/[\w\$_]/);
        return "meta";
      }
    }
  });

  pausePlay = document.getElementById("pauseplay")
  pausePlay.addEventListener("click", togglePausePlay);

  document
    .getElementById("stepButton")
    .addEventListener("click", stepButtonClick);

  document
    .getElementById("restart")
    .addEventListener("click", restartSimulation);

  var settings = {
    value: INITIAL_PROGRAM,
    gutters: ["note-gutter", "CodeMirror-linenumbers"],
    mode:  "text/x-robocom",
    theme: "solarized dark",
    smartIndent: false,
    lineNumbers: true,
  }

  CODE_MIRROR_BOX = CodeMirror(document.getElementById("codeMirrorEdit"),
    settings)

  //  TODO: put the cursorActivity function in seperate file
  var line = 0
  CODE_MIRROR_BOX.on("cursorActivity", function(cm) {
    var newLine = cm.getCursor().line
    if (PLAY_STATUS == PlayStatus.INITAL_STATE_PAUSED) {
      if (line != newLine) {
        compile()
      }
      line = newLine
    }
  })

  // You cannot edit the program, unless it is in the reset state
  CODE_MIRROR_BOX.on("beforeChange", function(cm, change) {
    if (PLAY_STATUS != PlayStatus.INITAL_STATE_PAUSED) {
      change.cancel()
    }
  })

  restartSimulation()

  // TODO: where should i put this?
  ANIMATE_INTERVAL = setInterval("animate()", CYCLE_DUR)
  nonBotAnimateInterval = setInterval("nonBotAnimate()", NON_BOT_CYCLE_DUR)
}

function setSpeed(speed) {
  var speedText = document.getElementById("speedText")

  ANIMATION_DUR = speed[0]
  CYCLE_DUR = speed[1]
  EASING = speed[3]
  speedText.innerHTML = speed[2]
  clearInterval(ANIMATE_INTERVAL)
  ANIMATE_INTERVAL = setInterval("animate()", CYCLE_DUR)
}

// TODO: consider graying out the play button when it's not possible to play it
// TODO: This doesn't work
function doPause() {
  PLAY_STATUS = PlayStatus.PAUSED
  pausePlay.innerHTML = 'Resume'
  d3.select("#pauseplay").attr("class", "btn")
  CODE_MIRROR_BOX.setOption("theme", DISABLED_CODE_THEME)
}

function doResume() {
  PLAY_STATUS = PlayStatus.PLAYING
  pausePlay.innerHTML = 'Pause'
  d3.select("#pauseplay").attr("class", "btn")
  d3.select("#messageBox").text("To edit your program, click 'Reset'")
  CODE_MIRROR_BOX.setOption("theme", DISABLED_CODE_THEME)

}

function doRun() {
  var program = compile()
  if (program.instructions != null) {
    doResume()
  }
}

function togglePausePlay() {
  // TODO: determine is this is threadsafe in JS
  if (PLAY_STATUS == PlayStatus.INITAL_STATE_PAUSED) {
    doRun()
  } else if (PLAY_STATUS == PlayStatus.PAUSED) {
    doResume()
  } else {
    doPause()
  }
}

function doFirstStep() {
  var program = compile()
  if (program.instructions != null) {
    doStep()
  }
}

function doStep() {
  PLAY_STATUS = PlayStatus.PAUSED
  pausePlay.innerHTML = 'Resume'
  d3.select("#pauseplay").attr("class", "btn")
  CODE_MIRROR_BOX.setOption("theme", DISABLED_CODE_THEME)
  d3.select("#messageBox").text("To edit your program, click 'Reset'")
  // TODO: clicking "Step" to fast will lead to bad animations
  // TODO: the highlighted instruction is the one that just executed
  // perhaps instead show the next instruction that will execute

  stepAndAnimate()
}

function stepButtonClick() {
  if (PLAY_STATUS == PlayStatus.INITAL_STATE_PAUSED) {
    doFirstStep()
  } else {
    doStep()
  }
}

// TODO: decouple compile from updating the GUI
function compile() {
  var programText = CODE_MIRROR_BOX.getValue()
  var program = compileRobocom(programText)
  addLineComments(CODE_MIRROR_BOX, program.lineComments)

  if (PLAY_STATUS == PlayStatus.INITAL_STATE_PAUSED) {
    if (program.instructions == null) {
      d3.select("#pauseplay").attr("class", "btn disabled")
      d3.select("#stepButton").attr("class", "btn disabled")
    } else {
      d3.select("#pauseplay").attr("class", "btn btn-primary")
      d3.select("#stepButton").attr("class", "btn")
      BOARD.bots = initBots(BOARD, program)
      drawBots()
    }
  } else {
    console.error("I don't expect compile to be called unless board is reset")
  }

  if (program.instructions == null){
    d3.select("#messageBox").text("ERROR: You must fix the errors  " +
      "before you can run your program.")
  } else {
    // TODO: put this comm functionality in function
    d3.select("#messageBox").text("Click the 'Run!' button to run your program")
  }

  return program
}

/**
 * - Pauses the simulation
 * - resets the board state
 * - compiles the program
 */
function restartSimulation() {
  PLAY_STATUS = PlayStatus.INITAL_STATE_PAUSED
  CODE_MIRROR_BOX.setOption("theme", NORMAL_CODE_THEME)

  pausePlay.innerHTML = 'Run!'
  d3.select("#messageBox").text("Click the 'Run!' button to run your program")

  cleanUpSimulation()
  cleanUpVisualization()

  BOARD.initCoins = [
      {x:0, y:1},
      {x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
      {x:4, y:1}
    ]

  // TODO: consider having each bot drop a marker where its head is

  BOARD.coins = _.clone(BOARD.initCoins)

  // matrix of markers on the board
  // matrix[x][y][quadrant][botColor] == strength (a float) or undefined
  BOARD.markers = newMatrix(
    BOARD.num_cols,
    BOARD.num_rows,
    function () {
      return newMatrix(
        Direction.NUM_DIRECTIONS,
        BotColor.NUM_COLORS, undefined)
    })

  drawInitMarkers(BOARD)

  BOARD.coinsCollected = 0
  drawCoins()

  var program = compile()
  if (program.instructions != null) {
    BOARD.bots = initBots(BOARD, program)
    drawBots()
  }

  BOARD.blocks = [
      {x:2, y:2},
      {x:2, y:3},
    ]
  drawBlocks()


}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var BotColor = {
  NUM_COLORS: 2,
  BLUE: 0,
  RED: 1
}

function Bot(x, y, facing, program, botColor) {

    this.cellX = x;
    this.cellY = y
    this.facing = facing;
    // an array of strings, each string is an "instruction"
    this.program = program;
    // instruction pointer points to the next instruction to be executed
    this.ip = 0;

    // the next animation to perform for this bot
    this.animations = {};

    // int from the BotColor enum
    this.botColor = botColor
}

function turnBot(bot, direction) {
  var oldFacing = bot.facing
  bot.facing = rotateDirection(bot.facing, direction)
  bot.animations.rotate = true
}

// TODO: handle case where goto goes past end of program
function executeGoto(bot, nextIp) {
  bot.ip = nextIp
  // animation?
}

// a bot tries to move into cell x,y.
// returns true if the bot is allowed to move in, false otherwise
// TODO: also check for bots
function tryMove(board, bot, x, y) {
  var matchingBlocks = _(board.blocks)
    .filter( function(block) {
      return block.x == x && block.y == y
    })
    .value()

  return matchingBlocks.length == 0
}

/**
 * executes the 'move' instruciton on the bot
 * updates the bot and board state
 * When a bot moves, it deposits two markers:
 *  - at the head in the old cell
 *  - at the tail in the new cell
 */
function moveBot(board, bot) {

  var prevX = bot.cellX
  var prevY = bot.cellY

  var dx = 0
  var dy = 0
  if (bot.facing == Direction.UP) {
    dy = -1
  } else if (bot.facing == Direction.DOWN) {
    dy = 1
  } else if (bot.facing == Direction.LEFT) {
    dx = -1
  } else if (bot.facing == Direction.RIGHT) {
    dx = 1
  } else {
    // assert(false)
  }

  xResult = wrapAdd(bot.cellX, dx, board.num_cols)
  yResult = wrapAdd(bot.cellY, dy, board.num_rows)
  destX = xResult[0]
  destY = yResult[0]
  xTorus = xResult[1]
  yTorus = yResult[1]

  if (!tryMove(board, bot, destX, destY)) {
    bot.animations.failMove = {
      destX: bot.cellX + dx,
      destY: bot.cellY + dy
    }
  } else {
    // TODO: break this function up into smaller functions
    
    bot.depositMarker.push({
      x: bot.cellX,
      y: bot.cellY,
      quadrant: bot.facing,
      botColor: bot.botColor
    })
    bot.cellX = destX
    bot.cellY = destY
    

    // did the bot pickup a coin?
    var matchingCoins = _(board.coins)
      .filter( function(coin) {
        return coin.x == bot.cellX && coin.y == bot.cellY
      })
      .value()

    assert(matchingCoins.length == 0 || matchingCoins.length == 1,
      "matchingCoins.length == 0 || matchingCoins.length == 1")

    if (matchingCoins.length == 1) {
      var matchingCoin = matchingCoins[0]

      // remove the coin from the board
      board.coins = _(board.coins)
        .filter( function(coin) {
          return !(coin.x == bot.cellX && coin.y == bot.cellY)
        })
        .value()

      board.coinsCollected += 1

      bot.animations.coin_collect = matchingCoin
    }

    if (xTorus != "torus" && yTorus != "torus") {
      bot.animations.nonTorusMove = true
    } else {
      bot.animations.torusMove = {
        prevX: prevX,
        prevY: prevY,
        oobPrevX: bot.cellX - dx,
        oobPrevY: bot.cellY - dy,
        oobNextX: prevX + dx, 
        oobNextY: prevY + dy
      }
    }

    bot.depositMarker.push({
      x: bot.cellX,
      y: bot.cellY,
      quadrant: oppositeDirection(bot.facing),
      botColor: bot.botColor
    })

  }
}

// assumes relatively sane values for increment
// returns [value, moveType]
// where moveType == "moveTorus" or "moveNonTorus"
function wrapAdd(value, increment, outOfBounds) {
  value += increment
  if (value >= outOfBounds) {
    return [value % outOfBounds, "torus"]
  } else if (value < 0) {
    return [outOfBounds + value, "torus"]
  } else {
    return [value, "nonTorus"]
  }
}

function decayMarker(strength) {
  strength = strength - 0.01
  if (strength <= MIN_MARKER_STRENGTH) {
    return MIN_MARKER_STRENGTH
  } else {
    return strength
  }
}

/**
 * marker has following fields: x, y, quadrant, botColor
 */
function addMarker(board, marker) {
  var currentStrength = board.markers[marker.x][marker.y][marker.quadrant][marker.botColor]
  if (typeof currentStrength === 'undefined') {
    currentStrength = 0.0
  }

  currentStrength += INIT_MARKER_STRENGTH
  if (currentStrength >= MAX_MARKER_STRENGTH) {
    currentStrength = MAX_MARKER_STRENGTH
  }

  board.markers[marker.x][marker.y][marker.quadrant][marker.botColor] =
    currentStrength
}

/**
 * Returns a list of marker objects, for markers with defined strength
 * each marker has following fields: x, y, quadrant, botColor, strength
 *
 * set keepUndefined to true to emit every marker, regardless of definition
 */
function getMarkers(board, keepUndefined) {

  if (typeof keepUndefined === 'undefined') {
    keepUndefined = false
  }
  var markers = []
  for (var x = 0; x < board.num_cols; x++) {
    for (var y = 0; y < board.num_rows; y++) {
      for (var q = 0; q < Direction.NUM_DIRECTIONS; q++) {
        for (var c = 0; c < BotColor.NUM_COLORS; c++) {
          strength = board.markers[x][y][q][c]
          if (!keepUndefined && typeof strength === 'undefined') {
            continue
          }
          marker = {
            x: x,
            y: y,
            quadrant: q,
            botColor: c,
            strength: strength
          }
          markers.push(marker)
        }
      }
    }
  }
  return markers
}

// TODO: do a better job separating model from view.
function step(board) {
  var bots = board.bots

  // TODO: determine for each for javascript
  var numBots = bots.length
  for (var i = 0; i < numBots; i++) {
    var bot = bots[i]

    // collection of animations related to the bot
    bot.animations = {}

    // list of markers that bot has dropped
    bot.depositMarker = []

    // make sure this bot hasn't finished
    if ("done" in bot.program) {
      continue
    } 

    var instruction = bot.program.instructions[bot.ip]
    bot.animations.lineIndex = instruction.lineIndex

    // NOTE: executing the instruction may modify the ip
    bot.ip = bot.ip + 1

    if (instruction.opcode == Opcode.MOVE) {
      moveBot(BOARD, bot)
    } else if (instruction.opcode == Opcode.TURN) {
      turnBot(bot, instruction.data)
    } else if (instruction.opcode == Opcode.GOTO) {
      executeGoto(bot, instruction.data)
    }
    bot.animations.lineIndex = instruction.lineIndex

    // if the bot has reached the end of its program
    if (bot.ip >= bot.program.instructions.length) {
      bot.program.done = true
      bot.animations.programDone = true
    }

    _(bot.depositMarker).forEach( function (marker) {
      addMarker(board, marker)
    })
  }

  // Decay the strength of each marker on the board
  _(getMarkers(board)).forEach( function(m) {
    board.markers[m.x][m.y][m.quadrant][m.botColor] = decayMarker(m.strength)
  })
}

function cleanUpSimulation() {
  BOARD.bots = []
}

function initBots(board, prog) {
  var initBot = new Bot(
    Math.floor((board.num_cols - 1) / 2),
    Math.floor((board.num_rows - 1)/ 2),
    Direction.UP,
    prog,
    BotColor.BLUE)

  return [initBot]  
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// return a deep copy of origObj, with newObj merged in
function cloneDeep(origObj, newObj) {
  return _.assign(_.cloneDeep(origObj), newObj)
}

// yields a new matrix
// if defaultValue is a function then matrix[x][y] = defaultValue(x, y)
// else matrix[x][y] = defaultValue
function newMatrix(xLength, yLength, defaultValue) {
  return newArray(xLength, function(x) {
    return newArray(yLength, function(y) {
      if (typeof defaultValue == "function") {
        return defaultValue(x, y)
      } else {
        return defaultValue
      }
    })
  })
}

// creates a new matrx of specified length
// if defaultValue is a function, then array[i] = defaultValue(i)
// else, array[i] = defaultValue
function newArray(length, defaultValue) {
  var a = Array(length)
  for (var i = 0; i < length; i++) {
    if (typeof defaultValue == "function") {
      a[i] = defaultValue(i)
    } else {
      a[i] = defaultValue
    }
  }
  return a
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Instead of using D3 selectAll, just do D3 select(node) for a given node
 * reference.
 */

// Maps each BotColor to a hue 
// The hue value (between 0 and 100)
var BotColorHue = {
  NUM_COLORS: 2,
  0: 84,
  1: 100
}

function directionToAngle(direction) {
  if (direction == Direction.UP) {
    return 0
  } else if (direction == Direction.DOWN) {
    return 180
  } else if (direction == Direction.LEFT) {
    return -90
  } else if (direction == Direction.RIGHT) {
    return 90
  } else {
    // assert false
  }
}

function botTransform(x, y, facing) {
  return "translate(" + x + ", " + y + ") " +
    "rotate(" + directionToAngle(facing) + " 16 16)"
}

function nonBotAnimate() {
  // TODO: animate coins rotating or something
  // IDEA: perhaps the reason nonBotAnimate and animateCoinCollection were
  // interferring is because they were both operating on the same svg elements
  // but they were using different transition objects.
}

function animateCoinCollection(coins, bots) {

  /**
   * NOTE: I found that animations would interfere with each other on fast
   * speeds if I used d3.selectAll (presumably due to race conditions).
   * I fixed this issue by using d3.select to only select the svg elements
   * that will actually be animated. It will probably be good to follow this
   * approach elsewhere.
   */

  _(bots)
    .map( function(b) {
      if ("coin_collect" in b.animations) {
        // need to serialize coin objects as strings so they can be used as keys
        // in the collectedCoins object
        return b.animations.coin_collect
      } else {
        return null
      }
    })
    .compact()
    .forEach( function(coin) {
      d3.select("#" + coinId(coin)).transition()
        .attr("r", COIN_EXPLODE_RADIUS)
        .attr("opacity", "0.0")
        .delay(ANIMATION_DUR / 4)
        .ease("cubic")
        .duration(ANIMATION_DUR)
        .each("end", function() {
          if (BOARD.coins.length == 0) {
            alert("You win!")
          }
        })
    })
}

function animateFailMove(transition) {
  var MOVE_DEPTH = 6
  transition
  .filter( function(bot) {
    return "failMove" in bot.animations
  })
  .attr("transform", function(bot) {
    var animation = bot.animations.failMove
    var dx = 0
    var dy = 0
    if (bot.cellX != animation.destX) {
      dx = (animation.destX - bot.cellX) * MOVE_DEPTH
    }
    if (bot.cellY != animation.destY) {
      dy = (animation.destY - bot.cellY) * MOVE_DEPTH
    }
    var x = bot.cellX * CELL_SIZE + dx
    var y = bot.cellY * CELL_SIZE + dy
    return botTransform(x, y, bot.facing)
  })
  .ease("cubic")
  .duration(ANIMATION_DUR / 2)
  .each("end", function() {
    d3.select(this).transition() 
      .attr("transform", function(bot) {
        var x = bot.cellX * CELL_SIZE
        var y = bot.cellY * CELL_SIZE 
        return botTransform(x, y, bot.facing)
      })
  })
  .ease(EASING)
  .duration(ANIMATION_DUR / 2)
}

function animateRotate(transition) {
  transition.filter( function(bot) {
    return "rotate" in bot.animations
  })
  .attr("transform", function(bot) {
    var x = bot.cellX * CELL_SIZE
    var y = bot.cellY * CELL_SIZE
    return botTransform(x, y, bot.facing)
  })
  .ease(EASING)
  .duration(ANIMATION_DUR)
}

function animateMoveNonTorus(transition) {
  transition.filter( function(bot) {
    return "nonTorusMove" in bot.animations
  })
  .attr("transform", function(bot) {
    var x = bot.cellX * CELL_SIZE
    var y = bot.cellY * CELL_SIZE
    return botTransform(x, y, bot.facing)
  })
  .ease(EASING)
  .duration(ANIMATION_DUR)
}

function animateProgramDone(bots) {

  doneBots = bots.filter( function(bot) {
    return "programDone" in bot.animations
  })

  VIS.selectAll(".programDone")
    .data(doneBots)
    .enter()
    .append("svg:use")
    .attr("class", "xTemplate")
    .attr("xlink:href", "#xTemplate")
    .attr("transform", function(bot) {
      var x = bot.cellX * CELL_SIZE
      var y = bot.cellY * CELL_SIZE
      return botTransform(x, y, bot.facing)
    })
    .attr("opacity", "0.0")
  .transition()
    .attr("opacity", "0.75")
    .delay(ANIMATION_DUR)
    .ease(EASING)
    .duration(ANIMATION_DUR / 2)


}

function animateMoveTorus(transition, bots) {

  /**
   * Replace the svg-bot element with a clone, and move the original bot
   * across the screen (out of bounds). Then move both svg elements at the
   * same time.
   */

  torusBots = bots.filter( function(bot) {
    return "torusMove" in bot.animations
  })

  // create the clone of the bot
  VIS.selectAll(".botClone")
    .data(torusBots)
    .enter().append("svg:use")
    .attr("class", "bot")
    .attr("xlink:href", "#botTemplate")
    .attr("transform", function(bot) {
      var x = bot.animations.torusMove.prevX * CELL_SIZE
      var y = bot.animations.torusMove.prevY * CELL_SIZE
      return botTransform(x, y, bot.facing)
    })
    .transition()
    .attr("transform", function(bot) {
      var x = bot.animations.torusMove.oobNextX * CELL_SIZE
      var y = bot.animations.torusMove.oobNextY * CELL_SIZE
      return botTransform(x, y, bot.facing)
    })
    .ease(EASING)
    .duration(ANIMATION_DUR)
    .each("end", function() {
      // garbage collect the bot clones
      d3.select(this).remove()
    })

  // instantly move the bot across to the other side of the screen
  transition.filter( function(bot) {
      return "torusMove" in bot.animations
    })
    .attr("transform", function(bot) {
      var x = bot.animations.torusMove.oobPrevX * CELL_SIZE
      var y = bot.animations.torusMove.oobPrevY * CELL_SIZE
      return botTransform(x, y, bot.facing)
    })
    .ease(EASING)
    .duration(0)
    .each("end", function() {
      // once the bot is on the other side of the screen, move it like normal
      d3.select(this).transition() 
        .attr("transform", function(bot) {
          var x = bot.cellX * CELL_SIZE

          var y = bot.cellY * CELL_SIZE
          return botTransform(x, y, bot.facing)
        })
        .ease(EASING)
        .duration(ANIMATION_DUR)
    })

}

// animate the program's text
function animateProgram(board) {

  var cm = CODE_MIRROR_BOX

  // if animation is too fast, don't highlight lines
  if (CYCLE_DUR < MAX_HIGHLIGHT_SPEED) {
    // TODO: remove _activeLine field from cm
    if ("_activeLine" in cm) {
      cm.removeLineClass(cm._activeLine, "background", BACK_CLASS);
    }
    return
  }

  // TODO: find the bot currently being traced and only animate that bot's prog
  if (board.bots.length == 0) {
    return
  }

  var bot = board.bots[0]
  if (!("lineIndex" in bot.animations)) {
    return
  }

  var lineNum = bot.animations.lineIndex

  // inspired by http://codemirror.net/demo/activeline.html
  var lineHandle = cm.getLineHandle(lineNum);
  if (cm._activeLine != lineHandle) {
    if ("_activeLine" in cm) {
      cm.removeLineClass(cm._activeLine, "background", BACK_CLASS);
    }
    cm.addLineClass(lineHandle, "background", BACK_CLASS);
    cm._activeLine = lineHandle;
  }
}

function animateMarkers(board) {

  _(getMarkers(board))
  .groupBy(markerId)
  // convert markers into colors
  .map( function(markers) {

    // markers is an array of all marker objects that have the same
    // x, y, and quadrant values (but different botColor values)

    // But for now there is only one color
    // TODO: implement multiple bot colors
    assert(markers.length <= 1, "in animateMarkers, markers.length <= 1")

    if (markers.length == 0) {
      return null
    } else {
      // First normalize the strength by converting it to a value in the range
      // [0.0, 1.0], where the weakest strength gets mapped to zero
      // and the strongest strength gets mapped to 1.0
      var marker = markers[0]

      var strength = marker.strength
      var strengthNormalized = (strength - MIN_MARKER_STRENGTH) /
        MAX_MARKER_STRENGTH

      var saturation = Math.floor(strengthNormalized * 100) + "%"
      var hue = BotColorHue[marker.botColor] + "%"
      var hsvString = "hsv(" + hue + "," + saturation + ", 100%)"
      var rgbString = "#" + tinycolor(hsvString).toHex()
      marker.rgb = rgbString

      return marker
    }

  })
  .compact()
  .forEach( function(marker) {
    d3.select("#" + markerId(marker)).transition()
      .attr("fill", marker.rgb)
      .ease("linear")
      .duration(ANIMATION_DUR)
  })

}

// TODO: breakup into smaller functions
function animate() {
  if (PLAY_STATUS != PlayStatus.PLAYING) {
    return;
  } else {
    stepAndAnimate()
  }
}

function stepAndAnimate() {
  // advance the simulation by one "step"
  step(BOARD)

  animateProgram(BOARD)

  // must pass initCoins for d3 transitions to work. Since the svg-coin
  // elements are never removed from the board (until the simulation ends)
  // the d3 transition must operate on BOARD.initCoins, not BOARD.coins
  animateCoinCollection(BOARD.initCoins, BOARD.bots)

  var transition = d3.selectAll(".bot").data(BOARD.bots).transition()

  animateFailMove(transition)
  animateRotate(transition)
  animateMoveNonTorus(transition)
  animateMoveTorus(transition, BOARD.bots)
  animateProgramDone(BOARD.bots)
  animateMarkers(BOARD)
}

function cleanUpVisualization() {
  d3.selectAll(".bot").remove()
  d3.selectAll(".coin").remove()
  d3.selectAll(".botClone").remove()
  d3.selectAll(".block").remove()
  d3.selectAll(".marker").remove()
  d3.selectAll(".xTemplate").remove()

  // TODO: turn off line highlighting
  if ("_activeLine" in CODE_MIRROR_BOX) {
    CODE_MIRROR_BOX.removeLineClass(
      CODE_MIRROR_BOX._activeLine, "background", BACK_CLASS);
  }
}
 
function createBoard(board) {
  VIS = d3.select("#board")
    .attr("class", "vis")
    .attr("width", board.num_cols * CELL_SIZE)
    .attr("height", board.num_rows * CELL_SIZE)
}

function drawCells(board) {

  var cells = new Array()
  for (var x = 0; x < board.num_cols; x++) {
    for (var y = 0 ; y < board.num_rows; y++) {
      cells.push({'x': x, 'y': y })
    }
  }

  VIS.selectAll(".cell")
    .data(cells)
    .enter().append("svg:rect")
    .attr("class", "cell")
    .attr("stroke", "lightgray")
    .attr("fill", "white")
    .attr("x", function(d) { return d.x * CELL_SIZE })
    .attr("y", function(d) { return d.y * CELL_SIZE })
    .attr("width", CELL_SIZE)
    .attr("height", CELL_SIZE)

 }

function coinId(coin) {
  return "coin_" + coin.x + "_" + coin.y
}

function markerId(marker) {
  return "marker_" + marker.x + "_" + marker.y + "_" + marker.quadrant
}

function drawCoins() {
  VIS.selectAll(".coin")
    .data(BOARD.coins)
    .enter().append("svg:circle")
    .attr("class", "coin")
    .attr("id", function(coin){ return coinId(coin)} )
    .attr("stroke", "goldenrod")
    .attr("fill", "gold")
    .attr("opacity", "1.0")
    .attr("r", COIN_RADIUS)
    .attr("cx", function(d){ return d.x * CELL_SIZE + CELL_SIZE/2 } )
    .attr("cy", function(d){ return d.y * CELL_SIZE + CELL_SIZE/2} )
}

function drawInitMarkers(board) {

  var markers = _(getMarkers(board, true)).filter( function (m) {
    // All bot colors share one graphical element, so we do this filtering
    return m.botColor == BotColor.BLUE
  }).value()

  VIS.selectAll(".marker")
    .data(markers)
    .enter().append("svg:circle")
    .attr("class", "marker")
    .attr("id", markerId)
    .attr("fill", "white")
    .attr("r", "5")
    .attr("cx", function(m) {
      var x = m.x * CELL_SIZE + CELL_SIZE/2
      if (m.quadrant == Direction.LEFT) {
        x -= 8
      } else if (m.quadrant == Direction.RIGHT) {
        x += 8
      }
      return x
    })
    .attr("cy", function(m) {
      var y = m.y * CELL_SIZE + CELL_SIZE/2
      if (m.quadrant == Direction.UP) {
        y -= 8
      } else if (m.quadrant == Direction.DOWN) {
        y += 8
      }
      return y
    })
}

function drawBlocks() {
  VIS.selectAll(".block")
    .data(BOARD.blocks)
    .enter().append("svg:rect")
    .attr("class", "block")
    .attr("stroke", "darkgray")
    .attr("fill", "darkgray")
    .attr("width", CELL_SIZE)
    .attr("height", CELL_SIZE)
    .attr("x", function(d){ return d.x * CELL_SIZE } )
    .attr("y", function(d){ return d.y * CELL_SIZE } )
}

function drawBots() {
  VIS.selectAll(".bot")
    .data(BOARD.bots)
    .enter().append("svg:use")
    .attr("class", "bot")
    .attr("xlink:href", "#botTemplate")
    .attr("transform", function(bot) {
      var x = bot.cellX * CELL_SIZE
      var y = bot.cellY * CELL_SIZE
      return botTransform(x, y, bot.facing)
    })
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Holds all top-level variables, function invocations etc.
 */

// if CYCLE_DUR < MAX_HIGHLIGHT_SPEED, lines will not be highlighted
// to show program execution
var MAX_HIGHLIGHT_SPEED = 150

// [animationDuration, delayDuration, description, easing]
PlaySpeed = {
  SUPER_SLOW: [2000, 4000, "Super slow", "cubic-in-out"],
  SLOW: [750, 1500, "Slow", "cubic-in-out"],
  NORMAL: [400, 600, "Normal", "cubic-in-out"],
  FAST: [150, 150, "Fast", "linear"],
  SUPER_FAST: [0, 0, "Super fast", "linear"]
}

PlayStatus = {
  INITAL_STATE_PAUSED: 0,
  PLAYING: 1,
  PAUSED: 2,
}

// TODO better name and document
var WRAP_CLASS = "activeline";
var BACK_CLASS = "activeline-background";

// TODO: better var names and all caps
var CELL_SIZE = 32,
    VIS = null,
    ANIMATE_INTERVAL = null,
    PLAY_STATUS = PlayStatus.INITAL_STATE_PAUSED,
    INIT_PLAY_SPEED = PlaySpeed.NORMAL,
    ANIMATION_DUR = INIT_PLAY_SPEED[0]
    CYCLE_DUR = INIT_PLAY_SPEED[1],
    EASING = INIT_PLAY_SPEED[3],
    NON_BOT_ANIMATION_DUR = PlaySpeed.SLOW[0],
    NON_BOT_CYCLE_DUR = NON_BOT_ANIMATION_DUR,
    INITIAL_PROGRAM = "\nstart:\nmove\nmove\nturn left\ngoto start\n",
    CODE_MIRROR_BOX = null,
    pausePlay = null,
    DEBUG = true,
    IDENT_REGEX = /^[A-Za-z][A-Za-z0-9_]*$/,
    NORMAL_CODE_THEME = "solarized dark",
    DISABLED_CODE_THEME = "solarized_dim dark"

    /**
     * TODO: create a cell property, where cell[x][y] yields
     * a list of objects in that cell. In the mean time, I'll just search
     * through the bots and coins objects when needed.
     */
    BOARD = {
      num_cols: 9,
      num_rows: 7,
      bots : [],
      // the coins currently on the board (changes throughout a simulation)
      coins : [],
      // the coins originally placed on the board (immutable throughout a
      // simulation)
      // TODO: assert that each coin is unique
      initCoins: [],
      coinsCollected : 0,
      blocks : []
    }

var MAX_MARKER_STRENGTH = 1.0
var MIN_MARKER_STRENGTH = 0.00001
var INIT_MARKER_STRENGTH = 0.35

// map of reserved words (built using fancy lodash style)
var reservedWords = "move turn left right goto"
var RESERVED_WORDS = _(reservedWords.split(" "))
  .map(function(word) { return [word, true] })
  .object()
  .value()

var COIN_RADIUS = 6
var COIN_EXPLODE_RADIUS = 100

window.onload = windowOnLoad
createBoard(BOARD)
drawCells(BOARD)
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * array of [programLine, instructionObject] pairs
 * tests ability to correctly compile instructions and detect errors
 * specific to instructions.
 * 
 * Things that are __not__ tested here:
 *    - tokenization
 *    - comments
 *    - labels
 *    - second phase of goto parsing
 */
var testInstructions = [

    ["move", new RobocomInstruction(Opcode.MOVE, null)],
    ["move foo", null],
    ["move foo bar", null],

    ["turn left", new RobocomInstruction(Opcode.TURN, Direction.LEFT)],
    ["turn right", new RobocomInstruction(Opcode.TURN, Direction.RIGHT)],
    ["turn up", null],
    ["turn down", null],
    ["turn", null],
    ["turn 0", null],
    ["turn 1", null],
    ["turn left right", null],
    ["turn left foo", null],

    ["goto foo_1", new RobocomInstruction(Opcode.GOTO, "foo_1")],
    ["goto foo bar", null],
    ["goto 1foo", null],
    ["goto _foo", null],
    ["goto move", null],
    ["goto goto", null]

  ]

for (var i = 0; i < testInstructions.length; i++) {
  var line     = testInstructions[i][0]
  var expected = testInstructions[i][1]
  var result = compileLine(line)[0]
  assert(_.isEqual(result, expected),
    "compile('" + line + "') != expected")
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var TEST_FILENAME = "js_test/simulator/test_moveBot.js"

/**
 * test execution of move instruction
 *************************************************************************/
var emptyBoard = {
  num_cols: 4,
  num_rows: 5,
  coinsCollected: 0
}

var botBase = {
  facing: Direction.UP,
  animations: {},
  depositMarker: [],
  botColor: BotColor.BLUE
}

var bot_2_2_up = cloneDeep(botBase, {
  cellX: 2,
  cellY: 2
})

var bot_0_0_up = cloneDeep(botBase, {
  cellX: 0,
  cellY: 0,
})

// list of [board, bot, expectedBoard, expectedBot] test cases
var testMoveBot = [

  /**
   * non-torus moves on an empty board
   *************************************************************************/
  // up
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up),
    cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {
      cellY: 1,
      animations: {nonTorusMove: true},
      depositMarker: [
        {x: 2, y: 2, botColor: BotColor.BLUE, quadrant: Direction.UP},
        {x: 2, y: 1, botColor: BotColor.BLUE, quadrant: Direction.DOWN}
      ]
    })
  ],
  // down
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {facing: Direction.DOWN} ),
    cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {
      facing: Direction.DOWN,
      cellY: 3,
      animations: {nonTorusMove: true},
      depositMarker: [
        {x: 2, y: 2, botColor: BotColor.BLUE, quadrant: Direction.DOWN},
        {x: 2, y: 3, botColor: BotColor.BLUE, quadrant: Direction.UP}
      ]
    })
  ],
  // left
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {facing: Direction.LEFT} ),
    cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {
      facing: Direction.LEFT,
      cellX: 1,
      animations: {nonTorusMove: true},
      depositMarker: [
        {x: 2, y: 2, botColor: BotColor.BLUE, quadrant: Direction.LEFT},
        {x: 1, y: 2, botColor: BotColor.BLUE, quadrant: Direction.RIGHT}
      ]
    })
  ],
  // right
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {facing: Direction.RIGHT} ),
    cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {
      facing: Direction.RIGHT,
      cellX: 3,
      animations: {nonTorusMove: true},
      depositMarker: [
        {x: 2, y: 2, botColor: BotColor.BLUE, quadrant: Direction.RIGHT},
        {x: 3, y: 2, botColor: BotColor.BLUE, quadrant: Direction.LEFT}
      ]
    })
  ],

  /**
   * __torus__ moves on an empty board
   *************************************************************************/
  // up
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up),
    cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      cellY: 4,
      animations: {torusMove: {
        prevX: 0,
        prevY: 0,
        oobPrevX: 0,
        oobPrevY: 5,
        oobNextX: 0,
        oobNextY: -1
      }},
      depositMarker: [
        {x: 0, y: 0, botColor: BotColor.BLUE, quadrant: Direction.UP},
        {x: 0, y: 4, botColor: BotColor.BLUE, quadrant: Direction.DOWN}
      ]
    })
  ],
  // down
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      facing: Direction.DOWN,
      cellY: 4
    }),
    cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      facing: Direction.DOWN,
      cellY: 0,
      animations: {torusMove: {
        prevX: 0,
        prevY: 4,
        oobPrevX: 0,
        oobPrevY: -1,
        oobNextX: 0,
        oobNextY: 5
      }},
      depositMarker: [
        {x: 0, y: 4, botColor: BotColor.BLUE, quadrant: Direction.DOWN},
        {x: 0, y: 0, botColor: BotColor.BLUE, quadrant: Direction.UP}
      ]
    })
  ],
  // left
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {facing: Direction.LEFT} ),
    cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      facing: Direction.LEFT,
      cellX: 3,
      animations: {torusMove: {
        prevX: 0,
        prevY: 0,
        oobPrevX: 4,
        oobPrevY: 0,
        oobNextX: -1,
        oobNextY: 0
      }},
      depositMarker: [
        {x: 0, y: 0, botColor: BotColor.BLUE, quadrant: Direction.LEFT},
        {x: 3, y: 0, botColor: BotColor.BLUE, quadrant: Direction.RIGHT}
      ]
    })
  ],
  // right
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      facing: Direction.RIGHT,
      cellX: 3
    }),
    cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      facing: Direction.RIGHT,
      cellX: 0,
      animations: {torusMove: {
        prevX: 3,
        prevY: 0,
        oobPrevX: -1,
        oobPrevY: 0,
        oobNextX: 4,
        oobNextY: 0
      }},
      depositMarker: [
        {x: 3, y: 0, botColor: BotColor.BLUE, quadrant: Direction.RIGHT},
        {x: 0, y: 0, botColor: BotColor.BLUE, quadrant: Direction.LEFT}
      ]
    })
  ],
]

var boardWithCoins = cloneDeep(emptyBoard, {
  coins : [
    {x: 1, y: 1},
    {x: 2, y: 2}
  ]
})

/**
 * moving bot picks up coins
 *************************************************************************/
testMoveBot = testMoveBot.concat([

  [ cloneDeep(boardWithCoins),
    cloneDeep(bot_0_0_up, {
      cellX: 1,
      cellY: 2
    }),
    cloneDeep(boardWithCoins, {
      coins: [
        {x: 2, y: 2}
      ],
      coinsCollected: 1
    }),
    cloneDeep(bot_0_0_up, {
      cellX: 1,
      cellY: 1,
      animations: {
        nonTorusMove: true,
        coin_collect: {x: 1, y: 1}
      },
      depositMarker: [
        {x: 1, y: 2, botColor: BotColor.BLUE, quadrant: Direction.UP},
        {x: 1, y: 1, botColor: BotColor.BLUE, quadrant: Direction.DOWN}
      ]
    })
  ]
])

var boardWithCoinsBlocks = cloneDeep(boardWithCoins, {
  blocks : [
    {x: 3, y: 3},
    {x: 3, y: 4}
  ]
})

for (TC_I = 0; TC_I < testMoveBot.length; TC_I++) {
  TC = testMoveBot[TC_I]
  var board = TC[0]
  var bot = TC[1]
  var expectedBoard = TC[2]
  var expectedBot = TC[3]
  moveBot(board, bot)
  RESULT = [board, bot]
  test(_.isEqual([board, bot], [expectedBoard, expectedBot]))
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var TEST_FILENAME = "js_test/simulator/test_tryMove.js"

var board = {blocks : [{x:5,y:5}]}
var bot = {facing: "any"}
var testTryMove = [
    {board: board, bot: bot, x: 5, y: 5, expected: false},
    {board: board, bot: bot, x: 5, y: 6, expected: true},
    {board: board, bot: bot, x: 6, y: 5, expected: true},
    {board: board, bot: bot, x: 6, y: 6, expected: true}
  ]

for (var TC_I = 0; TC_I < testTryMove.length; TC_I++) {
  var TC = testTryMove[TC_I]
  var RESULT = tryMove(TC.board, TC.bot, TC.x, TC.y)
  test(_.isEqual(RESULT, TC.expected))
}

