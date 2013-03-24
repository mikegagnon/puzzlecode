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

// [animationDuration, delayDuration]
PlaySpeed = {
  SUPER_SLOW: [1500, 3000, "Super slow"],
  SLOW: [750, 1500, "Slow"],
  NORMAL: [400, 400, "Normal"],
  FAST: [150, 150, "Fast"],
  SUPER_FAST: [0, 0, "Super fast"]
}

PlayStatus = {
  PAUSED: 0,
  PLAYING: 1
}

var playStatus = PlayStatus.PLAYING
//var EASING = "cubic-in-out"
var EASING = "linear"
var ANIMATION_DUR = PlaySpeed.NORMAL[0]
var CYCLE_DUR = PlaySpeed.NORMAL[1]
// TODO: replace 6 with a computed value
var BOT_PHASE_SHIFT = 0


// TODO: put onload and event handlers in separate file

function setSpeed(speed) {
  var speedText = document.getElementById("speedText")

  ANIMATION_DUR = speed[0]
  CYCLE_DUR = speed[1]
  speedText.innerHTML = speed[2]
  clearInterval(animateInterval)
  animateInterval = setInterval("animate()", CYCLE_DUR)
}

window.onload = function(){

  var pausePlay = document.getElementById("pauseplay")

  pausePlay
    .addEventListener("click", function() {
      // TODO: determine is this is threadsafe in JS
      if (playStatus == PlayStatus.PAUSED) {
        playStatus = PlayStatus.PLAYING
        pausePlay.innerHTML = 'Pause'
      } else {
        playStatus = PlayStatus.PAUSED
        pausePlay.innerHTML = 'Play!'
      }
    });
}


// Holds all top-level variables, funciton invocations etc.
//



var ccx = 6, // cell count x
    ccy = 7, // cell count y
    cw = 32, // cellWidth
    ch = 32,  // cellHeight
    del = CYCLE_DUR, // delay
    xs = d3.scale.linear().domain([0,ccx]).range([0,ccx * cw]),
    ys = d3.scale.linear().domain([0,ccy]).range([0,ccy * ch]),
    states = new Array()

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

var vis = d3.select("#board")
    .attr("class", "vis")
    .attr("width", ccx * cw)
    .attr("height", ccy * ch)

vis.selectAll(".cell")
    .data(function() { return toGrid(states) })
  .enter().append("svg:rect")
    .attr("class", "cell")
    .attr("stroke", "lightgray")
    .attr("fill", "white")
    .attr("x", function(d) { return xs(d.x) })
    .attr("y", function(d) { return ys(d.y) })
    .attr("width", cw)
    .attr("height", ch)

var bots = [
  new Bot(4,4, Direction.UP, ["move", "left", "move", "move"]),
  new Bot(1,1, Direction.RIGHT, ["move"]),
  new Bot(1,5, Direction.LEFT, ["move", "left", "move", "right"]),
  new Bot(3,7, Direction.DOWN, ["move"])
  ];

vis.selectAll(".bot")
    .data(bots)
  .enter().append("svg:use")
    .attr("class", "bot")
    .attr("xlink:href", "#botTemplate")
    .attr("transform", function(bot) {
      var x = bot.cellX * cw + BOT_PHASE_SHIFT
      var y = bot.cellY * ch + BOT_PHASE_SHIFT
      if (bot.facing == Direction.RIGHT) {
        return "translate(" + x + "," + y + ") rotate(90 16 16)"
      } else if (bot.facing == Direction.DOWN) {
        return "translate(" + x + "," + y + ") rotate(180 16 16)"
      } else if (bot.facing == Direction.LEFT) {
        return "translate(" + x + "," + y + ") rotate(-90 16 16)"
      } else {
        return "translate(" + x + "," + y + ")"
      }
    })

var animateInterval = setInterval("animate()", CYCLE_DUR)

