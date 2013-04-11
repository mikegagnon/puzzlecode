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
 * returns an array of "unlock description" objects, which can have 1 of 2
 * forms:
 *
 * (1) for unlocking a world:
 *    {
 *      world_index: number
 *    }
 *
 * (2) for unlocking a level:
 *    {
 *      world_index: number,
 *      level_index: number
 *    }
 */
function updateLevelVisibility(board, campaign, state) {

  var world_index = state.current_level.world_index
  var level_index = state.current_level.level_index

  // if the level has already been beaten, then there is nothing to update
  if (state.visibility[world_index][level_index].completed) {
    return []
  }

  var unlocked = []

  state.visibility[world_index][level_index].complete = true

  // try the unlock function for each locked level
  _(allLevelIndices(campaign))
    .forEach(function(lev) {
      if (!isLevelAccessible(state, lev.world_index, lev.level_index)) {

        var level = campaign[lev.world_index].levels[lev.level_index]
        // should this level be unlocked?
        if (level.unlock(campaign, state)) {

          // if the unlocked level is in a new world
          if (!(lev.world_index in state.visibility)) {
            unlocked.push({
              world_index: lev.world_index
            })
          }

          unlockLevel(state, lev.world_index, lev.level_index)

          unlocked.push({
            world_index: lev.world_index,
            level_index: lev.level_index
          })

        }
      }
    })

  return unlocked

}