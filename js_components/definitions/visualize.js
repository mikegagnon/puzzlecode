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

function clone(selector) {
    var node = d3.select(selector).node();
    return d3.select(node.parentNode.insertBefore(node.cloneNode(true),
node.nextSibling));
}

function nonBotAnimate() {
  // TODO: animate coins rotating or something
  // IDEA: perhaps the reason nonBotAnimate and animateCoinCollection were
  // interferring is because they were both operating on the same svg elements
  // but they were using different transition objects.
}

function animateCoinCollection(coins, bots) {

  // need to serialize coin objects as strings so they can be used as keys
  // in the collectedCoins object
  function serial(coin) {
    return coin.x + "x" + coin.y
  }

  // TODO: how can I simply get collectedCoins.length?
  var numCollected = 0

  // object "x,y" keys for each coin being collected
  var collectedCoins = _(bots)
    .map( function(b) {
      if ("coin_collect" in b.animations) {
        numCollected += 1
        return serial(b.animations.coin_collect)
      } else {
        return null
      }
    })
    .compact()
    .object([])
    .value()

  if (numCollected > 0) {

    var trans = d3.selectAll(".coin").data(coins).transition()

    trans
      .filter( function(coin) {
        return serial(coin) in collectedCoins
      })
      .attr("r", COIN_EXPLODE_RADIUS)
      .attr("opacity", "0.0")
      .delay(ANIMATION_DUR / 4)
      .ease("cubic")
      .duration(ANIMATION_DUR)
  }
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

// TODO: breakup into smaller functions
function animate() {
    if (playStatus == PlayStatus.PAUSED) {
      return;
    }

    var prevCoins = _.clone(BOARD.coins)
    step(BOARD.bots)

    animateCoinCollection(prevCoins, BOARD.bots)

    var transition = d3.selectAll(".bot").data(BOARD.bots).transition()

    animateFailMove(transition)
    animateRotate(transition)

    var moveNonTorus = transition.filter( function(bot) {
        var move = bot.animations.move
        return move != undefined && !move.torus
      })

    moveNonTorus
        .attr("transform", function(bot) {
          var x = bot.cellX * CELL_SIZE
          var y = bot.cellY * CELL_SIZE
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
  
    torusBots = BOARD.bots.filter(function(bot) {
      var move = bot.animations.move
      return move != undefined && move.torus
    })

    vis.selectAll(".botClone")
      .data(torusBots)
    .enter().append("svg:use")
      .attr("class", "bot")
      .attr("xlink:href", "#botTemplate")
      .attr("transform", function(bot) {
          var x = bot.animations.move.prevX * CELL_SIZE
          var y = bot.animations.move.prevY * CELL_SIZE
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
          var x = bot.animations.move.oobNextX  * CELL_SIZE
          var y = bot.animations.move.oobNextY  * CELL_SIZE
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
      var move = bot.animations.move
      return move != undefined && move.torus
    })

  // TODO: optimization idea. I am concerned I am specifying unncessary
  // rotations, when really
  // the only time you need to do a rotation is during the turn instruction.
  // otherwise you can use a pre-rotate SVG element.
  torusTransition
    .attr("transform", function(bot) {
          var x = bot.animations.move.oobPrevX * CELL_SIZE
          var y = bot.animations.move.oobPrevY * CELL_SIZE
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
          var x = bot.cellX * CELL_SIZE
          var y = bot.cellY * CELL_SIZE
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
  d3.selectAll(".coin").remove()
  d3.selectAll(".botClone").remove()
  d3.selectAll(".block").remove()
}
 
function createBoard() {
  vis = d3.select("#board")
    .attr("class", "vis")
    .attr("width", ccx * CELL_SIZE)
    .attr("height", ccy * CELL_SIZE)
}

function drawCells() {

  var cells = new Array()
  for (var x = 0; x < ccx; x++) {
    for (var y = 0 ; y < ccy; y++) {
      cells.push({'x': x, 'y': y })
    }
  }

  vis.selectAll(".cell")
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

function drawCoins() {
  vis.selectAll(".coin")
    .data(BOARD.coins)
  .enter().append("svg:circle")
    .attr("class", "coin")
    .attr("stroke", "goldenrod")
    .attr("fill", "gold")
    .attr("opacity", "1.0")
    .attr("r", COIN_RADIUS)
    .attr("cx", function(d){ return d.x * CELL_SIZE + CELL_SIZE/2 } )
    .attr("cy", function(d){ return d.y * CELL_SIZE + CELL_SIZE/2} )
}

function drawBlocks() {
  vis.selectAll(".block")
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
  vis.selectAll(".bot")
    .data(BOARD.bots)
  .enter().append("svg:use")
    .attr("class", "bot")
    .attr("xlink:href", "#botTemplate")
    .attr("transform", function(bot) {
      var x = bot.cellX * CELL_SIZE
      var y = bot.cellY * CELL_SIZE
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
}
