// Array Remove - By John Resig (MIT Licensed)
// http://ejohn.org/blog/javascript-array-remove/
function remove(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length)
  array.length = from < 0 ? array.length + from : from
  return array.push.apply(array, rest)
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

// TODO: what other code should go in this file?

// TODO: botIndex should be botId
function setBotProgram(board, botIndex, program) {
  if (typeof board.bots[botIndex] != "undefined") {
    board.bots[botIndex].program = program
  }
}

/**
 * Given a "board-configuration object," yields a new board object
 * TODO: ensure board.id is prefixed with puzzle_
 */
function loadBoard(campaign, state) {
  var lev = state.current_level
  var boardConfig = campaign[lev.world_index].levels[lev.level_index].level

  var board = {
    num_cols: boardConfig.num_cols,
    num_rows: boardConfig.num_rows,
    coins: cloneDeep(boardConfig.coins),
    blocks: cloneDeep(boardConfig.blocks),
    traps: cloneDeep(boardConfig.traps),
    coinsCollected: 0
  }

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

  if ("hint" in boardConfig) {
    board.visualize.persist.hint = boardConfig.hint
  }
  
  // the index of the bot being programmed by the code editor
  // TODO: this should be bot __id__ not bot __index__
  // TODO: this should go into board.visualize.persist
  board.visualize.programming_bot_index = boardConfig.programming_bot_index

  board.win_conditions = cloneDeep(boardConfig.win_conditions)

  board.constraints = cloneDeep(boardConfig.constraints)

  /**
   * The awards that will be given to the player once the level is
   * completed.
   */
  board.badges = cloneDeep(boardConfig.badges)

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
    var program = compilePuzzleCode(configBot.program, board)

    assert(program.constraintViolation == false,
      "loadBoard: program.constraintViolation == false")

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
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

// TODO: what else should go in this file?

// returns true if the specified level is visible
function isLevelAccessible(state, world_index, level_index) {
  return world_index in state.visibility &&
    level_index in state.visibility[world_index]
}

// returns true iff the specificed level has been completed
function isLevelCompleted(state, world_index, level_index) {
  return isLevelAccessible(state, world_index, level_index) &&
    state.visibility[world_index][level_index].complete
}

function isWorldAccessible(state, world_index) {
  return world_index in state.visibility
}

function isWorldCompleted(state, world_index) {
  return isWorldAccessible(state, world_index) &&
    state.visibility[world_index].complete
}

function isCampaignCompleted(state) {
  return state.visibility.complete = true
}

/**
 * If there is a previous level, returns {
 *    world_index: int
 *    level_index: int 
 *   }
 * Otherwise, returns {}
 */
function getPrevLevel(campaign, world_index, level_index) {
  if (world_index == 0 && level_index == 0) {
    return {}
  } else if (level_index == 0) {
    return {
      world_index: world_index - 1,
      level_index: campaign[world_index - 1].levels.length - 1
    }
  } else {
    return {
      world_index: world_index,
      level_index: level_index - 1
    }
  }
}

/**
 * If there is a next level, returns {
 *    world_index: int
 *    level_index: int
 *   }
 * Otherwise, returns {}
 */
function getNextLevel(campaign, world_index, level_index) {
  var lastLevelInThisWorld = campaign[world_index].levels.length - 1

  if (level_index == lastLevelInThisWorld) {
    var lastWorldIndex = campaign.length - 1
    if (world_index == lastWorldIndex) {
      return {}
    } else {
      return {
        world_index: world_index + 1,
        level_index: 0
      }
    }
  } else {
    return {
      world_index: world_index,
      level_index: level_index + 1
    }
  }
}

// returns true iff the previous level has been completed
function prevLevelCompleted(campaign, state, world_index, level_index) {
  var prevLevel = getPrevLevel(campaign, world_index, level_index)
  return isLevelCompleted(state, prevLevel.world_index,
      prevLevel.level_index)
}

/**
 * a "visibilityObject" comes from board.visibility
 * it is an object, where each key is either an index or "complete"
 * returns the index keys from visibilityObject
 */
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

// mark every world and level visible
function campaignAllVisible(campaign, state) {
  var next = getNextLevel(campaign, 0, 0)
  while (!_(next).isEmpty()) {
    if (!isLevelAccessible(state, next.world_index, next.level_index)) {
      unlockLevel(state, next.world_index, next.level_index)
    }
    next = getNextLevel(campaign, next.world_index, next.level_index)
  }
  showOrHideLevelMenu(state)
}

/**
 * called upon a victory to update state.visibility
 * returns an array of "campaign delta" objects (used for animating campaign
 * changes), which have several forms:
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
 * (5) for completing the game for the first time
 *    {
 *      game_complete: true
 *    }  
 *
 * TODO: unit tests
 * TBD: beating the game and other awards / badges
 */
function updateLevelVisibility(board, campaign, state) {

  var world_index = state.current_level.world_index
  var level_index = state.current_level.level_index

  // if the level has already been beaten, then there is nothing to update
  if (state.visibility[world_index][level_index].complete) {
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

        // Grab the "unlock function" for this level
        var unlockFn = campaign[lev.world_index].levels[lev.level_index].unlock

        // should this level be unlocked?
        if (unlockFn(campaign, state, lev.world_index, lev.level_index)) {

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
    if (!state.visibility[world_index][i].complete) {
      world_complete = false
    }
  }

  if (world_complete) {
    deltas.push({
        world_complete: world_index
    })

    var nextLevel = getNextLevel(campaign, world_index, level_index)

    // If there is no next level
    if (_(nextLevel).isEmpty()) {
      deltas.push({
        game_complete: true
      })
    }
  }

  return deltas

}

/**
 * loadLevel for loading visualization elements for a level, whereas
 * loadBoard is for creating a new board object from a board-configuration obj
 * TODO: where should this code go? Come up with a better function name.
 */
function loadLevel(campaign, state) {
  var world_i = state.current_level.world_index
  var level_i = state.current_level.level_index
  var level = campaign[world_i].levels[level_i].level

  if (AUTO_SOLVE_DEBUG) {
    var programText = level.solutions[0]
  } else {
    var programText = level.bots[level.programming_bot_index].program
  }

  var levelName = getLevelName(world_i, level_i, level.name)

  $("#leveltitle").text(levelName)

  displayConstrains(level.constraints)

  PLAY_STATUS = PlayStatus.INITAL_STATE_PAUSED
  CODE_MIRROR_BOX.setValue(programText)
  
}
/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

/**
 * IDEA: breakpoints, see http://codemirror.net/demo/marker.html
 *
 * TODO: error text usually needs to be more verbose. Perhaps add a link to
 * a modal that explains the error and gives references.
 *
 * IDEA: put drop-down boxes in comment section so you can fit more text there
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

function setupCodeMirrorBox() {

  // Defines a syntax highlighter for the PuzzleCode language
  CodeMirror.defineMIME("text/x-puzzlecode", {
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
  })

  var settings = {
    gutters: ["note-gutter", "CodeMirror-linenumbers"],
    mode:  "text/x-puzzlecode",
    theme: "eclipse",
    smartIndent: false,
    lineNumbers: true,
    height: 50
  }

  CODE_MIRROR_BOX = CodeMirror(document.getElementById("codeMirrorEdit"),
    settings)

  cm = CODE_MIRROR_BOX
  cm.setSize("100%", "250px")

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
}
/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

// TODO: careful unit testing

Opcode = {
  MOVE: 0,
  TURN: 1,
  GOTO: 2
}

function PuzzleCodeInstruction(
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

function PuzzleCodeProgram(
    // string
    programText,
    // array of instruction objects (or null if there was an error)
    instructions,
    // maps lineNumber to comment for that line
    lineComments,
    // true iff the program violates a constraint
    constraintViolation) {
  this.programText = programText
  this.instructions = instructions
  this.lineComments = lineComments
  this.constraintViolation = constraintViolation
}

function newErrorComment(text, url) {
  var newlink = document.createElement('a')
  newlink.setAttribute('href', url)
  newlink.setAttribute('target', '_blank')
  newlink.setAttribute('class', 'errorLink')
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
    instruction = new PuzzleCodeInstruction(Opcode.MOVE, null)
    comment = newComment("") //Move forward one square")
  } else {
    instruction = null
    comment = newErrorComment("Malformed 'move' instruction",
      WIKI_URL + "Move-instruction#malformed-move-instruction")
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
    comment = newErrorComment("The 'turn' instruction is missing a direction",
      WIKI_URL + "Turn-instruction#the-turn-instruction-is-missing-a-direction")
    error = true
  } else {
    var direction = tokens[1]
    if (direction == "left") {
      instruction = new PuzzleCodeInstruction(Opcode.TURN, Direction.LEFT)
      comment = newComment("")//Rotate to the left ↰")
    } else if (direction == "right") {
      instruction = new PuzzleCodeInstruction(Opcode.TURN, Direction.RIGHT)
      comment = newComment("")//Rotate to the right ↱")
    } else {
      instruction = null
      comment = newErrorComment("'" + direction + "' is not a valid direction",
        WIKI_URL + "Turn-instruction#_____-is-not-a-valid-direction")
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
    comment = newErrorComment("The 'goto' instruction is missing a label",
      WIKI_URL + "Goto-instruction#error-message-the-goto-instruction-is-missing-a-label")
    error = true
  } else {
    var label = tokens[1]
    if (!isValidLabel(label)) {
      instruction = null
      comment = newErrorComment("'" + label + "' is not a valid label",
        WIKI_URL + "Goto-instruction#error-message-_____-is-not-a-valid-label")
      error = true
    } else {
      instruction = new PuzzleCodeInstruction(Opcode.GOTO, label)
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
 *  instruction is a PuzzleCodeInstruction and comment is a string
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
      comment = newErrorComment("'" + label + "' is not a valid label",
        WIKI_URL + "Goto-instruction#error-message-_____-is-not-a-valid-label")
      return [null, comment, true, null]
    } else if (label in labels) {
      // TODO: get labels
      comment = newErrorComment("label '" + label + "' is already defined",
        WIKI_URL + "Goto-instruction#error-message-label-_____-is-already-defined")
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
    comment = newErrorComment("'" + opcode + "' is not an instruction",
      WIKI_URL + "Error-messages#error-message-_____-is-not-an-instruction")
    result = [null, comment, true, null]
  }
  var instruction = result[0]
  if (instruction != null) {
    instruction.lineIndex = lineIndex
  }
  return result

}

// Compiles a programText into a PuzzleCodeProgram object
function compilePuzzleCode(programText, board) {

  var lines = programText.split("\n")

  var instructions = []
  var lineComments = {}

  // map from label-string to instruction pointer for that label
  var labels = {}

  // map from label-string to line number for that label
  var labelLineNumbers = {}

  var error = false
  var constraintViolation = false

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

  // ensure max_instructions is not exceeded
  if (!error && "max_instructions" in board.constraints) {
    var max_instructions = board.constraints.max_instructions
    if (instructions.length > max_instructions) {
      error = true
      constraintViolation = true
      // add an error message at each instruction past the limit
      for (var i = max_instructions; i < instructions.length; i++) {
        var instruction = instructions[i]
        lineComments[instruction.lineIndex] =
          newErrorComment("Too many instructions",
            WIKI_URL + "Error-messages#error-message-too-many-instructions")
      }
    }
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
          newComment("")//resume execution at line " + labelLineNumbers[label])
      } else {
        error = true
        lineComments[instruction.lineIndex] =
          newErrorComment("the label '" + label + "' does not exist",
            WIKI_URL + "Goto-instruction#error-message-the-label-_____-does-not-exist")
      }
    }
  }

  if (error) {
    return new PuzzleCodeProgram(programText, null, lineComments,
      constraintViolation)
  } else {
    return new PuzzleCodeProgram(programText, instructions, lineComments,
      constraintViolation)
  }
}
/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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
    console.error(message)
  }
}

function assertLazy(message, func) {
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


/**
 * Usage: assign appropriate values to TC_NAME, TC, RESULT, and TEST_FILENAME
 * The test fails if bool == false
 */
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
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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

}

// These event handlers are registered in main.js and in index.html
function windowOnLoad() {

  setupCodeMirrorBox()
  registerEventHandlers()
  setupTutorial()

  setSpeed(INIT_PLAY_SPEED)

  var campaign = PUZZLE_CAMPAIGN
  var state = PUZZLE_CAMPAIGN_STATE

  showOrHideLevelMenu(state) 

  loadLevel(campaign, state)
  restartSimulation()

}

function chooseLevelClick() {
  PLAYER_HAS_USED_LEVEL_MENU = true
  $("#choose-level-div").removeClass("glow-focus")
  setupVictoryModal(PUZZLE_CAMPAIGN, PUZZLE_CAMPAIGN_STATE, [])
  $("#victoryModal").modal('show')
}

/**
 * Code for the speed drop down menu
 *****************************************************************************/

function setSpeed(speed) {
  ANIMATION_DUR = speed[0]
  CYCLE_DUR = speed[1]
  $("#speedText").text(speed[2])
  EASING = speed[3]
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


    // TODO: give a tip to click the hint button (when it is highlighted)
    if (HELP_BUTTON_CLICKED) {
      d3.select("#messageBoxHeader")
        .text("Tip:")
      d3.select("#messageBox")
        .html("<h3>Click the 'Run!' button to run your program</h3>")
    } else {
      d3.select("#messageBoxHeader")
        .text("")
      d3.select("#messageBox")
        .html("<br><h3>To begin, click the blue 'Help' button below</h3><br>")
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
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function keyword(str) {
  return "<span class='keyword'>" + str + "</span>"
}

function keyword_link(str) {
  return "<span class='keyword-link'>" + str + "</span>"
}
/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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
function tryMove(board, bot, x, y) {

  // TODO: matching objects like this doesn't seem to to be the best idea.
  // Instead, uild up a cell matrix or some other data structure
  var matchingBlocks = _(board.blocks)
    .filter( function(block) {
      return block.x == x && block.y == y
    })
    .value()

  var matchingBots = _(board.bots)
    .filter( function(bot) {
      return bot.cellX == x && bot.cellY == y
    })
    .value()

  return matchingBlocks.length == 0 && matchingBots.length == 0
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

// if this bot is in a trap, then remove it from the board
// returns true if the bot was trapped
// TODO: unit test trap
function checkTrap(board, bot) {
  var matchingTraps = _(board.traps)
    .filter( function(trap) {
      return trap.x == bot.cellX && trap.y == bot.cellY
    })
    .value()

  if (matchingTraps.length == 0) {
    return false
  } else {

    // TODO: more efficient way to remove bot
    board.bots = _(board.bots)
      .filter(function(b) {
        return b.id != bot.id
      }).value()

    if (!("traps" in board.visualize.step.general)) {
      board.visualize.step.general.traps = []
    }

    board.visualize.step.general.traps.push({
      x: bot.cellX,
      y: bot.cellY,
      bot : bot
    })

    return true
  }
}

function botDone(result, board, bot) {
  bot.program.done = true
  result.visualize.programDone = true

  // TODO only set encourage_reset if it's sensible.
  // Right now, if any bot's program finishes encourage_reset will be
  // activated.
  // Perhaos the best thing is have each puzzle define a function that
  // analyzes the board and determines whether or not a reset should be
  // encouraged
  board.visualize.step.general.encourage_reset = true
}

// a sub-step in the simulation
function dubstep(board, bot) {

  if (checkTrap(board, bot)) {
    return
  }

  // make sure this bot hasn't finished
  if ("done" in bot.program) {
    return
  } 

  // the bot-instruction functions will populate the fields of result
  var result = {
    // containins all visualizations for this bot
    visualize: {},
    // array of markers deposited by the bot
    depositMarker: []
  }

  var instruction = undefined

  // if the bot has an empty program
  if (bot.program.instructions.length == 0) {
    botDone(result, board, bot)
  }
  // if the bot's program is non-empty
  else {
    assert(bot.ip >= 0 && bot.ip < bot.program.instructions.length,
      "dubstep: bot.ip >= 0 && bot.ip < bot.program.instructions.length")
    instruction = bot.program.instructions[bot.ip]

    result.visualize.lineIndex = instruction.lineIndex

    // NOTE: executing the goto instruction (and others) may modify the ip
    bot.ip = bot.ip + 1

    if (instruction.opcode == Opcode.MOVE) {
      executeMove(result, board, bot)
    } else if (instruction.opcode == Opcode.TURN) {
      executeTurn(result, bot, instruction.data)
    } else if (instruction.opcode == Opcode.GOTO) {
      executeGoto(result, bot, instruction.data)
    }

    if (bot.ip < bot.program.instructions.length) {
      var nextInstruction = bot.program.instructions[bot.ip]
      result.visualize.nextLineIndex = nextInstruction.lineIndex
    }

    // if the bot has reached the end of its program
    if (bot.ip >= bot.program.instructions.length) {
      botDone(result, board, bot)
    }

    _(result.depositMarker).forEach( function (marker) {
      addMarker(board, marker)
    })

  }

  board.visualize.step.bot[bot.id] = result.visualize

}

// TODO: do a better job separating model from view.
function step(board, campaign, state) {

  // contains all data needed to visualize this step of the game
  board.visualize.step = {

    // visualizations associated with the board, but not any particular bot
    general: {},

    // bots[bot.id] == an object containing all visualizations for that bot
    // e.g. bot[1].lineIndex == the index of the line currently being
    // executed for that bot with bot.id == 1
    bot: {}
  }

  assertLazy(
    "board.bots must be ordered according to id, and every bot must have " +
    "a unique id",
    function(){
      var prevId = -1
      var sorted = true
      _(board.bots)
        .forEach(function(bot) {
          if (bot.id <= prevId) {
            sorted = false
          }
          prevId = bot.id
        })
      return sorted
    })

  _(board.bots).forOwn(function(bot) {
    dubstep(board, bot)
  })

  checkVictory(board, campaign, state)

  // Decay the strength of each marker on the board
  _(getMarkers(board)).forEach( function(m) {
    board.markers[m.x][m.y][m.quadrant][m.botColor] = decayMarker(m.strength)
  })
}

/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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

}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

/**
 * campaign and state have the usual meaning
 * campaign_deltas is an array of "campaign delta" objects, as returned
 * by the updateLevelVisibility() function
 *
 * returns html that enumerates the badges specified in campaign_deltas
 */
function getBadgesHtml(campaign, state, campaign_deltas) {
  var html = ""

  if (campaign_deltas.length == 0) {
    html += "<br><br>"
  }

  // First add the badges to the modal
  _(campaign_deltas)
    .forEach(function(delta) {

      // if a level has been unlocked
      if ("level_unlock" in delta) {

        var name = campaign[delta.world_index]
          .levels[delta.level_unlock].level.name
        var level_name = getLevelName(
            delta.world_index,
            delta.level_unlock,
            name)

        html += '<h5>'
          + '<span class="label label-success victory-label">New level</span> '
          + 'You unlocked <a href="'
          + levelLink(delta.world_index, delta.level_unlock)
          + '">'
          + level_name
          + '</a>'
          + '</h5>'

      }
      // if a world has been unlocked
      else if ("world_unlock" in delta) {
        /*var next_world_name = campaign[delta.world_unlock].name

        html += '<h5>'
          + '<span class="label label-success victory-label">New world</span> '
          + 'You unlocked World '
          + (delta.world_unlock + 1)
          + ': '
          + next_world_name
          + '</h5>'
        */
      } else if ("level_complete" in delta) {
        /*worldMenuCheckLevel(campaign, delta.world_index, delta.level_complete)

        var name = campaign[delta.world_index]
          .levels[delta.level_complete].level.name
        var level_name = getLevelName(
          delta.world_index,
          delta.level_complete,
          name)

        html += '<h5>'
          + '<span class="label label-warning victory-label">Level complete</span> '
          + 'You completed '
          + level_name
          + '</h5>'

        var nextLevel = getNextLevel(campaign, delta.world_index,
          delta.level_complete)

        // if there is a next level, then update the play-next-level button
        if (!_(nextLevel).isEmpty()) {
          $("#victoryModal_playNextButton")
            .attr("href", "javascript: transitionLevel("
              + nextLevel.world_index
              + ","
              + nextLevel.level_index
              + ")")
          $("#victoryModal_playNextButton").removeAttr("style")
        } else {
          $("#victoryModal_playNextButton").attr("style", "display: none;")
        }
        */
      } else if ("world_complete" in delta) {

        var world_name = campaign[delta.world_complete].name

        html += '<h5>'
          + '<span class="label label-important victory-label">World Complete</span> '
          + 'You completed World '
          + (delta.world_complete + 1)
          + ': '
          + world_name
          + '</h5>'

      } else if ("game_complete" in delta) {

        html += '<h5>'
          + '<span class="label label-inverse victory-label">Game Complete</span> '
          + "You have completed the game!"
          + '</h5>'

      } else {
        console.error("Unexpected delta: ")
        console.dir(delta)
      }

    })

  return html
}

function getLevelButtonHtml(campaign, state, world_index, level_index) {

  if (isLevelCompleted(state, world_index, level_index)) {
    var completed = true
    var visible = true
  } else if (isLevelAccessible(state, world_index, level_index)) {
    var completed = false
    var visible = true
  } else {
    var completed = false
    var visible = false
  }

  var html = '<a '

  if (completed || visible) {
    var name = campaign[world_index].levels[level_index].level.name
    var levelName = getLevelName(world_index, level_index, name)

    html += 'data-toggle="tooltip" title="' + levelName + '" '
    html +='href="javascript: transitionLevel('
      + world_index + ',' + level_index + ')" '

    if (completed) {
      html += 'class="btn btn-level-menu">'
    } else {
      html += 'class="btn btn-level-menu btn-primary">'      
    }

    html += (world_index + 1) + "." + (level_index + 1) + " "

  } else {
    html += 'href="#" class="btn btn-level-menu disabled">'
  }

  if (completed) {
    html += '<i class="icon-ok"></i>'
  } else if (!visible) {
    html += '<i class="icon-lock"></i>'
  }
  html += '</a>'

  return html
}

function getWorldMenuHtml(campaign, state, world_index) {

  var world = campaign[world_index]

  var html = "<tr>"

  html +=
    //'<td><div class="alert alert-info world-menu-label">'
    '<td><h4>'
    + "World " + (world_index + 1) + ": "
    + world.name
    + '</h4></td>'
    //+ '</div></td>'

  html += "<td>"

  var levels = world.levels

  for (level_index in levels) {
    html += getLevelButtonHtml(campaign, state, world_index, parseInt(level_index))
  }

  html += "</td>"
  html += "</tr>"
  return html
}

function getCampaignMenuHtml(campaign, state) {
  var html = "<table class='table table-striped'>"

  for (world_index in campaign) {
    if (isWorldAccessible(state, world_index)) {
      html += getWorldMenuHtml(campaign, state, parseInt(world_index))
    }
  }

  html += "</table>"

  return html

}

/**
 * campaign and state have the usual meaning
 * campaign_deltas is an array of "campaign delta" objects, as returned
 * by the updateLevelVisibility() function
 */
function setupVictoryModal(campaign, state, campaign_deltas) {

  var html = getBadgesHtml(campaign, state, campaign_deltas)
    + getCampaignMenuHtml(campaign, state) 

  $("#victoryModalBody").html(html)
}
/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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

  var lineHandle = code_mirror_box.getLineHandle(lineIndex)
  var identifier = "_" + css
  if (code_mirror_box[identifier] != lineHandle) {
    cm.addLineClass(lineHandle, "background", css)
    code_mirror_box[identifier] = lineHandle
  }

}

function rightComment(text) {
  var newlink = document.createElement('div')
  newlink.setAttribute('style', "text-align: right;")
  newlink.appendChild(newComment(text))
  return newlink
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
    var lineComments = {}

    if ("lineIndex" in bot_viz) {
      highlightLine(cm, bot_viz.lineIndex, BACK_CLASS)
      if (TUTORIAL_STEP_BUTTON_ACTIVE) {
        lineComments[bot_viz.lineIndex] = rightComment("previous instruction")
      }
    }

    if ("nextLineIndex" in bot_viz) {
      highlightLine(cm, bot_viz.nextLineIndex, NEXT_BACK_CLASS)
      if (TUTORIAL_STEP_BUTTON_ACTIVE) {
        lineComments[bot_viz.nextLineIndex] = rightComment("next instruction")
      }
    }

    if (!_(lineComments).isEmpty()) {
      addLineComments(cm, lineComments)
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
/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

var WinCondition = {
  COLLECT_COINS: 0
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

// TODO: consistent jargon for level selector etc as "level menu"

// show or hide the level menu, depending on whether or not multiple
// levels can be played

// TODO: when reveaing level menu for first, time highlight it somehow
// until after the user clicks it for the first time
// BUG: there seems to be a race condition. If you beat the first level
// on fast speed this function doesn't work properly
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
    $("#choose-level-div").attr("style", "display: none;")
  } else {
    $("#choose-level-div").removeAttr("style")
    
    if (!PLAYER_HAS_USED_LEVEL_MENU) {
      $("#choose-level-div").addClass("glow-focus")
    }
  }

}

function getLevelName(world_index, level_index, name) {
  return "Level "
    + (parseInt(world_index) + 1)
    + "."
    + (parseInt(level_index) + 1)
    + " " + name  
}

function levelLink(world_index, level_index) {
  return "javascript: transitionLevel(" + world_index + "," + level_index + ")"
}
/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_blocks() {
  return {
    id: "blocks",
    name: "Blocks",
    description: "Collect all the coins on the board.",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>"
      + "Your robot cannot move through blocks. It must go around them."
      + "</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],
    badges: {},
    constraints: [],

    // what conditions need to be met to unlock this level?
    // the unlock returns true if this level should be unlocked
    // TODO: come up with better unlock functions. e.g.
    //    return USED_MOVE && USED_TURN && isLevelCompleted(LevelEnum.Previous)
    unlock: function(campaign, state, world_index, level_index) {
      return prevLevelCompleted(campaign, state, world_index, level_index)
    },

    solutions: [
      "move\nmove\nturn left\nmove\nmove\nturn right\nmove\nmove\nturn right\nmove\nmove",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 2,
        cellY: 3,
        facing: Direction.RIGHT,
        program: "",
      },
    ],
    coins: [
      {x:6, y:3},
    ],
    blocks: [
      {x:5, y:2},
      {x:5, y:3},
      {x:5, y:4},
    ],
    traps: [
      //{x:3, y:0}
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_torus() {
  return {
    id: "torus",
    name: "Torus",
    description: "Collect all the coins on the board.",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>"
      + "If your robot goes off the board, it will wrap around -- and come "
      + "back on the opposite side."
      + "</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],
    constraints: [],
    solutions: [
      "move\nmove\nmove\nmove\nmove\nmove\nmove\n",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 2,
        facing: Direction.UP,
        program: "",
      },
    ],
    coins: [
      {x:4, y:0},
      {x:4, y:1},
      {x:4, y:4},
      {x:4, y:5},
      {x:4, y:6},
    ],
    blocks: [
      {x:0, y:3},
      {x:1, y:3},
      {x:2, y:3},
      {x:3, y:3},
      {x:4, y:3},
      {x:5, y:3},
      {x:6, y:3},
      {x:7, y:3},
      {x:8, y:3},
    ],
    traps: [
      //{x:3, y:0}
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_traps() {
  return {
    id: "traps",
    name: "Watchout for the traps",
    hint: "<p>Watchout for the traps...</p>",
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],
    constraints: [],
    solutions: [
        "turn right\nmove\nmove\nturn right\nmove\nturn left\nmove\nmove\n"
        + "move\nmove\nturn right\nmove\nmove\nmove\nmove\nmove"
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 4,
        facing: Direction.UP,
        program: "",
      },
    ],
    coins: [
      {x:1, y:0},
      {x:1, y:1},
      {x:1, y:2},
      {x:1, y:3},
      {x:5, y:4},
      {x:6, y:4},
      {x:0, y:5},
      {x:1, y:5},
      {x:6, y:5},
      {x:7, y:5},
      {x:8, y:5},
      {x:1, y:6},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: [
      {x:0, y:0},
      //{x:1, y:0},
      {x:2, y:0},
      {x:3, y:0},
      {x:4, y:0},
      {x:5, y:0},
      {x:6, y:0},
      {x:7, y:0},
      {x:8, y:0},

      {x:0, y:1},
      //{x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
      {x:4, y:1},
      {x:5, y:1},
      {x:6, y:1},
      {x:7, y:1},
      {x:8, y:1},

      {x:0, y:2},
      //{x:1, y:2},
      {x:2, y:2},
      {x:3, y:2},
      {x:4, y:2},
      {x:5, y:2},
      {x:6, y:2},
      {x:7, y:2},
      {x:8, y:2},

      {x:0, y:3},
      //{x:1, y:3},
      {x:2, y:3},
      {x:3, y:3},
      {x:4, y:3},
      {x:5, y:3},
      {x:6, y:3},
      {x:7, y:3},
      {x:8, y:3},

      {x:0, y:4},
      {x:1, y:4},
      {x:2, y:4},
      {x:3, y:4},
      //{x:4, y:4},
      //{x:5, y:4},
      //{x:6, y:4},
      {x:7, y:4},
      {x:8, y:4},

      //{x:0, y:5},
      //{x:1, y:5},
      {x:2, y:5},
      {x:3, y:5},
      {x:4, y:5},
      {x:5, y:5},
      //{x:6, y:5},
      //{x:7, y:5},
      //{x:8, y:5},

      {x:0, y:6},
      //{x:1, y:6},
      {x:2, y:6},
      {x:3, y:6},
      {x:4, y:6},
      {x:5, y:6},
      {x:6, y:6},
      {x:7, y:6},
      {x:8, y:6},

      {x:0, y:7},
      {x:1, y:7},
      {x:2, y:7},
      {x:3, y:7},
      {x:4, y:7},
      {x:5, y:7},
      {x:6, y:7},
      {x:7, y:7},
      {x:8, y:7},
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_uturn() {
  return {
    id: "uturn",
    name: "U-turn",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>Your robot <strong>cannot</strong> go backwards.</p>"
      + "<p>To perform a u-turn you need to <strong>turn twice</strong> (to "
      + "the left twice, or to the right twice).</p>"
      + "<p>If you need help on turning, checkout "
      + "<a target='_blank' href='"
      + WIKI_URL + "turn%20instruction"
      + "'>this help page</a>.</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    constraints: [],

    solutions: [
      "turn right\nturn right\nmove\nmove\nmove",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 3,
        facing: Direction.RIGHT,
        program: "turn right\nmove\nmove\nmove\n",
      },
    ],
    coins: [
      {x:3, y:3},
      {x:2, y:3},
      {x:1, y:3},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: []
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_welcome() {
  return {
    id: "intro_puzzle",
    name: "Welcome to Puzzle Code!",
    description: "Collect all the coins on the board.",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>"
      + "In Puzzle Code there are many <strong>instructions</strong> you "
      + "can use to <strong>program</strong> your robot."
      + "</p>"
      + "<p>"
      + "This level introduces you to <strong>two instructions</strong>: "
      + keyword("move") + " and " + keyword("turn") + "."
      + "</p>" 
      + "<h3>Move</h3>"
      + "<ul>"
      +   "<li>The " + keyword("move") + " instruction moves the "
      +       "robot forward one square.</li>"
      +   "<li>The robot can only move forward. It cannot move backwards or "
      +   "sideways.</li>"
      +     "<li>"
      +         "<a target='_blank' href='"
      +         WIKI_URL + "Move-instruction"
      +         "'>"
      +       "Learn more about the " + keyword_link("move") + " instruction."
      +     "</a></li>"
      + "</ul>"
      + "<h3>Turn</h3>"
      + "<ul>"
      +   "<li>" + keyword("turn left") + " will rotate the robot to the left." 
      +   "<li>" + keyword("turn right") + " will rotate the robot to the right."
      +     "<li>"
      +         "<a target='_blank' href='"
      +         WIKI_URL + "Turn-instruction"
      +         "'>"
      +       "Learn more about the " + keyword_link("turn") + " instruction."
      +     "</a></li>"
      + "</ul>"
      + "<h3>Example program</h3>"
      + "<pre>"
      + keyword("move") + "<br>"
      + keyword("move") + "<br>"
      + keyword("turn right") + "<br>"
      + keyword("move")
      + "</pre>"
      + "<p>This program tells the robot to:</p>"
      + "<ul>"
      +   "<li>move forward twice</li>"
      +   "<li>rotate to the right 90 degrees</li>"
      +   "<li>move forward once</li>"
      + "</ul>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    constraints: [],

    solutions: [
      "move\nmove\nmove\nturn left\nmove\nmove\nmove\nmove\n",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 4,
        facing: Direction.UP,
        program: "move\nmove\nturn left\nmove\nmove\n",
      },
    ],
    coins: [
      {x:0, y:1},
      {x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: [
      //{x:3, y:0}
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function world_moveTurn() {
  return {
    id: "world1",
    name: "Move &amp; Turn",
    levels: [
      {
        level: puzzle_welcome(),
        /**
         * The awards that will be given to the player once the level is
         * completed.
         */
        badges: {
          instruction: {
            "move": true,
            "turn": true
          }
        },
        /**
         * what conditions need to be met to unlock this level?
         * the unlock returns true if this level should be unlocked
         */
        unlock: function() {
          return true
        },
      },
      {
        level: puzzle_uturn(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_blocks(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_torus(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_zig_zag(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_traps(),
        badges: {},
        unlock: function(campaign, state, world_index, level_index) {
          return isLevelCompleted(state, world_index, level_index - 2) 
        }
      },
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_wrapAround() {
  return {
    id: "puzzle1",
    name: "Wrap around",
    description: "tbd",
    hint: "tbd",
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],
    constraints: [],
    solutions: [
      _(["turn left", "turn left",
       "move",
       "turn right",
       "move", "move", "move", "move", "move", "move"]).join("\n")
    ],
    num_cols: 8,
    num_rows: 8,
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 3,
        cellY: 3,
        facing: Direction.UP,
        program: "",
      }
    ],
    coins: [
      {x:0, y:4},
      {x:1, y:4},
      {x:2, y:4},
      {x:3, y:4},
      {x:5, y:4},
      {x:6, y:4},
      {x:7, y:4},
    ],
    blocks: [
      {x:4, y:0},
      {x:4, y:1},
      {x:4, y:2},
      {x:4, y:3},
      {x:4, y:4},
      {x:4, y:5},
      {x:4, y:6},
      {x:4, y:7},
    ],
    traps: [
      //{x:3, y:0}
    ]
  }
}
/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_zig_zag() {
  return {
    id: "zigzag",
    name: "Zig zag",
    hint: "<p>Zig, then zag. Then do it again.</p>",
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],
    constraints: [],
    solutions: [
        "move\nturn right\nmove\nturn left\nmove\nturn right\nmove\n"
        + "turn left\nmove\nturn right\nmove\nturn left\nmove\nturn right\n"
        + "move\nturn left\nmove\nturn right\nmove\nturn left\nmove\n"
        + "turn right\nmove\n"
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 0,
        cellY: 6,
        facing: Direction.UP,
        program: "",
      },
    ],
    coins: [
      {x:5, y:0},
      {x:6, y:0},
      {x:4, y:1},
      {x:5, y:1},
      {x:3, y:2},
      {x:4, y:2},
      {x:2, y:3},
      {x:3, y:3},
      {x:1, y:4},
      {x:2, y:4},
      {x:0, y:5},
      {x:1, y:5},
   
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: [
      {x:0, y:0},
      {x:1, y:0},
      {x:2, y:0},
      {x:3, y:0},
      {x:4, y:0},
      //{x:5, y:0},
      //{x:6, y:0},
      {x:7, y:0},
      {x:8, y:0},

      {x:0, y:1},
      {x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
      //{x:4, y:1},
      //{x:5, y:1},
      {x:6, y:1},
      {x:7, y:1},
      {x:8, y:1},

      {x:0, y:2},
      {x:1, y:2},
      {x:2, y:2},
      //{x:3, y:2},
      //{x:4, y:2},
      {x:5, y:2},
      {x:6, y:2},
      {x:7, y:2},
      {x:8, y:2},

      {x:0, y:3},
      {x:1, y:3},
      //{x:2, y:3},
      //{x:3, y:3},
      {x:4, y:3},
      {x:5, y:3},
      {x:6, y:3},
      {x:7, y:3},
      {x:8, y:3},

      {x:0, y:4},
      //{x:1, y:4},
      //{x:2, y:4},
      {x:3, y:4},
      {x:4, y:4},
      {x:5, y:4},
      {x:6, y:4},
      {x:7, y:4},
      {x:8, y:4},

      //{x:0, y:5},
      //{x:1, y:5},
      {x:2, y:5},
      {x:3, y:5},
      {x:4, y:5},
      {x:5, y:5},
      {x:6, y:5},
      {x:7, y:5},
      {x:8, y:5},

      //{x:0, y:6},
      {x:1, y:6},
      {x:2, y:6},
      {x:3, y:6},
      {x:4, y:6},
      {x:5, y:6},
      {x:6, y:6},
      {x:7, y:6},
      {x:8, y:6},
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_coins_everywhere() {
  return {
    id: "coins_everywhere",
    name: "Coins Everywhere",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>"
      + "Collect one column of coins, move into another column, and do it "
      + "again. Repeat."
      + "</p>"
      + "<p>" + learnMoreGoto() + "</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    // TODO: add a constraint that you can only use 4 move instructions
    constraints: {
      "max_instructions": 11,
    },

    solutions: [
      "start:\nmove\nmove\nmove\nmove\nmove\nmove\nmove\nturn right\nmove\n" +
      "turn left\ngoto start\n"
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 3,
        facing: Direction.UP,
        program: "",
      },
    ],
    coins: [
      {x:0, y:0},
      {x:0, y:1},
      {x:0, y:2},
      {x:0, y:3},
      {x:0, y:4},
      {x:0, y:5},
      {x:0, y:6},

      {x:1, y:0},
      {x:1, y:1},
      {x:1, y:2},
      {x:1, y:3},
      {x:1, y:4},
      {x:1, y:5},
      {x:1, y:6},

      {x:2, y:0},
      {x:2, y:1},
      {x:2, y:2},
      {x:2, y:3},
      {x:2, y:4},
      {x:2, y:5},
      {x:2, y:6},

      {x:3, y:0},
      {x:3, y:1},
      {x:3, y:2},
      {x:3, y:3},
      {x:3, y:4},
      {x:3, y:5},
      {x:3, y:6},

      {x:4, y:0},
      {x:4, y:1},
      {x:4, y:2},
      //{x:4, y:3},
      {x:4, y:4},
      {x:4, y:5},
      {x:4, y:6},

      {x:5, y:0},
      {x:5, y:1},
      {x:5, y:2},
      {x:5, y:3},
      {x:5, y:4},
      {x:5, y:5},
      {x:5, y:6},

      {x:6, y:0},
      {x:6, y:1},
      {x:6, y:2},
      {x:6, y:3},
      {x:6, y:4},
      {x:6, y:5},
      {x:6, y:6},

      {x:7, y:0},
      {x:7, y:1},
      {x:7, y:2},
      {x:7, y:3},
      {x:7, y:4},
      {x:7, y:5},
      {x:7, y:6},

      {x:8, y:0},
      {x:8, y:1},
      {x:8, y:2},
      {x:8, y:3},
      {x:8, y:4},
      {x:8, y:5},
      {x:8, y:6},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: [
      //{x:3, y:0}
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_get_unstuck() {
  return {
    id: "get_unstuck",
    name: "Introducing the goto instruction",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>"
      + "This level introduces you to <strong>a new instruction</strong>: "
      + " the " + keyword("goto") + " instruction. "
      + "</p>" 
      + "<h3>Example program</h3>"
      + "<pre>"
      + "start: " + keyword("move") + "<br>"
      + keyword("turn right") + "<br>"
      + keyword("goto")  + " start"
      + "</pre>"
      + "<p>This program tells the robot to:</p>"
      + "<ul>"
      +   "<li>move forward </li>"
      +   "<li>turn right</li>"
      +   "<li>move forward again</li>"
      +   "<li>turn right again</li>"
      +   "<li>and so on forever...</li>"
      + "</ul>"
      + "<h3>How it works</h3>"
      + "<ul>"
      +   "<li>The " + keyword("goto") + " instruction tells the robot to "
      +       "execute <strong>another instruction</strong>, instead of "
      +       "executing the " 
      +       "instruction that comes next.</li>"
      +   "<li>To use the " + keyword("goto") + " instruction you must "
      +       "give a <strong><i>label</i></strong> to another instruction."
      +   "</li>"
      +   "<li>You give another instruction a <i>label</i> by prefixing "
      +     "the instruction with a word followed by the ':' symbol.</li>"
      +   "<li>In this example, "
      +       "<pre>"
      +         "sally: " + keyword("move")
      +       "</pre>"
      +       "sally is a label for the " + keyword("move") + " instruction."
      +   "</li>"
      +   "<li>The label you give for an instruction doesn't really matter. "
      +     "It can be almost anything."
      +   "</li>"
      +     "<li>" + learnMoreGoto() + "</li>"
      + "</ul>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    // TODO: add a constraint that you can only use 4 move instructions
    constraints: {
      "max_instructions": 2,
    },

    solutions: [
      "start: move\ngoto start\n",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 4,
        facing: Direction.UP,
        program: "start: turn right\ngoto start\n",
      },
    ],
    coins: [
      {x: 4, y: 1},
      {x: 4, y: 0},
      {x: 4, y: 2},
      {x: 4, y: 3},
      {x: 4, y: 5},
      {x: 4, y: 6},
    ],
    blocks: [
    ],
    traps: [
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_small_steps() {
  return {
    id: "small_steps",
    name: "Small Steps",

    hint: 
      "<p>"
      + "Take one step forward, then use a " + keyword("goto") + " instruction "
      + "to do it again. "
      + "</p>"
      + "<p>"
      +       "<a target='_blank' href='"
      +         WIKI_URL + "Goto-instruction"
      +         "'>"
      +   "Learn more about the " + keyword_link("goto") + " instruction."
      +   "</a>"
      + "</p>"
    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    constraints: {
      "max_instructions": 2
    },

    solutions: [
      "again: move\ngoto again"
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 1,
        cellY: 3,
        facing: Direction.RIGHT,
        program: "",
      },
    ],
    coins: [
      {x:2, y:3},
      {x:3, y:3},
      {x:4, y:3},
      {x:5, y:3},
      {x:6, y:3},
      {x:7, y:3},

    ],
    blocks: [],
    traps: []
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_spiral() {
  return {
    id: "spiral",
    name: "Spiral",

    hint: 
      "<p>"
      + "It's OK if your robot bumps into a wall."
      + "</p>"
      + "<p>"
      + learnMoreGoto()
      + "</p>"
    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    constraints: {
      "max_instructions": 12
    },

    solutions: [
      "start:\nmove\nmove\nmove\nmove\nmove\nmove\nturn right\ngoto start\n"
    ],
    num_cols: 9,
    num_rows: 8,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 3,
        cellY: 4,
        facing: Direction.UP,
        program: "",
      },
    ],
    coins: [
      {x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
      {x:4, y:1},
      {x:5, y:1},
      {x:6, y:1},
      {x:7, y:1},
      {x:1, y:2},
      {x:7, y:2},
      {x:1, y:3},
      {x:3, y:3},
      {x:4, y:3},
      {x:5, y:3},
      {x:7, y:3},
      {x:1, y:4},
      {x:5, y:4},
      {x:7, y:4},
      {x:1, y:5},
      {x:5, y:5},
      {x:7, y:5},
      {x:1, y:6},
      {x:2, y:6},
      {x:3, y:6},
      {x:4, y:6},
      {x:5, y:6},
      {x:7, y:6},
    ],
    blocks: [
      {x:0, y:0},
      {x:1, y:0},
      {x:2, y:0},
      {x:3, y:0},
      {x:4, y:0},
      {x:5, y:0},
      {x:6, y:0},
      {x:7, y:0},
      {x:8, y:0},

      {x:0, y:1},
      /*{x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
      {x:4, y:1},
      {x:5, y:1},
      {x:6, y:1},
      {x:7, y:1},*/
      {x:8, y:1},

      {x:0, y:2},
      //{x:1, y:2},
      {x:2, y:2},
      {x:3, y:2},
      {x:4, y:2},
      {x:5, y:2},
      {x:6, y:2},
      //{x:7, y:2},
      {x:8, y:2},

      {x:0, y:3},
      //{x:1, y:3},
      {x:2, y:3},
      //{x:3, y:3},
      //{x:4, y:3},
      //{x:5, y:3},
      {x:6, y:3},
      //{x:7, y:3},
      {x:8, y:3},

      {x:0, y:4},
      //{x:1, y:4},
      {x:2, y:4},
      //{x:3, y:4},
      {x:4, y:4},
      //{x:5, y:4},
      {x:6, y:4},
      //{x:7, y:4},
      {x:8, y:4},

      {x:0, y:5},
      //{x:1, y:5},
      {x:2, y:5},
      {x:3, y:5},
      {x:4, y:5},
      //{x:5, y:5},
      {x:6, y:5},
      //{x:7, y:5},
      {x:8, y:5},

      {x:0, y:6},
      /*{x:1, y:6},
      {x:2, y:6},
      {x:3, y:6},
      {x:4, y:6},
      {x:5, y:6},*/
      {x:6, y:6},
      //{x:7, y:6},
      {x:8, y:6},

      {x:0, y:7},
      {x:1, y:7},
      {x:2, y:7},
      {x:3, y:7},
      {x:4, y:7},
      {x:5, y:7},
      {x:6, y:7},
      {x:7, y:7},
      {x:8, y:7},
    ],
    traps: []
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_the_square() {
  return {
    id: "the_square",
    name: "The Square",

    // TODO: add link to goto help page
    hint: 
      "<ul>"
      + "<li>You want to create a loop using the " + keyword("goto") + " "
      + "instruction.</li>"
      + "<li><strong>Each time the loop executes</strong>, you "
      + "want your robot "
      + "to pick up <strong>four coins</strong>, and then position itself "
      + "so that it can pickup the next four coins.</li>"
      + "<li>" + learnMoreGoto() + "</li>"
      + "</ul>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    // TODO: add a constraint that you can only use 4 move instructions
    constraints: {
      "max_instructions": 8,
    },

    solutions: [
      "start: move\nmove\nmove\nmove\nturn right\ngoto start"
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 2,
        cellY: 1,
        facing: Direction.RIGHT,
        program: "",
      },
    ],
    coins: [
      {x:3, y:1},
      {x:4, y:1},
      {x:5, y:1},
      {x:6, y:1},
      {x:6, y:2},
      {x:6, y:3},
      {x:6, y:4},
      {x:6, y:5},
      {x:3, y:5},
      {x:4, y:5},
      {x:5, y:5},
      {x:2, y:2},
      {x:2, y:3},
      {x:2, y:4},
      {x:2, y:5},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: [
      //{x:3, y:0}
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_the_t() {
  return {
    id: "the_t",
    name: "The T",

    // TODO: add link to goto help page
    hint: 
      "<p>"
      + "Instead of turning left at the T, turn right. Then use the "
      + keyword("goto") + " instruction to keep moving."
      + "<p>"
      + "<p>" + learnMoreGoto() + "</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    // TODO: add a constraint that you can only use 4 move instructions
    constraints: {
      "max_instructions": 8,
    },

    solutions: [
       "move\nmove\nmove\nturn right\nstart: move\ngoto start\n",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 5,
        facing: Direction.UP,
        program: "move\nmove\nmove\nturn left\nstart: move\ngoto start\n",
      },
    ],
    coins: [
      {x: 4, y: 2},
      {x: 5, y: 2},
      {x: 6, y: 2},
      {x: 7, y: 2},

      {x: 4, y: 3},
      {x: 4, y: 4},


    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [
      {x: 0, y: 0},
      {x: 0, y: 1},
      {x: 0, y: 2},
      {x: 0, y: 3},
      {x: 0, y: 4},
      {x: 0, y: 5},
      {x: 0, y: 6},

      {x: 1, y: 0},
      {x: 1, y: 1},
      //{x: 1, y: 2},
      {x: 1, y: 3},
      {x: 1, y: 4},
      {x: 1, y: 5},
      {x: 1, y: 6},

      {x: 2, y: 0},
      {x: 2, y: 1},
      //{x: 2, y: 2},
      {x: 2, y: 3},
      {x: 2, y: 4},
      {x: 2, y: 5},
      {x: 2, y: 6},

      {x: 3, y: 0},
      {x: 3, y: 1},
      //{x: 3, y: 2},
      {x: 3, y: 3},
      {x: 3, y: 4},
      {x: 3, y: 5},
      {x: 3, y: 6},

      {x: 4, y: 0},
      {x: 4, y: 1},
      //{x: 4, y: 2},
      //{x: 4, y: 3},
      //{x: 4, y: 4},
      //{x: 4, y: 5},
      {x: 4, y: 6},

      {x: 5, y: 0},
      {x: 5, y: 1},
      //{x: 5, y: 2},
      {x: 5, y: 3},
      {x: 5, y: 4},
      {x: 5, y: 5},
      {x: 5, y: 6},

      {x: 6, y: 0},
      {x: 6, y: 1},
      //{x: 6, y: 2},
      {x: 6, y: 3},
      {x: 6, y: 4},
      {x: 6, y: 5},
      {x: 6, y: 6},

      {x: 7, y: 0},
      {x: 7, y: 1},
      //{x: 7, y: 2},
      {x: 7, y: 3},
      {x: 7, y: 4},
      {x: 7, y: 5},
      {x: 7, y: 6},

      {x: 8, y: 0},
      {x: 8, y: 1},
      {x: 8, y: 2},
      {x: 8, y: 3},
      {x: 8, y: 4},
      {x: 8, y: 5},
      {x: 8, y: 6},

    ],
    traps: [
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function learnMoreGoto() {
  return "<a target='_blank' href='"
      + WIKI_URL + "Goto-instruction"
      + "'>"
      + "Learn more about the " + keyword_link("goto") + " instruction."
      + "</a>"
}

function world_goto() {
  return {
    id: "world2",
    name: "Goto",
    levels: [
      {
        level: puzzle_get_unstuck(),
        badges: {},
        unlock: function(campaign, state, world_index, level_index) {
          return isLevelCompleted(state, world_index - 1, 1) 
        }
      },
      {
        level: puzzle_the_t(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_the_square(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_coins_everywhere(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_spiral(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_zigs_and_zags(),
        badges: {},
        unlock: prevLevelCompleted
      },
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_zigs_and_zags() {
  return {
    id: "zigszags",
    name: "Zigs and zags",
    hint: "<p>"
      + "Zig and zag. Then use " +  keyword("goto") + " to do it again.</p>"
      + "<p>" + learnMoreGoto() + "</p>",

    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],
    constraints: {
      "max_instructions": 5
    },
    solutions: [
        "start: move\nturn right\nmove\nturn left\ngoto start"
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 0,
        cellY: 6,
        facing: Direction.UP,
        program: "",
      },
    ],
    coins: [
      {x:5, y:0},
      {x:6, y:0},
      {x:4, y:1},
      {x:5, y:1},
      {x:3, y:2},
      {x:4, y:2},
      {x:2, y:3},
      {x:3, y:3},
      {x:1, y:4},
      {x:2, y:4},
      {x:8, y:4},
      {x:0, y:5},
      {x:1, y:5},
      {x:7, y:5},
      {x:8, y:5},
      {x:6, y:6},
      {x:7, y:6},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: [
      {x:0, y:0},
      {x:1, y:0},
      {x:2, y:0},
      {x:3, y:0},
      {x:4, y:0},
      //{x:5, y:0},
      //{x:6, y:0},
      {x:7, y:0},
      {x:8, y:0},

      {x:0, y:1},
      {x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
      //{x:4, y:1},
      //{x:5, y:1},
      {x:6, y:1},
      {x:7, y:1},
      {x:8, y:1},

      {x:0, y:2},
      {x:1, y:2},
      {x:2, y:2},
      //{x:3, y:2},
      //{x:4, y:2},
      {x:5, y:2},
      {x:6, y:2},
      {x:7, y:2},
      {x:8, y:2},

      {x:0, y:3},
      {x:1, y:3},
      //{x:2, y:3},
      //{x:3, y:3},
      {x:4, y:3},
      {x:5, y:3},
      {x:6, y:3},
      {x:7, y:3},
      {x:8, y:3},

      {x:0, y:4},
      //{x:1, y:4},
      //{x:2, y:4},
      {x:3, y:4},
      {x:4, y:4},
      {x:5, y:4},
      {x:6, y:4},
      {x:7, y:4},
      //{x:8, y:4},

      //{x:0, y:5},
      //{x:1, y:5},
      {x:2, y:5},
      {x:3, y:5},
      {x:4, y:5},
      {x:5, y:5},
      {x:6, y:5},
      //{x:7, y:5},
      //{x:8, y:5},

      //{x:0, y:6},
      {x:1, y:6},
      {x:2, y:6},
      {x:3, y:6},
      {x:4, y:6},
      {x:5, y:6},
      //{x:6, y:6},
      //{x:7, y:6},
      {x:8, y:6},
    ]
  }
}/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

/**
 * Holds all top-level variables, function invocations etc.
 */

var WIKI_URL = "https://github.com/mikegagnon/puzzlecode/wiki/"

// if CYCLE_DUR < MAX_HIGHLIGHT_SPEED, lines will not be highlighted
// to show program execution
var MAX_HIGHLIGHT_SPEED = 150

// [animatiBACK_CLASSonDuration, delayDuration, description, easing]
PlaySpeed = {
  SUPER_SLOW: [2000, 4000, "Super slow", "cubic-in-out"],
  SLOW: [750, 1500, "Slow", "cubic-in-out"],
  NORMAL: [400, 600, "Normal speed", "cubic-in-out"],
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
var NEXT_BACK_CLASS = "nextActiveline-background";

// TODO: better var names and all caps
var CELL_SIZE = 32,
    VIS = null,
    ANIMATE_INTERVAL = null,
    PLAY_STATUS = PlayStatus.INITAL_STATE_PAUSED,
    INIT_PLAY_SPEED = PlaySpeed.NORMAL
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
    NORMAL_CODE_THEME = "eclipse",
    DISABLED_CODE_THEME = "eclipse-dim"

// if true, then loads the solution program when loading new levels
var AUTO_SOLVE_DEBUG = false

// if true, then every level is automatically visible
var CAMPAIGN_ALL_VISIBLE = false

// simply a list of all worlds
// This data structure is intended to be 100% immutable
// TODO: write a campaign sanity checker that verified that every level
// is accessible, the campaign is beatable, each puzzle has a unique id, etc.
var PUZZLE_CAMPAIGN = [
  world_moveTurn(),
  world_goto()]

var PUZZLE_CAMPAIGN_STATE = {

  /**
   * The player's set of accomplishments.
   * TODO: visualize badges in Victory modal and trophy page.
   */
  badges: {

    /**
     * Badges relating to instruction usage.
     * The set of instructions the player has used effectively
     */
    instruction: {},

    /**
     * what worlds has the player completed
     */
    world: {},

    /**
     * misc badges
     */
    misc: {}
  },

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

if (CAMPAIGN_ALL_VISIBLE) {
  campaignAllVisible(PUZZLE_CAMPAIGN, PUZZLE_CAMPAIGN_STATE)
}

// set to true once the help button has been clicked
var HELP_BUTTON_CLICKED = false 
var HINT_BUTTON_CLICKED = false 

// TODO: do we still need this?
var TUTORIAL_ACTIVE = false

// set to true when the tutorial begins a demonstration of the Step button
// (see tutorial.js)
var TUTORIAL_STEP_BUTTON_ACTIVE = false

// set to true when TUTORIAL_STEP_BUTTON_ACTIVE is true and the player
// has clicked step at least once
var TUTORIAL_STEP_BUTTON_ACTIVE_STEP_CLICKED = false

var MENU_BUTTONS = {
  "#pauseplay": true,
  "#stepButton": true,
  "#restart": true,
  "#helpButton": true,
  "#hintButton": true
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

// TODO: this belongs somewhere in visualize.js as non-global variables
var COIN_RADIUS = 6
var COIN_EXPLODE_RADIUS = 100

var TUTORIAL = undefined

// set to true once the player has seen (and clicked on) the level menu
// at least once
var PLAYER_HAS_USED_LEVEL_MENU = false


window.onload = windowOnLoad

