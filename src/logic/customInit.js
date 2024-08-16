// todo wip new, incomplete file

export function customInit() {
  // todo saved state

  const alphabet = [
    'A', 'B', 'C', 'D', 'E', 'F',
    'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R',
    'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z'
  ];

  const pieces = alphabet.map((letter, index) => ({
    "letters": [
        [
          letter
        ]
    ],
    "id": index,
    "poolIndex": index,
}));

  return {
    pieces,
  }
}
