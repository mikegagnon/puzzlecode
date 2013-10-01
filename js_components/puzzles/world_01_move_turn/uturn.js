/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_uturn() {
  return {
    id: "uturn",
    name: "U-turn",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>Your robot <strong>cannot</strong> go backwards.</p>"
      + "<p>To perform a u-turn you need to <strong>turn twice</strong> (to "
      + "the left twice, or to the right twice).</p>"
      + "<p>If you need help on turning, checkout "
      + "<a target='_blank' href='"
      + WIKI_URL + "turn%20instruction"
      + "'>this help page</a>.</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    constraints: [],

    solutions: [
      "turn right\nturn right\nmove\nmove\nmove",
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
        facing: Direction.RIGHT,
        program: "turn right\nmove\nmove\nmove\n",
      },
    ],
    coins: [
      {x:3, y:3},
      {x:2, y:3},
      {x:1, y:3},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: []
  }
}