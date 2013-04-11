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

// TODO: what other code should go in this file?

function setBotProgram(board, botIndex, program) {
  board.bots[botIndex].program = program
}

// TODO: implement
// will return a summary of all victory announcements that should be
// visualized once the level is beaten
function getVictoryAnnouncements(campaign, state) {
  return undefined
}

/**
 * Given a "board-configuration object," yields a new board object
 */
function loadBoard(campaign, state) {
  var lev = state.current_level
  var boardConfig = campaign[lev.world_index].levels[lev.level_index]

  var board = {
    num_cols: boardConfig.num_cols,
    num_rows: boardConfig.num_rows,
    coins: cloneDeep(boardConfig.coins),
    blocks: cloneDeep(boardConfig.blocks),
    coinsCollected: 0
  }

  // board.on_victory = cloneDeep(boardConfig.on_victory)
  // board.num_victory_announcements = setupVictoryModal(campaign, state)

  /**
   * Contains all data that is needed to visualize the board and game state.
   * How can you tell what data belongs in board.visualize?
   * Data should appear in board.visualize if, and only if, the data is
   * ignored in "headless" mode (i.e. non-visualization mode).
   */
  board.visualize = {

    // mutable data that persists across simulator steps
    persist: {},

    // immutable data that is valid for only one simulation step. Every
    // simulation step begins by erasing the contents of step.
    step: {}
  }

  // the index of the bot being programmed by the code editor
  board.visualize.programming_bot_index = boardConfig.programming_bot_index

  board.win_conditions = cloneDeep(boardConfig.win_conditions)

  // set to true once victory has been achieved
  board.victory = false

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
        // bot.id is immutable, and unique only w.r.t. this board
        id: i,
        cellX: configBot.cellX,
        cellY: configBot.cellY,
        botColor: configBot.botColor,
        facing: configBot.facing,
        ip: 0,
        program: program
      }
      board.bots.push(bot)
    }
  }

  // newly created bots get id == board.next_bot_id
  // don't need to worry about int overflows on bot ids because JS uses floats
  board.next_bot_id = boardConfig.bots.length

  return board
}/**
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

// TODO: what else should go in this file?

// returns true if the specified level is visible
function isLevelAccessible(state, world_index, level_index) {
  return world_index in state.visibility &&
    level_index in state.visibility[world_index]
}

// returns true iff the specificed level has been completed
function levelCompleted(state, world_index, level_index) {
  return isLevelAccessible(state, world_index, level_index) &&
    state.visibility[world_index][level_index].complete
}

// a "visibilityObject" comes from board.visibility
// it is an object, where each key is either an index or "complete"
// returns the index keys from visibilityObject
function getVisibilityIndices(visibilityObject) {
  return _.keys(visibilityObject)
    .filter(function(key) {
      return key != "complete"
    })
}

/**
 * returns an array of objects like: {
 *     world_index: number,
 *     level_index: number
 *   }
 * for each level in the campaign
 */
function allLevelIndices(campaign) {

  var indices = []

  for (var wi = 0; wi < campaign.length; wi++) {
    for (var li = 0; li < campaign[wi].levels.length; li++) {
      indices.push({
        world_index: wi,
        level_index: li
      })
    }
  }

  return indices
}

// make the specified level visible
function unlockLevel(state, world_index, level_index) {
  if (!(world_index in state.visibility)) {
    state.visibility[world_index] = {
      complete: false
    }
  }

  // the level should not already be visible
  assert(!(level_index in state.visibility[world_index]), 
    "unlockLevel: !(" + level_index + " in state.visibility["+ world_index +"])")

  state.visibility[world_index][level_index] = {
    complete: false
  }

}

/**
 * called upon a victory to update state.visibility
 * returns an array of "campaign delta" objects, which have several forms
 *
 * (1) for unlocking a world:
 *    {
 *      world_unlock: number
 *    }
 *
 * (2) for unlocking a level:
 *    {
 *      level_unlock: number,
 *      world_index: number
 *    }
 *
 * (3) for completing a level for the first time
 *    {
 *      level_complete: number,
 *      world_index: number
 *    }  
 *
 * (4) for completing a world for the first time
 *    {
 *      world_complete: number
 *    }  
 *
 * TBD: beating the game and other awards / badges
 */
function updateLevelVisibility(board, campaign, state) {

  var world_index = state.current_level.world_index
  var level_index = state.current_level.level_index

  // if the level has already been beaten, then there is nothing to update
  if (state.visibility[world_index][level_index].completed) {
    return []
  }

  state.visibility[world_index][level_index].complete = true

  var deltas = [
    {
      level_complete: level_index,
      world_index: world_index
    }
  ]

  // try the unlock function for each locked level
  _(allLevelIndices(campaign))
    .forEach(function(lev) {
      if (!isLevelAccessible(state, lev.world_index, lev.level_index)) {

        var level = campaign[lev.world_index].levels[lev.level_index]
        // should this level be unlocked?
        if (level.unlock(campaign, state)) {

          // if the unlocked level is in a new world
          if (!(lev.world_index in state.visibility)) {
            deltas.push({
              world_unlock: lev.world_index
            })
          }

          unlockLevel(state, lev.world_index, lev.level_index)

          deltas.push({
            level_unlock: lev.level_index,
            world_index: lev.world_index
          })

        }
      }
    })

  // check to see if this victory completed the world
  var world_complete = true
  for (i in getVisibilityIndices(state.visibility[world_index])) {
    console.log("lev " + i)
    if (!state.visibility[world_index][i].complete) {
      console.log("done")
      world_complete = false
    } else {
      console.log("not done")
    }
  }

  if (world_complete) {
    deltas.push({
        world_complete: world_index
    })
  }

  return deltas

}/**
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
 * IDEAS:
 *  - make the text box read-only while the simulation is playing
 *  - add break points
 *  - have the text box highlight the line that is currently being executed
 *
 * TODO: see if there is more sophisticated gutter mechanisms to
 * present comments and errors to the user
 * http://codemirror.net/doc/upgrade_v3.html#gutters
 *
 * TODO: listen for changes in the document and automatically update gutter
 * with comments and errors
 *
 * TODO: how to keep width of gutter constant?
 *
 * IDEA: breakpoints, see http://codemirror.net/demo/marker.html
 *
 * TODO: error text usually needs to be more verbose. Perhaps add a link to
 * a popup that explains the error and gives references.
 *
 * IDEA: put drop-down boxes in comment section so you can fit more text there
 *
 */

// lineComments is a map where line index points to comment for that line
function addLineComments(codeMirrorBox, lineComments) {
  codeMirrorBox.clearGutter("note-gutter")
  for (i in lineComments) {
    var comment = lineComments[i]
    codeMirrorBox
      .setGutterMarker(
        parseInt(i),
        "note-gutter",
        comment)
  }
}

function setupCodeMirrorBox(programText) {

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

  var settings = {
    gutters: ["note-gutter", "CodeMirror-linenumbers"],
    mode:  "text/x-robocom",
    theme: "solarized dark",
    smartIndent: false,
    lineNumbers: true,
  }

  CODE_MIRROR_BOX = CodeMirror(document.getElementById("codeMirrorEdit"),
    settings)

  cm = CODE_MIRROR_BOX

  //  TODO: put the cursorActivity function in seperate file
  var line = 0
  cm.on("cursorActivity", function(cm) {
    var newLine = cm.getCursor().line
    if (PLAY_STATUS == PlayStatus.INITAL_STATE_PAUSED) {
      if (line != newLine) {
        compile()
      }
      line = newLine
    }
  })

  // You cannot edit the program, unless it is in the reset state
  cm.on("beforeChange", function(cm, change) {
    if (PLAY_STATUS != PlayStatus.INITAL_STATE_PAUSED) {
      change.cancel()
    }
  })

  cm.setValue(programText)
  compile()
}
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

// TODO: careful unit testing

Opcode = {
  MOVE: 0,
  TURN: 1,
  GOTO: 2
}

function RobocomInstruction(
    // value must be in the Opcode enum
    opcode,
    // data object, whose type is determined by opcode
    data,
    // from program text
    lineIndex
    ) {
  this.opcode = opcode
  this.data = data
  this.lineIndex = lineIndex
}

function RobocomProgram(
    // string
    programText,
    // array of instruction objects (or null if there was an error)
    instructions,
    // maps lineNumber to comment for that line
    lineComments) {
  this.programText = programText
  this.instructions = instructions
  this.lineComments = lineComments
}

function newErrorComment(text, uri) {
  var newlink = document.createElement('a')
  newlink.setAttribute('href', uri)
  newlink.setAttribute('class', "errorLink")
  newlink.appendChild(newComment(text))
  return newlink
}

// TODO: make all comments hyperlinks, though the non-errors should be styled
// as if they're not hyperlinks (until you hover)
function newComment(text) {
  return document.createTextNode(text)
}

function removeComment(tokens) {
  var commentToken = -1
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    var commentCharIndex = token.indexOf("//")
    if (commentCharIndex == 0) {
      // completely exclude this token
      return tokens.slice(0, i)
    } else if (commentCharIndex > 0) {
      // trim this token and exclude the rest
      tokens[i] = token.substr(0, commentCharIndex)
      return tokens.slice(0, i + 1)
    }
  }
  return tokens
}

// returns [tokens, label]
// if a label is removed from tokens, then label is a string
// otherwise it is null
function removeLabel(tokens) {
  if (tokens.length == 0) {
    return [tokens, null]
  } else {
    var head = tokens[0]
    var colonIndex = head.indexOf(":")
    if (colonIndex <= 0) {
      return [tokens, null]
    } else if (colonIndex == head.length - 1) {
      var label = head.substr(0, head.length - 1)
      var newTokens = tokens.slice(1, tokens.length)
      return [newTokens, label]
    } else {
      var label = head.substr(0, colonIndex)
      var newHead = head.substr(colonIndex + 1, head.length)
      // asert newHead.length > 0
      tokens[0] = newHead
      return [tokens, label]
    }
  }
}

function compileMove(tokens) {
  var instruction = null
  var comment = null
  var error = false

  // assert tokens[0] == "move"
  if (tokens.length == 1) {
    instruction = new RobocomInstruction(Opcode.MOVE, null)
    comment = newComment("Move forward one square")
  } else {
    instruction = null
    comment = newErrorComment("Malformed 'move' instruction", "#")
    error = true
  }

  return [instruction, comment, error]
}

function compileTurn(tokens) {
  var instruction = null
  var comment = null
  var error = false

  // assert tokens[0] == "move"
  if (tokens.length != 2) {
    instruction = null
    comment = newErrorComment("The 'turn' instruction is missing a direction", "#")
    error = true
  } else {
    var direction = tokens[1]
    if (direction == "left") {
      instruction = new RobocomInstruction(Opcode.TURN, Direction.LEFT)
      comment = newComment("Rotate to the left ↰")
    } else if (direction == "right") {
      instruction = new RobocomInstruction(Opcode.TURN, Direction.RIGHT)
      comment = newComment("Rotate to the right ↱")
    } else {
      instruction = null
      comment = newErrorComment("'" + direction + "' is not a valid direction", "#")
      error = true
    }
  }

  return [instruction, comment, error]
}



// TODO: make sure the label is sane: i.e. not a reserved word and conforms
// to identifier regex
function compileGoto(tokens) {
  var instruction = null
  var comment = null
  var error = false

  // TODO: this error message doesn't make sense if length > 2
  if (tokens.length != 2) {
    instruction = null
    comment = newErrorComment("The 'goto' instruction is missing a label", "#")
    error = true
  } else {
    var label = tokens[1]
    if (!isValidLabel(label)) {
      instruction = null
      comment = newErrorComment("'" + label + "' is not a valid label", "#")
      error = true
    } else {
      instruction = new RobocomInstruction(Opcode.GOTO, label)
      // this comment is filled in on the second pass
      comment = null
      error = false
    }
  }
  return [instruction, comment, error]
}

function tokenize(line) {
  return line
    .replace(/\s+/g, " ")
    .replace(/(^\s+)|(\s+$)/g, "")
    .split(" ")
}

function isValidLabel(label) {
  return label.length > 0 &&
    label.length < 20 &&
    !(label in RESERVED_WORDS) &&
    IDENT_REGEX.test(label)
}

/**
 * Returns [instruction, comment, error, label], where:
 *  instruction is a RobocomInstruction and comment is a string
 *    instruction is set to null if there was an error compiling the
 *    instruction, or if the line is a no-op
 *  label is a string or null
 *  comment is a DOM node, or null
 *  error is true iff there was an error compiling this line
 */
function compileLine(line, lineIndex, labels) {
  
  tokens = tokenize(line)
  tokens = removeComment(tokens)
  tokensLabel = removeLabel(tokens)
  tokens = tokensLabel[0]
  label = tokensLabel[1]

  if (label != null) {
    if (!isValidLabel(label)) {
      var abbrevLabel = label.substr(0, 20)
      comment = newErrorComment("'" + label + "' is not a valid label", "#")
      return [null, comment, true, null]
    } else if (label in labels) {
      // TODO: get labels
      comment = newErrorComment("label '" + label + "' is already defined", "#")
      return [null, comment, true, null]
    }
  }

  if (tokens.length == 0 ||
      (tokens.length == 1 && tokens[0] == "")) {
    return [null, null, false, label]
  }

  var opcode = tokens[0]
  var result = undefined
  if (opcode == "move") {
    result = compileMove(tokens).concat([label])
  } else if (opcode == "turn") {
    result = compileTurn(tokens).concat([label])
  } else if (opcode == "goto") {
    result = compileGoto(tokens).concat([label])
  } else {
    comment = newErrorComment("'" + opcode + "' is not an instruction", "#")
    result = [null, comment, true, null]
  }
  var instruction = result[0]
  if (instruction != null) {
    instruction.lineIndex = lineIndex
  }
  return result

}

// Compiles a programText into a RobocomProgram object
function compileRobocom(programText) {
  var lines = programText.split("\n")
  var instructions = []
  var lineComments = {}

  // map from label-string to instruction pointer for that label
  var labels = {}

  // map from label-string to line number for that label
  var labelLineNumbers = {}

  var error = false

  // first pass: do everything except finalize GOTO statements
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var compiledLine = compileLine(line, i, labels)
    var instruction = compiledLine[0]
    var comment = compiledLine[1]
    var lineError = compiledLine[2]
    var label = compiledLine[3]

    if (label != null) {
      // TODO: make sure that GOTO pointing past last instruction works well
      labels[label] = instructions.length
      labelLineNumbers[label] = i + 1
    }

    if (instruction != null) {
      instruction.lineIndex = i
      instructions.push(instruction)
    }

    if (comment != null) {
      lineComments[i] = comment
    }

    error = error || lineError
  }

  // second pass: finalize GOTO statements
  for (var i = 0; i < instructions.length; i++) {
    var instruction = instructions[i]
    if (instruction.opcode == Opcode.GOTO) {
      var label = instruction.data
      if (label in labels) {
        // replace string label with numeric label
        instruction.data = labels[label]
        // TODO: better comment
        lineComments[instruction.lineIndex] =
          newComment("resume execution at line " + labelLineNumbers[label])
      } else {
        error = true
        lineComments[instruction.lineIndex] =
          newErrorComment("the label '" + label + "' does not exist", "#")
      }
    }
  }

  if (error) {
    return new RobocomProgram(programText, null, lineComments)
  } else {
    return new RobocomProgram(programText, instructions, lineComments)
  }
}
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

// some functions useful for debugging

// add size functions to selections and transitions
d3.selection.prototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};

 d3.transition.prototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};

function assert(bool, message) {
  if (!bool) {
    alert(message)
  }
}

function assertLazy(func, message) {
  if (DEBUG) {
    assert(func(), message)
  }
}

// the index of the current test case
var TC_NAME = undefined
// the current test case
var TC = undefined
// the actual result of the tested function
var RESULT = undefined
// the filename of the current test
var TEST_FILENAME = undefined

function test(bool) {
  if (!bool) {
    alert("Failed test. See console logs for error messages.")
    console.error("Failed test '" + TC_NAME +"' in " + TEST_FILENAME)
    console.log("Test case:")
    console.dir(TC)
    console.log("Result:")
    console.dir(RESULT)
  }
}
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

Direction = {
  NUM_DIRECTIONS: 4,
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
}

function rotateLeft(direction) {
  if (direction == Direction.LEFT) {
    return Direction.DOWN
  } else if (direction == Direction.DOWN) {
    return Direction.RIGHT
  } else if (direction == Direction.RIGHT) {
    return Direction.UP
  } else if (direction == Direction.UP) {
    return Direction.LEFT
  } else {
    // assert false
  }
}

function rotateRight(direction) {
  if (direction == Direction.LEFT) {
    return Direction.UP
  } else if (direction == Direction.UP) {
    return Direction.RIGHT
  } else if (direction == Direction.RIGHT) {
    return Direction.DOWN
  } else if (direction == Direction.DOWN) {
    return Direction.LEFT
  } else {
    // assert false
  }
}

function rotateDirection(oldFacing, rotateDirection) {
  if (rotateDirection == Direction.LEFT) {
    return rotateLeft(oldFacing)
  } else if (rotateDirection == Direction.RIGHT) {
    return rotateRight(oldFacing)
  } else {
    // assert false
  }
}

function oppositeDirection(direction) {
  return rotateLeft(rotateLeft(direction))
}
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

var OnVictory = {
  UNLOCK_NEXT_LEVEL: 0,
  UNLOCK_NEXT_WORLD: 1
}/**
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

function loadWorldMenu(campaign, state) {

  var worldIndices = getVisibilityIndices(state.visibility)

  for (world_index in worldIndices) {
    addWorldToMenu(
      campaign,
      state,
      world_index)

    var levelIndices = getVisibilityIndices(state.visibility[world_index])

    for (level_index in levelIndices) {
        addLevelToMenu(
          campaign,
          state,
          world_index,
          level_index)
    }
  }
}

/**
 * TODO: what's the difference between loadLevel and loadBoard?
 */
function loadLevel(campaign, state) {
  var world_i = state.current_level.world_index
  var level_i = state.current_level.level_index
  var level = campaign[world_i].levels[level_i]

  var programText = level.bots[level.programming_bot_index].program
  var programText = level.solutions[0]

  setupCodeMirrorBox(programText)
  restartSimulation()
}

function loadCampaign(campaign, state) {
  loadWorldMenu(campaign, state)
  loadLevel(campaign, state)
  showOrHideLevelMenu(state) 
}
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

var BotColor = {
  NUM_COLORS: 2,
  BLUE: 0,
  RED: 1
}

function executeTurn(result, bot, direction) {
  assert(direction == Direction.LEFT || direction == Direction.RIGHT,
    "executeTurn: direction == Direction.LEFT || direction == Direction.RIGHT")
  bot.facing = rotateDirection(bot.facing, direction)
  result.visualize.rotate = true
}

function executeGoto(result, bot, nextIp) {
  bot.ip = nextIp
  result.visualize.goto = true
}

// a bot tries to move into cell x,y.
// returns true if the bot is allowed to move in, false otherwise
// TODO: also check for bots
function tryMove(board, bot, x, y) {
  var matchingBlocks = _(board.blocks)
    .filter( function(block) {
      return block.x == x && block.y == y
    })
    .value()

  return matchingBlocks.length == 0
}

/**
 * executes the 'move' instruciton on the bot
 * updates the bot and board state
 * When a bot moves, it deposits two markers:
 *  - at the head in the old cell
 *  - at the tail in the new cell
 */
function executeMove(result, board, bot) {

  var prevX = bot.cellX
  var prevY = bot.cellY

  var dx = 0
  var dy = 0
  if (bot.facing == Direction.UP) {
    dy = -1
  } else if (bot.facing == Direction.DOWN) {
    dy = 1
  } else if (bot.facing == Direction.LEFT) {
    dx = -1
  } else if (bot.facing == Direction.RIGHT) {
    dx = 1
  } else {
    console.error("this code shoudln't be reachable: executeMove")
  }

  xResult = wrapAdd(bot.cellX, dx, board.num_cols)
  yResult = wrapAdd(bot.cellY, dy, board.num_rows)
  destX = xResult[0]
  destY = yResult[0]
  xTorus = xResult[1]
  yTorus = yResult[1]

  if (!tryMove(board, bot, destX, destY)) {
    result.visualize.failMove = {
      destX: bot.cellX + dx,
      destY: bot.cellY + dy
    }
  } else {
    // TODO: break this function up into smaller functions
    
    result.depositMarker.push({
      x: bot.cellX,
      y: bot.cellY,
      quadrant: bot.facing,
      botColor: bot.botColor
    })

    bot.cellX = destX
    bot.cellY = destY
    
    // did the bot pickup a coin?
    var matchingCoins = _(board.coins)
      .filter( function(coin) {
        return coin.x == bot.cellX && coin.y == bot.cellY
      })
      .value()

    assert(matchingCoins.length == 0 || matchingCoins.length == 1,
      "matchingCoins.length == 0 || matchingCoins.length == 1")

    if (matchingCoins.length == 1) {
      var matchingCoin = matchingCoins[0]

      // remove the coin from the board
      board.coins = _(board.coins)
        .filter( function(coin) {
          return !(coin.x == bot.cellX && coin.y == bot.cellY)
        })
        .value()

      board.coinsCollected += 1

      result.visualize.coin_collect = matchingCoin
    }

    if (xTorus != "torus" && yTorus != "torus") {
      result.visualize.nonTorusMove = true
    } else {
      result.visualize.torusMove = {
        prevX: prevX,
        prevY: prevY,
        oobPrevX: bot.cellX - dx,
        oobPrevY: bot.cellY - dy,
        oobNextX: prevX + dx, 
        oobNextY: prevY + dy
      }
    }

    result.depositMarker.push({
      x: bot.cellX,
      y: bot.cellY,
      quadrant: oppositeDirection(bot.facing),
      botColor: bot.botColor
    })

  }
}

// assumes relatively sane values for increment
// returns [value, moveType]
// where moveType == "moveTorus" or "moveNonTorus"
function wrapAdd(value, increment, outOfBounds) {
  value += increment
  if (value >= outOfBounds) {
    return [value % outOfBounds, "torus"]
  } else if (value < 0) {
    return [outOfBounds + value, "torus"]
  } else {
    return [value, "nonTorus"]
  }
}

function decayMarker(strength) {
  strength = strength - 0.01
  if (strength <= MIN_MARKER_STRENGTH) {
    // TODO: should this function return undefined instead?
    return MIN_MARKER_STRENGTH
  } else {
    return strength
  }
}

/**
 * marker has following fields: x, y, quadrant, botColor
 */
function addMarker(board, marker) {
  var currentStrength = board.markers[marker.x][marker.y][marker.quadrant][marker.botColor]
  if (typeof currentStrength === 'undefined') {
    currentStrength = 0.0
  }

  currentStrength += INIT_MARKER_STRENGTH
  if (currentStrength >= MAX_MARKER_STRENGTH) {
    currentStrength = MAX_MARKER_STRENGTH
  }

  board.markers[marker.x][marker.y][marker.quadrant][marker.botColor] =
    currentStrength
}

/**
 * Returns a list of marker objects, for markers with defined strength
 * each marker has following fields: x, y, quadrant, botColor, strength
 *
 * set keepUndefined to true to emit every marker, regardless of definition
 */
function getMarkers(board, keepUndefined) {

  if (typeof keepUndefined === 'undefined') {
    keepUndefined = false
  }
  var markers = []
  for (var x = 0; x < board.num_cols; x++) {
    for (var y = 0; y < board.num_rows; y++) {
      for (var q = 0; q < Direction.NUM_DIRECTIONS; q++) {
        for (var c = 0; c < BotColor.NUM_COLORS; c++) {
          strength = board.markers[x][y][q][c]
          if (!keepUndefined && typeof strength === 'undefined') {
            continue
          }
          marker = {
            x: x,
            y: y,
            quadrant: q,
            botColor: c,
            strength: strength
          }
          markers.push(marker)
        }
      }
    }
  }
  return markers
}



function checkVictory(board, campaign, state) {
  if (board.victory) {
    return
  }

  var win_conditions = board.win_conditions
  var conditionsMet = 0

  for (var i = 0; i < win_conditions.length; i++) {
    var condition = win_conditions[i]
    if (condition.type == WinCondition.COLLECT_COINS) {
      if (board.coins.length == 0) {
        conditionsMet += 1
      }
    } else {
      console.error("Unsupported condition.type " + condition.type)
    }
  }

  if (win_conditions.length == conditionsMet) {
    board.victory = true
    board.visualize.step.general.victory = true

    var campaign_deltas = updateLevelVisibility(board, campaign, state)
    if (campaign_deltas.length > 0) {
      board.visualize.step.general.campaign_deltas = campaign_deltas
    }
  }
}

// TODO: do a better job separating model from view.
function step(board, campaign, state) {

  // TODO: assertLazy that all bot ids are unique

  // contains all data needed to visualize this step of the game
  board.visualize.step = {

    // visualizations associated with the board, but not any particular bot
    general: {},

    // bots[bot.id] == an object containing all visualizations for that bot
    // e.g. bot[1].lineIndex == the index of the line currently being
    // executed for that bot with bot.id == 1
    bot: {}
  }

  _(board.bots).forOwn(function(bot) {

    // make sure this bot hasn't finished
    if ("done" in bot.program) {
      return
    } 

    var instruction = bot.program.instructions[bot.ip]

    // NOTE: executing the instruction may modify the ip
    bot.ip = bot.ip + 1

    // the bot-instruction functions will populate the fields of result
    var result = {
      // containins all visualizations for this bot
      visualize: {},
      // array of markers deposited by the bot
      depositMarker: []
    }

    if (instruction.opcode == Opcode.MOVE) {
      executeMove(result, board, bot)
    } else if (instruction.opcode == Opcode.TURN) {
      executeTurn(result, bot, instruction.data)
    } else if (instruction.opcode == Opcode.GOTO) {
      executeGoto(result, bot, instruction.data)
    }

    board.visualize.step.bot[bot.id] = result.visualize
    board.visualize.step.bot[bot.id].lineIndex = instruction.lineIndex

    // if the bot has reached the end of its program
    if (bot.ip >= bot.program.instructions.length) {
      bot.program.done = true
      board.visualize.step.bot[bot.id].programDone = true
    }

    _(result.depositMarker).forEach( function (marker) {
      addMarker(board, marker)
    })

  })

  checkVictory(board, campaign, state)

  // Decay the strength of each marker on the board
  _(getMarkers(board)).forEach( function(m) {
    board.markers[m.x][m.y][m.quadrant][m.botColor] = decayMarker(m.strength)
  })
}

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

// return a deep copy of origObj, with newObj merged in
function cloneDeep(origObj, newObj) {
  return _.assign(_.cloneDeep(origObj), newObj)
}

// yields a new matrix
// if defaultValue is a function then matrix[x][y] = defaultValue(x, y)
// else matrix[x][y] = defaultValue
function newMatrix(xLength, yLength, defaultValue) {
  return newArray(xLength, function(x) {
    return newArray(yLength, function(y) {
      if (typeof defaultValue == "function") {
        return defaultValue(x, y)
      } else {
        return defaultValue
      }
    })
  })
}

// creates a new matrx of specified length
// if defaultValue is a function, then array[i] = defaultValue(i)
// else, array[i] = defaultValue
function newArray(length, defaultValue) {
  var a = Array(length)
  for (var i = 0; i < length; i++) {
    if (typeof defaultValue == "function") {
      a[i] = defaultValue(i)
    } else {
      a[i] = defaultValue
    }
  }
  return a
}
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
 * Instead of using D3 selectAll, just do D3 select(node) for a given node
 * reference.
 */



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
  // IDEA: perhaps the reason nonBotAnimate and animateCoinCollection were
  // interferring is because they were both operating on the same svg elements
  // but they were using different transition objects.
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
    d3.select("#" + coinId(coin)).transition()
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
      // TODO: this is a temporary hack that only makes sense when there is
      // one bot.
      // Long-term idea: only change restart to primary if this is the bot
      // that is being programmed on the code editor.
      .each("end", function(){
        d3.select("#restart").attr("class", "btn btn-primary")
      })
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
      d3.select("#restart").attr("class", "btn btn-primary")
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

// animate the program's text
function animateProgram(board) {

  var cm = CODE_MIRROR_BOX

  // if animation is too fast, don't highlight lines
  if (CYCLE_DUR < MAX_HIGHLIGHT_SPEED) {
    // TODO: remove _activeLine field from cm
    if ("_activeLine" in cm) {
      cm.removeLineClass(cm._activeLine, "background", BACK_CLASS);
    }
    return
  }

  // TODO: find the bot currently being traced and only animate that bot's prog
  if (board.bots.length == 0) {
    return
  }

  var bot = board.bots[board.visualize.programming_bot_index]
  if (!(bot.id in board.visualize.step.bot)) {
    return
  }

  var lineNum = board.visualize.step.bot[bot.id].lineIndex

  // inspired by http://codemirror.net/demo/activeline.html
  var lineHandle = cm.getLineHandle(lineNum);
  if (cm._activeLine != lineHandle) {
    if ("_activeLine" in cm) {
      cm.removeLineClass(cm._activeLine, "background", BACK_CLASS);
    }
    cm.addLineClass(lineHandle, "background", BACK_CLASS);
    cm._activeLine = lineHandle;
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
  VIS = d3.select("#board")
    .attr("class", "vis")
    .attr("width", board.num_cols * CELL_SIZE)
    .attr("height", board.num_rows * CELL_SIZE)
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

function drawCoins() {
  VIS.selectAll(".coin")
    .data(BOARD.coins)
    .enter().append("svg:circle")
    .attr("class", "coin")
    .attr("id", function(coin){ return coinId(coin)} )
    .attr("stroke", "goldenrod")
    .attr("fill", "gold")
    .attr("opacity", "1.0")
    .attr("r", COIN_RADIUS)
    .attr("cx", function(d){ return d.x * CELL_SIZE + CELL_SIZE/2 } )
    .attr("cy", function(d){ return d.y * CELL_SIZE + CELL_SIZE/2} )
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

function drawBlocks() {
  VIS.selectAll(".block")
    .data(BOARD.blocks)
    .enter().append("svg:rect")
    .attr("class", "block")
    .attr("stroke", "darkgray")
    .attr("fill", "darkgray")
    .attr("width", CELL_SIZE)
    .attr("height", CELL_SIZE)
    .attr("x", function(d){ return d.x * CELL_SIZE } )
    .attr("y", function(d){ return d.y * CELL_SIZE } )
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
  d3.selectAll(".botClone").remove()
  d3.selectAll(".block").remove()
  d3.selectAll(".marker").remove()
  d3.selectAll(".victory-ball").remove()
  d3.selectAll(".xTemplate").remove()

  // TODO: turn off line highlighting
  if ("_activeLine" in CODE_MIRROR_BOX) {
    CODE_MIRROR_BOX.removeLineClass(
      CODE_MIRROR_BOX._activeLine, "background", BACK_CLASS);
  }
}

// TODO: have links to levels work
function animateVictoryModalAndMenu(board, campaign, state) {

  if (!("campaign_deltas" in board.visualize.step.general)) {
    return
  }

  // wait until after the victoryBalls animation is done
  setTimeout(function(){

    // the html contents of the modal
    var html = ""

    // TODO: sort announcements some way?
    /**
     * NOTE: this approach assumes that world_unlock deltas always occurs before
     * level_unlock. This assumption is necessary because a level can only 
     * be added to a menu after the world has been added to the menu.
     */
    _(board.visualize.step.general.campaign_deltas)
      .forEach(function(delta) {
        // if a level has been unlocked
        if ("level_unlock" in delta) {
          var level_name = campaign[delta.world_index]
            .levels[delta.level_unlock].name

          html += '<p>'
            + '<span class="label label-info victory-label">New level</span> '
            + 'You unlocked <a href="#">Level '
            + (delta.world_index + 1)
            + '-'
            + (delta.level_unlock + 1)
            + ': '
            + level_name
            + '</a>'
            + '</p>'

          addLevelToMenu(campaign, state, delta.world_index, delta.level_unlock)
        }
        // if a world has been unlocked
        else if ("world_unlock" in delta) {
          var next_world_name = campaign[delta.world_unlock].name

          html += '<p>'
            + '<span class="label label-success victory-label">New world</span> '
            + 'You unlocked World '
            + (delta.world_unlock + 1)
            + ': '
            + next_world_name
            + '</p>'

          addWorldToMenu(campaign, state, delta.world_unlock)
        } else if ("level_complete" in delta) {
          console.dir(delta.level_complete)
          worldMenuCheckLevel(campaign, delta.world_index, delta.level_complete)        
        } else if ("world_complete" in delta) {
          worldMenuCheckWorld(campaign, delta.world_complete)
        } else {
          console.error("Unexpected delta: ")
          console.dir(delta)
        }
      })

    $("#victoryModalBody").html(html)
    $("#victoryModal").modal('show')
    showOrHideLevelMenu(PUZZLE_CAMPAIGN_STATE)
  }, VICTORY_DUR * 2)

}

// assumes board has already been initialized
function initializeVisualization(campaign, state, board) {
  drawBoardContainer(board)
  drawCells(board)
  drawInitMarkers(board)
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
  animateFailMove(board)
  animateRotate(board)
  animateMoveNonTorus(board)
  animateMoveTorus(board)
  animateProgramDone(board)
  animateMarkers(board)
  animateVictoryBalls(board, PUZZLE_CAMPAIGN_STATE)
  animateVictoryModalAndMenu(board, PUZZLE_CAMPAIGN, PUZZLE_CAMPAIGN_STATE)
}
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

var WinCondition = {
  COLLECT_COINS: 0
}/**
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

// TODO: consistent jargon for level selector etc as "level menu"

// show or hide the level menu, depending on whether or not multiple
// levels can be played

// TODO: when reveaing level menu for first, time highlight it somehow
// until after the user clicks it for the first time
function showOrHideLevelMenu(state) {

  var hide = false

  // list of the indices for the visibile worlds
  var visibleWorldIndices = getVisibilityIndices(state.visibility)
  assert(visibleWorldIndices.length > 0,
    "showOrHideLevelMenu: visibleWorldIndices.length > 0")

  // if only one world is visible
  if (visibleWorldIndices.length == 1) {
    var world = state.visibility[visibleWorldIndices[0]]
    // and if only one level is visible in that world
    if (getVisibilityIndices(world).length == 1) {
      // then hide the level menu
      hide = true
    }
  }

  if (hide) {
    $("#accordionLevelSelect").attr("style", "display: none;")
  } else {
    $("#accordionLevelSelect").removeAttr("style")
  }

}

function getCompletedClass(completed) {
  if (completed) {
    return "icon-ok"
  } else {
    return "icon-minus"
  }
}

function getWorldNameHtml(world_index, name, completed) {
  var completedClass = getCompletedClass(completed)

  var worldName = "World "
    + (parseInt(world_index) + 1)
    + ": "
    + name

  return '<i class="' + completedClass + '"></i> '
      + worldName
      +  '<span class="caret world-menu-caret"></span>'
}

/**
 * worldId: the id for the newly created world menu object (do not include '#')
 * text: the name of the world, e.g. "World 1: Move &amp; Turn"
 * completed: true iff world is completed, false otherwise
 */
function addWorldToMenu(campaign, state, world_index) {

  var worldCompleted = state.visibility[world_index].complete
  var world = campaign[world_index]

  $("#levelmenu")
    .append(
      '<li id="' + world.id + '">'
      +  '<div class="btn-group">'
      +    '<a class="btn dropdown-toggle level-select"'
      +       'data-toggle="dropdown" href="#">'
      +       getWorldNameHtml(world_index, world.name, worldCompleted)
      +    '</a>'
      +    '<ul class="dropdown-menu">'
      +    '</ul>'
      +  '</div>'
      + '</li>')

}

/**
 * Add a check mark to a level
 */
function worldMenuCheckWorld(campaign, world_index) {
  var world = campaign[world_index]

  $("#" + world.id)
    .find(".btn")
    .html(getWorldNameHtml(world_index, world.name, true))

}

function getLevelNameHtml(world_index, level_index, name, completed) {
  var completedClass = getCompletedClass(completed)
  var levelName = "Level "
    + (parseInt(world_index) + 1)
    + "-"
    + (parseInt(level_index) + 1)
    + ": " + name

  return '<i class="' + completedClass + '"></i> ' + levelName
}

function addLevelToMenu(campaign, state, world_index, level_index) {

  var completed = state.visibility[world_index][level_index].complete

  var world = campaign[world_index]
  var level = world.levels[level_index]

  $("#" + world.id)
    .find(".dropdown-menu")
    .append('<li id="' + level.id + '">'
      + '<a tabindex="-1" class="level-link" href="#">'
      + getLevelNameHtml(world_index, level_index, level.name, completed)
      + '</a>'
      + '</li>')
}

/**
 * Add a check mark to a level
 */
function worldMenuCheckLevel(campaign, world_index, level_index) {
  var level = campaign[world_index].levels[level_index]

  $("#" + level.id)
    .find(".level-link")
    .html(getLevelNameHtml(world_index, level_index, level.name, true))

}

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
 * Holds all top-level variables, function invocations etc.
 */

// if CYCLE_DUR < MAX_HIGHLIGHT_SPEED, lines will not be highlighted
// to show program execution
var MAX_HIGHLIGHT_SPEED = 150

// [animationDuration, delayDuration, description, easing]
PlaySpeed = {
  SUPER_SLOW: [2000, 4000, "Super slow", "cubic-in-out"],
  SLOW: [750, 1500, "Slow", "cubic-in-out"],
  NORMAL: [400, 600, "Normal", "cubic-in-out"],
  FAST: [150, 150, "Fast", "linear"],
  SUPER_FAST: [0, 0, "Super fast", "linear"]
}

PlayStatus = {
  INITAL_STATE_PAUSED: 0,
  PLAYING: 1,
  PAUSED: 2,
}

// TODO better name and document
var WRAP_CLASS = "activeline";
var BACK_CLASS = "activeline-background";

// TODO: better var names and all caps
var CELL_SIZE = 32,
    VIS = null,
    ANIMATE_INTERVAL = null,
    PLAY_STATUS = PlayStatus.INITAL_STATE_PAUSED,
    INIT_PLAY_SPEED = PlaySpeed.NORMAL,
    ANIMATION_DUR = INIT_PLAY_SPEED[0]
    CYCLE_DUR = INIT_PLAY_SPEED[1],
    VICTORY_DUR = 400
    EASING = INIT_PLAY_SPEED[3],
    NON_BOT_ANIMATION_DUR = PlaySpeed.SLOW[0],
    NON_BOT_CYCLE_DUR = NON_BOT_ANIMATION_DUR,
    CODE_MIRROR_BOX = null,
    pausePlay = null,
    DEBUG = true,
    IDENT_REGEX = /^[A-Za-z][A-Za-z0-9_]*$/,
    NORMAL_CODE_THEME = "solarized dark",
    DISABLED_CODE_THEME = "solarized_dim dark"

var PUZZLE_1 = {
  id: "puzzle1",
  name: "Collect the coins",
  description: "Collect all the coins on the board.",
  hint: "tbd",
  win_conditions: [
    {type: WinCondition.COLLECT_COINS}
  ],
  constraints: [],
  // TODO: make sure all obsolete on_victory references are dealt with
  /*on_victory: [
    {type: OnVictory.UNLOCK_NEXT_LEVEL},
    {type: OnVictory.UNLOCK_NEXT_WORLD},
  ],*/

  // what conditions need to be met to unlock this level?
  // the unlock returns true if this level should be unlocked
  unlock: function(campaign, state) {
    return true
  },

  solutions: [
    "move\nmove\nturn left\nmove\nmove\nmove\nmove\n",
  ],
  num_cols: 9,
  num_rows: 7,
  programming_bot_index: 0,
  bots : [
    {
      botColor: BotColor.BLUE,
      cellX: 4,
      cellY: 3,
      facing: Direction.UP,
      program: "move\nmove\nmove\nturn left\nmove\nmove\n",
    },
    {
      botColor: BotColor.BLUE,
      cellX: 0,
      cellY: 0,
      facing: Direction.RIGHT,
      program: "start: move\nmove\nmove\ngoto start\n",
    },
    {
      botColor: BotColor.BLUE,
      cellX: 6,
      cellY: 6,
      facing: Direction.RIGHT,
      program: "start: move\n turn right\ngoto start\n",
    },
    {
      botColor: BotColor.BLUE,
      cellX: 4,
      cellY: 2,
      facing: Direction.LEFT,
      program: "start: move\nmove\ngoto start\n",
    },
  ],
  coins: [
    {x:0, y:1},
    {x:1, y:1},
    {x:2, y:1},
    {x:3, y:1},
    {x:4, y:1}
  ],
  blocks: [
    {x:2, y:2},
    {x:2, y:3},
  ]
}

var PUZZLE_2 = cloneDeep(PUZZLE_1, {
  name: "Avoid the blocks",
  unlock: function(campaign, state) {
    return levelCompleted(state, 0, 0)
  }
})

var PUZZLE_3 = cloneDeep(PUZZLE_1, {
  name: "Foobar",
  unlock: function(campaign, state) {
    return levelCompleted(state, 0, 1)
  }
})

var PUZZLE_4 = cloneDeep(PUZZLE_1, {
  name: "Baz",
  unlock: function(campaign, state) {
    return levelCompleted(state, 1, 0)
  }
})

var WORLD_1 = {
  id: "world1",
  name: "Move &amp; Turn",
  levels: [
    PUZZLE_1,
    PUZZLE_2
  ]
}

var WORLD_2 = {
  id: "world2",
  name: "Goto",
  levels: [
    PUZZLE_3,
    PUZZLE_4
  ]
}

// simply a list of all worlds
// This data structure is intended to be 100% immutable
// TODO: write a campaign sanity checker that verified that every level
// is accessible, the campaign is beatable, etc.
var PUZZLE_CAMPAIGN = [
  WORLD_1,
  WORLD_2]

var PUZZLE_CAMPAIGN_STATE = {
  current_level: {
    world_index: 0,
    level_index: 0
  },

  /**
   * if visibility.complete == true, then the whole campaign has been completed
   *
   * if visibility[world_index] exists, then that world is visible
   * if visibility[world_index].complete == true, then that world is completed
   *
   * if visibility[world_index][level_index] exists, then that level is visible
   * if visibility[world_index][level_index].complete == true, then that level is completed
   */
  visibility: {
    0: {
      complete: false,
      0: {
        complete: false,
      },
    },
    complete: false
  }
}

var BOARD = undefined

// BOARD.bots[PROGRAMING_BOT_INDEX] is the bot currently being programmed
// by the CodeMirror editor
var PROGRAMING_BOT_INDEX = 0

/**
 * TODO: create a cell property, where cell[x][y] yields
 * a list of objects in that cell. In the mean time, I'll just search
 * through the bots and coins objects when needed.
 */

var MAX_MARKER_STRENGTH = 1.0
var MIN_MARKER_STRENGTH = 0.00001
var INIT_MARKER_STRENGTH = 0.35

// map of reserved words (built using fancy lodash style)
var reservedWords = "move turn left right goto"
var RESERVED_WORDS = _(reservedWords.split(" "))
  .map(function(word) { return [word, true] })
  .object()
  .value()

var COIN_RADIUS = 6
var COIN_EXPLODE_RADIUS = 100

window.onload = windowOnLoad

