export default function sendAnalytics(eventName, data = {}) {
  const mode = process.env.NODE_ENV;
  if (mode === "development" || mode === "test") {
    console.log(`Not logging ${eventName} because in ${mode} mode`);
    return;
  }

  try {
    window.gtag("event", eventName, data);
  } catch (error) {
    console.log("tracking error", error);
  }
}
