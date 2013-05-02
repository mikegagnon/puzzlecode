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

// TODO: split this up into several files. Right now this file includes
// simulation animations as well as other visualizations (e.g. buttons)

// Determines which button on the GUI should be highlighted
function getPrimaryButton() {

  if (TUTORIAL_ACTIVE) {
    return undefined
  }
  else if (!HELP_BUTTON_CLICKED) {
    return "#helpButton"
  }
  else if (!HINT_BUTTON_CLICKED) {
    return "#hintButton"
  }
  else {
    return "#pauseplay"
  }
}

function updatePrimaryButton() {
  var primaryButton = getPrimaryButton()
  if (typeof primaryButton != "undefined") {
    setPrimaryButton(primaryButton)
  }
}
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

// Returns an svg translation command to update the bot's __pixel__ position on
// the board and it's direction
function botTransformPixels(x, y, facing) {
  return "translate(" + x + ", " + y + ") " +
    "rotate(" + directionToAngle(facing) + " 16 16)"
}

// Like botTransformPixels, except using __cell__ position instead of __pixel__
function botTransform(bot) {
  var x = bot.cellX * CELL_SIZE
  var y = bot.cellY * CELL_SIZE
  return botTransformPixels(x, y, bot.facing)
}

/**
 * Returns a lodash collection containing "viz objects" for bots
 * that have the visualizeKey. A "viz object" is an object like: {
 *    viz: board.visualize.step.bot[bot.id][visualizeKey] 
 *    bot: the bot
 * }
 */
function getViz(board, visualizeKey) {
  return _(board.bots)
    .filter(function(bot){
      return bot.id in board.visualize.step.bot &&
        visualizeKey in board.visualize.step.bot[bot.id]
    })
    .map(function(bot) {
      return {
        viz: board.visualize.step.bot[bot.id][visualizeKey],
        bot: bot
      }
    })
}

/**
 * For each bot with the specified visualization, execute:
 *    fn(viz, bot)
 * where:
 *   viz == board.visualize.step.bot[bot.id][visualizeKey]
 */
function visualizeBot(board, visualizeKey, fn) {
  getViz(board, visualizeKey)
    .forEach(function(v) {
      fn(v.viz, v.bot)
    })
}

/**
 * For each bot with the specified visualization, execute:
 *    fn(transition, viz, bot)
 * where:
 *   transition is a d3 transition with only that bot selected
 *   viz == board.visualize.step.bot[bot.id][visualizeKey]
 * IMPORTANT NOTE: It seems that there can only be ONE transition on a bot
 * at a time, due to D3. Even if two transitions produce completely different
 * effects, it seems that merely selecting the same bot twice causes trouble.
 * Only use transitionBot if you are sure it is for an exclusive animation of
 * the bot. You can use visualizeBot() to evade this limitation.
 */
function transitionBot(board, visualizeKey, fn) {
  visualizeBot(board, visualizeKey, function(viz, bot) {
    var transition = d3.select("#" + botId(bot)).transition()
    fn(transition, viz, bot)
  })
}


function nonBotAnimate() {
  // TODO: animate coins rotating or something
}

function animateGoto(board) {

  var BLIP_RADIUS = 10

  visualizeBot(board, "goto", function(gotoViz, bot) {

    var blipId = botId(bot) + "_goto_blip"

    // TODO: design decision. This new coin appears above the bot. Should it
    // go underneath the bot? If so, how to do it?
    VIS.selectAll("#" + blipId)
      .data([bot])
    .enter().append("svg:circle")
      .attr("id", blipId)
      .attr("class", "goto-blip")
      .attr("stroke", "limegreen")
      .attr("fill", "lime")
      .attr("opacity", "1.0")
      .attr("r", BLIP_RADIUS)
      .attr("cx", function(d){ return d.cellX * CELL_SIZE + CELL_SIZE/2} )
      .attr("cy", function(d){ return d.cellY * CELL_SIZE + CELL_SIZE/2} )
    .transition()
      .attr("opacity", "0.0")
      .delay(ANIMATION_DUR / 4)
      .ease("cubic")
      .duration(ANIMATION_DUR * 3 / 4)
      // garbage collect the blip
      .each("end", function() {
        d3.select(this).remove()
      })
  })
}

function animateTraps(board) {

  if ("traps" in board.visualize.step.general) {
    var traps = board.visualize.step.general.traps
    _(traps)
      .forEach(function(trap){
      var trapId = "trap_" + trap.x + "_" + trap.y

      VIS.selectAll("#" + trapId)
        .data([trap])
      .enter().append("svg:rect")
        .attr("id", trapId)
        .attr("class", "trap_animate")
        .attr("stroke", "white")
        .attr("fill", "darkred")
        .attr("x", trap.x * CELL_SIZE)
        .attr("y", trap.y * CELL_SIZE)
        .attr("width", CELL_SIZE)
        .attr("height", 0)
      .transition()
        .attr("height", CELL_SIZE / 2)
        .ease("linear")
        .duration(ANIMATION_DUR)
        .each("end", function() {
          // garbage collect the trap
          d3.select(this).remove()

          // garbage collect the bot
          d3.selectAll("#" + botId(trap.bot)).remove()
        })

      VIS.selectAll("#" + trapId + "_part2")
        .data([trap])
      .enter().append("svg:rect")
        .attr("id", trapId)
        .attr("class", "trap_animate")
        .attr("stroke", "white")
        .attr("fill", "darkred")
        .attr("x", trap.x * CELL_SIZE)
        .attr("y", (trap.y + 1) * CELL_SIZE)
        .attr("width", CELL_SIZE)
        .attr("height", 0)
      .transition()
        .attr("y", (trap.y + 0.5) * CELL_SIZE)
        .attr("height", CELL_SIZE / 2)
        .ease("linear")
        .duration(ANIMATION_DUR)
        // garbage collect the trap
        .each("end", function() {
          d3.select(this).remove()
        })
      })
  }
}

function animateCoinCollection(board) {

  /**
   * NOTE: I found that animations would interfere with each other on fast
   * speeds if I used d3.selectAll (presumably due to race conditions).
   * I fixed this issue by using d3.select to only select the svg elements
   * that will actually be animated. It will probably be good to follow this
   * approach elsewhere.
   */

  visualizeBot(board, "coin_collect", function(coin, bot) {
    // remove the actual coin
    VIS.select("#" + coinId(coin)).remove()

    var cloneCoinId = coinId(coin) + "_clone"

    // TODO: design decision. This new coin appears above the bot. Should it
    // go underneath the bot? If so, how to do it?
    var newCoin = VIS.selectAll("#" + cloneCoinId)
      .data([coin])
      .enter().append("svg:circle")
      .attr("id", cloneCoinId)

    drawCoin(newCoin)
      .attr("class", "coinExplosion")
      .transition()
      .attr("r", COIN_EXPLODE_RADIUS)
      .attr("opacity", "0.0")
      .delay(ANIMATION_DUR / 4)
      .ease("cubic")
      .duration(ANIMATION_DUR)
  })
}

function animateFailMove(board) {

  // number of pixels to move the bot forward before stopping
  var MOVE_DEPTH = 6

  transitionBot(board, "failMove", function(transition, failMove, bot) {
    transition
      // First, move the bot forward MOVE_DEPTH pixels
      .attr("transform", function(bot) {
        // dx == number of pixels bot will move in x direction
        var dx = 0
        // similar for dy
        var dy = 0
        if (bot.cellX != failMove.destX) {
          var diff = failMove.destX - bot.cellX
          assert(diff == 0 || Math.abs(diff) == 1, "X: diff == 0 || diff == 1")
          dx = diff * MOVE_DEPTH
        }
        if (bot.cellY != failMove.destY) {
          var diff = failMove.destY - bot.cellY
          assert(diff == 0 || Math.abs(diff) == 1, "Y: diff == 0 || diff == 1")
          dy = diff * MOVE_DEPTH
        }
        var x = bot.cellX * CELL_SIZE + dx
        var y = bot.cellY * CELL_SIZE + dy
        return botTransformPixels(x, y, bot.facing)
      })
      .ease("cubic")
      .duration(ANIMATION_DUR / 2)
      .each("end", function() {
        // now back the bot up to where it was before
        d3.select(this).transition() 
          .attr("transform", botTransform)
      })
      .ease(EASING)
      .duration(ANIMATION_DUR / 2)
  })
}

function animateRotate(board) {
  transitionBot(board, "rotate", function(transition) {
    transition
      .attr("transform", botTransform)
      .ease(EASING)
      .duration(ANIMATION_DUR)
  })
}


function animateMoveNonTorus(board) {
  transitionBot(board, "nonTorusMove", function(transition) {
    transition
      .attr("transform", botTransform)
      .ease(EASING)
      .duration(ANIMATION_DUR)
  })
}

function animateProgramDone(board) {

  visualizeBot(board, "programDone", function(programDone, bot) {

    var progDoneId = "programDone_" + botId(bot)
    VIS.selectAll("#" + progDoneId)
      .data([bot])
      .enter()
      .append("svg:use")
      .attr("id", progDoneId)
      .attr("class", "xTemplate")
      .attr("xlink:href", "#xTemplate")
      .attr("transform", botTransform)
      .attr("opacity", "0.0")
    .transition()
      .attr("opacity", "0.75")
      .delay(ANIMATION_DUR)
      .ease(EASING)
      .duration(ANIMATION_DUR / 2)

  })

  return

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
    .each("end", function(){
      // TODO: highlight the restart button iff you detect a level "failure"
      // i.e., if it becomes impossible to accomplish the objective
      d3.select("#restart").attr("class", "btn btn-primary menu-button")
    })
}

function animateMoveTorus(board) {

  transitionBot(board, "torusMove", function(transition, torusMove, bot) {

    var cloneBotId = botId(bot) + "_clone"

    // Step 1: clone the bot and slide it out of view
    // TODO: for some reason this works with selectAll but not select
    VIS.selectAll("#" + cloneBotId)
      .data([bot])
      .enter()
      .append("svg:use")
      // The clone starts at the previous location of the bot
      .attr("id", cloneBotId)
      .attr("class", "bot")
      .attr("xlink:href", "#botTemplate")
      .attr("transform", function(bot) {
        return botTransform({
            cellX: torusMove.prevX,
            cellY: torusMove.prevY,
            facing: bot.facing
          })
      })
      .transition()
      // the clone slides out of view
      .attr("transform", function(bot) {
        return botTransform({
            cellX: torusMove.oobNextX,
            cellY: torusMove.oobNextY,
            facing: bot.facing
          })
      })
      .ease(EASING)
      .duration(ANIMATION_DUR)
      // garbage collect the bot clone
      .each("end", function() {
        d3.select(this).remove()
      })


    // Step 2: move the original bot to the other side of the screen, and
    // slide it into view
    transition
      // First, immediately move the bot to the other side of the board (out
      // of bounds)
      .attr("transform", function(bot) {
        return botTransform({
          cellX: torusMove.oobPrevX,
          cellY: torusMove.oobPrevY,
          facing: bot.facing
        })
      })
      .ease(EASING)
      .duration(0)
      // once the bot is on the other side of the screen, move it like normal
      .each("end", function() {
        d3.select(this).transition() 
          .attr("transform", botTransform)
          .ease(EASING)
          .duration(ANIMATION_DUR)
      })
  })

}

/**
 * turn off line highlighting for a particular line style
 * css is the name of the css class that styles the highlighted line
 * the line that is highlighted with css will be unhighlighted
 */
function undoHighlightLine(code_mirror_box, css) {
  var identifier = "_" + css
  if (identifier in code_mirror_box) {
    var lineHandle = code_mirror_box[identifier]
    code_mirror_box.removeLineClass(lineHandle, "background", css);
  }
}

/**
 * update the line highlighting for a particular css style
 * lineIndex is the line to be highlighted (the old line will be unhighlighted)
 * css is the name of the css class that will style the highlighted line
 * inspired by http ://codemirror.net/demo/activeline.html
 */
function highlightLine(code_mirror_box, lineIndex, css) {

  // first remove any previous highlighting for css
  undoHighlightLine(code_mirror_box, css)

  console.log("highlightLine = " + lineIndex)
  var lineHandle = code_mirror_box.getLineHandle(lineIndex)
  var identifier = "_" + css
  if (code_mirror_box[identifier] != lineHandle) {
    cm.addLineClass(lineHandle, "background", css)
    code_mirror_box[identifier] = lineHandle
  }
}

// animate the program's text
function animateProgram(board) {

  var cm = CODE_MIRROR_BOX

  // If the animation is too fast, turn off line highlighting
  if (CYCLE_DUR < MAX_HIGHLIGHT_SPEED) {
    undoHighlightLine(cm, BACK_CLASS)
    undoHighlightLine(cm, NEXT_BACK_CLASS)
  }

  // TODO: find the bot currently being traced and only animate that bot's prog
  if (board.bots.length == 0) {
    return
  }

  var bot = board.bots[board.visualize.programming_bot_index]
  if (!(bot.id in board.visualize.step.bot)) {
    return
  }

  var bot_viz = board.visualize.step.bot[bot.id]

  // if animation is slow enough
  if (CYCLE_DUR >= MAX_HIGHLIGHT_SPEED) {
    if ("lineIndex" in bot_viz) {
      highlightLine(cm, bot_viz.lineIndex, BACK_CLASS)
    }

    if ("nextLineIndex" in bot_viz) {
      highlightLine(cm, bot_viz.nextLineIndex, NEXT_BACK_CLASS)
    }
  }

}

function animateEncourageReset(board) {
  if ("encourage_reset" in board.visualize.step.general) {
    setTimeout(function(){
      setPrimaryButton("#restart")
    }, ANIMATION_DUR)
  }
}

function animateMarkers(board) {

  _(getMarkers(board))
    .groupBy(markerId)
    // convert markers into colors
    // essentially a flatMap, since the null values that are returned are
    // "compact"ed
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

// lowerBound is inclusive
// upperBound is exclusive
function randInt(lowerBound, upperBound) {
  assert(upperBound > lowerBound, "randInt: " + upperBound + " > " + lowerBound)
  var range = upperBound - lowerBound
  return lowerBound + Math.floor(Math.random() * range)
} 

// returns a random x-pixel coordinate somehwere on the board
function randX(board) {
  return randInt(0, board.num_cols * CELL_SIZE)
}

// returns a random y-pixel coordinate somehwere on the board
function randY(board) {
  return randInt(0, board.num_rows * CELL_SIZE)
}

function animateVictoryBalls(board, state) {

  if (!("victory" in board.visualize.step.general)) {
    return
  }

  var NUM_BALLS = 15
  var centerX = board.num_cols * CELL_SIZE / 2
  var centerY = board.num_rows * CELL_SIZE / 2

  var maxRadius = board.num_rows * CELL_SIZE * 2 / 3
  var minRadius = CELL_SIZE * 2

  // array of  cell coordinates
  var victoryBalls = _.range(NUM_BALLS)
    .forEach(function(ball_index) {

      var ballId = "victoryBall_" + ball_index

      VIS.selectAll("#" + ballId)
        .data([ball_index])
        .enter()
        .append("svg:circle")
        .attr("id", ballId)
        .attr("class", "victory-ball")
        .attr("stroke", "limegreen")
        .attr("stroke-width", "50")
        .attr("fill", "lime")
        .attr("opacity", "1.0")
        .attr("r", 0)
        .attr("cx", centerX)
        .attr("cy", centerY)
        .transition()
        .delay(ANIMATION_DUR + VICTORY_DUR * Math.random())
        .attr("cx", function(){ return randX(board) })
        .attr("cy", function(){ return randY(board) })
        .attr("opacity", "0.0")
        .attr("stroke-width", "0")
        .attr("r", function() { return randInt(minRadius, maxRadius) })
        .ease(EASING)
        .duration(VICTORY_DUR)
    })

  setTimeout(function(){
    doPause()
  }, ANIMATION_DUR);
}

// TODO: breakup into smaller functions
function animate() {
  if (PLAY_STATUS != PlayStatus.PLAYING) {
    return;
  } else {
    stepAndAnimate()
  }
}
 
function drawBoardContainer(board) {

  var height = board.num_rows * CELL_SIZE

  VIS = d3.select("#board")
    .attr("class", "vis")
    .attr("width", board.num_cols * CELL_SIZE)
    .attr("height", height)

  CODE_MIRROR_BOX.setSize("100%", height + "px")

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

function botId(bot) {
  return "bot_" + bot.id
}

function markerId(marker) {
  return "marker_" + marker.x + "_" + marker.y + "_" + marker.quadrant
}

function drawCoin(d3Element) {
  return d3Element
    .attr("class", "coin")
    .attr("stroke", "goldenrod")
    .attr("fill", "gold")
    .attr("opacity", "1.0")
    .attr("r", COIN_RADIUS)
    .attr("cx", function(d){ return d.x * CELL_SIZE + CELL_SIZE/2 } )
    .attr("cy", function(d){ return d.y * CELL_SIZE + CELL_SIZE/2} )
}

function drawCoins() {

  // first create the coin svg elements
  VIS.selectAll(".coin")
    .data(BOARD.coins)
    .enter().append("svg:circle")
    .attr("id", function(coin){ return coinId(coin)} )

  // Then draw each coin
  _(BOARD.coins)
    .forEach(function(coin) {
      drawCoin(VIS.selectAll("#" + coinId(coin)))
    })


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

function drawTraps(board) {
  VIS.selectAll(".trap")
    .data(board.traps)
    .enter().append("svg:rect")
    .attr("class", "block")
    .attr("fill", "black")
    .attr("width", CELL_SIZE)
    .attr("height", CELL_SIZE)
    .attr("x", function(d){ return d.x * CELL_SIZE } )
    .attr("y", function(d){ return d.y * CELL_SIZE } )  
}

function drawBlocks() {

  VIS.selectAll(".block")
    .data(BOARD.blocks)
    .enter().append("svg:use")
    .attr("class", "block")
    .attr("xlink:href", "#blockTemplate")
    .attr("transform", function(block) {
      var x = block.x * CELL_SIZE
      var y = block.y * CELL_SIZE
      return "translate(" + x + ", " + y + ") "
    })
}

function drawBots() {

  VIS.selectAll(".bot")
    .data(BOARD.bots)
    .enter().append("svg:use")
    .attr("id", botId)
    .attr("class", "bot")
    .attr("xlink:href", "#botTemplate")
    .attr("transform", botTransform)
}

function cleanUpVisualization() {
  d3.selectAll(".cell").remove()
  d3.selectAll(".bot").remove()
  d3.selectAll(".coin").remove()
  d3.selectAll(".coinExplosion").remove()
  d3.selectAll(".botClone").remove()
  d3.selectAll(".block").remove()
  d3.selectAll(".marker").remove()
  d3.selectAll(".victory-ball").remove()
  d3.selectAll(".xTemplate").remove()

  // TODO: turn off line highlighting
  undoHighlightLine(CODE_MIRROR_BOX, BACK_CLASS)
  undoHighlightLine(CODE_MIRROR_BOX, NEXT_BACK_CLASS)
}

function displayConstrains(constraints) {
  if (_(constraints).isEmpty()) {
    $("#constraintBoxDiv").attr("style", "display: none;")
  } else {
    $("#constraintBoxDiv").removeAttr("style")

    var numConstraints = _(constraints).keys().value().length
    assert(numConstraints > 0, "numConstraints > 0")

    if (numConstraints == 1) {
      $("#constraintBoxHeader").text("Constraint for this level:")
    } else {
      $("#constraintBoxHeader").text("Constraints for this level:")      
    }

    // TODO: should I sort the keys to ensure consistent ordering?
    var html = ""

    if ("max_instructions" in constraints) {
      html += "<li>Your program may contain <strong>at most "
        + constraints.max_instructions + " instructions</strong>."
        + "</li>"
    }

    $("#constraintBoxList").html(html)

  }
}

function animateVictoryModalAndMenu(board, campaign, state) {

  if (!("victory" in board.visualize.step.general)) {
    return
  }

  if ("campaign_deltas" in board.visualize.step.general) {
    var campaign_deltas = board.visualize.step.general.campaign_deltas
  } else {
    var campaign_deltas = []
  }
  
  setupVictoryModal(campaign, state, campaign_deltas)

  // wait until after the victoryBalls animation is done
  setTimeout(function(){
    $("#victoryModal").modal('show')
    showOrHideLevelMenu(state)
  }, VICTORY_DUR * 2)

}

function initHintModal(board) {
  var persist = board.visualize.persist
  if ("hint" in persist) {
    $("#hintModalBody").html(persist.hint)
  } else {
    // TODO: also disable the hint button
    $("#hintModalBody").html("No hint")    
  }
}

// assumes board has already been initialized
function initializeVisualization(campaign, state, board) {

  initHintModal(board)

  drawBoardContainer(board)
  drawCells(board)
  drawInitMarkers(board)
  drawTraps(board)

  // TODO: refactor so that you pass board as a param
  drawCoins()
  drawBots()
  drawBlocks()
}



// called periodically by a timer
function stepAndAnimate() {
  var board = BOARD

  // advance the simulation by one "step"
  step(board, PUZZLE_CAMPAIGN, PUZZLE_CAMPAIGN_STATE)

  animateProgram(board)

  // TODO: delete BOARD.initCoins
  animateCoinCollection(board)

  // TODO: consider an alternative design, where instead of passing the board
  // to each animation function pass it only the bots for that animation.
  // This way you can do board.bots.groupBy(animation) in one pass.
  animateGoto(board)
  animateTraps(board)
  animateFailMove(board)
  animateRotate(board)
  animateMoveNonTorus(board)
  animateMoveTorus(board)
  animateProgramDone(board)
  animateMarkers(board)
  animateVictoryBalls(board, PUZZLE_CAMPAIGN_STATE)
  animateVictoryModalAndMenu(board, PUZZLE_CAMPAIGN, PUZZLE_CAMPAIGN_STATE)
  animateEncourageReset(board)
}
