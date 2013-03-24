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

Opcode = {
  MOVE: 0,
  TURN: 1,
}

function RobocomInstruction(
    // value must be in the Opcode enum
    opcode,
    // data object, whose type is determined by opcode
    data) {
  this.opcode = opcode
  this.data = data
}

function RobocomProgram(
    // string
    programText,
    // array of instruction objects (or null if there was an error)
    instructions,
    // maps lineNumber to comment for that line
    lineComments) {
  this.programText = programText
  this.instructions = instructions
  this.lineComments = lineComments
}

function newErrorComment(text, uri) {
  var newlink = document.createElement('a')
  newlink.setAttribute('href', uri)
  newlink.setAttribute('class', "errorLink")
  newlink.appendChild(newComment(text))
  return newlink
}

function newComment(text) {
  return document.createTextNode(text)
}

function removeComment(tokens) {
  var commentToken = -1
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    var commentCharIndex = token.indexOf("//")
    if (commentCharIndex == 0) {
      // completely exclude this token
      return tokens.slice(0, i)
    } else if (commentCharIndex > 0) {
      // trim this token and exclude the rest
      tokens[i] = token.substr(0, commentCharIndex)
      return tokens.slice(0, i + 1)
    }
  }
  return tokens
}

function compileMove(tokens) {
  var instruction = null
  var comment = null

  // assert tokens[0] == "move"
  if (tokens.length == 1) {
    instruction = new RobocomInstruction(Opcode.MOVE, null)
    comment = newComment("Move forward one square")
  } else {
    instruction = null
    comment = newErrorComment("Incorrect 'move' instruction", "#")
  }

  return [instruction, comment]
}

function compileTurn(tokens) {
  var instruction = null
  var comment = null

  // assert tokens[0] == "move"
  if (tokens.length == 2) {
    var direction = tokens[1]
    if (direction == "left") {
      instruction = new RobocomInstruction(Opcode.TURN, Direction.LEFT)
      comment = newComment("Rotate counter-clockwise 90 degrees")
    } else if (direction == "right") {
      instruction = new RobocomInstruction(Opcode.TURN, Direction.RIGHT)
      comment = newComment("Rotate clockwise 90 degrees")
    } else {
      instruction = null
      comment = newErrorComment("'" + direction + "' is not a valid direction", "#")
    }
  } else {
    instruction = null
    comment = newErrorComment("The 'turn' instruction is missing a direction", "#")
  }

  return [instruction, comment]
}

// Returns [instruction, comment]
//  where instruction is a RobocomInstruction and comment is a string
//  instruction is set to null if there was an error compiling the instruciton
// Returns [] if the line is a no-op
function compileLine(line) {
  var tokens = line
    .replace(/\s+/g, " ")
    .replace(/(^\s+)|(\s+$)/g, "")
    .split(" ")

  tokens = removeComment(tokens)

  if (tokens.length == 0 ||
      (tokens.length == 1 && tokens[0] == "")) {
    return []
  }

  console.dir(tokens)

  var opcode = tokens[0]
  if (opcode == "move") {
    return compileMove(tokens)
  } else if (opcode == "turn") {
    return compileTurn(tokens)
  } else {
    comment = newErrorComment("'" + opcode + "' is not an instruction", "#")
    return [null, comment]
  }
}

// Compiles a programText into a RobocomProgram object
function compileRobocom(programText) {
  var lines = programText.split("\n")
  var instructions = []
  var lineComments = {}
  var error = false
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var compiledLine = compileLine(line)
    if (compiledLine.length > 0) {
      // assert compiledLine.length == 2
      lineComments[i] = compiledLine[1]
      var instruction = compiledLine[0]
      if (instruction == null) {
        error = true
      } else {
        instructions.push(instruction)
      }
    }
  }

  if (error) {
    return new RobocomProgram(programText, null, lineComments)
  } else {
    return new RobocomProgram(programText, instructions, lineComments)
  }
}
