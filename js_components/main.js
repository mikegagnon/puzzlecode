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

// [animationDuration, delayDuration, description, easing]
PlaySpeed = {
  SUPER_SLOW: [2000, 4000, "Super slow", "cubic-in-out"],
  SLOW: [750, 1500, "Slow", "cubic-in-out"],
  NORMAL: [400, 600, "Normal", "cubic-in-out"],
  FAST: [150, 150, "Fast", "linear"],
  SUPER_FAST: [0, 0, "Super fast", "linear"]
}

PlayStatus = {
  PAUSED: 0,
  PLAYING: 1
}

// TODO: better var names and all caps
var NUM_COLS = 9,
    NUM_ROWS = 7,
    CELL_SIZE = 32,
    VIS = null,
    ANIMATE_INTERVAL = null,
    PLAY_STATUS = PlayStatus.PLAYING,
    INIT_PLAY_SPEED = PlaySpeed.FAST,
    ANIMATION_DUR = INIT_PLAY_SPEED[0]
    CYCLE_DUR = INIT_PLAY_SPEED[1],
    EASING = INIT_PLAY_SPEED[3],
    NON_BOT_ANIMATION_DUR = PlaySpeed.SLOW[0],
    NON_BOT_CYCLE_DUR = NON_BOT_ANIMATION_DUR,
    INITIAL_PROGRAM = "\nstart:move\nmove\nmove\nturn left\ngoto start\n",
    CODE_MIRROR_BOX = null,
    pausePlay = null,
    DEBUG = true,
    IDENT_REGEX = /^[A-Za-z][A-Za-z0-9_]*$/,

    /**
     * TODO: create a cell property, where cell[x][y] yields
     * a list of objects in that cell. In the mean time, I'll just search
     * through the bots and coins objects when needed.
     */
    BOARD = {
      bots : [],
      // the coins currently on the board (changes throughout a simulation)
      coins : [],
      // the coins originally placed on the board (immutable throughout a
      // simulation)
      initCoins: [],
      coinsCollected : 0,
      blocks : []
    }

// map of reserved words (built using fancy lodash style)
var reservedWords = "move turn left right goto"
var RESERVED_WORDS = _(reservedWords.split(" "))
  .map(function(word) { return [word, true] })
  .object()
  .value()

var COIN_RADIUS = 6
var COIN_EXPLODE_RADIUS = 100

window.onload = windowOnLoad
createBoard()
drawCells()
