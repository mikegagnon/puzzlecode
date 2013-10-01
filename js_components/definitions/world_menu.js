/**
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
