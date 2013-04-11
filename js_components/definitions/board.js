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
}