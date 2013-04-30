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

function learnMoreGoto() {
  return "<a target='_blank' href='"
      + WIKI_URL + "Goto-instruction"
      + "'>"
      + "Learn more about the " + keyword_link("goto") + " instruction."
      + "</a>"
}

function world_goto() {
  return {
    id: "world2",
    name: "Goto",
    levels: [
      {
        level: puzzle_get_unstuck(),
        badges: {},
        unlock: function(campaign, state, world_index, level_index) {
          return isLevelCompleted(state, world_index - 1, 1) 
        }
      },
      {
        level: puzzle_the_t(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_the_square(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_coins_everywhere(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_spiral(),
        badges: {},
        unlock: prevLevelCompleted
      },
    ]
  }
}