#
# Copyright 2013 Michael N. Gagnon
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# Compiles puzzlecode.js from its constituent components
# TODO: minify the js

all: puzzlecode.js

js=js_components
dest=public
puzzlecode_js=$(dest)/puzzlecode.js
js_test=js_test/*/*.js
definitions = $(js)/definitions/*.js
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
	