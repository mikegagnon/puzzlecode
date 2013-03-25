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

// Holds all top-level variables, function invocations etc.


// [animationDuration, delayDuration]
PlaySpeed = {
  SUPER_SLOW: [2000, 4000, "Super slow", "cubic-in-out"],
  SLOW: [750, 1500, "Slow", "cubic-in-out"],
  NORMAL: [400, 800, "Normal", "cubic-in-out"],
  FAST: [150, 150, "Fast", "linear"],
  SUPER_FAST: [0, 0, "Super fast", "linear"]
}

PlayStatus = {
  PAUSED: 0,
  PLAYING: 1
}

var playStatus = PlayStatus.PLAYING
//var EASING = "cubic-in-out"
var initPlaySpeed = PlaySpeed.SLOW
var ANIMATION_DUR = initPlaySpeed[0]
var CYCLE_DUR = initPlaySpeed[1]
var EASING = initPlaySpeed[3]
// TODO: replace 6 with a computed value
var BOT_PHASE_SHIFT = 0

var initialProgram = "move\nmove\nmove\nturn left\n"
var codeMirrorBox = null

var pausePlay = null

// maps linenumbers to comments for that line
var lineComments = {}

// TODO: put onload and event handlers in separate file
window.onload = function(){

  pausePlay = document.getElementById("pauseplay")
  pausePlay.addEventListener("click", togglePausePlay);

  document
    .getElementById("restart")
    .addEventListener("click", restartSimulation);

  codeMirrorBox = CodeMirror(document.getElementById("container"), {
    value: initialProgram,
    gutters: ["note-gutter", "CodeMirror-linenumbers"],
    mode:  "text/x-robocom",
    theme: "solarized dark",
    smartIndent: false,
    lineNumbers: true,
  });

  restartSimulation()

  // TODO: where should i put this?
  animateInterval = setInterval("animate()", CYCLE_DUR)
}

var animateInterval = null
var ccx = 9, // cell count x
    ccy = 7, // cell count y
    cw = 32, // cellWidth
    ch = 32,  // cellHeight
    del = CYCLE_DUR, // delay
    xs = d3.scale.linear().domain([0,ccx]).range([0,ccx * cw]),
    ys = d3.scale.linear().domain([0,ccy]).range([0,ccy * ch]),
    states = new Array()

// TODO: fix this jank
d3.range(ccx).forEach(function(x) {
    states[x] = new Array()
    d3.range(ccy).forEach(function(y) {
        states[x][y] = Math.random() > .8 ? true : false
    })
})

function toGrid(states) {
    var g = []
    for (x = 0; x < ccx; x++) {
        for (y = 0; y < ccy; y++) {
            g.push({"x": x, "y": y, "state": states[x][y]})
        }
    }
    return g
}

var vis = null

//var prog = compileRobocom(initialProgram)
var bots = null// initBots(prog)

createBoard()
drawCells()

//drawBots()

// kick it off
//

