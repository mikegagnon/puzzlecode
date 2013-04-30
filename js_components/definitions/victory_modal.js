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

/**
 * campaign and state have the usual meaning
 * campaign_deltas is an array of "campaign delta" objects, as returned
 * by the updateLevelVisibility() function
 *
 * returns html that enumerates the badges specified in campaign_deltas
 */
function getBadgesHtml(campaign, state, campaign_deltas) {
  var html = ""

  if (campaign_deltas.length == 0) {
    html += "<br><br>"
  }

  // First add the badges to the modal
  _(campaign_deltas)
    .forEach(function(delta) {

      // if a level has been unlocked
      if ("level_unlock" in delta) {

        var name = campaign[delta.world_index]
          .levels[delta.level_unlock].level.name
        var level_name = getLevelName(
            delta.world_index,
            delta.level_unlock,
            name)

        html += '<h5>'
          + '<span class="label label-success victory-label">New level</span> '
          + 'You unlocked <a href="'
          + levelLink(delta.world_index, delta.level_unlock)
          + '">'
          + level_name
          + '</a>'
          + '</h5>'

      }
      // if a world has been unlocked
      else if ("world_unlock" in delta) {
        /*var next_world_name = campaign[delta.world_unlock].name

        html += '<h5>'
          + '<span class="label label-success victory-label">New world</span> '
          + 'You unlocked World '
          + (delta.world_unlock + 1)
          + ': '
          + next_world_name
          + '</h5>'
        */
      } else if ("level_complete" in delta) {
        /*worldMenuCheckLevel(campaign, delta.world_index, delta.level_complete)

        var name = campaign[delta.world_index]
          .levels[delta.level_complete].level.name
        var level_name = getLevelName(
          delta.world_index,
          delta.level_complete,
          name)

        html += '<h5>'
          + '<span class="label label-warning victory-label">Level complete</span> '
          + 'You completed '
          + level_name
          + '</h5>'

        var nextLevel = getNextLevel(campaign, delta.world_index,
          delta.level_complete)

        // if there is a next level, then update the play-next-level button
        if (!_(nextLevel).isEmpty()) {
          $("#victoryModal_playNextButton")
            .attr("href", "javascript: transitionLevel("
              + nextLevel.world_index
              + ","
              + nextLevel.level_index
              + ")")
          $("#victoryModal_playNextButton").removeAttr("style")
        } else {
          $("#victoryModal_playNextButton").attr("style", "display: none;")
        }
        */
      } else if ("world_complete" in delta) {

        var world_name = campaign[delta.world_complete].name

        html += '<h5>'
          + '<span class="label label-important victory-label">World Complete</span> '
          + 'You completed World '
          + (delta.world_complete + 1)
          + ': '
          + world_name
          + '</h5>'

      } else if ("game_complete" in delta) {

        html += '<h5>'
          + '<span class="label label-inverse victory-label">Game Complete</span> '
          + "You have completed the game!"
          + '</h5>'

      } else {
        console.error("Unexpected delta: ")
        console.dir(delta)
      }

    })

  return html
}

function getLevelButtonHtml(campaign, state, world_index, level_index) {

  if (isLevelCompleted(state, world_index, level_index)) {
    var completed = true
    var visible = true
  } else if (isLevelAccessible(state, world_index, level_index)) {
    var completed = false
    var visible = true
  } else {
    var completed = false
    var visible = false
  }

  var html = '<a '

  if (completed || visible) {
    var name = campaign[world_index].levels[level_index].level.name
    var levelName = getLevelName(world_index, level_index, name)

    html += 'data-toggle="tooltip" title="' + levelName + '" '
    html +='href="javascript: transitionLevel('
      + world_index + ',' + level_index + ')" '

    if (completed) {
      html += 'class="btn btn-level-menu">'
    } else {
      html += 'class="btn btn-level-menu btn-primary">'      
    }

    html += (world_index + 1) + "." + (level_index + 1) + " "

  } else {
    html += 'href="#" class="btn btn-level-menu disabled">'
  }

  if (completed) {
    html += '<i class="icon-ok"></i>'
  } else if (!visible) {
    html += '<i class="icon-lock"></i>'
  }
  html += '</a>'

  return html
}

function getWorldMenuHtml(campaign, state, world_index) {

  var world = campaign[world_index]

  var html = "<tr>"

  html +=
    //'<td><div class="alert alert-info world-menu-label">'
    '<td><h4>'
    + "World " + (world_index + 1) + ": "
    + world.name
    + '</h4></td>'
    //+ '</div></td>'

  html += "<td>"

  var levels = world.levels

  for (level_index in levels) {
    html += getLevelButtonHtml(campaign, state, world_index, parseInt(level_index))
  }

  html += "</td>"
  html += "</tr>"
  return html
}

function getCampaignMenuHtml(campaign, state) {
  var html = "<table class='table table-striped'>"

  for (world_index in campaign) {
    if (isWorldAccessible(state, world_index)) {
      html += getWorldMenuHtml(campaign, state, parseInt(world_index))
    }
  }

  html += "</table>"

  return html

}

/**
 * campaign and state have the usual meaning
 * campaign_deltas is an array of "campaign delta" objects, as returned
 * by the updateLevelVisibility() function
 */
function setupVictoryModal(campaign, state, campaign_deltas) {

  var html = getBadgesHtml(campaign, state, campaign_deltas)
    + getCampaignMenuHtml(campaign, state) 

  $("#victoryModalBody").html(html)
}
