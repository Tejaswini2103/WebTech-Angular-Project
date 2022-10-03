const fetch = require("node-fetch");
const async = require('express-async-await');
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const finnhub = require('finnhub');
const app = express();
var cors = require('cors');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "c8555vaad3i9e9m0ktfg"
const finnhubClient = new finnhub.DefaultApi()
app.use(express.static('public'));

//app.use("/", express.static(path.join(__dirname, "angular")));

/*
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "angular", "index.html"));
    next();
});

*/

app.get("/api/posts", (req, res, next) => {


  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  finnhubClient.symbolSearch('TSLA', (error, data, response) => {
    const posts =
      {
        id: "ksajflaj132",
        title: data.result[0].description,
        content: "This is coming from the server!"
      };

    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: posts
    });
    });

});



app.get("/api/summary/:ticker", (req, res, next) => {

  var stock = req.params.ticker;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );


  finnhubClient.companyProfile2({'symbol': stock}, (error, data, response) => {

    res.status(200).json({
      message: "Info fetched successfully!",
      info: data
    });

    console.log(data);

  });

});

app.get("/api/candles/:ticker", (req, res, next) => {

  var stock = req.params.ticker;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  var currDate = new Date();
  currDate = currDate.getTime();
  console.log(currDate);
  currDate = currDate/1000;
  currDate = parseInt(currDate);

  var oldDate = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
  oldDate = oldDate.getTime();
  console.log(oldDate);
  oldDate = oldDate/1000;
  oldDate = parseInt(oldDate);


  finnhubClient.stockCandles(stock, "D", oldDate, currDate, (error, data, response) => {
    res.status(200).json({
      message: "Data fetched successfully!",
      candledata: data
    });
  });

});

app.get("/api/hourly/:ticker", (req, res, next) => {

  var stock = req.params.ticker;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  var currDate = new Date();
  currDate = currDate.getTime();
  console.log(currDate);
  currDate = currDate/1000;
  currDate = parseInt(currDate);

  var oldDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  oldDate = oldDate.getTime();
  console.log(oldDate);
  oldDate = oldDate/1000;
  oldDate = parseInt(oldDate);


  finnhubClient.stockCandles(stock, "5", oldDate, currDate, (error, data, response) => {
    res.status(200).json({
      message: "Data fetched successfully!",
      candledata: data
    });
  });

});



app.get("/api/details/:ticker", (req, res, next) => {
  console.log("inside");
  var stock = req.params.ticker;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  finnhubClient.quote(stock, (error, data, response) => {

    res.status(200).json({
      message: "Info fetched successfully!",
      priceinfo: data
    });
    console.log("quote");
    console.log(data);
  });

});

/*
app.get("/api/prices/:ticker", (req, res, next) => {

  var stock = req.params.ticker;

  var result = stock.split(",");

  var vh = [];

  for(var i=0;i<result.length;i++) {
    var stockk = result[i];
  var url = 'https://finnhub.io/api/v1/quote?symbol='+stockk+'&token=c8555vaad3i9e9m0ktfg';
  fetch(url).then(response => {
    return response.json();

  }).then(users => {
    vh[i] = users;
    console.log(vh[i]);
    console.log(i);
    if(i==result.length) {
      console.log("inside the loop");
      res.send(vh);
    }
  });
  }
}); */


async function getPrices(stock) {

  let searchRes = [];
  var output = {};
  for(var i=0;i<stock.length;i++) {
  let url = 'https://finnhub.io/api/v1/quote?symbol='+stock[i]+'&token=c8555vaad3i9e9m0ktfg';
  let headers = {'Content-Type': 'application/json'};
  let APIres = await fetch(url, {method: 'GET', headers: headers});
   searchRes[i] = await APIres.json();
   output[stock[i]] = [];
   output[stock[i]].push(searchRes[i]);
  }
  return output;
}

app.get('/api/prices/:ticker', async function (req, res) {
  console.log(`\nSearch-utilities Call: ${req.params.ticker}`);
  // if not found, response is [] with length 0
  var stockList = req.params.ticker;
  var re = stockList.split(",");
  let origRes = await getPrices(re);
  let msg = `${req.params.ticker} Search-utilities finished at ${Date()}\nLength of response: ${origRes.length}`;
  console.log(msg);
  return res.send(origRes);

});


app.get('/api/peers/:StockTicker', function (req, res) {
  var stock = req.params.StockTicker;
  finnhubClient.companyPeers(stock, (error, data, response) => {
    res.status(200).json({
      message: "Info fetched successfully!",
      peers: data
    });
    //console.log(peers);
  })
});





app.get('/api/peers/:StockTicker', function (req, res) {
  var stock = req.params.StockTicker;
  finnhubClient.companyPeers(stock, (error, data, response) => {
    res.status(200).json({
      message: "Info fetched successfully!",
      peers: data
    });
    //console.log(peers);
  })
});


app.get('/api/peers/:StockTicker', function (req, res) {
  var stock = req.params.StockTicker;
  finnhubClient.companyPeers(stock, (error, data, response) => {
    res.status(200).json({
      message: "Info fetched successfully!",
      peers: data
    });
    //console.log(peers);
  })
});


app.get('/ticker/:StockTicker', function (req, res) {
  var stock = req.params.StockTicker;
  finnhubClient.companyProfile2({'symbol': stock}, (error, data, response) => {
  res.send(data);
  })
});


app.get("/api/search/:ticker", (req, res, next) => {

  var ticker = req.params.ticker;
  console.log(ticker);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  finnhubClient.symbolSearch(ticker, (error, data, response) => {

    res.status(200).json(data);
    console.log(data);
  })

});

app.get("/api/recommendations/:ticker", (req, res, next) => {

  var ticker = req.params.ticker;
  console.log(ticker);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  finnhubClient.recommendationTrends(ticker, (error, data, response) => {

    res.status(200).json({
      message: "Info fetched successfully!",
      trends: data
    });
  })

});

app.get("/api/earnings/:ticker", (req, res, next) => {

  var ticker = req.params.ticker;

  finnhubClient.companyEarnings(ticker, {'limit': 10}, (error, data, response) => {
    res.status(200).json({
      message: "Info fetched successfully!",
      earnings: data
    });
  });

});

app.get("/api/mentions/:ticker", (req, res, next) => {

  var ticker = req.params.ticker;
  console.log(ticker);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  /*
  const userAction = async () => {
    const response = await fetch('https://finnhub.io/api/v1/stock/social-sentiment?symbol=TSLA&from=2022-01-01&token=c8555vaad3i9e9m0ktfg');
    const myJson = await response.json(); //extract JSON from the http response
    return myJson;
    // do something with myJson
  } */

  var url = 'https://finnhub.io/api/v1/stock/social-sentiment?symbol='+ticker+'&from=2022-01-01&token=c8555vaad3i9e9m0ktfg';
  fetch(url).then(response => {
    return response.json();
  }).then(users => {
    res.send(users);
  });

});


app.get("/api/companynews/:ticker", (req, res, next) => {

  var ticker = req.params.ticker;
  console.log(ticker);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

var currentdate = new Date();
var day = currentdate.getDate();
var month = currentdate.getMonth()+1;
var year = currentdate.getFullYear();

var last = new Date(currentdate.getTime() - (7 * 24 * 60 * 60 * 1000));
var daybefore7days =last.getDate();
var monthbefore7days=last.getMonth()+1;
var yearbefore7days=last.getFullYear();


if (daybefore7days < 10) daybefore7days = '0' + daybefore7days;
if (monthbefore7days < 10) monthbefore7days = '0' + monthbefore7days;

if (day < 10) day = '0' + day;
if (month < 10) month = '0' + month;

var seven_days_ago_date = yearbefore7days+"-"+monthbefore7days+"-"+daybefore7days;
var today = year+"-"+month+"-"+day;


  finnhubClient.companyNews(ticker, seven_days_ago_date, today, (error, data, response) => {
    res.status(200).json({
      message: "Company news fetched successfully!",
      companynews: data

    });

  });

});



module.exports = app;

