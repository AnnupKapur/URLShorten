require('dotenv').config();
const express = require('express');
const cors = require('cors');
var bodyParser = require("body-parser");
const mongo = require("mongodb"); 
const app = express();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {useMongoClient: true}, (err)=>{
  if(err) {return console.log(`Error: ${err}`)};
  console.log(`MongoDB Connection is: ${mongoose.connection.readyState}` );
});

const urlHandler = require("./handlers/urlHandler.js");
app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});





// --------------------------------------
// POST : REQUEST TO ADD URL TO DATABASE
// --------------------------------------

app.post("/api/shorturl", urlHandler.postOriginalURL);





// --------------------------------------
// GET : ATTEMPT TO VISIT A SHORT URL
// --------------------------------------

app.get("/api/shorturl/:short_url", urlHandler.getShortURL);





// --------------------------------------
// INVALID ROUTING CATCH
// --------------------------------------

app.use((req, res) => {
  res.status(404).sendFile(__dirname + "/views.index.html");
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
