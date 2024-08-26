# TODO

- make small puzzle more interconnected -- maybe by limiting grid size during generation?

- Add a tutorial video that pops up at the start. like palette

- icons uniform
- add tests

- piece rotation
- transpose grid/game solved logic will only work for square grid

For screenshots:

  const grid = [
    ["","","","","","","","","","","",""],
    ["","","","","","","","","","","",""],
    ["","","","","","","","","","B","",""],
    ["","","P","U","Z","Z","L","E","","R","",""],
    ["","","L","","","","E","","","A","",""],
    ["","G","A","M","E","","T","","","I","",""],
    ["","","Y","","","","T","H","I","N","K",""],
    ["","","","","","","E","","","","",""],
    ["","","","","W","O","R","D","","","",""],
    ["","","","","","","","","","","",""],
    ["","","","","","","","","","","",""],
    ["","","","","","","","","","","",""]
  ]

    const pieces = [{"letters":[["P","U","Z"],["L","",""],["A","",""]],"solutionTop":3,"solutionLeft":2},{"letters":[["B"],["R"],["A"]],"solutionTop":2,"solutionLeft":9},{"letters":[["","T","H"],["","E",""],["O","R","D"]],"solutionTop":6,"solutionLeft":5},{"letters":[["M","E"]],"solutionTop":5,"solutionLeft":3},{"letters":[["","I",""],["I","N","K"]],"solutionTop":5,"solutionLeft":8},{"letters":[["W"]],"solutionTop":8,"solutionLeft":4},{"letters":[["G"]],"solutionTop":5,"solutionLeft":1},{"letters":[["Y"]],"solutionTop":6,"solutionLeft":2},{"letters":[["Z","L","E"],["","E",""],["","T",""]],"solutionTop":3,"solutionLeft":5}];

// todo later PR:

- Use the hasVisited state to announce
- add some custom daily puzzles
- consolidate control buttons into hamburger menu (and add share button)

- add link to sponsors?
- rules = use the icons instead of words
- rules = use line-spacing in css instead of multiple br
- relocate to new file:
  - getWordValidityGrids
  - countingGrid
- just rename dispatch params to dispatcher everywhere
- put arrayToGrid to common or to word-logic package
- piecesOverlapQ should use getGridFromPieces
- // todo put screenshots of lexlet and blobble and wordfall ()as webp/compressed images? in MoreGames.js
