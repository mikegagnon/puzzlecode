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

    var instruction = bot.program[bot.ip]
    bot.ip = (bot.ip + 1) % bot.program.length
    bot.animation = new Animation(AnimationType.NONE, null)
    if (instruction == "move") {
      moveBot(bot)
    } else if (instruction == "left") {
      turnBot(bot, Direction.LEFT)
    } else if (instruction == "right") {
      turnBot(bot, Direction.RIGHT)
    }
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

// [animationDuration, delayDuration]
PlaySpeed = {
  SUPER_SLOW: [2000, 4000, "Super slow"],
  SLOW: [750, 1500, "Slow"],
  NORMAL: [400, 400, "Normal"],
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
var ANIMATION_DUR = PlaySpeed.NORMAL[0]
var CYCLE_DUR = PlaySpeed.NORMAL[1]
// TODO: replace 6 with a computed value
var BOT_PHASE_SHIFT = 0


// TODO: put onload and event handlers in separate file

function setSpeed(speed) {
  var speedText = document.getElementById("speedText")

  ANIMATION_DUR = speed[0]
  CYCLE_DUR = speed[1]
  speedText.innerHTML = speed[2]
  clearInterval(animateInterval)
  animateInterval = setInterval("animate()", CYCLE_DUR)
}

window.onload = function(){

  var pausePlay = document.getElementById("pauseplay")

  pausePlay
    .addEventListener("click", function() {
      // TODO: determine is this is threadsafe in JS
      if (playStatus == PlayStatus.PAUSED) {
        playStatus = PlayStatus.PLAYING
        pausePlay.innerHTML = 'Pause'
      } else {
        playStatus = PlayStatus.PAUSED
        pausePlay.innerHTML = 'Play!'
      }
    });
}


// Holds all top-level variables, funciton invocations etc.
//



var ccx = 6, // cell count x
    ccy = 7, // cell count y
    cw = 32, // cellWidth
    ch = 32,  // cellHeight
    del = CYCLE_DUR, // delay
    xs = d3.scale.linear().domain([0,ccx]).range([0,ccx * cw]),
    ys = d3.scale.linear().domain([0,ccy]).range([0,ccy * ch]),
    states = new Array()

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

var vis = d3.select("#board")
    .attr("class", "vis")
    .attr("width", ccx * cw)
    .attr("height", ccy * ch)

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

var bots = [
  new Bot(4,4, Direction.UP, ["move", "left", "move", "move"]),
  new Bot(1,1, Direction.RIGHT, ["move"]),
  new Bot(1,5, Direction.LEFT, ["move", "left", "move", "right"]),
  new Bot(3,7, Direction.DOWN, ["move"])
  ];

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

var animateInterval = setInterval("animate()", CYCLE_DUR)

