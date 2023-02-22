function getBrowser() {
  if (typeof globalThis.browser === 'undefined') {
    return chrome;
  } else {
    return globalThis.browser;
  }
}

export default getBrowser();
