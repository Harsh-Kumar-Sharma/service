const getFileNameFromURL = (url) => {
  const split = url.split('.com/');
  return split[1];
};

const normalizeString = (string) => {
  return String(string).charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const jsonToBlob = (json) => {
  const str = JSON.stringify(json);
  const buf = Buffer.from(str, 'utf8');
  return buf;
};

module.exports = { getFileNameFromURL, normalizeString, jsonToBlob };
