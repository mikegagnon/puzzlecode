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

// TODO: instead of using arrays use objects e.g. testcase.board
// list of [board, bot, x, y, expectedResult] test cases
var board = {blocks : [{x:5,y:5}]}
var bot = {facing: "any"}
var testTryMove = [
    [board, bot, 5, 5, false],
    [board, bot, 5, 6, true],
    [board, bot, 6, 5, true],
    [board, bot, 6, 6, true],
  ]

for (var i = 0; i < testTryMove.length; i++) {
  var board    = testTryMove[i][0]
  var bot      = testTryMove[i][1]
  var x        = testTryMove[i][2]
  var y        = testTryMove[i][3]
  var expected = testTryMove[i][4]
  var result = tryMove(board, bot, x, y)
  test(_.isEqual(result, expected), function() {
    console.log("tryMove '" + testTryMove[i] + "' failed")
    console.dir(board)
    console.dir(bot)
    console.dir(x)
    console.dir(y)
    console.dir(expected)
    console.dir(result)
  })
}

/**
 * TODO: put in own file
 * test move execution of move instruction
 *************************************************************************/
var emptyBoard = {
  num_cols: 4,
  num_rows: 5,
  coinsCollected: 0
}

var bot_2_2_up = {
  cellX: 2,
  cellY: 2,
  facing: Direction.UP
}

var bot_0_0_up = {
  cellX: 0,
  cellY: 0,
  facing: Direction.UP
}

// list of [board, bot, expectedBoard, expectedBot] test cases
var testMoveBot = [

  /**
   * non-torus moves on an empty board
   *************************************************************************/
  // up
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up),
    cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {
      cellY: 1,
      animations: {nonTorusMove: true}
    })
  ],
  // down
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {facing: Direction.DOWN} ),
    cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {
      facing: Direction.DOWN,
      cellY: 3,
      animations: {nonTorusMove: true}
    })
  ],
  // left
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {facing: Direction.LEFT} ),
    cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {
      facing: Direction.LEFT,
      cellX: 1,
      animations: {nonTorusMove: true}
    })
  ],
  // right
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {facing: Direction.RIGHT} ),
    cloneDeep(emptyBoard),
    cloneDeep(bot_2_2_up, {
      facing: Direction.RIGHT,
      cellX: 3,
      animations: {nonTorusMove: true}
    })
  ],

  /**
   * __torus__ moves on an empty board
   *************************************************************************/
  // up
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up),
    cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      cellY: 4,
      animations: {torusMove: {
        prevX: 0,
        prevY: 0,
        oobPrevX: 0,
        oobPrevY: 5,
        oobNextX: 0,
        oobNextY: -1
      }}
    })
  ],
  // down
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      facing: Direction.DOWN,
      cellY: 4
    }),
    cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      facing: Direction.DOWN,
      cellY: 0,
      animations: {torusMove: {
        prevX: 0,
        prevY: 4,
        oobPrevX: 0,
        oobPrevY: -1,
        oobNextX: 0,
        oobNextY: 5
      }}
    })
  ],
  // left
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {facing: Direction.LEFT} ),
    cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      facing: Direction.LEFT,
      cellX: 3,
      animations: {torusMove: {
        prevX: 0,
        prevY: 0,
        oobPrevX: 4,
        oobPrevY: 0,
        oobNextX: -1,
        oobNextY: 0
      }}
    })
  ],
  // right
  [ cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      facing: Direction.RIGHT,
      cellX: 3
    }),
    cloneDeep(emptyBoard),
    cloneDeep(bot_0_0_up, {
      facing: Direction.RIGHT,
      cellX: 0,
      animations: {torusMove: {
        prevX: 3,
        prevY: 0,
        oobPrevX: -1,
        oobPrevY: 0,
        oobNextX: 4,
        oobNextY: 0
      }}
    })
  ],
]

var boardWithCoins = cloneDeep(emptyBoard, {
  coins : [
    {x: 1, y: 1},
    {x: 2, y: 2}
  ]
})

/**
 * moving bot picks up coins
 *************************************************************************/
testMoveBot = testMoveBot.concat([

  [ cloneDeep(boardWithCoins),
    cloneDeep(bot_0_0_up, {
      cellX: 1,
      cellY: 2
    }),
    cloneDeep(boardWithCoins, {
      coins: [
        {x: 2, y: 2}
      ],
      coinsCollected: 1
    }),
    cloneDeep(bot_0_0_up, {
      cellX: 1,
      cellY: 1,
      animations: {
        nonTorusMove: true,
        coin_collect: {x: 1, y: 1}
      }
    })
  ]
])

var boardWithCoinsBlocks = cloneDeep(boardWithCoins, {
  blocks : [
    {x: 3, y: 3},
    {x: 3, y: 4}
  ]
})

for (var i = 0; i < testMoveBot.length; i++) {
  var board    = testMoveBot[i][0]
  var bot      = testMoveBot[i][1]
  var expectedBoard = testMoveBot[i][2]
  var expectedBot = testMoveBot[i][3]
  moveBot(board, bot)
  test(_.isEqual([board, bot], [expectedBoard, expectedBot]),
    function() {
      console.error("testMoveBot[" + i + "]"),
      console.dir(board)
      console.dir(bot)
      console.dir(expectedBoard)
      console.dir(expectedBot)

    })
}