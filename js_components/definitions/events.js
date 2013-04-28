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

// TODO: delete this and use onClick instead
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

  $('#hintModal').on('shown', hintClick)

  $("#choose-level-button").click(function() {
    PLAYER_HAS_USED_LEVEL_MENU = true
    $("#accordionLevelSelect").removeClass("glow-focus")
  });

}

// These event handlers are registered in main.js and in index.html
function windowOnLoad() {

  setupCodeMirrorBox()
  registerEventHandlers()
  setupTutorial()

  // TODO: where should i put this?
  ANIMATE_INTERVAL = setInterval("animate()", CYCLE_DUR)
  nonBotAnimateInterval = setInterval("nonBotAnimate()", NON_BOT_CYCLE_DUR)

  var campaign = PUZZLE_CAMPAIGN
  var state = PUZZLE_CAMPAIGN_STATE

  loadWorldMenu(campaign, state)
  showOrHideLevelMenu(state) 

  loadLevel(campaign, state)
  restartSimulation()

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

  // If we are in the middle of demonstrating the step button (see tutorial.js)
  // then disable the pause/play button
  if (TUTORIAL_STEP_BUTTON_ACTIVE) {
    return
  }

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

  // If we are in the middle of demonstrating the step button (see tutorial.js)
  // then we need to update the tutorial state
  if (TUTORIAL_STEP_BUTTON_ACTIVE) {

    // if the bot has finished, then we should transition out of the step
    // button demo
    if ("encourage_reset" in BOARD.visualize.step.general) {
      assert(TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED,
        "stepButtonClick: TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED")
      tutorialTransition("programEditor4", "programEditor5")
    }
    // if this is the first time the player has clicked the Step button
    // during the step button demo
    else if (!TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED) {
      // TODO: programEditor4 needs to set TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED = true
      tutorialTransition("programEditor3", "programEditor4")
    }
  }
}

function hintClick() {
  HINT_BUTTON_CLICKED = true
  compile()
}

function disableButton(button) {
  assert(button in MENU_BUTTONS, "disableButton: button in MENU_BUTTONS")
  $(button).addClass("disabled")
}

function enableButton(button) {
  assert(button in MENU_BUTTONS, "enableButton: button in MENU_BUTTONS")
  $(button).removeClass("disabled")
}

function noPrimaryButtons() {
  for (b in MENU_BUTTONS) {
    $(b).removeClass("btn-primary")
  }
}

function setPrimaryButton(button) {

  assert(button in MENU_BUTTONS, "setPrimaryButton: button in MENU_BUTTONS")

  for (b in MENU_BUTTONS) {
    if (b == button) {
      $(b).addClass("btn-primary")
    } else {
      $(b).removeClass("btn-primary")
    }
  }

}

// TODO: take codeMirrorBox parameter and board param
function compile() {
  var board = BOARD

  var programText = CODE_MIRROR_BOX.getValue()
  var program = compilePuzzleCode(programText, board)
  addLineComments(CODE_MIRROR_BOX, program.lineComments)

  if (program.constraintViolation) {
    $("#constraintBoxDiv").addClass("glow-focus")
  } else {
    $("#constraintBoxDiv").removeClass("glow-focus")    
  }

  // Enable or disable the #pausePlay and #stepButton buttons
  if (PLAY_STATUS == PlayStatus.INITAL_STATE_PAUSED) {
    if (program.instructions == null) {
      disableButton("#pauseplay")
      disableButton("#stepButton")
    } else {
      enableButton("#pauseplay")
      enableButton("#stepButton")

      updatePrimaryButton()
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

    // TODO: give a tip to click the hint button (when it is highlighted)
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
 * When the user clicks a level
 *****************************************************************************/

function clickLevel(world_index, level_index) {
  transitionLevel(world_index, level_index)
}

function transitionLevel(world_index, level_index) {

  $("#victoryModal").modal('hide')
  cleanUpVisualization()

  var campaign = PUZZLE_CAMPAIGN
  var state = PUZZLE_CAMPAIGN_STATE

  state.current_level.world_index = world_index
  state.current_level.level_index = level_index

  loadLevel(campaign, state)
  restartSimulation()
}