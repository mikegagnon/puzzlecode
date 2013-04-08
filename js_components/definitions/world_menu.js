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

function getCompletedClass(completed) {
  if (completed) {
    return "icon-ok"
  } else {
    return "icon-minus"
  }
}

/**
 * worldId: the id for the newly created world menu object (do not include '#')
 * text: the name of the world, e.g. "World 1: Move &amp; Turn"
 * completed: true iff world is completed, false otherwise
 */
function addWorldToMenu(worldId, text, completed) {

  var completedClass = getCompletedClass(completed)

  $("#levelmenu")
    .append(
      '<li id="' + worldId + '">'
      +  '<div class="btn-group">'
      +    '<a class="btn dropdown-toggle level-select"'
      +       'data-toggle="dropdown" href="#">'
      +       '<i class="' + completedClass + '"></i> '
      +       text
      +       '<span class="caret world-menu-caret"></span>'
      +    '</a>'
      +    '<ul class="dropdown-menu">'
      +    '</ul>'
      +  '</div>'
      + '</li>')
}

function addLevelToMenu(worldId, levelId, text, completed) {
  var completedClass = getCompletedClass(completed)

  $("#" + worldId)
    .find(".dropdown-menu")
    .append('<li id="' + levelId + '">'
      + '<a tabindex="-1" href="#">'
      + '<i class="' + completedClass + '"></i> '
      + text
      + '</a>'
      + '</li>')
}

