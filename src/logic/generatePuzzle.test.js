import { generatePuzzle } from "./generatePuzzle";
import {getConnectivityScore} from "./getConnectivityScore"

function getAverage(array) {
  const sum = array.reduce(
    (currentSum, currentValue) => currentSum + currentValue,
    0
  );
  return sum / array.length;
}

// todo these tests were just playing around to see how grid size affects connectivity and count
// would like to take a fresh look to see:
// - if the count and connectivity (average and spread) changes as grid size changes for a set number of letters
// - if/how much the count changes as you force a higher connectivity
describe("generatePuzzle", () => {
  test("count does not increase ", () => {
    const numIterations = 500;
    const numLetters = 20;
    const gridSizes = [8, 7, 6];

    let averages = {};

    gridSizes.forEach((gridSize) => {
      let connectivityScores = [];
      let counts = [];

      for (let iteration = 0; iteration < numIterations; iteration++) {
        const { pieces, count } = generatePuzzle({
          gridSize: gridSize,
          minLetters: numLetters,
        });
        counts.push(count);
        const connectivityScore = getConnectivityScore({ pieces, gridSize });
        connectivityScores.push(connectivityScore);
      }

      averages[gridSize] = {
        averageCount: getAverage(counts),
        averageConnectivity: getAverage(connectivityScores),
      };
    });

    // The average number of attempts to generate the puzzle
    // for each grid size should not be more than this
    // const countTolerance = 2;
    // expect(
    //   Math.abs(
    //     averages[Math.min(...gridSizes)].averageCount -
    //       averages[Math.max(...gridSizes)].averageCount
    //   )
    // ).toBeLessThanOrEqual(countTolerance);

    // The average connectivity for the smaller grid should be higher than
    // that of the larger grid
    gridSizes.forEach((gridSize) =>
      console.log(`${gridSize}: ${averages[gridSize].averageCount}`)
    );
    gridSizes.forEach((gridSize) =>
      console.log(`${gridSize}: ${averages[gridSize].averageConnectivity}`)
    );
    // expect(
    //   averages[Math.min(...gridSizes)].averageConnectivity
    // ).toBeGreaterThanOrEqual(averages[Math.max(...gridSizes)].averageConnectivity);
  });
});
