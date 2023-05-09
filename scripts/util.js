const convert = require("xml-js");

function xml2json(response) {
  // console.log(response); // this will print xml data structure
  const data = JSON.parse(
    convert.xml2json(response.data, { compact: true, spaces: 2 })
  );
  return data;
}

module.exports = {
  xml2json,
};
