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

function puzzle_small_steps() {
  return {
    id: "small_steps",
    name: "Small Steps",

    hint: 
      "<p>"
      + "Take one step forward, then use a " + keyword("goto") + " instruction "
      + "to do it again. "
      + "</p>"
      + "<p>"
      +   "<a href='#'>"
      +   "Learn more about the " + keyword_link("goto") + " instruction."
      +   "</a>"
      + "</p>"
    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    // TODO: add a constraint that you can only use 1 move instruction
    constraints: [],

    solutions: [
      "again: move\ngoto again"
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 1,
        cellY: 3,
        facing: Direction.RIGHT,
        program: "",
      },
    ],
    coins: [
      {x:2, y:3},
      {x:3, y:3},
      {x:4, y:3},
      {x:5, y:3},
      {x:6, y:3},
      {x:7, y:3},

    ],
    blocks: [],
    traps: []
  }
}