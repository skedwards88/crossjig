import sendAnalytics from "./sendAnalytics";

export function assembleShareLink({url, seed, query = "id"}) {
  const fullUrl = seed ? `${url}?${query}=${seed}` : url;
  return fullUrl;
}

export function handleShare({appName, text, url, seed, query}) {
  const fullUrl = assembleShareLink({url, seed, query});

  navigator
    .share({
      title: appName,
      text: `${text}\n\n`,
      url: fullUrl,
    })
    .then(() => console.log("Successful share"))
    .catch((error) => {
      console.log("Error sharing", error);
    });
  sendAnalytics("share");
}

export function handleCopy({text, url, seed}) {
  const fullUrl = assembleShareLink({url, seed});

  try {
    navigator.clipboard.writeText(`${text}\n\n${fullUrl}`);
  } catch (error) {
    console.log("Error copying", error);
  }
}
