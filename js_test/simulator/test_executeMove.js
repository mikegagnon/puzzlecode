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

var TEST_FILENAME = "js_test/simulator/test_moveBot.js"

/**
 * test execution of move instruction
 *************************************************************************/
var emptyBoard = {
  num_cols: 4,
  num_rows: 5,
  coinsCollected: 0
}

var botBase = {
  facing: Direction.UP,
  animations: {},
  depositMarker: [],
  botColor: BotColor.BLUE
}

var bot_2_2_up = cloneDeep(botBase, {
  cellX: 2,
  cellY: 2
})

var bot_0_0_up = cloneDeep(botBase, {
  cellX: 0,
  cellY: 0,
})

// list of [board, bot, expectedBoard, expectedBot] test cases
var testMoveBot = {

  /**
   * non-torus moves on an empty board:
   *************************************************************************/
  "non-torus moves on an empty board: move up": {
    board: cloneDeep(emptyBoard),
    bot: cloneDeep(bot_2_2_up),
    expected: {
      board: cloneDeep(emptyBoard),
      bot: cloneDeep(bot_2_2_up, {
        cellY: 1,
        animations: {nonTorusMove: true},
        depositMarker: [
          {x: 2, y: 2, botColor: BotColor.BLUE, quadrant: Direction.UP},
          {x: 2, y: 1, botColor: BotColor.BLUE, quadrant: Direction.DOWN}
        ]
      })
    }
  },
  "non-torus moves on an empty board: move down": {
    board: cloneDeep(emptyBoard),
    bot: cloneDeep(bot_2_2_up, {facing: Direction.DOWN} ),
    expected: {
      board: cloneDeep(emptyBoard),
      bot: cloneDeep(bot_2_2_up, {
        facing: Direction.DOWN,
        cellY: 3,
        animations: {nonTorusMove: true},
        depositMarker: [
          {x: 2, y: 2, botColor: BotColor.BLUE, quadrant: Direction.DOWN},
          {x: 2, y: 3, botColor: BotColor.BLUE, quadrant: Direction.UP}
        ]
      })
    }
  },
  "non-torus moves on an empty board: move left": {
    board: cloneDeep(emptyBoard),
    bot: cloneDeep(bot_2_2_up, {facing: Direction.LEFT} ),
    expected: {
      board: cloneDeep(emptyBoard),
      bot: cloneDeep(bot_2_2_up, {
        facing: Direction.LEFT,
        cellX: 1,
        animations: {nonTorusMove: true},
        depositMarker: [
          {x: 2, y: 2, botColor: BotColor.BLUE, quadrant: Direction.LEFT},
          {x: 1, y: 2, botColor: BotColor.BLUE, quadrant: Direction.RIGHT}
        ]
      })
    }
  },
  "non-torus moves on an empty board: move right": {
    board: cloneDeep(emptyBoard),
    bot: cloneDeep(bot_2_2_up, {facing: Direction.RIGHT} ),
    expected: {
      board: cloneDeep(emptyBoard),
      bot: cloneDeep(bot_2_2_up, {
        facing: Direction.RIGHT,
        cellX: 3,
        animations: {nonTorusMove: true},
        depositMarker: [
          {x: 2, y: 2, botColor: BotColor.BLUE, quadrant: Direction.RIGHT},
          {x: 3, y: 2, botColor: BotColor.BLUE, quadrant: Direction.LEFT}
        ]
      })
    }
  },

  /**
   * __torus__ moves on an empty board
   *************************************************************************/
  "torus moves on an empty board: move up": {
    board: cloneDeep(emptyBoard),
    bot: cloneDeep(bot_0_0_up),
    expected: {
      board: cloneDeep(emptyBoard),
      bot: cloneDeep(bot_0_0_up, {
        cellY: 4,
        animations: {torusMove: {
          prevX: 0,
          prevY: 0,
          oobPrevX: 0,
          oobPrevY: 5,
          oobNextX: 0,
          oobNextY: -1
        }},
        depositMarker: [
          {x: 0, y: 0, botColor: BotColor.BLUE, quadrant: Direction.UP},
          {x: 0, y: 4, botColor: BotColor.BLUE, quadrant: Direction.DOWN}
        ]
      })
    }
  },

  "torus moves on an empty board: move down": {
    board: cloneDeep(emptyBoard),
    bot: cloneDeep(bot_0_0_up, {
      facing: Direction.DOWN,
      cellY: 4
    }),
    expected: {
      board: cloneDeep(emptyBoard),
      bot: cloneDeep(bot_0_0_up, {
        facing: Direction.DOWN,
        cellY: 0,
        animations: {torusMove: {
          prevX: 0,
          prevY: 4,
          oobPrevX: 0,
          oobPrevY: -1,
          oobNextX: 0,
          oobNextY: 5
        }},
        depositMarker: [
          {x: 0, y: 4, botColor: BotColor.BLUE, quadrant: Direction.DOWN},
          {x: 0, y: 0, botColor: BotColor.BLUE, quadrant: Direction.UP}
        ]
      })
    }
  },
  "torus moves on an empty board: move left": {
    board: cloneDeep(emptyBoard),
    bot: cloneDeep(bot_0_0_up, {facing: Direction.LEFT} ),
    expected: {
      board: cloneDeep(emptyBoard),
      bot: cloneDeep(bot_0_0_up, {
        facing: Direction.LEFT,
        cellX: 3,
        animations: {torusMove: {
          prevX: 0,
          prevY: 0,
          oobPrevX: 4,
          oobPrevY: 0,
          oobNextX: -1,
          oobNextY: 0
        }},
        depositMarker: [
          {x: 0, y: 0, botColor: BotColor.BLUE, quadrant: Direction.LEFT},
          {x: 3, y: 0, botColor: BotColor.BLUE, quadrant: Direction.RIGHT}
        ]
      })
    }
  },
  "torus moves on an empty board: move right": {
    board: cloneDeep(emptyBoard),
    bot: cloneDeep(bot_0_0_up, {
      facing: Direction.RIGHT,
      cellX: 3
    }),
    expected: {
      board: cloneDeep(emptyBoard),
      bot: cloneDeep(bot_0_0_up, {
        facing: Direction.RIGHT,
        cellX: 0,
        animations: {torusMove: {
          prevX: 3,
          prevY: 0,
          oobPrevX: -1,
          oobPrevY: 0,
          oobNextX: 4,
          oobNextY: 0
        }},
        depositMarker: [
          {x: 3, y: 0, botColor: BotColor.BLUE, quadrant: Direction.RIGHT},
          {x: 0, y: 0, botColor: BotColor.BLUE, quadrant: Direction.LEFT}
        ]
      })
    }
  },
}

var boardWithCoins = cloneDeep(emptyBoard, {
  coins : [
    {x: 1, y: 1},
    {x: 2, y: 2}
  ]
})

/**
 * moving bot picks up coins
 *************************************************************************/
testMoveBot = _.assign(testMoveBot, {

  "moving bot picks up a coin": {
    board: cloneDeep(boardWithCoins),
    bot: cloneDeep(bot_0_0_up, {
      cellX: 1,
      cellY: 2
    }),
    expected: {
      board: cloneDeep(boardWithCoins, {
        coins: [
          {x: 2, y: 2}
        ],
        coinsCollected: 1
      }),
      bot: cloneDeep(bot_0_0_up, {
        cellX: 1,
        cellY: 1,
        animations: {
          nonTorusMove: true,
          coin_collect: {x: 1, y: 1}
        },
        depositMarker: [
          {x: 1, y: 2, botColor: BotColor.BLUE, quadrant: Direction.UP},
          {x: 1, y: 1, botColor: BotColor.BLUE, quadrant: Direction.DOWN}
        ]
      })
    }
  }
})


/**
 * moving bot bumps into block
 *************************************************************************/
var boardWithCoinsBlocks = cloneDeep(boardWithCoins, {
  blocks : [
    {x: 3, y: 3}
  ]
})

testMoveBot = _.assign(testMoveBot, {

  "moving bot bumps into a block": {
    board: cloneDeep(boardWithCoinsBlocks),
    bot: cloneDeep(bot_0_0_up, {
      cellX: 2,
      cellY: 3,
      facing: Direction.RIGHT
    }),
    expected: {
      board: cloneDeep(boardWithCoinsBlocks),
      bot: cloneDeep(bot_0_0_up, {
        cellX: 2,
        cellY: 3,
        facing: Direction.RIGHT,
        animations: {
          failMove: {
            destX: 3,
            destY: 3
          }
        }
      })
    }
  }
})

for (TC_NAME in testMoveBot) {
  TC = testMoveBot[TC_NAME]
  var board = cloneDeep(TC.board)
  var bot = cloneDeep(TC.bot)
  executeMove(board, bot)
  RESULT = {
    board: board,
    bot: bot
  }
  test(_.isEqual(RESULT, TC.expected))
}
