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

  // Add the visible worlds to the world menu
  var prevWorldId = "menuworldtemplate"
  for (var i = 0; i < state.visible_worlds.length; i++) {
    var visible_world = state.visible_worlds[i]
    var world = campaign[visible_world.index]
    var worldName = "World " + (visible_world.index + 1) + ": " + world.name
    addWorldToMenu(
      world.id,
      prevWorldId,
      worldName,
      visible_world.completed)
    prevWorldId = world.id
  }

  // Add the visible levels to the world menu
  for (var i = 0; i < state.visible_levels.length; i++) {
    var visible_level = state.visible_levels[i]
    var world = campaign[visible_level.world_index]
    var level = world.levels[visible_level.level_index]
    var world = campaign[visible_level.world_index]
    var levelName = "Level "
      + (visible_level.world_index + 1)
      + "-"
      + (visible_level.level_index + 1)
      + ": " + level.name
    addLevelToMenu(
      world.id,
      level.id,
      levelName,
      visible_level.completed)
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

function loadCampaign(campaign, state) {
  loadWorldMenu(campaign, state)
  loadLevel(campaign, state)
}