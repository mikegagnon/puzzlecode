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

  document
    .getElementById("helpButton")
    .addEventListener("click", helpButtonClick);
}

// These event handlers are registered in main.js and in index.html
function windowOnLoad() {
  setupCodeMirrorBox()
  registerEventHandlers()

  // TODO: where should i put this?
  ANIMATE_INTERVAL = setInterval("animate()", CYCLE_DUR)
  nonBotAnimateInterval = setInterval("nonBotAnimate()", NON_BOT_CYCLE_DUR)

  var campaign = PUZZLE_CAMPAIGN
  var state = PUZZLE_CAMPAIGN_STATE

  loadWorldMenu(campaign, state)
  showOrHideLevelMenu(state) 

  loadLevel(campaign, state)
  restartSimulation()

  // Add popover contents
  // TODO: go back doesn't work
  $("#helpButton").popover({
    html : true,
    trigger : "manual",
    title : "<h3>How to play Puzzle Code</3>",
    placement: "top",
    content : "<p><a href='javascript: beginTutorial()'>Begin the walkthrough tutorial</a></p>" + 
      "<p><a href='javascript: clearTutorial()'>Cancel</a></p>"
  })

  $("#boardDiv").popover({
    html : true,
    trigger : "manual",
    title : "<h3>This is the game board</3>",
    placement: "top",
    content : 
      "<p>Try to collect all the <strong>gold coins</strong> "
      + "using your <strong>blue robot</strong>.</p>"
      + "<p>However, you cannot move your robot using your mouse or keyboard...</p>"
      + "<p><a href='javascript: tutorialProgramEditor()'>Continue</a></p>"
      + "<p><a href='javascript: helpButtonClick()'>Go back</a></p>"
      + "<p><a href='javascript: clearTutorial()'>Cancel</a></p>"
  })

  $("#code-mirror-wrapper").popover({
    html : true,
    trigger : "manual",
    title : "<h3>This is the program editor</3>",
    placement: "top",
    content :
      "<p>You must tell your robot what to do by "
      + 'writing a <strong>"program."</strong></p> '
      + "<p>A program is just "
      + "<strong>a list of instructions</strong> that your robot will follow exactly. "
      + "</p>"
      + "<p><a href='javascript: tutorialProgramEditor()'>Continue</a></p>"
      + "<p><a href='javascript: beginTutorial()'>Go back</a></p>"
      + "<p><a href='javascript: clearTutorial()'>Cancel</a></p>"
  })

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
  d3.select("#pauseplay").attr("class", "btn menu-button")
  CODE_MIRROR_BOX.setOption("theme", DISABLED_CODE_THEME)
}

function doResume() {
  PLAY_STATUS = PlayStatus.PLAYING
  pausePlay.innerHTML = 'Pause'
  d3.select("#pauseplay").attr("class", "btn menu-button")
  d3.select("#restart").attr("class", "btn menu-button")

  d3.select("#messageBoxDiv")
    .attr("class", "alert alert-block alert-success")
  d3.select("#messageBoxHeader")
    .text("Tip:")
  d3.select("#messageBox")
    .html("<h3>To edit your program, click 'Reset'</h3>")

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
  d3.select("#pauseplay").attr("class", "btn menu-button")
  CODE_MIRROR_BOX.setOption("theme", DISABLED_CODE_THEME)

  d3.select("#messageBoxDiv")
    .attr("class", "alert alert-block alert-success")
  d3.select("#messageBoxHeader")
    .text("Tip:")
  d3.select("#messageBox")
    .html("<h3>To edit your program, click 'Reset'</h3>")

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
      d3.select("#pauseplay").attr("class", "btn disabled menu-button")
      d3.select("#stepButton").attr("class", "btn disabled menu-button")
    } else {
      if (HELP_BUTTON_CLICKED) {
        d3.select("#pauseplay").attr("class", "btn btn-primary menu-button")
        d3.select("#helpButton").attr("class", "btn help-button menu-button")
      } else {
        d3.select("#pauseplay").attr("class", "btn menu-button")
      }
      d3.select("#stepButton").attr("class", "btn menu-button")
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
    d3.select("#messageBox").html("<h3>You must fix the errors  " +
      "before you can run your program.</h3>")
  } else {
    // TODO: put this comm functionality in function
    d3.select("#messageBox")
    d3.select("#messageBoxDiv")
      .attr("class", "alert alert-block alert-success")
    d3.select("#messageBoxHeader")
      .text("Tip:")
    if (HELP_BUTTON_CLICKED) {
      d3.select("#messageBox")
        .html("<h3>Click the 'Run!' button to run your program</h3>")
    } else {
      d3.select("#messageBox")
        .html("<h3>Click the blue 'Help' button, below</h3>")
    }
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
  d3.select("#messageBox").html("<h3>Click the 'Run!' button to run your program</h3>")
  d3.select("#restart").attr("class", "btn menu-button")

  cleanUpVisualization()

  BOARD = loadBoard(PUZZLE_CAMPAIGN, PUZZLE_CAMPAIGN_STATE)

  var program = compile()
  setBotProgram(BOARD, PROGRAMING_BOT_INDEX, program)

  initializeVisualization(PUZZLE_CAMPAIGN, PUZZLE_CAMPAIGN_STATE, BOARD)

}

/**
 * Help walkthrough
 *****************************************************************************/
function clearTutorial() {
  $('#helpButton').popover('hide')
  $('#boardDiv').popover('hide')
  $("#boardDiv").attr("class", "")
  compile()
}

function helpButtonClick() {
  clearTutorial()
  $('#helpButton').popover('show')
  HELP_BUTTON_CLICKED = true
  d3.select("#helpButton").attr("class", "btn help-button menu-button")

}

// TODO: consistent names for tutorial funcions
function beginTutorial() {
  clearTutorial()
  $("#boardDiv").attr("class", "glow-focus")
  $('#boardDiv').popover('show')
}

// TODO: add go-back button
function tutorialProgramEditor() {
  clearTutorial()
  // TODO: this glow doesn't look very good
  $("#code-mirror-wrapper").attr("class", "glow-focus")
  $('#code-mirror-wrapper').popover('show')
}


/**
 * When the user clicks a level
 *****************************************************************************/
function clickLevel(world_index, level_index) {
  $("#victoryModal").modal('hide')
  cleanUpVisualization()

  var campaign = PUZZLE_CAMPAIGN
  var state = PUZZLE_CAMPAIGN_STATE

  state.current_level.world_index = world_index
  state.current_level.level_index = level_index

  loadLevel(campaign, state)
  restartSimulation()
}
