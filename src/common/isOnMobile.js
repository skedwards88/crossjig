export function isOnMobile() {
  const userAgent = navigator.userAgent;
  return /Android|iPhone|iPad/i.test(userAgent);
}
