/**
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
}