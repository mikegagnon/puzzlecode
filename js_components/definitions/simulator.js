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
    this.animation = "";
}

function turnBot(bot, direction) {
  var oldFacing = bot.facing
  bot.facing = rotateDirection(bot.facing, direction)
  var animationData = new AnimationTurn(oldFacing, bot.facing)
  bot.animation = new Animation(AnimationType.ROTATE, animationData)
}

function executeGoto(bot, nextIp) {
  bot.ip = nextIp
  // animation?
}

// executes the 'move' instruciton on the bot
// updates the bot state
function moveBot(bot) {

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

  xResult = wrapAdd(bot.cellX, dx, ccx)
  yResult = wrapAdd(bot.cellY, dy, ccy)
  bot.cellX = xResult[0]
  bot.cellY = yResult[0]
  xTorus = xResult[1]
  yTorus = yResult[1]

  animationData = new AnimationMove(
    xTorus == "torus" || yTorus == "torus",
    prevX, prevY,
    bot.cellX - dx, bot.cellY - dy,
    prevX + dx, prevY + dy,
    dx, dy) 

  bot.animation = new Animation(AnimationType.MOVE, animationData)
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
    bot.animation = new Animation(AnimationType.NONE, null)
    if (instruction.opcode == Opcode.MOVE) {
      moveBot(bot)
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

function initBots(prog) {
  var initBot = new Bot(
    Math.floor((ccx - 1) / 2),
    Math.floor((ccy - 1)/ 2),
    Direction.UP,
    prog)

  return [initBot]  
}
