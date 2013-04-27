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

function puzzle_torus() {
  return {
    id: "torus",
    name: "Torus",
    description: "Collect all the coins on the board.",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>"
      + "If your robot goes off the board, it will wrap around -- and come "
      + "back on the opposite side."
      + "</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],
    constraints: [],
    solutions: [
      "move\nmove\nmove\nturn left\nmove\nmove\nmove\nmove\n",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 2,
        facing: Direction.UP,
        program: "move\nmove\nturn left\nmove\nmove\n",
      },
    ],
    coins: [
      {x:4, y:0},
      {x:4, y:1},
      {x:4, y:4},
      {x:4, y:4},
      {x:4, y:5},
      {x:4, y:6},
    ],
    blocks: [
      {x:0, y:3},
      {x:1, y:3},
      {x:2, y:3},
      {x:3, y:3},
      {x:4, y:3},
      {x:5, y:3},
      {x:6, y:3},
      {x:7, y:3},
      {x:8, y:3},
    ],
    traps: [
      //{x:3, y:0}
    ]
  }
}