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

function puzzle_coins_everywhere() {
  return {
    id: "coins_everywhere",
    name: "Coins Everywhere",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>"
      + "Collect one column of coins, move into another column, and do it "
      + "again. Repeat."
      + "</p>"
      + "<p>" + learnMoreGoto() + "</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    // TODO: add a constraint that you can only use 4 move instructions
    constraints: {
      "max_instructions": 11,
    },

    solutions: [
      "start:\nmove\nmove\nmove\nmove\nmove\nmove\nmove\nturn right\nmove\n" +
      "turn left\ngoto start\n"
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
        facing: Direction.UP,
        program: "",
      },
    ],
    coins: [
      {x:0, y:0},
      {x:0, y:1},
      {x:0, y:2},
      {x:0, y:3},
      {x:0, y:4},
      {x:0, y:5},
      {x:0, y:6},

      {x:1, y:0},
      {x:1, y:1},
      {x:1, y:2},
      {x:1, y:3},
      {x:1, y:4},
      {x:1, y:5},
      {x:1, y:6},

      {x:2, y:0},
      {x:2, y:1},
      {x:2, y:2},
      {x:2, y:3},
      {x:2, y:4},
      {x:2, y:5},
      {x:2, y:6},

      {x:3, y:0},
      {x:3, y:1},
      {x:3, y:2},
      {x:3, y:3},
      {x:3, y:4},
      {x:3, y:5},
      {x:3, y:6},

      {x:4, y:0},
      {x:4, y:1},
      {x:4, y:2},
      //{x:4, y:3},
      {x:4, y:4},
      {x:4, y:5},
      {x:4, y:6},

      {x:5, y:0},
      {x:5, y:1},
      {x:5, y:2},
      {x:5, y:3},
      {x:5, y:4},
      {x:5, y:5},
      {x:5, y:6},

      {x:6, y:0},
      {x:6, y:1},
      {x:6, y:2},
      {x:6, y:3},
      {x:6, y:4},
      {x:6, y:5},
      {x:6, y:6},

      {x:7, y:0},
      {x:7, y:1},
      {x:7, y:2},
      {x:7, y:3},
      {x:7, y:4},
      {x:7, y:5},
      {x:7, y:6},

      {x:8, y:0},
      {x:8, y:1},
      {x:8, y:2},
      {x:8, y:3},
      {x:8, y:4},
      {x:8, y:5},
      {x:8, y:6},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: [
      //{x:3, y:0}
    ]
  }
}