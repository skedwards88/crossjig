export function isRunningStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches || // most browsers
    window.navigator.standalone === true // safari
  );
}
