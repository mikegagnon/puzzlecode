/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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
