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

function animateProgram(board) {

  // Animation is too fast; don't highlight lines
  if (CYCLE_DUR < MAX_HIGHLIGHT_SPEED) {
    // TODO: make sure nothing is higlighted
    return
  }

  // TODO: find the bot currently being traced and only animate that bot's prog
  if (board.bots.length == 0) {
    return
  }

  var bot = board.bots[0]
  var lineNum = bot.animations.lineIndex
  var cm = CODE_MIRROR_BOX

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
  step(BOARD.bots)

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
}

function cleanUpVisualization() {
  d3.selectAll(".bot").remove()
  d3.selectAll(".coin").remove()
  d3.selectAll(".botClone").remove()
  d3.selectAll(".block").remove()

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
