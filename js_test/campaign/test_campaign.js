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

var TEST_FILENAME = "js_test/campaign/test_campaign.js"

// For now a level is just some placeholder value, but I expect in the future
// tests these dummy levels will need to have the actual structure of real
// levels
var DUMMY_LEV_1_1 = true
var DUMMY_LEV_1_2 = true
var DUMMY_LEV_1_3 = true
var DUMMY_LEV_2_1 = true
var DUMMY_LEV_3_1 = true
var DUMMY_LEV_3_2 = true

var DUMMY_WORLD_1 = {
  id: "world1",
  name: "foo",
  levels: [
    DUMMY_LEV_1_1,
    DUMMY_LEV_1_2,
    DUMMY_LEV_1_3,
  ]
}

var DUMMY_WORLD_2 = {
  id: "world2",
  name: "bar",
  levels: [
    DUMMY_LEV_2_1,
  ]
}

var DUMMY_WORLD_3 = {
  id: "world3",
  name: "baz",
  levels: [
    DUMMY_LEV_3_1,
    DUMMY_LEV_3_2,
  ]
}

var DUMMY_CAMPAIGN = [
  DUMMY_WORLD_1,
  DUMMY_WORLD_2,
  DUMMY_WORLD_3]

/**
 * test for getPrevLevel
 *****************************************************************************/

var testGetPrevLevel = {
  "0.0": {
    world_index: 0,
    level_index: 0,
    expected: {}
  },
  "0.1": {
    world_index: 0,
    level_index: 1,
    expected: {
      world_index: 0,
      level_index: 0
    }
  },
  "0.2": {
    world_index: 0,
    level_index: 2,
    expected: {
      world_index: 0,
      level_index: 1
    }
  },
  "1.0": {
    world_index: 1,
    level_index: 0,
    expected: {
      world_index: 0,
      level_index: 2
    }
  },
  "2.0": {
    world_index: 2,
    level_index: 0,
    expected: {
      world_index: 1,
      level_index: 0
    }
  },
  "2.1": {
    world_index: 2,
    level_index: 1,
    expected: {
      world_index: 2,
      level_index: 0
    }
  },
}

for (TC_NAME in testGetPrevLevel) {
  TC = testGetPrevLevel[TC_NAME]
  RESULT = getPrevLevel(DUMMY_CAMPAIGN, TC.world_index, TC.level_index)
  test(_.isEqual(RESULT, TC.expected))
}

/**
 * test for getNextLevel
 *****************************************************************************/

var testGetNextLevel = {
  "0.0": {
    world_index: 0,
    level_index: 0,
    expected: {
      world_index: 0,
      level_index: 1
    }
  },
  "0.1": {
    world_index: 0,
    level_index: 1,
    expected: {
      world_index: 0,
      level_index: 2
    }
  },
  "0.2": {
    world_index: 0,
    level_index: 2,
    expected: {
      world_index: 1,
      level_index: 0
    }
  },
  "1.0": {
    world_index: 1,
    level_index: 0,
    expected: {
      world_index: 2,
      level_index: 0
    }
  },
  "2.0": {
    world_index: 2,
    level_index: 0,
    expected: {
      world_index: 2,
      level_index: 1
    }
  },
  "2.1": {
    world_index: 2,
    level_index: 1,
    expected: {}
  },
}

for (TC_NAME in testGetNextLevel) {
  TC = testGetNextLevel[TC_NAME]
  RESULT = getNextLevel(DUMMY_CAMPAIGN, TC.world_index, TC.level_index)
  test(_.isEqual(RESULT, TC.expected))
}