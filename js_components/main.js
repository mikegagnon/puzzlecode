/**
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

