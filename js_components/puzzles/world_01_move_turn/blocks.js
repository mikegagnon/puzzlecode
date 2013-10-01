/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_blocks() {
  return {
    id: "blocks",
    name: "Blocks",
    description: "Collect all the coins on the board.",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>"
      + "Your robot cannot move through blocks. It must go around them."
      + "</p>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],
    badges: {},
    constraints: [],

    // what conditions need to be met to unlock this level?
    // the unlock returns true if this level should be unlocked
    // TODO: come up with better unlock functions. e.g.
    //    return USED_MOVE && USED_TURN && isLevelCompleted(LevelEnum.Previous)
    unlock: function(campaign, state, world_index, level_index) {
      return prevLevelCompleted(campaign, state, world_index, level_index)
    },

    solutions: [
      "move\nmove\nturn left\nmove\nmove\nturn right\nmove\nmove\nturn right\nmove\nmove",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 2,
        cellY: 3,
        facing: Direction.RIGHT,
        program: "",
      },
    ],
    coins: [
      {x:6, y:3},
    ],
    blocks: [
      {x:5, y:2},
      {x:5, y:3},
      {x:5, y:4},
    ],
    traps: [
      //{x:3, y:0}
    ]
  }
}