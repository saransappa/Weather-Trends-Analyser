var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST method for analysis */
router.post('/analyse',function(req,res,next){
  var values = JSON.parse(req.body.values);
  var temps = values.temperature;
  var humid = values.humidity;
  var visib = values.visibility; 
  console.log(temps);
  var temps1 = []
  var temps2 = []
  var temps3 = []
  var temps4 = []
  var temps5 = []
  var humid1 = []
  var humid2 = []
  var humid3 = []
  var humid4 = []
  var humid5 = []
  var visib1 = []
  var visib2 = []
  var visib3 = []
  var visib4 = []
  var visib5 = []
  k = 0
  for(i=0;i<30;i++){
    if(i<=5){
      temps1.push(temps[i]);
      humid1.push(humid[i]);
      visib1.push(visib[i]);
    }
    else if(i<=11){
      temps2.push(temps[i]);
      humid2.push(humid[i]);
      visib2.push(visib[i]);
    }
    else if(i<=17){
      temps3.push(temps[i]);
      humid3.push(humid[i]);
      visib3.push(visib[i]);
    }
    else if(i<=23){
      temps4.push(temps[i]);
      humid4.push(humid[i]);
      visib4.push(visib[i]);
    }
    else if(i<=29){
      temps5.push(temps[i]);
      humid5.push(humid[i]);
      visib5.push(visib[i]);
    }
  }
  var temp_avg = [];
  var humid_avg = [];
  var visib_avg  = [];
  for(i=0;i<5;i++){
    var a = Math.abs(temps1[i+1]-temps1[i]);
    var b = Math.abs(temps2[i+1]-temps2[i]);
    var c = Math.abs(temps3[i+1]-temps3[i]);
    var d = Math.abs(temps4[i+1]-temps4[i]);
    var e = Math.abs(temps5[i+1]-temps5[i]);
    var a1 = Math.abs(humid1[i+1]-humid1[i]);
    var b1 = Math.abs(humid2[i+1]-humid2[i]);
    var c1 = Math.abs(humid3[i+1]-humid3[i]);
    var d1 = Math.abs(humid4[i+1]-humid4[i]);
    var e1 = Math.abs(humid5[i+1]-humid5[i]);
    var a2 = Math.abs(visib1[i+1]-visib1[i]);
    var b2 = Math.abs(visib2[i+1]-visib2[i]);
    var c2 = Math.abs(visib3[i+1]-visib3[i]);
    var d2 = Math.abs(visib4[i+1]-visib4[i]);
    var e2 = Math.abs(visib5[i+1]-visib5[i]);
    temp_avg.push((a+b+c+d+e)/5);
    humid_avg.push((a1+b1+c1+d1+e1)/5);
    visib_avg.push((a2+b2+c2+d2+e2)/5);
  }
  var result ={
    "temp_analysis" : temp_avg,
    "humid_analysis" : humid_avg,
    "visib_analysis" : visib_avg
  }
  console.log(result);
  res.send(result);
});
module.exports = router;
