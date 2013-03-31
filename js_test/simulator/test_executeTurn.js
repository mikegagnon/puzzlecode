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

var TEST_FILENAME = "js_test/simulator/test_executeTurn.js"

/**
 * test execution of move instruction
 *************************************************************************/


var botBase = {
  animations: {},
}

var testExecuteTurn = {
  "facing up, turn left": {
    bot: cloneDeep(botBase, {
      facing: Direction.UP,
    }),
    turnDirection: Direction.LEFT,
    expected: cloneDeep(botBase, {
      facing: Direction.LEFT,
      animations: {
        rotate: true
      }
    }),
  },
  "facing up, turn right": {
    bot: cloneDeep(botBase, {
      facing: Direction.UP,
    }),
    turnDirection: Direction.RIGHT,
    expected: cloneDeep(botBase, {
      facing: Direction.RIGHT,
      animations: {
        rotate: true
      }
    }),
  },

    "facing right, turn left": {
    bot: cloneDeep(botBase, {
      facing: Direction.RIGHT,
    }),
    turnDirection: Direction.LEFT,
    expected: cloneDeep(botBase, {
      facing: Direction.UP,
      animations: {
        rotate: true
      }
    }),
  },
  "facing right, turn right": {
    bot: cloneDeep(botBase, {
      facing: Direction.RIGHT,
    }),
    turnDirection: Direction.RIGHT,
    expected: cloneDeep(botBase, {
      facing: Direction.DOWN,
      animations: {
        rotate: true
      }
    }),
  },

    "facing down, turn left": {
    bot: cloneDeep(botBase, {
      facing: Direction.DOWN,
    }),
    turnDirection: Direction.LEFT,
    expected: cloneDeep(botBase, {
      facing: Direction.RIGHT,
      animations: {
        rotate: true
      }
    }),
  },
  "facing down, turn right": {
    bot: cloneDeep(botBase, {
      facing: Direction.DOWN,
    }),
    turnDirection: Direction.RIGHT,
    expected: cloneDeep(botBase, {
      facing: Direction.LEFT,
      animations: {
        rotate: true
      }
    }),
  },

    "facing left, turn left": {
    bot: cloneDeep(botBase, {
      facing: Direction.LEFT,
    }),
    turnDirection: Direction.LEFT,
    expected: cloneDeep(botBase, {
      facing: Direction.DOWN,
      animations: {
        rotate: true
      }
    }),
  },
  "facing left, turn right": {
    bot: cloneDeep(botBase, {
      facing: Direction.LEFT,
    }),
    turnDirection: Direction.RIGHT,
    expected: cloneDeep(botBase, {
      facing: Direction.UP,
      animations: {
        rotate: true
      }
    }),
  },
}

for (TC_NAME in testExecuteTurn) {
  TC = testExecuteTurn[TC_NAME]
  var bot = cloneDeep(TC.bot)
  executeTurn(bot, TC.turnDirection)
  RESULT = bot
  test(_.isEqual(RESULT, TC.expected))
}
