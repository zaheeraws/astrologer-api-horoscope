var request = require('request');
var cheerio = require('cheerio');
var config = require('./config')
var app = require('express')();

var url = 'https://new.theastrologer.com/'
var horoscope = ["taurus","pisces","cancer","sagittarius","aquarius","leo","libra","aries","virgo","gemini","capricorn","scorpio"];

var arr = [];
var port = 5000
app.set('port',(process.env.PORT || port))

app.get('/', (req,res)=>{
  console.log(horoscope)
  var text = {
    "GET_ALL": "http://__url__/horoscope",
    "GET_BY_SUNSIGN": "http://__url__/horoscope/:sunsign",
    "LIST_OF_SUNSIGN": horoscope,
    "WRITTEN_BY": "Prima Yudantra // prima.yudantra@gmail.com // http://github.com/primayudantra"
  }
  res.json(text)
})

app.get('/horoscope', (req,res)=>{
  horoscope.map(item =>{
    request(url + item, (err, resp, html)=> {
      if(!err){
        var $ = cheerio.load(html)
        let content = $('#today').find('p').html()
        var payload = { sunsign:item, content: content, date: new Date().toISOString().substring(0,10)}
        arr.push(payload)
        --horoscope.length;
        if(horoscope.length<=0){
          let data = { data: arr}
          res.json(data)
        }
      }
    })
  })
})

app.get('/horoscope/:sunsign', (req,res) => {
  var sunsign = req.params.sunsign;
  request(url + sunsign, (err, resp, html)=> {
    if(!err){
      var $ = cheerio.load(html)
      let content = $('#today').find('p').html()
      var payload = { sunsign:req.params.sunsign, content: content, date: new Date().toISOString().substring(0,10)}
      let data = { data: payload}
      res.json(data)
    }
  })
})

app.get('/horoscope/:sunsign/:day', (req,res) => {
  var sunsign = req.params.sunsign;
  var day = req.params.day;
  request(url + sunsign, (err, resp, html)=> {
    if(!err){
      var $ = cheerio.load(html)
      let content = $('#today').find('p').html();

      let json = "{";
      var exp = /Rating:/;
      $("#today").find(".daily-meta").find(".col-md-6").each(function(i,v){
         $(v).find("p").each(function(k,p){
          if( !$(p).remove("span").text().match(exp) ){
            let vals = $(p).remove("span").text().split(":");
            value = "'" + vals[0] + "': '" + vals[1] + "' ";
            json += value + ",";
          }
              
        });
      });
      json = json.replace(/,\s*$/, "");
      json += "}";

      //var payload = { sunsign:req.params.sunsign, horoscope: content, content: content, other: json, date: new Date().toISOString().substring(0,10)}
      //let data = { data: payload};
      let data = { day: day, horoscope: content, meta: json, sunsign:req.params.sunsign, date: new Date().toISOString().substring(0,10) }
      res.json(data)
    }
  })
})

app.listen(app.get('port'), function(){
  console.log("-------------------------------")
  console.log("PRIMA YUDANTRA - ASTROLOGER API TODAY")
  console.log("SERVER RUNNING ON PORT")
  console.log("-------------------------------")

})
