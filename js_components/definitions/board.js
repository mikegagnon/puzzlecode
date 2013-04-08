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

function isLevelAccessible(state, world_index, level_index) {
  return world_index in state.visibility &&
    level_index in state.visibility[world_index]
}

// TODO: have links to levels work
// returns the number of announcements in the modal
// TODO: this should really go in visualize.js
function setupVictoryModal(campaign, state) {

  var world_index = state.current_level.world_index
  var level_index = state.current_level.level_index
  var on_victory = campaign[world_index].levels[level_index].on_victory
  assert(on_victory.length > 0, "setupVictoryModal: on_victory.length > 0")

  var html = ""

  var numAnnouncements = 0

  for (var i = 0; i < on_victory.length; i++) {
    var victoryEvent = on_victory[i]
    if (victoryEvent.type == OnVictory.UNLOCK_NEXT_LEVEL) {
      var next_level_index = level_index + 1

      // if the next_level currently not accessible, then add it to the modal
      if (!isLevelAccessible(state, world_index, next_level_index)) {
        numAnnouncements += 1
        var next_level_name = campaign[world_index].levels[next_level_index].name
        html += '<p>'
          + '<span class="label label-info victory-label">New level</span> '
          + 'You unlocked <a href="#">Level '
          + (world_index + 1)
          + '-'
          + (next_level_index + 1)
          + ': '
          + next_level_name
          + '</a>'
          + '</p>'
      }
    } else if (victoryEvent.type == OnVictory.UNLOCK_NEXT_WORLD) {
      var next_world_index = world_index + 1

      // if the next_level currently not accessible, then add it to the modal
      if (!isLevelAccessible(state, next_world_index, 0)) {
        numAnnouncements += 1

        var next_world_name = campaign[next_world_index].name
        var next_level_name = campaign[next_world_index].levels[0].name

        html += '<p>'
          + '<span class="label label-success victory-label">New world</span> '
          + 'You unlocked World '
          + (next_world_index + 1)
          + ': '
          + next_world_name
          + ', <a href="#"> '
          + 'Level '
          + (next_world_index + 1)
          + '-1 '
          + next_level_name
          + '</a>'
          + '</p>'
      }
    } else {
      console.error("unknown victoryEvent.type == " + victoryEvent.type)
    }
  }

  $("#victoryModalBody").html(html)

  return numAnnouncements
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

  board.on_victory = cloneDeep(boardConfig.on_victory)
  board.num_victory_announcements = setupVictoryModal(campaign, state)

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


  return board
}