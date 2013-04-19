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

  // TODO: the tutorial is a mess. Reorganize and make clean.
  // Also, there are some bugs. Need to test corner cases.
  // TODO: add a hint button
  $("#helpButton").popover({
    html : true,
    trigger : "manual",
    title : "<h4>How to play Puzzle Code</h4>",
    placement: "top",
    content :
      "<div class='btn-group'>"
      + "<a class='btn' href='javascript: clearTutorial()'>Cancel</a>"
      + "<a class='btn btn-primary' href='javascript: beginTutorial()'>Begin tutorial</a>"
      + "</div>"
  })

  $("#boardDiv").popover({
    html : true,
    trigger : "manual",
    title : "<h4>This is the game board <a class='close' href='javascript: clearTutorial()''>&times;</a></h4>",
    placement: "top",
    content : 
      "<p>Try to collect the <strong>gold coins</strong> "
      + "using your <strong>robot</strong>. <img src='img/bot.png'></p>"
      + "<div class='btn-group'>"
      + "<a class='btn' href='javascript: helpButtonClick()'>Back</a>"
      + "<a class='btn btn-primary' href='javascript: tutorialProgramEditor1()'>Continue</a>"
      + "</div>"
  })

  // TODO: only say what the current program is if it actually matches up
  // with the current program
  $("#code-mirror-wrapper").popover({
    html : true,
    trigger : "manual",
    title : "<h4>This is the Program Editor <a class='close' href='javascript: clearTutorial()''>&times;</a></h4>",
    placement: "top",
    content :
      "<p>You must tell your robot what to do by "
      + 'writing a <strong>"program."</strong></p> '
      + "<p>A program is just "
      + "<strong>a list of instructions</strong> that your robot will follow <strong>exactly</strong>. "
      + "</p>"
      + "<p>The current program tells the robot to move forward twice, turn left, "
      + "then move forward twice again.</p>"
      + "<div class='btn-group'>"
      + "<a class='btn' href='javascript: beginTutorial()'>Back</a>"
      + "<a class='btn btn-primary' href='javascript: tutorialProgramEditor2()'>Continue</a>"
      + "</div>"
  })

  $("#code-mirror-wrapper2").popover({
    html : true,
    trigger : "manual",
    title : "<h4>Editing your program <a class='close' href='javascript: clearTutorial()''>&times;</a></h4>",
    placement: "top",
    content :
      "You don't need to edit your program now, but when you "
      + "want to, you can edit your program by typing like this (for example): <div style='width:500px'><img src='img/editor_typing.gif'></div>"
      + "<div class='btn-group'>"
      + "<a class='btn' href='javascript: tutorialProgramEditor1()'>Back</a>"
      + "<a class='btn btn-primary' href='javascript: tutorialProgramEditor3()'>Continue</a>"
      + "</div>"
  })

  $("#code-mirror-wrapper3").popover({
    html : true,
    trigger : "manual",
    title : "<h4>Step through your program <a class='close' href='javascript: clearTutorial()''>&times;</a></h4>",
    placement: "top",
    content :
      "<p>"
      + "You can run your program, <strong>one step at a time</strong>, "
      + "by clicking the <strong>Step</strong> button (above the game board)."
      + "</p>"
      + "<p><strong>Try it now</strong>.</p>"
      + "<p>Note: If your program has errors, you must fix them before you "
      + "can step through your program.</p>"
      + "<div class='btn-group'>"
      + "<a class='btn' href='javascript: tutorialProgramEditor2()'>Back</a>"
      + "</div>"
  })

  $("#code-mirror-wrapper4").popover({
    html : true,
    trigger : "manual",
    title : "<h4>Watch your robot run <a class='close' href='javascript: clearTutorial()''>&times;</a></h4>",
    placement: "top",
    content :
      "<p>Your robot just <strong>executed one of your instructions</strong>.</p>"
      + "<p>(1) Notice how the <strong>game board</strong> has changed.</p>"
      + "<p>(2) Also notice, the program editor has <strong>highlighted</strong> the instruction "
      + "your robot just executed.</p>"
      + "<p>Keep stepping through your program until your program finishes.</p>"
      + "<div class='btn-group'>"
      + "<a class='btn' href='javascript: tutorialProgramEditor3()'>Back</a>"
      + "</div>"
  })

  $("#code-mirror-wrapper5").popover({
    html : true,
    trigger : "manual",
    title : "<h4>Your program has finished <a class='close' href='javascript: clearTutorial()''>&times;</a></h4>",
    placement: "top",
    content :
      "<p>Your robot probably did not accomplish its objective (collect "
      + "all the gold coins).</p>"
      + "<p><strong>That's OK!</strong> <i class='icon-thumbs-up'></i></p>"
      + "<p><strong>To try again, click the <strong>Reset</strong> button, edit "
      + "your program and run it again.</strong></p>"
      + "<p>You have now completed the tutorial!</p>"
      + "<div class='btn-group'>"
      + "<a class='btn btn-primary' href='javascript: clearTutorial()'>Exit tutorial</a>"
      + "</div>"
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

  if (TUTORIAL_STEP_BUTTON_ACTIVE) {
    // if the bot has finished
    if ("encourage_reset" in BOARD.visualize.step.general) {
      tutorialProgramEditor5()
    } else {
      tutorialProgramEditor4NoPopover()
    }
  }
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

// TODO: take codeMirrorBox parameter
function compile() {
  var programText = CODE_MIRROR_BOX.getValue()
  var program = compileRobocom(programText)
  addLineComments(CODE_MIRROR_BOX, program.lineComments)

  // Enable or disable the #pausePlay and #stepButton buttons
  if (PLAY_STATUS == PlayStatus.INITAL_STATE_PAUSED) {
    if (program.instructions == null) {
      disableButton("#pauseplay")
      disableButton("#stepButton")
    } else {
      enableButton("#pauseplay")
      enableButton("#stepButton")
      if (HELP_BUTTON_CLICKED) {
        if (!TUTORIAL_ACTIVE) {
          setPrimaryButton("#pauseplay")
        }
      } else {
        setPrimaryButton("#helpButton")
      }
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

function updatePopover(target, newPopover) {
  $(target).data('popover', null).popover(newPopover)
}

// hides all popovers except show
function clearTutorial(show) {
  var POPOVERS = [
    "#helpButton",
    "#boardDiv",
    "#code-mirror-wrapper",
    "#code-mirror-wrapper2",
    "#code-mirror-wrapper3",
    "#code-mirror-wrapper4",
    "#code-mirror-wrapper5",
  ]
  for (i in POPOVERS) {
    var popover = POPOVERS[i]
    if (popover != show) {
      $(popover).popover("hide")
    }
  }

  $("#boardDiv").attr("class", "board")
  $("#code-mirror-wrapper").attr("class", "code-mirror-wrapper")

  TUTORIAL_ACTIVE = false
  TUTORIAL_STEP_BUTTON_ACTIVE = false
}

// TODO: when player clicks help, make sure the message box is visible
function helpButtonClick() {
  clearTutorial("#helpButton")
  $("#helpButton").popover("show")
  HELP_BUTTON_CLICKED = true
  noPrimaryButtons()
}

// TODO: consistent names for tutorial funcions
function beginTutorial() {
  clearTutorial("#boardDiv")
  TUTORIAL_ACTIVE = true
  $("#boardDiv").attr("class", "board glow-focus")
  $('#boardDiv').popover('show')
  noPrimaryButtons()
}

function tutorialProgramEditor1() {
  clearTutorial("#code-mirror-wrapper")
  TUTORIAL_ACTIVE = true
  $("#code-mirror-wrapper").attr("class", "glow-focus code-mirror-wrapper")
  $('#code-mirror-wrapper').popover('show')
  noPrimaryButtons()
}

function tutorialProgramEditor2() {
  clearTutorial("#code-mirror-wrapper2")
  TUTORIAL_ACTIVE = true
  $("#code-mirror-wrapper").attr("class", "glow-focus code-mirror-wrapper")
  $('#code-mirror-wrapper2').popover('show')
  noPrimaryButtons()
}

function tutorialProgramEditor3() {
  clearTutorial("#code-mirror-wrapper3")
  TUTORIAL_ACTIVE = true
  TUTORIAL_STEP_BUTTON_ACTIVE = true

  $("#code-mirror-wrapper").attr("class", "glow-focus code-mirror-wrapper")
  $('#code-mirror-wrapper3').popover('show')
  setPrimaryButton("#stepButton")

}

function tutorialProgramEditor4NoPopover() {
  clearTutorial("#code-mirror-wrapper4")
  TUTORIAL_ACTIVE = true
  TUTORIAL_STEP_BUTTON_ACTIVE = true  
  setPrimaryButton("#stepButton")
}

function tutorialProgramEditor4() {
  tutorialProgramEditor4NoPopover()

  $("#code-mirror-wrapper").attr("class", "glow-focus code-mirror-wrapper")
  $('#code-mirror-wrapper4').popover('show')

}

function tutorialProgramEditor5() {
  clearTutorial("#code-mirror-wrapper5")
  TUTORIAL_ACTIVE = true

  $("#code-mirror-wrapper").attr("class", "glow-focus code-mirror-wrapper")
  $('#code-mirror-wrapper5').popover('show')

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
