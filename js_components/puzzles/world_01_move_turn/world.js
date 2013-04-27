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

function world_moveTurn() {
  return {
    id: "world1",
    name: "Move &amp; Turn",
    levels: [
      {
        level: puzzle_welcome(),
        /**
         * The awards that will be given to the player once the level is
         * completed.
         */
        badges: {
          instruction: {
            "move": true,
            "turn": true
          }
        },
        /**
         * what conditions need to be met to unlock this level?
         * the unlock returns true if this level should be unlocked
         */
        unlock: function() {
          return true
        },
      },
      {
        level: puzzle_uturn(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_blocks(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_torus(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_traps(),
        badges: {},
        unlock: function(campaign, state, world_index, level_index) {
          return levelCompleted(state, world_index, level_index - 2)
        }
      },
    ]
  }
}