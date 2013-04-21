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
      PLAYER_HAS_SEEN_LEVEL_MENU = false
      console.log("PLAYER_HAS_SEEN_LEVEL_MENU = false")
    }
  }

  if (hide) {
    $("#accordionLevelSelect").attr("style", "display: none;")
  } else {
    $("#accordionLevelSelect").removeAttr("style")

    // TODO: only glow the level menu if the player has never clicked on it
    // before. As soon as the player clicks the level menu, un-glow it
    if (!PLAYER_HAS_SEEN_LEVEL_MENU) {
      $("#accordionLevelSelect").addClass("glow-focus")
    }
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

function getLevelName(world_index, level_index, name) {
  return "Level "
    + (parseInt(world_index) + 1)
    + "."
    + (parseInt(level_index) + 1)
    + " " + name  
}

function getLevelNameHtml(world_index, level_index, name, completed) {
  var completedClass = getCompletedClass(completed)
  var levelName = getLevelName(world_index, level_index, name)
  return '<i class="' + completedClass + '"></i> ' + levelName
}

// Returns an href target for a particular level
function levelLink(world_index, level_index) {
  return "javascript: clickLevel(" + world_index + "," + level_index + ")"
}

function addLevelToMenu(campaign, state, world_index, level_index) {

  var completed = state.visibility[world_index][level_index].complete

  var world = campaign[world_index]
  var level = world.levels[level_index]

  $("#" + world.id)
    .find(".dropdown-menu")
    .append('<li id="' + level.id + '">'
      + '<a tabindex="-1" class="level-link" href="'
      + levelLink(world_index, level_index)
      + '">'
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

