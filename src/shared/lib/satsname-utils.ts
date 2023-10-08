export function getSatsName(nameStr: string): { suffix: string; name: string } | false {
  const name = nameStr.toLowerCase().trim().split(/\s/g)[0];

  const arr = name.split('.');
  const len = arr.length === 2;
  if (!len) {
    return false;
  }
  const suffix = arr[1];
  return {
    suffix,
    name
  };
}
