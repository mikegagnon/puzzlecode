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
 * Design of the tutorial system.
 * The tutorial is divided into a number of parts.
 * TODO: document
 *****************************************************************************/

/**
 * transition from current tutorial-step to next tutorial-step
 * current and next are keys into the TUTORIAL.setup object
 * if next == "cancel", then next is ignored (it is not activated)
 * a next value of "cancel" signifies that the tutorial should be aborted,
 * and therefore nothing should be activated after the current step is
 * deactivated
 */
function tutorialTransition(current, next) {
  var setup = TUTORIAL.setup
  assert(current in setup && (next == "cancel" || next in setup),
    "tutorialTransition: current in setup && "
    + "(next == 'cancel' || next in setup)")

  setup[current].deactivate()

  if (next == "cancel") {
    compile()
  } else {
    setup[next].activate()
  }

}

// Called once during windowOnLoad to initialize the tutorial
// returns a "Tutorial" object
function setupTutorial() {
  TUTORIAL = setupTutorialObject()
  var tutorial = TUTORIAL

  _(tutorial.setup)
    .forEach(function(tutorialStep) {
      // attach the popover to the specified html element
      if ("popover_attach" in tutorialStep ||
          "popover" in tutorialStep) {
        $(tutorialStep.popover_attach).popover(tutorialStep.popover)
      }
    })
}

function getCloseButton(current) {
  return " <a "
    + "class='close' "
    + "href='javascript: tutorialTransition(\"" + current + "\", \"cancel\")'>"    
    + "&times;"
    + "</a>"
}

function setupTutorialObject() {

  var DEFAULT_POPOVER = {
    html : true,
    trigger : "manual",
    placement: "top"
  }

  function getTitle(current, text) {
    return "<h4>" + text + getCloseButton(current) + "</h4>"
  }

  /**
   * current and next are keys into TUTORIAL.setup
   * they represent the current and next tutorial steps for tutorialTransition
   * text is the text of the button
   * primary is true iff the button is the primary button
   */
  function getNavButton(current, next, text, primary) {
    if (primary) {
      var primaryClass = " btn-primary"
    } else {
      var primaryClass = ""
    }
    return "<a "
      + "class='btn" + primaryClass + "' "
      + "href='javascript: tutorialTransition(\""
          + current + "\", \""
          + next + "\")'>"
      + text
      + "</a>"
  }

  /**
   * prev, current, and next are keys into TUTORIAL.setup
   * they represent the previous, current, and next tutorial-steps 
   *
   * if prevText is given, it is used as the text to display to the user
   *    for the button to go to the previous step
   * and similarly, for nextText
   *
   * prev must always be given
   * current must always be given
   * if next is not given, then there is no next step
   * if prevText is not given, then prevText becomes "Back"
   * if nextText is not given, then prevText becomes "Continue"
   ***************************************************************************/
  function getNavigation(prev, current, next, prevText, nextText) {
    var begin = "<div class='btn-group'>"
    var end = "</div>"

    if (typeof prevText == "undefined") {
      prevText = "Back"
    }
    if (typeof nextText == "undefined") {
      nextText = "Continue"
    }

    var prevButton = getNavButton(current, prev, prevText, false)

    if (typeof next == "undefined") {
      var nextButton = ""
    } else {
      var nextButton = getNavButton(current, next, nextText, true)
    }

    return begin + prevButton + nextButton + end
  }

  var setup = {

    /**
     * The greeting that is presented when the user clicks the help button
     *************************************************************************/

    // This object describes the 'helpButton' tutorial step
    "startTutorialPrompt": {

      // A Bootstrap popover will be attached to the #helpButton html element
      popover_attach: "#helpButton",

      // Options for initializing the Bootstrap popover
      popover: cloneDeep(DEFAULT_POPOVER, {
        title: getTitle("startTutorialPrompt", "How to play Puzzle Code"),
        // HACK: the style-width is a hack to make sure the close button in the 
        // title renders well
        content: "<div style='width: 250px'>"
         + "<p>To learn the basics, click the "
         + "<strong>Begin Tutorial</strong> button.</p>"
         + "<p>For more in-depth help, visit our "
         + "<a "
         + "target='_blank' "
         + "href='"
         + WIKI_URL + "Help-for-Puzzle-Code"
         + "'>Help Page</a> (opens in a new "
         + "window).</p>"
         + getNavigation(
            "cancel",
            "startTutorialPrompt",
            "gameBoardOverview",
            "Cancel",
            "Begin tutorial")
         + "</div>"
      }),

      // This function is called to active this tutorial-step
      activate: function() {
        restartSimulation()

        // BOOKMARK TODO: get this worked out. 
        HELP_BUTTON_CLICKED = true
        TUTORIAL_ACTIVE = true
        $("#helpButton").popover("show")
        noPrimaryButtons()
      },

      // This function os called to deactivate this tutorial-step
      deactivate: function() {
        TUTORIAL_ACTIVE = false
        $("#helpButton").popover("hide")
      }
    },

    /**
     * Introduce the user to the game board
     *************************************************************************/
    "gameBoardOverview": {
      popover_attach: "#boardDiv",
      popover: cloneDeep(DEFAULT_POPOVER, {
        title: getTitle("gameBoardOverview", "This is the Game Board"),
        content: 
          "<p>Try to collect the <strong>gold coins</strong> "
          + "using your <strong>robot</strong>. <img src='img/bot.png'></p>"
          + getNavigation(
            "startTutorialPrompt",
            "gameBoardOverview",
            "programEditor1")
      }),
      activate: function() {
        $("#boardDiv").addClass("glow-focus")
        $("#boardDiv").popover('show')
      },
      deactivate: function() {
        TUTORIAL_ACTIVE = false
        $("#boardDiv").popover("hide")
        $("#boardDiv").removeClass("glow-focus")
      }
    },

    /**
     * Introduce the user to the Program Editor
     * TODO: only say what the current program is if it actually matches up
     * with the current program
     *************************************************************************/
    "programEditor1": {
      popover_attach: "#code-mirror-wrapper",
      popover: cloneDeep(DEFAULT_POPOVER, {
        title: getTitle("programEditor1", "This is the Program Editor"),
        content: 
          "<p>You must tell your robot what to do by "
          + 'writing a <strong>"program."</strong></p> '
          + "<p>A program is just "
          + "<strong>a list of instructions</strong> that your robot will "
          + "follow <strong>exactly</strong>. "
          + "</p>"
          + "<p>The current program tells the robot to move forward twice, "
          + "turn left, then move forward twice again.</p>"
          + getNavigation(
            "gameBoardOverview",
            "programEditor1",
            "programEditor2")
      }),
      activate: function() {
        $("#code-mirror-wrapper").addClass("glow-focus")
        $("#code-mirror-wrapper").popover('show')
      },
      deactivate: function() {
        TUTORIAL_ACTIVE = false
        $("#code-mirror-wrapper").popover("hide")
        $("#code-mirror-wrapper").removeClass("glow-focus")
      }
    },

    /**
     * Illustrate how to type with the program editor
     *************************************************************************/
    "programEditor2": {
      popover_attach: "#code-mirror-wrapper2",
      popover: cloneDeep(DEFAULT_POPOVER, {
        title: getTitle("programEditor2", "Editing your program"),
        content: 
          "You don't need to edit your program now, but when you "
          + "want to, you can edit your program by typing like this "
          + "(for example): <div style='width:500px'>"
          + "<img src='img/editor_typing.gif'></div>"
          + getNavigation(
            "programEditor1",
            "programEditor2",
            "programEditor3")
      }),
      activate: function() {
        $("#code-mirror-wrapper").addClass("glow-focus")
        $("#code-mirror-wrapper2").popover('show')
      },
      deactivate: function() {
        TUTORIAL_ACTIVE = false
        $("#code-mirror-wrapper2").popover("hide")
        $("#code-mirror-wrapper").removeClass("glow-focus")
      }
    },

    /**
     * Demonstrate the step button
     *************************************************************************/
    "programEditor3": {
      popover_attach: "#code-mirror-wrapper3",
      popover: cloneDeep(DEFAULT_POPOVER, {
        title: getTitle("programEditor3", "Step through your program"),
        content: 
          "<p>"
          + "You can run your program, <strong>one step at a time</strong>, "
          + "by clicking the <strong>Step</strong> button (above the game board)."
          + "</p>"
          + "<p><strong>Try it now</strong>.</p>"
          + "<p>Note: If your program has errors, you must fix them before you "
          + "can step through your program.</p>"
          + getNavigation(
            "programEditor2",
            "programEditor3")
      }),
      activate: function() {
        $("#code-mirror-wrapper").addClass("glow-focus")
        $("#code-mirror-wrapper3").popover('show')

        // HACK: the whole TUTORIAL_STEP_BUTTON_ACTIVE thing is hacky,
        // but it seems the simplest/best solution for now
        TUTORIAL_STEP_BUTTON_ACTIVE = true
        TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED = false
        setPrimaryButton("#stepButton")
      },
      deactivate: function() {
        TUTORIAL_ACTIVE = false
        TUTORIAL_STEP_BUTTON_ACTIVE = false
        TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED = false
        noPrimaryButtons()
        $("#code-mirror-wrapper3").popover("hide")
        $("#code-mirror-wrapper").removeClass("glow-focus")
      }
    },

    /**
     * Encourage the player to keep clicking the Step button
     *************************************************************************/
    "programEditor4": {
      popover_attach: "#code-mirror-wrapper4",
      popover: cloneDeep(DEFAULT_POPOVER, {
        title: getTitle("programEditor4", "Watch your robot run"),
        content: 
          "<p>Your robot just <strong>executed an instruction"
          + "</strong>. Note the following:</p>"
          + "<ul>"
          + "<li>The robot has moved on the Game Board.</li>"
          + "<li class='activeline-background'>The instruction that was "
          + "<strong>just executed</strong> is highlighted in "
          + "<strong>light-yellow</strong>.</li>"
          + "<li class='nextActiveline-background'>The <strong>next</strong> "
          + "instruction that will execute is highlighted in "
          + "<strong>bright yellow</strong>.</li>"
          + "<li class='nextActiveline-background'>When you click "
          + "<strong>Step</strong>, the <strong>next</strong> instruction "
          + "will execute.</li>"
          + "</ul>"
          + "<p><strong> Keep clicking the Step button</strong></p>"
      }),
      activate: function() {
        $("#code-mirror-wrapper").addClass("glow-focus")
        $("#code-mirror-wrapper4").popover('show')

        // HACK: the whole TUTORIAL_STEP_BUTTON_ACTIVE thing is hacky,
        // but it seems the simplest/best solution for now
        TUTORIAL_STEP_BUTTON_ACTIVE = true
        TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED = true
        setPrimaryButton("#stepButton")
      },
      deactivate: function() {
        TUTORIAL_ACTIVE = false
        TUTORIAL_STEP_BUTTON_ACTIVE = false
        TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED = false
        noPrimaryButtons()
        $("#code-mirror-wrapper4").popover("hide")
        $("#code-mirror-wrapper").removeClass("glow-focus")
      }
    },

    /**
     * Explain how the program has finished
     *************************************************************************/
    "programEditor5": {
      popover_attach: "#code-mirror-wrapper5",
      popover: cloneDeep(DEFAULT_POPOVER, {
        title: getTitle("programEditor5", "Your program has finished"),
        content: 
          "<p>Your robot probably did not accomplish its objective (collect "
          + "all the gold coins).</p>"
          + "<p><strong>That's OK!</strong> <i class='icon-thumbs-up'></i></p>"
          + "<p><strong>To try again, click the <strong>Reset</strong> button, edit "
          + "your program and run it again.</strong></p>"
          + "<p>You have now completed the tutorial!</p>"
          + "<p>For more in-depth help, visit our "
          + "<a "
          + "target='_blank' "
          + "href='"
          + WIKI_URL + "Help-for-Puzzle-Code"
          + "'>Help Page</a> (opens in a new "
          + "window)</p>"
          + getNavigation(
            "cancel",
            "programEditor5",
            undefined,
            "Exit tutorial")

      }),
      activate: function() {
        $("#code-mirror-wrapper").addClass("glow-focus")
        $("#code-mirror-wrapper5").popover('show')

        // HACK: the whole TUTORIAL_STEP_BUTTON_ACTIVE thing is hacky,
        // but it seems the simplest/best solution for now
        /*TUTORIAL_STEP_BUTTON_ACTIVE = true
        TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED = true
        setPrimaryButton("#stepButton")*/
        TUTORIAL_STEP_BUTTON_ACTIVE = false
        TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED = false
        setPrimaryButton("#restart")
      },
      deactivate: function() {
        TUTORIAL_ACTIVE = false
        $("#code-mirror-wrapper5").popover("hide")
        $("#code-mirror-wrapper").removeClass("glow-focus")
      }
    },

  }
  
  var tutorial = {
    // setup is immutable
    setup: setup,
    // state is mutable
    // TODO: I ended up not using the state property. delete it and replace
    // tutorial with setup
    state: {}
  }

  return tutorial

}