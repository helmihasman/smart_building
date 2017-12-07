var express = require('express');
var multer  =   require('multer');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var session = require('express-session');
var expressValidator = require('express-validator');
var methodOverride = require('method-override');
var fs = require('fs');

var mysql = require('mysql');
var request = require('request');

var fs = require("fs");

var Client = require('ibmiotf');

var routes = require('./routes/index');
var users = require('./routes/users');
//var customers = require('./routes/customers');
//var admin_users = require('./routes/admin_users');

var app = express();

var mysql = require("mysql");
var http = require('http').Server(app);
var io = require('socket.io')(http);


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Store = require('express-session').Store;

app.use(function(req, res, next){
  res.io = io;
  next();
});

//http.listen(80);
//var port = app.settings.port;
//var port2 = app.get('port');
http.listen(process.env.PORT || 3000, function(){
 // console.log('listening on **:'+process.env.PORT);
// console.log('listening on **:'+port);
// console.log('listening on **$:'+port2);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(session({secret:"secretpassqchat123456"}));
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(expressValidator());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploads', express.static(process.cwd() + '/uploads'));

app.use('/', routes);
app.use('/users', users);

//passport
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now()+'.jpg');
  }
});

var storage_image =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads/image');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now()+'.jpg');
  }
});

var upload = multer({ storage : storage}).single('emp_image');

var upload_image = multer({ storage : storage_image}).single('file');

app.use(methodOverride(function(req, res){
 if (req.body && typeof req.body == 'object' && '_method' in req.body) 
   { 
      var method = req.body._method;
      delete req.body._method;
      return method;
    } 
  }));


//var connect_mysql = mysql.createPool({
//     host:'us-cdbr-iron-east-04.cleardb.net',
//     user:'b753688ff4397b',
//     password:'a2c32182',
//     port:3306,
//     database:'ad_4a07813f131a943'
//});


var con = mysql.createConnection({
    host: "us-cdbr-sl-dfw-01.cleardb.net",
    user: "bc9dce1745b5cd",
    password: "6aff4a6c",
    database: "ibmx_9f8dc7374e775fc"
});


app.post("/login", passport.authenticate('local_qchat', {
    

    successRedirect: '/',

    failureRedirect: '/login',

    failureFlash: true

}), function(req, res, info){
    
    res.render('login',{'message' :req.flash('message')});

});


app.get('/', function(req, res, next) {

var temperature, humidity, air_quality, current, waterflow, waterlevel;
    con.query("SELECT count(*) as number,avg(temp_val) as avg_temp,year(temp_date) as year_s, month(temp_date) as month_s, day(temp_date) as day_s FROM temperature GROUP BY day(temp_date) order by temp_date desc",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           temperature = rows;
           
           con.query("SELECT count(*) as number,avg(humidity_val) as avg_humidity,year(humidity_date) as year_s, month(humidity_date) as month_s, day(humidity_date) as day_s FROM humidity GROUP BY day(humidity_date) order by humidity_date desc",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    humidity = rows;
                    
                    con.query("SELECT count(*) as number,avg(air_tvoc) as avg_tvoc,avg(air_eco2) as avg_eco2,year(air_date) as year_s, month(air_date) as month_s, day(air_date) as day_s FROM air_quality GROUP BY day(air_date) order by air_date desc",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            air_quality = rows;
                            
                            con.query("SELECT count(*) as number,avg(current_val) as avg_current,year(current_date) as year_s, month(current_date) as month_s, day(current_date) as day_s FROM current GROUP BY day(current_date) order by current_date desc",function(error,rows,fields){
                                if(!!error){
                                    console.log('Error in the query '+error);
                                }
                                else{
                                    current = rows;
                                    
                                    con.query("SELECT count(*) as number,avg(waterflow_val) as avg_waterflow,year(waterflow_date) as year_s, month(waterflow_date) as month_s, day(waterflow_date) as day_s FROM waterflow GROUP BY day(waterflow_date) order by waterflow_date desc",function(error,rows,fields){
                                        if(!!error){
                                            console.log('Error in the query '+error);
                                        }
                                        else{
                                            waterflow = rows;
                                            
                                             con.query("SELECT count(*) as number,avg(waterlevel_val) as avg_waterlevel,year(waterlevel_date) as year_s, month(waterlevel_date) as month_s, day(waterlevel_date) as day_s FROM waterlevel GROUP BY day(waterlevel_date) order by waterlevel_date desc",function(error,rows,fields){
                                                if(!!error){
                                                    console.log('Error in the query '+error);
                                                }
                                                else{
                                                    waterlevel = rows;

                                                    res.render('index',{title:"Home",temperature:temperature,humidity:humidity,air_quality:air_quality,current:current,waterflow:waterflow,waterlevel:waterlevel});
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
           
       }
   });

  var temperature;
  con.query("SELECT count(*) as number,avg(temp_val) as avg_temp,year(temp_date) as year_s, month(temp_date) as month_s, day(temp_date) as day_s FROM temperature GROUP BY day(temp_date) order by temp_date desc",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           console.log('Successful query\n');
           console.log(rows);
           temperature = rows;
           
            //res.render('index',{title:"Temperature",temperature:temperature});

       }
   });
    
  //res.render('index', { title: 'Home' });
});

app.get('/temperature', function(req, res, next) {
    
    con.query("SELECT * FROM temperature",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
            res.render('temperature',{title:"Temperature",data:rows});

       }
   });
    
//  res.render('temperature', { title: 'Temperature' });
});

app.get('/humidity', function(req, res, next) {
    
    con.query("SELECT * FROM humidity",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
            res.render('humidity',{title:"Humidity",data:rows});

       }
   });
    
//  res.render('temperature', { title: 'Temperature' });
});

app.get('/air_quality', function(req, res, next) {
    
    con.query("SELECT * FROM air_quality",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
            res.render('air_quality',{title:"Air Quality",data:rows});

       }
   });
    
//  res.render('temperature', { title: 'Temperature' });
});

app.get('/current', function(req, res, next) {
    
    con.query("SELECT * FROM current",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
            res.render('current',{title:"Current",data:rows});

       }
   });
    
//  res.render('temperature', { title: 'Temperature' });
});

app.get('/waterflow', function(req, res, next) {
    
    con.query("SELECT * FROM waterflow",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
            res.render('waterflow',{title:"Water Flow",data:rows});

       }
   });
    
//  res.render('temperature', { title: 'Temperature' });
});

app.get('/waterlevel', function(req, res, next) {
    
    con.query("SELECT * FROM waterlevel",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           //console.log('Successful query\n');
           //console.log(rows);
           
            res.render('waterlevel',{title:"Water Level",data:rows});

       }
   });
    
//  res.render('temperature', { title: 'Temperature' });
});

app.post('/api/v1/getdata_new', function(req, res, next) {
    
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    var temperature, humidity, air_quality, current, waterflow, waterlevel;
    con.query("SELECT * FROM temperature order by temp_id desc limit 1",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           temperature = rows;
           
           con.query("SELECT * FROM humidity order by humidity_id desc limit 1",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    humidity = rows;
                    
                    con.query("SELECT * FROM air_quality order by air_id desc limit 1",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            air_quality = rows;
                            
                            con.query("SELECT * FROM current order by current_id desc limit 1",function(error,rows,fields){
                                if(!!error){
                                    console.log('Error in the query '+error);
                                }
                                else{
                                    current = rows;
                                    
                                    con.query("SELECT * FROM waterflow order by waterflow_id desc limit 1",function(error,rows,fields){
                                        if(!!error){
                                            console.log('Error in the query '+error);
                                        }
                                        else{
                                            waterflow = rows;
                                            
                                             con.query("SELECT * FROM waterlevel order by waterlevel_id desc limit 1",function(error,rows,fields){
                                                if(!!error){
                                                    console.log('Error in the query '+error);
                                                }
                                                else{
                                                    waterlevel = rows;
                                                    
                                                     var requestData = {
                                                            payload: {
                                                              temperature: temperature,
                                                              humidity: humidity,
                                                              air_quality : air_quality,
                                                              current : current,
                                                              waterflow : waterflow,
                                                              waterlevel : waterlevel

                                                            }
                                                          };

                                                    res.status(200).send(requestData);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
           
       }
   });

//  res.render('temperature', { title: 'Temperature' });
});

app.post('/api/v1/getdata', function(req, res, next) {
    
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    var temperature, humidity, air_quality, current, waterflow, waterlevel;
    con.query("SELECT * FROM temperature order by temp_id desc",function(error,rows,fields){
       if(!!error){
           console.log('Error in the query '+error);
       }
       else{
           temperature = rows;
           
           con.query("SELECT * FROM humidity order by humidity_id desc",function(error,rows,fields){
                if(!!error){
                    console.log('Error in the query '+error);
                }
                else{
                    humidity = rows;
                    
                    con.query("SELECT * FROM air_quality order by air_id desc",function(error,rows,fields){
                        if(!!error){
                            console.log('Error in the query '+error);
                        }
                        else{
                            air_quality = rows;
                            
                            con.query("SELECT * FROM current order by current_id desc",function(error,rows,fields){
                                if(!!error){
                                    console.log('Error in the query '+error);
                                }
                                else{
                                    current = rows;
                                    
                                    con.query("SELECT * FROM waterflow order by waterflow_id desc",function(error,rows,fields){
                                        if(!!error){
                                            console.log('Error in the query '+error);
                                        }
                                        else{
                                            waterflow = rows;
                                            
                                             con.query("SELECT * FROM waterlevel order by waterlevel_id desc",function(error,rows,fields){
                                                if(!!error){
                                                    console.log('Error in the query '+error);
                                                }
                                                else{
                                                    waterlevel = rows;
                                                    
                                                     var requestData = {
                                                            payload: {
                                                              temperature: temperature,
                                                              humidity: humidity,
                                                              air_quality : air_quality,
                                                              current : current,
                                                              waterflow : waterflow,
                                                              waterlevel : waterlevel

                                                            }
                                                          };

                                                    res.status(200).send(requestData);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
           
       }
   });

//  res.render('temperature', { title: 'Temperature' });
});

app.post('/api/v1/test', function(req, res, next) {
    
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    var good = {data:"good"};
    res.status(200).send(good);
                                                

//  res.render('temperature', { title: 'Temperature' });
});

io.on('connection', function (socket) {
//    console.log('a client connected');
    con.query('SELECT * FROM temperature order by temp_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('temperature', rows);
       });
       
    setInterval(function(){ 
       con.query('SELECT * FROM temperature order by temp_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('temperature', rows);
       });
       }, 10000);

 });
 
 
 io.on('connection', function (socket) {
//    console.log('a client connected');
    con.query('SELECT * FROM humidity order by humidity_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('humidity', rows);
       });
       
    setInterval(function(){ 
       con.query('SELECT * FROM humidity order by humidity_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('humidity', rows);
       });
       }, 10000);

 });
 
  io.on('connection', function (socket) {
//    console.log('a client connected');
    con.query('SELECT * FROM air_quality order by air_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('air_quality', rows);
       });
       
    setInterval(function(){ 
       con.query('SELECT * FROM air_quality order by air_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('air_quality', rows);
       });
       }, 10000);

 });
 
   io.on('connection', function (socket) {
//    console.log('a client connected');
    con.query('SELECT * FROM current order by current_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('current', rows);
       });
       
    setInterval(function(){ 
       con.query('SELECT * FROM current order by current_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('current', rows);
       });
       }, 10000);

 });
 
 
 io.on('connection', function (socket) {
//    console.log('a client connected');
    con.query('SELECT * FROM waterflow order by waterflow_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('waterflow', rows);
       });
       
    setInterval(function(){ 
       con.query('SELECT * FROM waterflow order by waterflow_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('waterflow', rows);
       });
       }, 10000);

 });
 
 
  io.on('connection', function (socket) {
//    console.log('a client connected');
    con.query('SELECT * FROM waterlevel order by waterlevel_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('waterlevel', rows);
       });
       
    setInterval(function(){ 
       con.query('SELECT * FROM waterlevel order by waterlevel_id desc limit 1',function(err,rows){
         if(err) throw err;
         //console.log('Data received from Db:\n');
         //console.log("data from db="+JSON.stringify(rows));
         socket.emit('waterlevel', rows);
       });
       }, 10000);

 });


function createDateAsUTC(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
}

var appClientConfig = {
    "org": '4bnyyk',
    "id": Date.now()+"",
    "auth-key": 'a-4bnyyk-tnfyiz1zpm',
    "auth-token": 'beoUtF&r@uGMc9N)ON',
    "type" : "shared" // make this connection as shared subscription
  };
  var appClient = new Client.IotfApplication(appClientConfig);

  appClient.connect();

  appClient.on("connect", function () {

      appClient.subscribeToDeviceEvents();
  });

  appClient.on("error", function (err) {
      console.log("Error : "+err);
  });
  
  appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
    
//    if(eventType === "reader"){
//        var json_string = JSON.parse(payload);
//        console.log("json stirng="+JSON.stringify(json_string));
//    }
    
    
    if(eventType === "hat"){
    var json_string = JSON.parse(payload);
    console.log("json stirng="+JSON.stringify(json_string));
    
    var d = createDateAsUTC(new Date());
    d.setMinutes(d.getMinutes()+480);
    var ddate = d.getDate();
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
    var dhour = d.getHours();
    var dminutes = d.getMinutes();
    var dseconds = d.getSeconds();

    if(ddate < 10){
        ddate = "0"+ddate;
    }
    if(dmonth < 10){
        dmonth = "0"+dmonth;
    }

    if(dhour < 10){
        dhour = "0"+dhour;
    }
    if(dminutes < 10){
        dminutes = "0"+dminutes;
    }
    if(dseconds < 10){
        dseconds = "0"+dseconds;
    }
    
    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
    console.log("newdate= "+newdate);
    
    
    con.query('INSERT INTO temperature(temp_val,temp_date) values("'+json_string.d.temp+'","'+newdate+'")',function(err,rows){
         if(!!err){
                    console.log('Error in the query '+err);
                }
                else{
                   // console.log('Successful query fff\n');
                   // console.log(rows);
                }
    });
    
    con.query('INSERT INTO humidity(humidity_val,humidity_date) values("'+json_string.d.humidity+'","'+newdate+'")',function(err,rows){
         if(!!err){
                    console.log('Error in the query '+err);
                }
                else{
                   // console.log('Successful query fff\n');
                   // console.log(rows);
                }
    });
    
    con.query('INSERT INTO air_quality(air_date,air_tvoc,air_eco2) values("'+newdate+'","'+json_string.d.tvoc+'","'+json_string.d.eco2+'")',function(err,rows){
         if(!!err){
                    console.log('Error in the query '+err);
                }
                else{
                   // console.log('Successful query fff\n');
                   // console.log(rows);
                }
    });
    
    }
            
    else if(eventType === "wwc"){
    var json_string = JSON.parse(payload);
    console.log("json stirng="+JSON.stringify(json_string));
    
    var d = createDateAsUTC(new Date());
    d.setMinutes(d.getMinutes()+480);
    var ddate = d.getDate();
    var dmonth = d.getMonth()+1;
    var dyear = d.getFullYear();
    var dhour = d.getHours();
    var dminutes = d.getMinutes();
    var dseconds = d.getSeconds();

    if(ddate < 10){
        ddate = "0"+ddate;
    }
    if(dmonth < 10){
        dmonth = "0"+dmonth;
    }

    if(dhour < 10){
        dhour = "0"+dhour;
    }
    if(dminutes < 10){
        dminutes = "0"+dminutes;
    }
    if(dseconds < 10){
        dseconds = "0"+dseconds;
    }
    
    var newdate = dyear+"-"+dmonth+"-"+ddate+" "+dhour+":"+dminutes+":"+dseconds;
    console.log("newdate= "+newdate);
    
    
    con.query('INSERT INTO current(current_val,current_date) values("'+json_string.d.power+'","'+newdate+'")',function(err,rows){
         if(!!err){
                    console.log('Error in the query '+err);
                }
                else{
                   // console.log('Successful query fff\n');
                   // console.log(rows);
                }
    });
    
    con.query('INSERT INTO waterflow(waterflow_val,waterflow_date) values("'+json_string.d.water_flow+'","'+newdate+'")',function(err,rows){
         if(!!err){
                    console.log('Error in the query '+err);
                }
                else{
                   // console.log('Successful query fff\n');
                   // console.log(rows);
                }
    });
    
    con.query('INSERT INTO waterlevel(waterlevel_val,waterlevel_date) values("'+json_string.d.water_level+'","'+newdate+'")',function(err,rows){
         if(!!err){
                    console.log('Error in the query '+err);
                }
                else{
                   // console.log('Successful query fff\n');
                   // console.log(rows);
                }
    });
    
      }
                

});


passport.use('local_qchat', new LocalStrategy({

  usernameField: 'username',

  passwordField: 'password',

  passReqToCallback: true //passback entire req to call back
} , function (req, username, password, done){

      
      if(!username || !password ) { return done(null, false, req.flash('message','All fields are required.')); }

      var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';

      con.query("select * from employee where employee_email = '"+username+"'", function(err, rows){

          //console.log("err=="+err); 
          //console.log("rroows=="+JSON.stringify(rows));

        if (err) return done(req.flash('message',err));

        if(!rows.length){ return done(null, false, req.flash('message','Invalid username or password.')); }
        
//        salt = salt+''+password;
//
//        var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
        
        var encPassword = password;
        var dbPassword  = rows[0].employee_password;
        
        if(!(dbPassword === encPassword)){
            
            return done(null, false, req.flash('message','Invalid username or password.'));

         }
        // console.log("rowwww = "+JSON.stringify(rows[0]));
        return done(null, rows[0]);

      });

    }

));

passport.serializeUser(function(user, done){
        
//    console.log("rowwwwss = "+JSON.stringify(user));
    done(null, user);

});

passport.deserializeUser(function(user, done){
    
    done(null, user);
    
});



function isAuthenticated(req, res, next) {
   
  if (req.isAuthenticated())

    return next();

  res.redirect('/login');

}
 
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//http.listen(3000, function(){
//  console.log('listening on *:3000');
//});
//app.listen(1337);

//module.exports = app;
module.exports = {app: app, server: http};
