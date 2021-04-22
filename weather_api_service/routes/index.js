const { json } = require('express');
var express = require('express');
var router = express.Router();
var request = require('request');
var API_KEY = <Visual Crossing Weather API KEY>
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Weather API service' });
});

async function make_call(curr_date,location){
  return new Promise(function (resolve, reject) {
    request.get({
      headers: {'content-type' : 'application/x-www-form-urlencoded'},
      url:     'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/'+location+'/'+curr_date+'/'+curr_date+'?unitGroup=metric&key='+API_KEY+'&options=nonulls&include=obs',
    }, function(error, response, body){
      if(!error){
        var output = response.body;
        if(output.localeCompare("Invalid location found. Please check your location parameter:"+location)==0)resolve("invalid");
        else{
          var result = JSON.parse(output);
          resolve(result.days[0]);
        }
      }
      else{
        reject(error);
      }
    });
  });
}

router.post('/get_data',  async function(req,res,next){
  var location = req.body.location;
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  
  today = '-' + mm + '-' + (dd-1) ;
  //console.log(today);
  //console.log(req.body.location);
  var temps = []
  var humidity = []
  var visibility = []
  var curr_date = ""
  for(i = yyyy-30;i<=yyyy;i++){
      curr_date = String(i) + today;
      //console.log(curr_date);
      var r =await make_call(curr_date,req.body.location)
      if (r=="invalid")res.send("Sorry! Location not available!");
      temps.push(r.tempmax)
      humidity.push(r.humidity)
      visibility.push(r.visibility)
      console.log(curr_date)
      if(i==yyyy){
        break;
      }
  }
  var result = {
    "start": yyyy-30,
    "end" : yyyy,
    "temperature" : temps,
    "humidity": humidity,
    "visibility" : visibility
  }
  console.log(result);
  res.send(result);
});
module.exports = router;
