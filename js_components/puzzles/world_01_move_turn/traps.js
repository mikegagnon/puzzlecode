/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_traps() {
  return {
    id: "traps",
    name: "Watchout for the traps",
    hint: "<p>Watchout for the traps...</p>",
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],
    constraints: [],
    solutions: [
        "turn right\nmove\nmove\nturn right\nmove\nturn left\nmove\nmove\n"
        + "move\nmove\nturn right\nmove\nmove\nmove\nmove\nmove"
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
        program: "",
      },
    ],
    coins: [
      {x:1, y:0},
      {x:1, y:1},
      {x:1, y:2},
      {x:1, y:3},
      {x:5, y:4},
      {x:6, y:4},
      {x:0, y:5},
      {x:1, y:5},
      {x:6, y:5},
      {x:7, y:5},
      {x:8, y:5},
      {x:1, y:6},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: [
      {x:0, y:0},
      //{x:1, y:0},
      {x:2, y:0},
      {x:3, y:0},
      {x:4, y:0},
      {x:5, y:0},
      {x:6, y:0},
      {x:7, y:0},
      {x:8, y:0},

      {x:0, y:1},
      //{x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
      {x:4, y:1},
      {x:5, y:1},
      {x:6, y:1},
      {x:7, y:1},
      {x:8, y:1},

      {x:0, y:2},
      //{x:1, y:2},
      {x:2, y:2},
      {x:3, y:2},
      {x:4, y:2},
      {x:5, y:2},
      {x:6, y:2},
      {x:7, y:2},
      {x:8, y:2},

      {x:0, y:3},
      //{x:1, y:3},
      {x:2, y:3},
      {x:3, y:3},
      {x:4, y:3},
      {x:5, y:3},
      {x:6, y:3},
      {x:7, y:3},
      {x:8, y:3},

      {x:0, y:4},
      {x:1, y:4},
      {x:2, y:4},
      {x:3, y:4},
      //{x:4, y:4},
      //{x:5, y:4},
      //{x:6, y:4},
      {x:7, y:4},
      {x:8, y:4},

      //{x:0, y:5},
      //{x:1, y:5},
      {x:2, y:5},
      {x:3, y:5},
      {x:4, y:5},
      {x:5, y:5},
      //{x:6, y:5},
      //{x:7, y:5},
      //{x:8, y:5},

      {x:0, y:6},
      //{x:1, y:6},
      {x:2, y:6},
      {x:3, y:6},
      {x:4, y:6},
      {x:5, y:6},
      {x:6, y:6},
      {x:7, y:6},
      {x:8, y:6},

      {x:0, y:7},
      {x:1, y:7},
      {x:2, y:7},
      {x:3, y:7},
      {x:4, y:7},
      {x:5, y:7},
      {x:6, y:7},
      {x:7, y:7},
      {x:8, y:7},
    ]
  }
}