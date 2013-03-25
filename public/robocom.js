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
 * The simulator creates an Animation object for each animation that should be
 * carried out. It includes all the information needed for the visualization
 * engine to perform the animation.
 */

AnimationType = {
  NONE: 0,
  MOVE: 1,
  ROTATE: 2
}

/**
 * type: one of the values from AnimationType
 * data: data associated with the animation (e.g. an AnimationMove object)
 */
function Animation(type, data) {
  // value from the AnimationType enum
  this.type = type
  this.data = data
}

// move a bot (covers both torus and non-torus moves)
function AnimationMove(
    // boolean
    torus,
    // previous cell coordinates
    prevX, prevY,
    // out-of-bounds prev-X and prev-Y
    oobPrevX, oobPrevY,
    // out-of-bounds next-X and next-Y
    // i.e. what nextX and nextY would be if it weren't for the wrap around
    oobNextX, oobNextY,
    // either -1, 0, or 1
    dx, dy) {
  this.torus = torus
  this.prevX = prevX
  this.prevY = prevY
  this.oobPrevX = oobPrevX
  this.oobPrevY = oobPrevY
  this.oobNextX = oobNextX
  this.oobNextY = oobNextY
  this.dx = dx
  this.dy = dy
}

// rotate a bot
function AnimationTurn(oldFacing, newFacing) {
  this.oldFacing = oldFacing
  this.newFacing = newFacing
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
 */

// Defines a syntax highlighter for the robocom language
CodeMirror.defineMIME("text/x-robocom", {
  name: "clike",
  //keywords: words("move turn goto"),
  keywords: {
    "move" : true,
    "turn" : true,
    "goto" : true
  },
  blockKeywords: {},
  atoms: {
    "true" : true,
    "false" : true,
    "left" : true,
    "right" : true
  },
  hooks: {
    "@": function(stream) {
      stream.eatWhile(/[\w\$_]/);
      return "meta";
    }
  }
});

// lineComments is a map where line index points to comment for that line
function addLineComments(lineComments) {
  codeMirrorBox.clearGutter("note-gutter")
  for (i in lineComments) {
      var comment = lineComments[i]
      console.dir(i)
      console.log(comment)
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

Opcode = {
  MOVE: 0,
  TURN: 1,
}

function RobocomInstruction(
    // value must be in the Opcode enum
    opcode,
    // data object, whose type is determined by opcode
    data) {
  this.opcode = opcode
  this.data = data
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

function compileMove(tokens) {
  var instruction = null
  var comment = null

  // assert tokens[0] == "move"
  if (tokens.length == 1) {
    instruction = new RobocomInstruction(Opcode.MOVE, null)
    comment = newComment("Move forward one square")
  } else {
    instruction = null
    comment = newErrorComment("Incorrect 'move' instruction", "#")
  }

  return [instruction, comment]
}

function compileTurn(tokens) {
  var instruction = null
  var comment = null

  // assert tokens[0] == "move"
  if (tokens.length == 2) {
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
    }
  } else {
    instruction = null
    comment = newErrorComment("The 'turn' instruction is missing a direction", "#")
  }

  return [instruction, comment]
}

// Returns [instruction, comment]
//  where instruction is a RobocomInstruction and comment is a string
//  instruction is set to null if there was an error compiling the instruciton
// Returns [] if the line is a no-op
function compileLine(line) {
  var tokens = line
    .replace(/\s+/g, " ")
    .replace(/(^\s+)|(\s+$)/g, "")
    .split(" ")

  tokens = removeComment(tokens)

  if (tokens.length == 0 ||
      (tokens.length == 1 && tokens[0] == "")) {
    return []
  }

  console.dir(tokens)

  var opcode = tokens[0]
  if (opcode == "move") {
    return compileMove(tokens)
  } else if (opcode == "turn") {
    return compileTurn(tokens)
  } else {
    comment = newErrorComment("'" + opcode + "' is not an instruction", "#")
    return [null, comment]
  }
}

// Compiles a programText into a RobocomProgram object
function compileRobocom(programText) {
  var lines = programText.split("\n")
  var instructions = []
  var lineComments = {}
  var error = false
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var compiledLine = compileLine(line)
    if (compiledLine.length > 0) {
      // assert compiledLine.length == 2
      lineComments[i] = compiledLine[1]
      var instruction = compiledLine[0]
      if (instruction == null) {
        error = true
      } else {
        instructions.push(instruction)
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
};/**
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

// These event handlers are registered in main.js and in index.html

function setSpeed(speed) {
  var speedText = document.getElementById("speedText")

  ANIMATION_DUR = speed[0]
  CYCLE_DUR = speed[1]
  speedText.innerHTML = speed[2]
  clearInterval(animateInterval)
  animateInterval = setInterval("animate()", CYCLE_DUR)
}

// TODO: consider graying out the play button when it's not possible to play it
function doPause() {
  playStatus = PlayStatus.PAUSED
  pausePlay.innerHTML = 'Play!'
}

function doPlay() {
  if (bots.length > 0) {
    playStatus = PlayStatus.PLAYING
    pausePlay.innerHTML = 'Pause'
  }
}

function togglePausePlay() {
  // TODO: determine is this is threadsafe in JS
  if (playStatus == PlayStatus.PAUSED) {
    doPlay()
  } else {
    doPause()
  }
}

/**
 * - Pauses the simulation
 * - resets the board state
 * - compiles the program
 */
function restartSimulation() {
  doPause()
  cleanUpSimulation()
  cleanUpVisualization()
  var programText = codeMirrorBox.getValue()
  var program = compileRobocom(programText)
  addLineComments(program.lineComments)
  if (program.instructions != null) {
    bots = initBots(program)
    drawBots()
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

// TODO: Put in Direction.js

Direction = {
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

function rotateDirection(oldDirection, rotateDirection) {
  if (rotateDirection == Direction.LEFT) {
    return rotateLeft(oldDirection)
  } else if (rotateDirection == Direction.RIGHT) {
    return rotateRight(oldDirection)
  } else {
    // assert false
  }
}

function turnBot(bot, direction) {
  var oldFacing = bot.facing
  bot.facing = rotateDirection(bot.facing, direction)
  var animationData = new AnimationTurn(oldFacing, bot.facing)
  bot.animation = new Animation(AnimationType.ROTATE, animationData)
}

// executes the 'move' instruciton on the bot
// updates the bot state
function moveBot(bot) {

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

  xResult = wrapAdd(bot.cellX, dx, ccx)
  yResult = wrapAdd(bot.cellY, dy, ccy)
  bot.cellX = xResult[0]
  bot.cellY = yResult[0]
  xTorus = xResult[1]
  yTorus = yResult[1]

  animationData = new AnimationMove(
    xTorus == "torus" || yTorus == "torus",
    prevX, prevY,
    bot.cellX - dx, bot.cellY - dy,
    prevX + dx, prevY + dy,
    dx, dy) 

  bot.animation = new Animation(AnimationType.MOVE, animationData)
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


function Bot(x, y, facing, program) {

    this.cellX = x;
    this.cellY = y
    this.facing = facing;
    // an array of strings, each string is an "instruction"
    this.program = program;
    // instruction pointer points to the next instruction to be executed
    this.ip = 0;

    // the next animation to perform for this bot
    this.animation = "";
}

// TODO: do a better job separating model from view.
function step(bots) {
  // TODO: determine for each for javascript
  var numBots = bots.length
  for (var i = 0; i < numBots; i++) {
    var bot = bots[i]

    var instruction = bot.program.instructions[bot.ip]
    bot.ip = (bot.ip + 1) % bot.program.instructions.length
    bot.animation = new Animation(AnimationType.NONE, null)
    if (instruction.opcode == Opcode.MOVE) {
      moveBot(bot)
    } else if (instruction.opcode == Opcode.TURN) {
      turnBot(bot, instruction.data)
    }
  }
}

function cleanUpSimulation() {
  bots = []
}

function initBots(prog) {
  var initBot = new Bot(
    Math.floor((ccx - 1) / 2),
    Math.floor((ccy - 1)/ 2),
    Direction.UP,
    prog)

  return [initBot]  
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

function clone(selector) {
    var node = d3.select(selector).node();
    return d3.select(node.parentNode.insertBefore(node.cloneNode(true),
node.nextSibling));
}

function animate() {
    if (playStatus == PlayStatus.PAUSED) {
      return;
    }

    step(bots)
    var transition = d3.selectAll(".bot").data(bots).transition()

    /**
     * TODO:
     * two groups of moves: the torus and non-torus moves
     * for the torus moves:
     *    - clone the bot and put it on the other side of the board (off the board)
     *    - move both bots
     *    - garbage collect the bots that were moved off the board
     *    - how to associate the new bots with the old data?
     *        - move the original bot across the board (hidden) and
     *          put a clone where the original bot used to be.
     */
    d3.selectAll(".head").data(bots).transition()

    // TODO: this doesn't rotate around the origin; why not?
    transition.filter( function(bot) {
          return bot.animation.type == AnimationType.ROTATE
        })
        .attr("transform", function(bot) {
          var x = bot.cellX * cw + BOT_PHASE_SHIFT
          var y = bot.cellY * ch + BOT_PHASE_SHIFT
          var newAngle = directionToAngle(bot.facing)
          return "translate(" + x + ", " + y + ") rotate(" + newAngle + " 16 16)"
        })
      .ease(EASING)
      .duration(ANIMATION_DUR)

    var moveNonTorus = transition.filter( function(bot) {
        var notTorus = bot.animation.type == AnimationType.MOVE &&
          !bot.animation.data.torus
        return notTorus
      })

    // TODO: choose linear or cubic easing depending on speed of animation
    // and delay between movements
    moveNonTorus
        /*.attr("x", function(bot) { return bot.cellX * cw + BOT_PHASE_SHIFT })
        .attr("y", function(bot) { return bot.cellY * ch + BOT_PHASE_SHIFT })*/
        .attr("transform", function(bot) {
          var x = bot.cellX * cw + BOT_PHASE_SHIFT
          var y = bot.cellY * ch + BOT_PHASE_SHIFT
          if (bot.facing == Direction.RIGHT) {
            return "translate(" + x + "," + y + ") rotate(90 16 16)"
          } else if (bot.facing == Direction.DOWN) {
            return "translate(" + x + "," + y + ") rotate(180 16 16)"
          } else if (bot.facing == Direction.LEFT) {
            return "translate(" + x + "," + y + ") rotate(-90 16 16)"
          } else {
            return "translate(" + x + "," + y + ")"
          }
        })
        .ease(EASING)
        .duration(ANIMATION_DUR)
  
    torusBots = bots.filter(function(bot) {
      var torus = bot.animation.type == AnimationType.MOVE &&
        bot.animation.data.torus
      return torus
    })

    vis.selectAll(".botClone")
      .data(torusBots)
    .enter().append("svg:use")
      .attr("class", "bot")
      .attr("xlink:href", "#botTemplate")
      .attr("transform", function(bot) {
          var x = bot.animation.data.prevX * cw + BOT_PHASE_SHIFT
          var y = bot.animation.data.prevY * ch + BOT_PHASE_SHIFT
          if (bot.facing == Direction.RIGHT) {
            return "translate(" + x + "," + y + ") rotate(90 16 16)"
          } else if (bot.facing == Direction.DOWN) {
            return "translate(" + x + "," + y + ") rotate(180 16 16)"
          } else if (bot.facing == Direction.LEFT) {
            return "translate(" + x + "," + y + ") rotate(-90 16 16)"
          } else {
            return "translate(" + x + "," + y + ")"
          }
        })
    .transition()
      .attr("transform", function(bot) {
          var x = bot.animation.data.oobNextX  * cw + BOT_PHASE_SHIFT
          var y = bot.animation.data.oobNextY  * ch + BOT_PHASE_SHIFT
          if (bot.facing == Direction.RIGHT) {
            return "translate(" + x + "," + y + ") rotate(90 16 16)"
          } else if (bot.facing == Direction.DOWN) {
            return "translate(" + x + "," + y + ") rotate(180 16 16)"
          } else if (bot.facing == Direction.LEFT) {
            return "translate(" + x + "," + y + ") rotate(-90 16 16)"
          } else {
            return "translate(" + x + "," + y + ")"
          }
      })
      .ease(EASING)
      .duration(ANIMATION_DUR)
      .each("end", function() {
        // garbage collect the bot clones
        d3.select(this).remove()
      })

  var torusTransition = transition.filter( function(bot) {
      return bot.animation.type == AnimationType.MOVE &&
        bot.animation.data.torus
    })

  // TODO: optimization idea. I am concerned I am specifying unncessary
  // rotations, when really
  // the only time you need to do a rotation is during the turn instruction.
  // otherwise you can use a pre-rotate SVG element.
  torusTransition
    .attr("transform", function(bot) {
          var x = bot.animation.data.oobPrevX * cw + BOT_PHASE_SHIFT
          var y = bot.animation.data.oobPrevY * ch + BOT_PHASE_SHIFT
          if (bot.facing == Direction.RIGHT) {
            return "translate(" + x + "," + y + ") rotate(90 16 16)"
          } else if (bot.facing == Direction.DOWN) {
            return "translate(" + x + "," + y + ") rotate(180 16 16)"
          } else if (bot.facing == Direction.LEFT) {
            return "translate(" + x + "," + y + ") rotate(-90 16 16)"
          } else {
            return "translate(" + x + "," + y + ")"
          }
    })
    .ease(EASING)
    .duration(0)
    .each("end", function() {
      d3.select(this).transition() 
        .attr("transform", function(bot) {
          var x = bot.cellX * cw + BOT_PHASE_SHIFT
          var y = bot.cellY * ch + BOT_PHASE_SHIFT 
          if (bot.facing == Direction.RIGHT) {
            return "translate(" + x + "," + y + ") rotate(90 16 16)"
          } else if (bot.facing == Direction.DOWN) {
            return "translate(" + x + "," + y + ") rotate(180 16 16)"
          } else if (bot.facing == Direction.LEFT) {
            return "translate(" + x + "," + y + ") rotate(-90 16 16)"
          } else {
            return "translate(" + x + "," + y + ")"
          }
        })
        .ease(EASING)
        .duration(ANIMATION_DUR)
    })
  
}

function cleanUpVisualization() {
  d3.selectAll(".bot").remove()
  d3.selectAll(".botClone").remove()
}
 
function createBoard() {
  vis = d3.select("#board")
    .attr("class", "vis")
    .attr("width", ccx * cw)
    .attr("height", ccy * ch)
}

function drawCells() {
  vis.selectAll(".cell")
    .data(function() { return toGrid(states) })
  .enter().append("svg:rect")
    .attr("class", "cell")
    .attr("stroke", "lightgray")
    .attr("fill", "white")
    .attr("x", function(d) { return xs(d.x) })
    .attr("y", function(d) { return ys(d.y) })
    .attr("width", cw)
    .attr("height", ch)
 }


function drawBots() {
  vis.selectAll(".bot")
    .data(bots)
  .enter().append("svg:use")
    .attr("class", "bot")
    .attr("xlink:href", "#botTemplate")
    .attr("transform", function(bot) {
      var x = bot.cellX * cw + BOT_PHASE_SHIFT
      var y = bot.cellY * ch + BOT_PHASE_SHIFT
      if (bot.facing == Direction.RIGHT) {
        return "translate(" + x + "," + y + ") rotate(90 16 16)"
      } else if (bot.facing == Direction.DOWN) {
        return "translate(" + x + "," + y + ") rotate(180 16 16)"
      } else if (bot.facing == Direction.LEFT) {
        return "translate(" + x + "," + y + ") rotate(-90 16 16)"
      } else {
        return "translate(" + x + "," + y + ")"
      }
    })
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

// Holds all top-level variables, function invocations etc.


// [animationDuration, delayDuration]
PlaySpeed = {
  SUPER_SLOW: [2000, 4000, "Super slow"],
  SLOW: [750, 1500, "Slow"],
  NORMAL: [400, 800, "Normal"],
  FAST: [150, 150, "Fast"],
  SUPER_FAST: [0, 0, "Super fast"]
}

PlayStatus = {
  PAUSED: 0,
  PLAYING: 1
}

var playStatus = PlayStatus.PLAYING
//var EASING = "cubic-in-out"
var EASING = "linear"
var ANIMATION_DUR = PlaySpeed.SLOW[0]
var CYCLE_DUR = PlaySpeed.SLOW[1]
// TODO: replace 6 with a computed value
var BOT_PHASE_SHIFT = 0

var initialProgram = "move\nmove\nmove\nturn left\n"
var codeMirrorBox = null

var pausePlay = null

// maps linenumbers to comments for that line
var lineComments = {}

// TODO: put onload and event handlers in separate file
window.onload = function(){

  pausePlay = document.getElementById("pauseplay")
  pausePlay.addEventListener("click", togglePausePlay);

  document
    .getElementById("restart")
    .addEventListener("click", restartSimulation);

  codeMirrorBox = CodeMirror(document.getElementById("container"), {
    value: initialProgram,
    gutters: ["note-gutter", "CodeMirror-linenumbers"],
    mode:  "text/x-robocom",
    theme: "solarized dark",
    smartIndent: false,
    lineNumbers: true,
  });

  restartSimulation()

  // TODO: where should i put this?
  animateInterval = setInterval("animate()", CYCLE_DUR)
}

var animateInterval = null
var ccx = 9, // cell count x
    ccy = 7, // cell count y
    cw = 32, // cellWidth
    ch = 32,  // cellHeight
    del = CYCLE_DUR, // delay
    xs = d3.scale.linear().domain([0,ccx]).range([0,ccx * cw]),
    ys = d3.scale.linear().domain([0,ccy]).range([0,ccy * ch]),
    states = new Array()

// TODO: fix this jank
d3.range(ccx).forEach(function(x) {
    states[x] = new Array()
    d3.range(ccy).forEach(function(y) {
        states[x][y] = Math.random() > .8 ? true : false
    })
})

function toGrid(states) {
    var g = []
    for (x = 0; x < ccx; x++) {
        for (y = 0; y < ccy; y++) {
            g.push({"x": x, "y": y, "state": states[x][y]})
        }
    }
    return g
}

var vis = null

//var prog = compileRobocom(initialProgram)
var bots = null// initBots(prog)

createBoard()
drawCells()

//drawBots()

// kick it off
//

