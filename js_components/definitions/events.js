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

  // BOOKMARK TODO: Setup program compilation for a particular puzzle
  var programText = PUZZLE_1.bots[0].program
  setupCodeMirrorBox(CODE_MIRROR_BOX, programText)

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
  d3.select("#restart").attr("class", "btn")

  d3.select("#messageBoxDiv")
    .attr("class", "alert alert-block alert-success")
  d3.select("#messageBoxHeader")
    .text("Tip:")
  d3.select("#messageBox")
    .text("To edit your program, click 'Reset'")

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

  d3.select("#messageBoxDiv")
    .attr("class", "alert alert-block alert-success")
  d3.select("#messageBoxHeader")
    .text("Tip:")
  d3.select("#messageBox")
    .text("To edit your program, click 'Reset'")

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
    }
  } else {
    console.error("I don't expect compile to be called unless board is reset")
  }

  if (program.instructions == null){
    d3.select("#messageBoxDiv")
      .attr("class", "alert alert-block alert-error")
    d3.select("#messageBoxHeader")
      .text("Error:")
    d3.select("#messageBox").text("You must fix the errors  " +
      "before you can run your program.")
  } else {
    // TODO: put this comm functionality in function
    d3.select("#messageBox")
    d3.select("#messageBoxDiv")
      .attr("class", "alert alert-block alert-success")
    d3.select("#messageBoxHeader")
      .text("Tip:")
    d3.select("#messageBox")
      .text("Click the 'Run!' button to run your program")
  }

  return program
}

// TODO: put in appropriate file
function loadBoard(boardConfig) {
  var board = {
    num_cols: boardConfig.num_cols,
    num_rows: boardConfig.num_rows,
    coins: cloneDeep(boardConfig.coins),
    blocks: cloneDeep(boardConfig.blocks),
    coinsCollected: 0
  }

  board.markers = newMatrix(
    board.num_cols,
    board.num_rows,
    function () {
      return newMatrix(
        Direction.NUM_DIRECTIONS,
        BotColor.NUM_COLORS, undefined)
    })

  board.bots = []

  for (var i = 0; i < boardConfig.bots.length; i++) {
    var configBot = boardConfig.bots[i]
    var program = compileRobocom(configBot.program)
    if (program.instructions == null) {
      // TODO: handle this error better
      console.error("Could not compile: " + configBot.program)
    } else {
      var bot = {
        cellX: configBot.cellX,
        cellY: configBot.cellY,
        botColor: configBot.botColor,
        facing: configBot.facing,
        ip: 0,
        program: program
      }
      console.dir(configBot)
      console.dir(bot)
      board.bots.push(bot)
    }
  }

  return board
}

// TODO put in appropriate file
function setupCodeMirrorBox(cm, programText) {
  cm.setValue(programText)
  compile()
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
  d3.select("#messageBoxDiv")
    .attr("class", "alert alert-block alert-success")
  d3.select("#messageBoxHeader")
    .text("Tip:")
  d3.select("#messageBox").text("Click the 'Run!' button to run your program")
  d3.select("#restart").attr("class", "btn")

  cleanUpVisualization()

  BOARD = loadBoard(PUZZLE_1)

  drawBoardContainer(BOARD)
  drawCells(BOARD)
  drawInitMarkers(BOARD)
  drawCoins()
  drawBots()
  drawBlocks()

}
