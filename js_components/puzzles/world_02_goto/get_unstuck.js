/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_get_unstuck() {
  return {
    id: "get_unstuck",
    name: "Introducing the goto instruction",

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
      + keyword("goto")  + " start"
      + "</pre>"
      + "<p>This program tells the robot to:</p>"
      + "<ul>"
      +   "<li>move forward </li>"
      +   "<li>turn right</li>"
      +   "<li>move forward again</li>"
      +   "<li>turn right again</li>"
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
      +     "<li>" + learnMoreGoto() + "</li>"
      + "</ul>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    // TODO: add a constraint that you can only use 4 move instructions
    constraints: {
      "max_instructions": 2,
    },

    solutions: [
      "start: move\ngoto start\n",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 4,
        facing: Direction.UP,
        program: "start: turn right\ngoto start\n",
      },
    ],
    coins: [
      {x: 4, y: 1},
      {x: 4, y: 0},
      {x: 4, y: 2},
      {x: 4, y: 3},
      {x: 4, y: 5},
      {x: 4, y: 6},
    ],
    blocks: [
    ],
    traps: [
    ]
  }
}