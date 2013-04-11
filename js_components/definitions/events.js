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

/**
 * Code for the windowOnLoad event
 *****************************************************************************/

function registerEventHandlers() {
  pausePlay = document.getElementById("pauseplay")
  pausePlay
    .addEventListener("click", togglePausePlay);

  document
    .getElementById("stepButton")
    .addEventListener("click", stepButtonClick);

  document
    .getElementById("restart")
    .addEventListener("click", restartSimulation);
}

// These event handlers are registered in main.js and in index.html
function windowOnLoad() {

  registerEventHandlers()

  // TODO: where should i put this?
  ANIMATE_INTERVAL = setInterval("animate()", CYCLE_DUR)
  nonBotAnimateInterval = setInterval("nonBotAnimate()", NON_BOT_CYCLE_DUR)

  loadCampaign(PUZZLE_CAMPAIGN, PUZZLE_CAMPAIGN_STATE)
}

/**
 * Code for the speed drop down menu
 *****************************************************************************/

function setSpeed(speed) {
  var speedText = document.getElementById("speedText")

  ANIMATION_DUR = speed[0]
  CYCLE_DUR = speed[1]
  EASING = speed[3]
  speedText.innerHTML = speed[2]
  clearInterval(ANIMATE_INTERVAL)
  ANIMATE_INTERVAL = setInterval("animate()", CYCLE_DUR)
}

/**
 * Code for pause / play / resume button
 *****************************************************************************/

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
  setBotProgram(BOARD, PROGRAMING_BOT_INDEX, program)
  if (program.instructions != null) {
    doResume()
  }
}

// handles clicks on the #pauseplay button
function togglePausePlay() {
  if (PLAY_STATUS == PlayStatus.INITAL_STATE_PAUSED) {
    doRun()
  } else if (PLAY_STATUS == PlayStatus.PAUSED) {
    doResume()
  } else {
    doPause()
  }
}

/**
 * Code for the #stepButton
 *****************************************************************************/

function doFirstStep() {
  var program = compile()
  setBotProgram(BOARD, PROGRAMING_BOT_INDEX, program)
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

// handles clicks for the #stepButton
function stepButtonClick() {
  if (PLAY_STATUS == PlayStatus.INITAL_STATE_PAUSED) {
    doFirstStep()
  } else {
    doStep()
  }
}

// TODO: take codeMirrorBox parameter
function compile() {
  var programText = CODE_MIRROR_BOX.getValue()
  var program = compileRobocom(programText)
  addLineComments(CODE_MIRROR_BOX, program.lineComments)

  // Enable or disable the #pausePlay and #stepButton buttons
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

  // Update the messageBox
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

/**
 * Code for the #restart button
 *****************************************************************************/

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

  BOARD = loadBoard(PUZZLE_CAMPAIGN, PUZZLE_CAMPAIGN_STATE)

  var program = compile()
  setBotProgram(BOARD, PROGRAMING_BOT_INDEX, program)

  initializeVisualization(PUZZLE_CAMPAIGN, PUZZLE_CAMPAIGN_STATE, BOARD)

}
