Puzzle Code
===========
By Mike Gagnon, public domain (see UNLICENSE)

A programming game for non-programmers.

Currently in development. Live demo at http://puzzlecode.org

The game
--------
Puzzle Code is heavily inspired by
[Robocom](http://atlantis.cyty.com/robocom/), an
old programming game where you program bots
to battle each other.

In Puzzle Code there will be a battle mode, but
I will also create a single-player puzzle campaign.
In each puzzle the player must program a robot
to accomplish an objective (e.g. collect all the
coins) within certain constrains (e.g. your bot
can only use 10 lines of code).

The puzzle campaign will be divided into worlds,
where each world contains several levels. Each
world will introduce a new programming concept.

Goals
-----
* Fun
* Extremely easy and intuitive for non-programmers.
  * Programming is fundamentally challenging. I want players
to focus on the fun challenge of programming --- not the
annoyances usually associated with programming.
* Self contained. Every aspect of the game and programming
language should be learnable from playing the game.
No tutorials. Like what it's like to learn to play Angry Birds.
  * However, there should be a rich help system,
including good documentation for every instruction and error
message.


Compile
-------
```
$ make
```

Then browse to public/index.html
