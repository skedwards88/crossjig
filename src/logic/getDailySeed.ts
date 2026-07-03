import {customDailyPuzzles} from "./customDailyPuzzles";
import {getSeedFromDate} from "@skedwards88/shared-components/src/logic/getSeedFromDate";

export default function getDailySeed() {
  const seedFromDate = getSeedFromDate();

  // Check if there is a custom puzzle for today
  // Otherwise, use the date as the seed
  const customDaily = customDailyPuzzles[seedFromDate];
  const seed = customDaily || seedFromDate;

  const isCustom = customDaily ? true : false;

  return [seed, isCustom];
}
