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
  assert(_.isEqual(result, expected),
    "tryMove '" + testTryMove[i] + "' failed")
}

// list of [board, bot, expectedBoard, expectedBot] test cases
var board = {
  num_cols: 4,
  num_rows: 5,
  coins : [
    {x: 1, y: 1}
  ],
  coinsCollected : 0,
  blocks : [
    {x: 0, y: 0},
    {x: 3, y: 4}
  ]
}

var testMoveBot = [
    [ _.clone(board),
      {cellX: 2, cellY: 2, facing: Direction.UP},
      board,
      {cellX: 2, cellY: 1, facing: Direction.UP},
    ]
]

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