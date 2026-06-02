export function getFromStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return undefined;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
}
