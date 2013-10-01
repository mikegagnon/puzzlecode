/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

/**
 * IDEA: breakpoints, see http://codemirror.net/demo/marker.html
 *
 * TODO: error text usually needs to be more verbose. Perhaps add a link to
 * a modal that explains the error and gives references.
 *
 * IDEA: put drop-down boxes in comment section so you can fit more text there
 */

// lineComments is a map where line index points to comment for that line
function addLineComments(codeMirrorBox, lineComments) {
  codeMirrorBox.clearGutter("note-gutter")
  for (i in lineComments) {
    var comment = lineComments[i]
    codeMirrorBox
      .setGutterMarker(
        parseInt(i),
        "note-gutter",
        comment)
  }
}

function setupCodeMirrorBox() {

  // Defines a syntax highlighter for the PuzzleCode language
  CodeMirror.defineMIME("text/x-puzzlecode", {
    name: "clike",
    keywords: RESERVED_WORDS,
    blockKeywords: {},
    atoms: {},
    hooks: {
      "@": function(stream) {
        stream.eatWhile(/[\w\$_]/);
        return "meta";
      }
    }
  })

  var settings = {
    gutters: ["note-gutter", "CodeMirror-linenumbers"],
    mode:  "text/x-puzzlecode",
    theme: "eclipse",
    smartIndent: false,
    lineNumbers: true,
    height: 50
  }

  CODE_MIRROR_BOX = CodeMirror(document.getElementById("codeMirrorEdit"),
    settings)

  cm = CODE_MIRROR_BOX
  cm.setSize("100%", "250px")

  //  TODO: put the cursorActivity function in seperate file
  var line = 0
  cm.on("cursorActivity", function(cm) {
    var newLine = cm.getCursor().line
    if (PLAY_STATUS == PlayStatus.INITAL_STATE_PAUSED) {
      if (line != newLine) {
        compile()
      }
      line = newLine
    }
  })

  // You cannot edit the program, unless it is in the reset state
  cm.on("beforeChange", function(cm, change) {
    if (PLAY_STATUS != PlayStatus.INITAL_STATE_PAUSED) {
      change.cancel()
    }
  })
}
