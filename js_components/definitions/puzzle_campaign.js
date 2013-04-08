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

function loadWorldMenu(campaign, state) {

  for (world_index in state.visibility) {
    addWorldToMenu(
      campaign,
      state,
      world_index)

    for (level_index in state.visibility[world_index]) {
      addLevelToMenu(
        campaign,
        state,
        world_index,
        level_index)
    }
  }
}

function loadLevel(campaign, state) {
  var world_i = state.current_level.world_index
  var level_i = state.current_level.level_index
  var level = campaign[world_i].levels[level_i]

  // BOOKMARK TODO: Setup program compilation for a particular puzzle
  var programText = level.bots[level.programming_bot_index].program

  var programText = level.solutions[0]

  PROGRAMMING_BOT_INDEX = level.programming_bot_index

  setupCodeMirrorBox(programText)
  restartSimulation()
}

// show or hide the level menu, depending on whether or not multiple
// levels can be played
// TODO: put in visualize.js 
function setupLevelSelect(state) {

  console.log("setupLevelSelect")

  var visibleWorlds = _.keys(state.visibility)
  if (visibleWorlds.length == 1 &&
    _.keys(state.visibility[visibleWorlds[0]]).length == 1) {
    $("#accordionLevelSelect").attr("style", "display: none;")
  } else {
    $("#accordionLevelSelect").removeAttr("style")
  } 
}

function loadCampaign(campaign, state) {
  loadWorldMenu(campaign, state)
  loadLevel(campaign, state)
  setupLevelSelect(state) 
}
