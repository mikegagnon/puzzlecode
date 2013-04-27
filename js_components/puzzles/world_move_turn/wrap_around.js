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

function puzzle_wrapAround() {
  return {
    id: "puzzle1",
    name: "Wrap around",
    description: "tbd",
    hint: "tbd",
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],
    constraints: [],

    // what conditions need to be met to unlock this level?
    // the unlock returns true if this level should be unlocked
    unlock: function(campaign, state, world_index, level_index) {
      return prevLevelCompleted(campaign, state, world_index, level_index)
    },

    solutions: [
      _(["turn left", "turn left",
       "move",
       "turn right",
       "move", "move", "move", "move", "move", "move"]).join("\n")
    ],
    num_cols: 8,
    num_rows: 8,
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 3,
        cellY: 3,
        facing: Direction.UP,
        program: "",
      }
    ],
    coins: [
      {x:0, y:4},
      {x:1, y:4},
      {x:2, y:4},
      {x:3, y:4},
      {x:5, y:4},
      {x:6, y:4},
      {x:7, y:4},
    ],
    blocks: [
      {x:4, y:0},
      {x:4, y:1},
      {x:4, y:2},
      {x:4, y:3},
      {x:4, y:4},
      {x:4, y:5},
      {x:4, y:6},
      {x:4, y:7},
    ],
    traps: [
      //{x:3, y:0}
    ]
  }
}
