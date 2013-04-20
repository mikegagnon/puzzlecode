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

// Can be called at any time to abort the tutorial
function cancelTutorial() {
  var tutorial = TUTORIAL



}



// Called once during windowOnLoad to initialize the tutorial
// returns a "Tutorial" object
function setupTutorial() {
  TUTORIAL = setupTutorialObject()
  console.dir(TUTORIAL)
  var tutorial = TUTORIAL

  _(tutorial.setup)
    .forEach(function(tutorialStep) {
      if ("initialize" in tutorialStep) {
        console.log("initialize")
        console.dir(tutorialStep)
        tutorialStep.initialize()
      }

      // attach the popover to the specified html element
      if ("popover_attach" in tutorialStep ||
          "popover" in tutorialStep) {
        $(tutorialStep.popover_attach).popover(tutorialStep.popover)
      }
    })
}

function setupTutorialObject() {

  var DEFAULT_POPOVER = {
    html : true,
    trigger : "manual",
    placement: "top"
  }

  var CLOSE_BUTTON = " <a "
    + "class='close' "
    + "href='javascript: clearTutorial()'>"
    + "&times;"
    + "</a>"

  function getTitle(text) {
    return "<h4>" + text + CLOSE_BUTTON + "</h4>"
  }

  /**
   * elements is an array of "navigation element" objects.
   * Each navigation element looks like: {
   *    text: string presented to the user for this element
   *    tutorialStep: a key from setup, e.g. "#boardDiv"
   *    primary: optional property. if present, then set this element
   *      as the primary
   * }  
   ***************************************************************************/
  function getNavigation(elements) {
    var begin = "<div class='btn-group'>"
    var end = "</div>"
    
    // TODO: is there a better way to do this?
    var middle = _(elements)
      .map(function(element){
        if ("primary" in element) {
          var primary = " btn-primary"
        } else {
          var primary = ""
        }
        var functionCall = "TUTORIAL.setup." + element.tutorialStep + "()"
        return "<a "
          + "class='btn" + primary + "' "
          + "href='javascript: " + functionCall + "'>"
          + element.text
          + "</a>"
      })

    return begin + middle + end
  }

  var setup = {

    /**
     * The greeting that is presented when the user clicks the help button
     *************************************************************************/

    // This object describes the 'helpButton' tutoria step 
    "helpButton": {

      // A Bootstrap popover will be attached to the #helpButton html element
      popover_attach: "#helpButton",

      // Options for initializing the Bootstrap popover
      popover: cloneDeep(DEFAULT_POPOVER, {
        title: getTitle("How to play Puzzle Code"),
        content: getNavigation([
          { text: "Cancel", tutorialStep: "cancel" },
          { text: "Begin tutorial", tutorialStep: "gameBoardOverview",
            primary: true }
        ])
      }),

      // the windowOnLoad fuction will call this initialize function exactly once
      // to setup this tutorial step
      initialize: function() {

        // TODO: is there a jquery method that would be better?
        // TODO: does this.activate work?
        document
          .getElementById("helpButton")
          .addEventListener("click", this.activate)
      },

      // This function is called to active this tutorial-step
      activate: function() {
        $("#helpButton").popover("show")
      },

      // This function os called to deactivate this tutorial-step
      deactivate: function() {
        $("#helpButton").popover("hide")
      }
    },

    /**
     * Introduce the user to the game board
     *************************************************************************/
    "gameBoardOverview": {
      popover_attach: "#boardDiv",
      popover: cloneDeep(DEFAULT_POPOVER, {
        title: getTitle("This is the game board"),
        content: 
          "<p>Try to collect the <strong>gold coins</strong> "
          + "using your <strong>robot</strong>. <img src='img/bot.png'></p>"
          + getNavigation([
              { text: "Back", tutorialStep: "helpButton" },
              { text: "Continue", tutorialStep: "tutorialProgramEditor1",
                primary: true }
            ])
      }),
      activate: function() {
        $("#boardDiv").addClass("glow-focus")
        $("#boardDiv").popover('show')
      },
      deactivate: function() {
        $("#boardDiv").popover("hide")
        $("#boardDiv").removeClass("glow-focus")
      }
    },
  }
  
  var tutorial = {
    // setup is immutable
    setup: setup,
    // state is mutable
    state: {}
  }

  return tutorial

}