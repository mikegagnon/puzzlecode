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
var testTryMove = [
    [{blocks : [{x:5,y:5}]}, {facing: "any"}, 5, 5, false],
    [{blocks : [{x:5,y:5}]}, {facing: "any"}, 5, 6, true],
    [{blocks : [{x:5,y:5}]}, {facing: "any"}, 6, 5, true],
    [{blocks : [{x:5,y:5}]}, {facing: "any"}, 6, 6, true]
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
