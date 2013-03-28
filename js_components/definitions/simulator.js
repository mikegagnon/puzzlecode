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

function Bot(x, y, facing, program) {

    this.cellX = x;
    this.cellY = y
    this.facing = facing;
    // an array of strings, each string is an "instruction"
    this.program = program;
    // instruction pointer points to the next instruction to be executed
    this.ip = 0;

    // the next animation to perform for this bot
    this.animations = {};
}

function turnBot(bot, direction) {
  var oldFacing = bot.facing
  bot.facing = rotateDirection(bot.facing, direction)
  bot.animations = { rotate : new AnimationTurn(oldFacing, bot.facing) }
}

// TODO: handle case where goto goes past end of program
function executeGoto(bot, nextIp) {
  bot.ip = nextIp
  // animation?
}

// a bot tries to move into cell x,y.
// returns true if the bot is allowed to move in, false otherwise
// TODO: also check for bots
function tryMove(board, bot, x, y) {
  var matchingBlocks = _(board.blocks)
    .filter( function(block) {
      return block.x == x && block.y == y
    })
    .value()

  return matchingBlocks.length == 0
}

// executes the 'move' instruciton on the bot
// updates the bot state
function moveBot(board, bot) {

  bot.animations = {}

  var prevX = bot.cellX
  var prevY = bot.cellY

  var dx = 0
  var dy = 0
  if (bot.facing == Direction.UP) {
    dy = -1
  } else if (bot.facing == Direction.DOWN) {
    dy = 1
  } else if (bot.facing == Direction.LEFT) {
    dx = -1
  } else if (bot.facing == Direction.RIGHT) {
    dx = 1
  } else {
    // assert(false)
  }

  xResult = wrapAdd(bot.cellX, dx, board.num_cols)
  yResult = wrapAdd(bot.cellY, dy, board.num_rows)
  destX = xResult[0]
  destY = yResult[0]
  xTorus = xResult[1]
  yTorus = yResult[1]

  if (!tryMove(board, bot, destX, destY)) {
    bot.animations.failMove = {
      destX: bot.cellX + dx,
      destY: bot.cellY + dy
    }
  } else {
    // TOOD: break this function up into smaller functions

    bot.cellX = destX
    bot.cellY = destY

    // did the bot pickup a coin?
    var matchingCoins = _(BOARD.coins)
      .filter( function(coin) {
        return coin.x == bot.cellX && coin.y == bot.cellY
      })
      .value()

    assert(matchingCoins.length == 0 || matchingCoins.length == 1,
      "matchingCoins.length == 0 || matchingCoins.length == 1")

    if (matchingCoins.length == 1) {
      var matchingCoin = matchingCoins[0]

      // remove the coin from the board
      BOARD.coins = _(BOARD.coins)
        .filter( function(coin) {
          return !(coin.x == bot.cellX && coin.y == bot.cellY)
        })
        .value()

      BOARD.coinsCollected += 1

      bot.animations.coin_collect = matchingCoin
    }

    if (xTorus != "torus" && yTorus != "torus") {
      bot.animations.nonTorusMove = true
    } else {
      bot.animations.torusMove = {
        prevX: prevX,
        prevY: prevY,
        oobPrevX: bot.cellX - dx,
        oobPrevY: bot.cellY - dy,
        oobNextX: prevX + dx, 
        oobNextY: prevY + dy
      }
    }

  }
}

// assumes relatively sane values for increment
// returns [value, moveType]
// where moveType == "moveTorus" or "moveNonTorus"
function wrapAdd(value, increment, outOfBounds) {
  value += increment
  if (value >= outOfBounds) {
    return [value % outOfBounds, "torus"]
  } else if (value < 0) {
    return [outOfBounds + value, "torus"]
  } else {
    return [value, "nonTorus"]
  }
}

// TODO: do a better job separating model from view.
function step(bots) {
  // TODO: determine for each for javascript
  var numBots = bots.length
  for (var i = 0; i < numBots; i++) {
    var bot = bots[i]

    var instruction = bot.program.instructions[bot.ip]
    bot.ip = (bot.ip + 1) % bot.program.instructions.length
    bot.animations = {}
    if (instruction.opcode == Opcode.MOVE) {
      moveBot(BOARD, bot)
    } else if (instruction.opcode == Opcode.TURN) {
      turnBot(bot, instruction.data)
    } else if (instruction.opcode == Opcode.GOTO) {
      executeGoto(bot, instruction.data)
    }
  }
}

function cleanUpSimulation() {
  BOARD.bots = []
}

function initBots(board, prog) {
  var initBot = new Bot(
    Math.floor((board.num_cols - 1) / 2),
    Math.floor((board.num_rows - 1)/ 2),
    Direction.UP,
    prog)

  return [initBot]  
}
