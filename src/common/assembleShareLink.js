export function assembleShareLink({url, seed, query = "id"}) {
  const fullUrl = seed ? `${url}?${query}=${seed}` : url;
  return fullUrl;
}
