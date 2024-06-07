require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const {MongoClient} = require('mongodb');

const dns = require('dns');
const urlp = require('url');


const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("urlshortner");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  console.log(typeof(url));
  let dnslookup = dns.lookup(urlp.parse(url).hostname, async (err, addr)=>{
    if(!addr){
      res.jsom({error: "Invalid URL"});
    } 
    else{
      const dcCount = await urls.countDocuments({});
      const inDoc = {
        url: url,
        short_url: dcCount
      }
      await urls.insertOne(inDoc);
      res.json({ original_url : url, short_url : dcCount});
    }
  })
  console.log(req.body.url);
});
app.get('/api/shorturl/:short_url', async (req, res)=>{
  const urlDoc = await urls.findOne({short_url: +req.params.short_url})
  res.redirect(urlDoc.url);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
