import React from "react";

function dayLetterFromNumber(number) {
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

function StatBar({won, maxDays, dayNumber}) {
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

function StatsNumber({number, text}) {
  return (
    <div className="statsNumber">
      <div className="number">{number}</div>
      <div>{text}</div>
    </div>
  );
}

export default function Stats({stats, setDisplay}) {
  const maxDays = Object.values(stats.days).reduce(
    (currentMax, comparison) =>
      currentMax > comparison.won ? currentMax : comparison.won,
    0,
  );

  // Order the day keys so get Mon...Sun
  const orderedDayKeys = [1, 2, 3, 4, 5, 6, 0];

  let bars = [];
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
          number={stats.streak}
          text={"daily challenge streak"}
        ></StatsNumber>

        {stats.streak ? (
          <StatsNumber
            number={`${Math.round(
              (100 * stats.numHintlessInStreak) / stats.streak,
            )}%`}
            text={"streak without hints"}
          ></StatsNumber>
        ) : (
          <></>
        )}

        <StatsNumber number={stats.maxStreak} text={"max streak"}></StatsNumber>
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
