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
 