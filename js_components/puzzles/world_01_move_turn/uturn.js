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

function puzzle_uturn() {
  return {
    id: "uturn",
    name: "U-turn",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>Your robot <strong>cannot</strong> go backwards.</p>"
      + "<p>To perform a u-turn you need to <strong>turn twice</strong> (to "
      + "the left twice, or to the right twice).</p>"
      + "<p>If you need help on turning, checkout "
      + "<a target='_blank' href='"
      + WIKI_URL + "turn%20instruction"
      + "'>this help page</a>.</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    constraints: [],

    solutions: [
      "turn right\nturn right\nmove\nmove\nmove",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 3,
        facing: Direction.RIGHT,
        program: "turn right\nmove\nmove\nmove\n",
      },
    ],
    coins: [
      {x:3, y:3},
      {x:2, y:3},
      {x:1, y:3},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: []
  }
}