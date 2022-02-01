const dns = require("dns");
const UrlRecord = require("../models/urlModel.js");

// --------------------------------------
// THE CURRENT COUNT OF SHORT URLS
// --------------------------------------

let shortURLCount = 0;

const shortURLCountCheck = () => {
  UrlRecord
    .find()
    .lean()
    .sort({ short_url: -1 })
    .limit(1)
    .exec((err, data) => {
      if (err) return console.log(`Error : ${err}`);
      if (data.length > 0) {
        shortURLCount = data[0].short_url;
      }
      else {
        // dont need to do anything here as shortURLCount is initialised to 0
      }
    });
};





// --------------------------------------
// POST REQUEST
// --------------------------------------

const postOriginalURL = (req, res) => {

  // ensure counter is up to date
  shortURLCountCheck();

  let urlInput = req.body.url;
  let protocol = urlInput.substring(0, urlInput.indexOf("://") + 3);
  let urlAll = urlInput.substring(protocol.length);
  let urlHost = "";

  // create seperate hostname only variable for dns.lookup
  if (urlAll.indexOf("/") >= 0) {
    urlHost = urlAll.substring(0, urlAll.indexOf("/"));
  } else {
    urlHost = urlAll;
  };

  //check the protocol
  if (protocol != "http://" && protocol != "https://") {
    return res.json({ "error": "invalid url" });
  }

  // do the dns.lookup - is there a website at that address
  dns.lookup(urlHost, (err, address) => {
    if (err) {
      return res.json({ "error": "your host is invalid" });
    } else {
      UrlRecord.findOne({ "original_url": urlInput }, (err, data) => {
        if (err) { return console.log(`Error: ${err}`) }

        if (data) {
          return res.json({
            "original_url": urlInput,
            "short_url": data.short_url
          });
        } else {
          let newRecord = new UrlRecord({
            "original_url": urlInput,
            "short_url": shortURLCount + 1
          });
          newRecord.save((err, data) => {
            if (err) { return console.log(`Error: ${err}`) }
            return res.json({
              "original_url": urlInput,
              "short_url": shortURLCount + 1
            });
          });
        }
      })
    };
  });
};





// --------------------------------------
// GET REQUEST
// --------------------------------------

const getShortURL = (req, res) => {
  let shortURL = req.params.short_url;

  if (isNaN(+shortURL)) {
    res.status(404).sendFile(process.env.PWD + "/views/index.html");
  } else {
    UrlRecord
      .findOne({ "short_url": shortURL }, (err, data) => {
        if (err) { return console.log(`Error: ${err}`) }
        if (data) {
          res.redirect(data.original_url);
        }
        else {
          res.status(404).sendFile(process.env.PWD + "/views/index.html");
        }
      });
  }
};





// --------------------------------------
// EXPORT FUNCTIONS
// --------------------------------------

exports.postOriginalURL = postOriginalURL;
exports.getShortURL = getShortURL;