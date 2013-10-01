# This is free and unencumbered software released into the public domain.
# See UNLICENSE.

# Compiles puzzlecode.js from its constituent components
# TODO: minify the js

all: puzzlecode.js

js=js_components
dest=public
puzzlecode_js=$(dest)/puzzlecode.js
js_test=js_test/*/*.js
definitions = $(js)/definitions/*.js $(js)/puzzles/*/*.js
tmp_file=/tmp/puzzlecode_tmp

# compiles a special version of puzzlecode.js that also runs a bunch of js tests
# to run the tests, just open public/index.html. If there are no alerts,
# everything passed
test: puzzlecode.js
	@cat $(puzzlecode_js) $(js_test) > $(tmp_file)
	@mv $(tmp_file) $(puzzlecode_js)
	@echo created test version of $(puzzlecode_js)

puzzlecode.js: \
	$(definitions) \
	$(js)/main.js
	@cat $(definitions) $(js)/main.js > $(puzzlecode_js)
	@echo created $(puzzlecode_js)
	