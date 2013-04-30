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

function puzzle_the_t() {
  return {
    id: "the_t",
    name: "The T",

    // TODO: add link to goto help page
    hint: 
      "<p>"
      + "Instead of turning left at the T, turn right. Then use the "
      + keyword("goto") + " instruction to keep moving."
      + "<p>"
      + "<p>" + learnMoreGoto() + "</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    // TODO: add a constraint that you can only use 4 move instructions
    constraints: {
      "max_instructions": 8,
    },

    solutions: [
       "move\nmove\nmove\nturn right\nstart: move\ngoto start\n",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 5,
        facing: Direction.UP,
        program: "move\nmove\nmove\nturn left\nstart: move\ngoto start\n",
      },
    ],
    coins: [
      {x: 4, y: 2},
      {x: 5, y: 2},
      {x: 6, y: 2},
      {x: 7, y: 2},

      {x: 4, y: 3},
      {x: 4, y: 4},


    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [
      {x: 0, y: 0},
      {x: 0, y: 1},
      {x: 0, y: 2},
      {x: 0, y: 3},
      {x: 0, y: 4},
      {x: 0, y: 5},
      {x: 0, y: 6},

      {x: 1, y: 0},
      {x: 1, y: 1},
      //{x: 1, y: 2},
      {x: 1, y: 3},
      {x: 1, y: 4},
      {x: 1, y: 5},
      {x: 1, y: 6},

      {x: 2, y: 0},
      {x: 2, y: 1},
      //{x: 2, y: 2},
      {x: 2, y: 3},
      {x: 2, y: 4},
      {x: 2, y: 5},
      {x: 2, y: 6},

      {x: 3, y: 0},
      {x: 3, y: 1},
      //{x: 3, y: 2},
      {x: 3, y: 3},
      {x: 3, y: 4},
      {x: 3, y: 5},
      {x: 3, y: 6},

      {x: 4, y: 0},
      {x: 4, y: 1},
      //{x: 4, y: 2},
      //{x: 4, y: 3},
      //{x: 4, y: 4},
      //{x: 4, y: 5},
      {x: 4, y: 6},

      {x: 5, y: 0},
      {x: 5, y: 1},
      //{x: 5, y: 2},
      {x: 5, y: 3},
      {x: 5, y: 4},
      {x: 5, y: 5},
      {x: 5, y: 6},

      {x: 6, y: 0},
      {x: 6, y: 1},
      //{x: 6, y: 2},
      {x: 6, y: 3},
      {x: 6, y: 4},
      {x: 6, y: 5},
      {x: 6, y: 6},

      {x: 7, y: 0},
      {x: 7, y: 1},
      //{x: 7, y: 2},
      {x: 7, y: 3},
      {x: 7, y: 4},
      {x: 7, y: 5},
      {x: 7, y: 6},

      {x: 8, y: 0},
      {x: 8, y: 1},
      {x: 8, y: 2},
      {x: 8, y: 3},
      {x: 8, y: 4},
      {x: 8, y: 5},
      {x: 8, y: 6},

    ],
    traps: [
    ]
  }
}