/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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
      +       "<a target='_blank' href='"
      +         WIKI_URL + "Goto-instruction"
      +         "'>"
      +   "Learn more about the " + keyword_link("goto") + " instruction."
      +   "</a>"
      + "</p>"
    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    constraints: {
      "max_instructions": 2
    },

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