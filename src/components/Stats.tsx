import type {DayNumber, DisplayState, Stats as StatsType} from "../Types";

function dayLetterFromNumber(
  number: DayNumber,
): "S" | "M" | "T" | "W" | "R" | "F" {
  switch (number) {
    case 0:
      return "S";
    case 1:
      return "M";
    case 2:
      return "T";
    case 3:
      return "W";
    case 4:
      return "R";
    case 5:
      return "F";
    case 6:
      return "S";

    default:
      throw new Error(`Unexpected day number ${number}`);
  }
}

function StatBar({
  won,
  maxDays,
  dayNumber,
}: {
  won: number;
  maxDays: number;
  dayNumber: DayNumber;
}): React.JSX.Element {
  return (
    <div className="statsBar">
      <div className="statsDay">{dayLetterFromNumber(dayNumber)}</div>
      <div
        className="statsWon"
        style={{
          width: `${100 * (won / maxDays) || 0}%`,
        }}
      ></div>
    </div>
  );
}

function StatsNumber({
  formattedNumber,
  text,
}: {
  formattedNumber: string;
  text: string;
}): React.JSX.Element {
  return (
    <div className="statsNumber">
      <div className="number">{formattedNumber}</div>
      <div>{text}</div>
    </div>
  );
}

export default function Stats({
  stats,
  setDisplay,
}: {
  stats: StatsType;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
}): React.JSX.Element {
  const maxDays = Object.values(stats.days).reduce(
    (currentMax, comparison) =>
      currentMax > comparison.won ? currentMax : comparison.won,
    0,
  );

  // Order the day keys so get Mon...Sun
  const orderedDayKeys: DayNumber[] = [1, 2, 3, 4, 5, 6, 0];

  const bars = [];
  for (const key of orderedDayKeys) {
    bars.push(
      <StatBar
        dayNumber={key}
        won={stats.days[key].won}
        maxDays={maxDays}
        key={key}
      ></StatBar>,
    );
  }
  return (
    <div className="App stats">
      <div>
        <StatsNumber
          formattedNumber={`${stats.streak}`}
          text={"daily challenge streak"}
        ></StatsNumber>

        {stats.streak ? (
          <StatsNumber
            formattedNumber={`${Math.round(
              (100 * stats.numHintlessInStreak) / stats.streak,
            )}%`}
            text={"streak without hints"}
          ></StatsNumber>
        ) : (
          <></>
        )}

        <StatsNumber
          formattedNumber={`${stats.maxStreak}`}
          text={"max streak"}
        ></StatsNumber>
      </div>

      <div id="statsDistribution">
        <div className="statLabel">Daily challenge win distribution</div>
        <div id="statsBars">{bars}</div>
      </div>

      <small>{`Stats are stored locally on your device/browser.`}</small>
      <button
        className="close"
        id="statsClose"
        onClick={() => setDisplay("daily")}
      >
        CLOSE
      </button>
    </div>
  );
}
