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
 *
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
    if (!state.visibility[world_index][i].complete) {
      world_complete = false
    }
  }

  if (world_complete) {
    deltas.push({
        world_complete: world_index
    })
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
  var level = campaign[world_i].levels[level_i]

  var programText = level.bots[level.programming_bot_index].program
  var programText = level.solutions[0]

  setupCodeMirrorBox(programText)
}

function loadCampaign(campaign, state) {
  loadWorldMenu(campaign, state)
  loadLevel(campaign, state)
  showOrHideLevelMenu(state) 
}
