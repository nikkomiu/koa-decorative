export const stripPostfix = (str: string, postfix: string) => str.endsWith(postfix)
  ? str.substr(0, str.length - postfix.length)
  : str;

export const stripPrefix = (str: string, prefix: string) => str.startsWith(prefix)
  ? str.substr(prefix.length, str.length)
  : str;
