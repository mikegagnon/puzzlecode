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

function puzzle_goto() {
  return {
    id: "intro_goto",
    name: "The goto instruction",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>"
      + "This level introduces you to <strong>a new instruction</strong>: "
      + " the " + keyword("goto") + " instruction. "
      + "</p>" 
      + "<h3>Example program</h3>"
      + "<pre>"
      + "start: " + keyword("move") + "<br>"
      + keyword("turn right") + "<br>"
      + keyword("turn right") + "<br>"
      + keyword("goto")  + " start"
      + "</pre>"
      + "<p>This program tells the robot to:</p>"
      + "<ul>"
      +   "<li>move forward </li>"
      +   "<li>make a u-turn</li>"
      +   "<li>move forward again</li>"
      +   "<li>make a u-turn again</li>"
      +   "<li>and so on forever...</li>"
      + "</ul>"
      + "<h3>How it works</h3>"
      + "<ul>"
      +   "<li>The " + keyword("goto") + " instruction tells the robot to "
      +       "execute <strong>another instruction</strong>, instead of "
      +       "executing the " 
      +       "instruction that comes next.</li>"
      +   "<li>To use the " + keyword("goto") + " instruction you must "
      +       "give a <strong><i>label</i></strong> to another instruction."
      +   "</li>"
      +   "<li>You give another instruction a <i>label</i> by prefixing "
      +     "the instruction with a word followed by the ':' symbol.</li>"
      +   "<li>In this example, "
      +       "<pre>"
      +         "sally: " + keyword("move")
      +       "</pre>"
      +       "sally is a label for the " + keyword("move") + " instruction."
      +   "</li>"
      +   "<li>The label you give for an instruction doesn't really matter. "
      +     "It can be almost anything."
      +   "</li>"
      +     "<li><a href='#'>"
      +       "Learn more about the " + keyword_link("goto") + " instruction."
      +     "</a></li>"
      + "</ul>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    constraints: [],

    solutions: [
      "start: move\nmove\nmove\nmove\nturn right\ngoto start"
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 2,
        cellY: 1,
        facing: Direction.RIGHT,
        program: "start: move\nmove\nturn right\ngoto start",
      },
    ],
    coins: [
      {x:3, y:1},
      {x:4, y:1},
      {x:5, y:1},
      {x:6, y:1},
      {x:6, y:2},
      {x:6, y:3},
      {x:6, y:4},
      {x:6, y:5},
      {x:3, y:5},
      {x:4, y:5},
      {x:5, y:5},
      {x:2, y:2},
      {x:2, y:3},
      {x:2, y:4},
      {x:2, y:5},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: [
      //{x:3, y:0}
    ]
  }
}