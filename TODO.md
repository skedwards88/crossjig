# TODO

- looks like start drag can be triggered before multiselect
- - also looks like endmultiselect can be triggered without end drag
- when long touch but don't drag, end touch is not triggered on phone
- when long touch and jiggle finger without dragging, doesn't multi select. maybe add delay for drag start or tell if drag moved?

- make small puzzle more interconnected -- maybe by limiting grid size during generation?

- Make a way to move chunks of connected pieces instead of the whole puzzle
- Add a tutorial video that pops up at the start. like palette

- icons uniform
- package to import to wordgames
- add tests

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
