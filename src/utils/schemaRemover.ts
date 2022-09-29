export const schemaRemover = (url: string) => {
  const separator = "://";
  const positionOfSeparator = url.indexOf(separator);
  if (positionOfSeparator < 0) {
    return url;
  }
  return url.split(separator)[1];
};
