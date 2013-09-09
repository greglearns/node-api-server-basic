MOCHA?=node_modules/.bin/mocha
REPORTER?=spec
DEBUG?=
BAIL?=
FLAGS?=$(DEBUG) --reporter $(REPORTER) $(BAIL)

test:
	$(MOCHA) $(shell find . -name *-test.js | grep -v node_modules) $(FLAGS)

.PHONY: test

