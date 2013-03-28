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

  CODE_MIRROR_BOX = CodeMirror(document.getElementById("codeMirrorEdit"), settings)

  CODE_MIRROR_BOX_NON_EDIT = CodeMirror(document.getElementById("codeMirrorNonEdit"),
    cloneDeep(settings, { readOnly: "nocursor" }))
  CODE_MIRROR_BOX_NON_EDIT.setValue(CODE_MIRROR_BOX.getValue())

  d3.select("#codeMirrorNonEdit").attr("style", "display: none")

  restartSimulation()
  doPlay()

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
  pausePlay.innerHTML = 'Play!'

  // TODO: cover text box in gray
  // TODO: determine state machine for all possible ways text editor should
  // become disabled, re-enabled put these in own function
  d3.select("#codeMirrorNonEdit").attr("style", "display:none")
  d3.select("#codeMirrorEdit").attr("style", "")

  var programText = CODE_MIRROR_BOX.getValue() 
  CODE_MIRROR_BOX_NON_EDIT.setValue(programText)
  var program = compileRobocom(programText)
  addLineComments(CODE_MIRROR_BOX_NON_EDIT, program.lineComments)

}

function doPlay() {
  if (BOARD.bots.length > 0) {
    PLAY_STATUS = PlayStatus.PLAYING
    pausePlay.innerHTML = 'Pause'
    d3.select("#codeMirrorNonEdit").attr("style", "")
    d3.select("#codeMirrorEdit").attr("style", "display:none")

  }
}

function togglePausePlay() {
  // TODO: determine is this is threadsafe in JS
  if (PLAY_STATUS == PlayStatus.PAUSED) {
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
  var programText = CODE_MIRROR_BOX.getValue()
  var program = compileRobocom(programText)
  addLineComments(CODE_MIRROR_BOX, program.lineComments)

  BOARD.initCoins = [
      {x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
      {x:4, y:1}
    ]

  BOARD.coins = _.clone(BOARD.initCoins)

  BOARD.coinsCollected = 0
  drawCoins()

  if (program.instructions != null) {
    BOARD.bots = initBots(BOARD, program)
    drawBots()
  }

  BOARD.blocks = [
      {x:1, y:2},
      {x:2, y:2},
      {x:3, y:2},
    ]
  drawBlocks()

}
