var express = require('express');
var router = express.Router();
var request = require('request');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname + "/" + "index.html");
});

async function make_call_to_weather_api(data){
  return new Promise(function (resolve, reject) {
    request.post({
      headers: {'content-type' : 'application/x-www-form-urlencoded'},
      url:   'http://localhost:5000/get_data'  ,
      body:    data
    }, function(error, response, body){
      if(!error){
        resolve(response);
      }
      else{
        reject(error);
      }
    });
  });
  
}

async function make_analysis(data){
  return new Promise(function (resolve, reject) {
    request.post({
      headers: {'content-type' : 'application/x-www-form-urlencoded'},
      url:   'http://localhost:8000/analyse'  ,
      body:    data
    }, function(error, response, body){
      if(!error){
        resolve(response);
      }
      else{
        reject(error);
      }
    });
  });
  
}

router.post('/submit',async function(req,res,next){
  console.log(req.body.location);
  var data = "location="+req.body.location;
  if(req.body.location==''){
    res.sendFile(__dirname + "/" + "index.html");
  }
  var result = await make_call_to_weather_api(data);

  try {
    var output = JSON.parse(result.body);
  } catch (error) {
    res.sendFile(__dirname + "/" + "invalid.html");
  }
  var analysis_response = await make_analysis("values="+result.body);
  var analysis = JSON.parse(analysis_response.body);
  console.log(analysis);
  var start = output.start;
  var end = output.end;
  var temp_vals = "";
  var humid_vals = "";
  var visib_vals="";
  var k = 0;
  for(i=start;i<=end;i++){
      temp_vals += "['"+i+"',"+output.temperature[k]+"]";
      humid_vals+= "['"+i+"',"+output.humidity[k]+"]";
      visib_vals+= "['"+i+"',"+output.visibility[k]+"]";
      if(i!=end){
        temp_vals+=',';
        humid_vals+=',';
        visib_vals+=',';
      }
      k+=1;
  }
  var temp_avg_vals = "";
  var humid_avg_vals = "";
  var visib_avg_vals = "";
  k = 0;
  for(i=start;i<end;i+=6){
    temp_avg_vals+="['"+ String(i)+"-"+String(i+5)+"',"+analysis.temp_analysis[k]+"]";
    humid_avg_vals+="['"+ String(i)+"-"+String(i+5)+"',"+analysis.humid_analysis[k]+"]";
    visib_avg_vals+="['"+ String(i)+"-"+String(i+5)+"',"+analysis.visib_analysis[k]+"]";
    if(i<end-1){
      temp_avg_vals+=",";
      humid_avg_vals+=",";
      visib_avg_vals+=",";
    }
    k+=1;
  }
  console.log(temp_avg_vals);
  console.log(humid_avg_vals);
  console.log(visib_avg_vals);
  
  var temp_zone = 0;
  var humid_zone = 0;
  var visib_zone = 0;
  for(i =0;i<analysis.temp_analysis.length;i++){
    temp_zone += Math.abs(analysis.temp_analysis[i]);
    humid_zone += Math.abs(analysis.humid_analysis[i]);
    visib_zone += Math.abs(analysis.visib_analysis[i]);
  }
  var temp_thresh = 1.02; 
  temp_zone/= analysis.temp_analysis.length;
  humid_zone/= analysis.humid_analysis.length;
  visib_zone/= analysis.visib_analysis.length;
  
  var MAJOR_FACTOR = "";
  
  var temp_maj_fac_percent =0;
  var humid_maj_fac_percent = 0;
  var visib_maj_fac_percent =0;
  for(i=0;i<analysis.temp_analysis.length-1;i++){
    temp_maj_fac_percent += Math.abs(analysis.temp_analysis[i+1] - analysis.temp_analysis[i])/Math.abs(analysis.temp_analysis[i])
    humid_maj_fac_percent += Math.abs(analysis.humid_analysis[i+1] - analysis.humid_analysis[i])/Math.abs(analysis.humid_analysis[i])
    visib_maj_fac_percent += Math.abs(analysis.visib_analysis[i+1] - analysis.visib_analysis[i])/Math.abs(analysis.visib_analysis[i])
  }
  
  var maj_fac_percent = Math.max(temp_maj_fac_percent,humid_maj_fac_percent, visib_maj_fac_percent);
  if(maj_fac_percent == temp_maj_fac_percent)MAJOR_FACTOR = "Temperature";
  else if(maj_fac_percent == humid_maj_fac_percent) MAJOR_FACTOR = "Humidity";
  else MAJOR_FACTOR = "Visibility";

  var ZONE = "";
  
  if(temp_zone<0.80){
    ZONE = "SAFE ZONE";
  }
  else if(temp_zone >= 0.80 && temp_zone<temp_thresh ){
    ZONE = "VULNERABLE ZONE";
  }
  else if(temp_zone >= temp_thresh && temp_zone <1.2 ){
    ZONE = "RISK ZONE";
  }
  else{
    ZONE = "HIGH ALERT"
  }

  var html = `<html>
  <head>
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
  <script type="text/javascript">
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      var data = google.visualization.arrayToDataTable([
        ['Year', 'Max Temperature'],`+
        temp_vals
      +`]);

      var options = {
        title: 'Max Temperature Variations',
        hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
        vAxis: {scaleType: 'log'}
      };

      var chart = new google.visualization.LineChart(document.getElementById('temp'));
      chart.draw(data, options);

      var data2 = google.visualization.arrayToDataTable([
        ['Year', 'Humidity'],`+
        humid_vals
      +`]);

      var options2 = {
        title: 'Humidity Variations',
        hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
        vAxis: {scaleType: 'log'}
      };

      var chart2 = new google.visualization.LineChart(document.getElementById('humid'));
      chart2.draw(data2, options2);

      var data3 = google.visualization.arrayToDataTable([
        ['Year', 'Visibility'],`+
        visib_vals
      +`]);

      var options3 = {
        title: 'Visibility Variations',
        hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
        vAxis: {scaleType: 'log'}
      };

      var chart3 = new google.visualization.LineChart(document.getElementById('visib'));
      chart3.draw(data3, options3);

      var data4 = google.visualization.arrayToDataTable([
        ['Year', 'Max Temperature Average'],`+
        temp_avg_vals
      +`]);

      var options4 = {
        title: 'Max Temperature Variations for a range of years',
        hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
        vAxis: {minValue: 0}
      };

      var chart4 = new google.visualization.LineChart(document.getElementById('temp_avg'));
      chart4.draw(data4, options4);

      var data5 = google.visualization.arrayToDataTable([
        ['Year', 'Humidity Average'],`+
        humid_avg_vals
      +`]);

      var options5 = {
        title: 'Humidity Variations for a range of years',
        hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
        vAxis: {minValue: 0}
      };

      var chart5 = new google.visualization.LineChart(document.getElementById('humid_avg'));
      chart5.draw(data5, options5);

      var data6 = google.visualization.arrayToDataTable([
        ['Year', 'Visibility Average'],`+
        visib_avg_vals
      +`]);

      var options6 = {
        title: 'Visibility Variations for a range of years',
        hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
        vAxis: {minValue: 0}
      };

      var chart6 = new google.visualization.LineChart(document.getElementById('visib_avg'));
      chart6.draw(data6, options6);
    }
  </script>
  </head>
  <body>
    <div id="temp" style="width: 100%; height: 500px;"></div>
    <div id="humid" style="width: 100%; height: 500px;"></div>
    <div id="visib" style="width: 100%; height: 500px;"></div>
    <div id="temp_avg" style="width: 100%; height: 500px;"></div>
    <div id="humid_avg" style="width: 100%; height: 500px;"></div>
    <div id="visib_avg" style="width: 100%; height: 500px;"></div>
    <h2>Major Factor for Climate Change in `+req.body.location+ " is "+ MAJOR_FACTOR +`</h2>
    <h2>`+req.body.location+ " belongs to "+ ZONE +`</h2>
  </body>
</html>`;
    res.send(html);
});

module.exports = router;
