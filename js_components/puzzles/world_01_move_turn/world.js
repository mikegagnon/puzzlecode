/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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
        level: puzzle_zig_zag(),
        badges: {},
        unlock: prevLevelCompleted
      },
      {
        level: puzzle_traps(),
        badges: {},
        unlock: function(campaign, state, world_index, level_index) {
          return isLevelCompleted(state, world_index, level_index - 2) 
        }
      },
    ]
  }
}