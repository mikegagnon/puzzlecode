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

var TEST_FILENAME = "js_test/simulator/test_tryMove.js"

var board = {blocks : [{x:5,y:5}]}
var bot = {facing: "any"}
var testTryMove = {
  "move blocked": {board: board, bot: bot, x: 5, y: 5, expected: false},
  "move succeed #1": {board: board, bot: bot, x: 5, y: 6, expected: true},
  "move succeed #2": {board: board, bot: bot, x: 6, y: 5, expected: true},
  "move succeed #3": {board: board, bot: bot, x: 6, y: 6, expected: true}
}

for (TC_NAME in testTryMove) {
  var TC = testTryMove[TC_NAME]
  var RESULT = tryMove(TC.board, TC.bot, TC.x, TC.y)
  test(_.isEqual(RESULT, TC.expected))
}

/*for (var TC_I = 0; TC_I < testTryMove.length; TC_I++) {
  var TC = testTryMove[TC_I]
  var RESULT = tryMove(TC.board, TC.bot, TC.x, TC.y)
  test(_.isEqual(RESULT, TC.expected))
}*/

