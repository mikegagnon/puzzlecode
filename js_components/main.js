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

/**
 * Holds all top-level variables, function invocations etc.
 */

// if CYCLE_DUR < MAX_HIGHLIGHT_SPEED, lines will not be highlighted
// to show program execution
var MAX_HIGHLIGHT_SPEED = 150

// [animationDuration, delayDuration, description, easing]
PlaySpeed = {
  SUPER_SLOW: [2000, 4000, "Super slow", "cubic-in-out"],
  SLOW: [750, 1500, "Slow", "cubic-in-out"],
  NORMAL: [400, 600, "Normal", "cubic-in-out"],
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

// TODO: better var names and all caps
var CELL_SIZE = 32,
    VIS = null,
    ANIMATE_INTERVAL = null,
    PLAY_STATUS = PlayStatus.INITAL_STATE_PAUSED,
    INIT_PLAY_SPEED = PlaySpeed.NORMAL,
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
    NORMAL_CODE_THEME = "solarized dark",
    DISABLED_CODE_THEME = "solarized_dim dark"

var PUZZLE_1 = {
  id: "puzzle1",
  name: "Collect the coins",
  description: "Collect all the coins on the board.",
  hint: "tbd",
  win_conditions: [
    {type: WinCondition.COLLECT_COINS}
  ],
  constraints: [],
  // TODO: make sure all obsolete on_victory references are dealt with
  /*on_victory: [
    {type: OnVictory.UNLOCK_NEXT_LEVEL},
    {type: OnVictory.UNLOCK_NEXT_WORLD},
  ],*/

  // what conditions need to be met to unlock this level?
  // the unlock returns true if this level should be unlocked
  unlock: function(campaign, state) {
    return true
  },

  solutions: [
    "move\nmove\nturn left\nmove\nmove\nmove\nmove\n",
  ],
  num_cols: 9,
  num_rows: 7,
  programming_bot_index: 0,
  bots : [
    {
      botColor: BotColor.BLUE,
      cellX: 4,
      cellY: 3,
      facing: Direction.UP,
      program: "move\nmove\nmove\nturn left\nmove\nmove\n",
    },
    {
      botColor: BotColor.BLUE,
      cellX: 0,
      cellY: 0,
      facing: Direction.RIGHT,
      program: "start: move\nmove\nmove\ngoto start\n",
    },
    {
      botColor: BotColor.BLUE,
      cellX: 6,
      cellY: 6,
      facing: Direction.RIGHT,
      program: "start: move\n turn right\ngoto start\n",
    },
    {
      botColor: BotColor.BLUE,
      cellX: 4,
      cellY: 2,
      facing: Direction.LEFT,
      program: "start: move\nmove\ngoto start\n",
    },
  ],
  coins: [
    {x:0, y:1},
    {x:1, y:1},
    {x:2, y:1},
    {x:3, y:1},
    {x:4, y:1}
  ],
  blocks: [
    {x:2, y:2},
    {x:2, y:3},
  ]
}

var PUZZLE_2 = cloneDeep(PUZZLE_1, {
  name: "Avoid the blocks",
  unlock: function(campaign, state) {
    return levelCompleted(state, 0, 0)
  }
})

var PUZZLE_3 = cloneDeep(PUZZLE_1, {
  name: "Foobar",
  unlock: function(campaign, state) {
    return levelCompleted(state, 0, 1)
  }
})

var PUZZLE_4 = cloneDeep(PUZZLE_1, {
  name: "Baz",
  unlock: function(campaign, state) {
    return levelCompleted(state, 1, 0)
  }
})

var WORLD_1 = {
  id: "world1",
  name: "Move &amp; Turn",
  levels: [
    PUZZLE_1,
    PUZZLE_2
  ]
}

var WORLD_2 = {
  id: "world2",
  name: "Goto",
  levels: [
    PUZZLE_3,
    PUZZLE_4
  ]
}

// simply a list of all worlds
// This data structure is intended to be 100% immutable
// TODO: write a campaign sanity checker that verified that every level
// is accessible, the campaign is beatable, etc.
var PUZZLE_CAMPAIGN = [
  WORLD_1,
  WORLD_2]

var PUZZLE_CAMPAIGN_STATE = {
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

var COIN_RADIUS = 6
var COIN_EXPLODE_RADIUS = 100

window.onload = windowOnLoad

