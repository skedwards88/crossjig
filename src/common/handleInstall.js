import sendAnalytics from "./sendAnalytics";

async function handleInstall(installPromptEvent, setInstallPromptEvent) {
  console.log("handling install");
  console.log(installPromptEvent);
  installPromptEvent.prompt();
  const result = await installPromptEvent.userChoice;
  console.log(result);
  setInstallPromptEvent(null);
  sendAnalytics("install");
}

function handleBeforeInstallPrompt(
  event,
  setInstallPromptEvent,
  setShowInstallButton,
) {
  console.log("handleBeforeInstallPrompt");
  if (event) setInstallPromptEvent(event);
  setShowInstallButton(true);
}

function handleAppInstalled(setInstallPromptEvent, setShowInstallButton) {
  console.log("handleAppInstalled");
  setInstallPromptEvent(null);
  setShowInstallButton(false);
}

export {handleInstall, handleBeforeInstallPrompt, handleAppInstalled};
