let tryCount = 0;
const checkLoaded = (callback) => {
  tryCount++;
  if (tryCount > 600) {
    // some error happen?
    return;
  }
  if (document.readyState === 'complete') {
    callback();
    return true;
  } else {
    setTimeout(() => {
      checkLoaded(callback);
    }, 100);
  }
};
const domReadyCall = (callback) => {
  checkLoaded(callback);

  // if (document.readyState === 'complete') {
  //   callback();
  // } else {
  //   const domContentLoadedHandler = (e) => {
  //     callback();
  //     document.removeEventListener('DOMContentLoaded', domContentLoadedHandler);
  //   };
  //   document.addEventListener('DOMContentLoaded', domContentLoadedHandler);
  // }
};

const $ = document.querySelector.bind(document);

export { domReadyCall, $ };
