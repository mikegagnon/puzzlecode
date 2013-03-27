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

function clone(selector) {
    var node = d3.select(selector).node();
    return d3.select(node.parentNode.insertBefore(node.cloneNode(true),
node.nextSibling));
}

function nonBotAnimate() {
  // TODO: animate coins rotating or something
}

function animateCoins(coins, bots) {

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

function animate() {
    if (playStatus == PlayStatus.PAUSED) {
      return;
    }

    var prevCoins = _.clone(BOARD.coins)
    step(BOARD.bots)

    animateCoins(prevCoins, BOARD.bots)

    var transition = d3.selectAll(".bot").data(BOARD.bots).transition()

    transition.filter( function(bot) {
           return "rotate" in bot.animations
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
        var move = bot.animations.move
        return move != undefined && !move.torus
      })

    moveNonTorus
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
          var x = bot.animations.move.prevX * cw + BOT_PHASE_SHIFT
          var y = bot.animations.move.prevY * ch + BOT_PHASE_SHIFT
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
          var x = bot.animations.move.oobNextX  * cw + BOT_PHASE_SHIFT
          var y = bot.animations.move.oobNextY  * ch + BOT_PHASE_SHIFT
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
          var x = bot.animations.move.oobPrevX * cw + BOT_PHASE_SHIFT
          var y = bot.animations.move.oobPrevY * ch + BOT_PHASE_SHIFT
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
  d3.selectAll(".coin").remove()
  d3.selectAll(".botClone").remove()
}
 
function createBoard() {
  vis = d3.select("#board")
    .attr("class", "vis")
    .attr("width", ccx * cw)
    .attr("height", ccy * ch)
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
    .attr("x", function(d) { return d.x * cw })
    .attr("y", function(d) { return d.y * ch })
    .attr("width", cw)
    .attr("height", ch)

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
    .attr("cx", function(d){ return d.x * cw + cw/2 } )
    .attr("cy", function(d){ return d.y * ch + ch/2} )
}

function drawBots() {
  vis.selectAll(".bot")
    .data(BOARD.bots)
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
}
