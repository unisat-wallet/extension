export const isWs = (obj: any): boolean => {
  if (!isString(obj)) {
    throw new Error(`${obj} is not valid url`);
  } else {
    return obj.startsWith('ws://') || obj.startsWith('wss://');
  }
};

export const isString = (obj: any): boolean => {
  return obj === `${obj}`;
};

export const isHttp = (obj: any): boolean => {
  if (!isString(obj)) {
    throw new Error(`${obj} is not valid url`);
  } else {
    return obj.startsWith('http://') || obj.startsWith('https://');
  }
};

export const isObject = (obj: any): boolean => {
  return obj !== null && !Array.isArray(obj) && typeof obj === 'object';
};

export const isArray = (obj: any): boolean => {
  return Array.isArray(obj);
};
