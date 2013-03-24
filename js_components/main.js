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

PlayStatus = {
  PAUSED: 0,
  PLAYING: 1
}

var playStatus = PlayStatus.PLAYING

window.onload = function(){

  var pauseText = document.getElementById("pauseText")
  var playText = document.getElementById("playText")

  document
    .getElementById("pauseplay")
    .addEventListener("click", function() {
      // TODO: determine is this is threadsafe in JS
      if (playStatus == PlayStatus.PAUSED) {
        playStatus = PlayStatus.PLAYING
        pauseText.style.display = "inline"
        playText.style.display = "none"
      } else {
        playStatus = PlayStatus.PAUSED
        pauseText.style.display = "none"
        playText.style.display = "inline"
      }
    });
}


// Holds all top-level variables, funciton invocations etc.
//

//var EASING = "cubic-in-out"
var EASING = "linear"
var ANIMATION_DUR = 500
var CYCLE_DUR = ANIMATION_DUR
// TODO: replace 6 with a computed value
var BOT_PHASE_SHIFT = 0

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

setInterval("animate()", CYCLE_DUR)

