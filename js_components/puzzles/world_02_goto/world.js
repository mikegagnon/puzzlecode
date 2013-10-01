/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
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
      {
        level: puzzle_zigs_and_zags(),
        badges: {},
        unlock: prevLevelCompleted
      },
    ]
  }
}