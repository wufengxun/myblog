
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore=require('connect-mongo')(express);
var settings=require('./settings');
var flash=require('connect-flash');
var fs=require('fs');
var accessLog=fs.createWriteStream('access.log',{flags:'a'});
var errorLog=fs.createWriteStream('error.log',{flags:'a'});

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.logger({stream:accessLog}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret:settings.cookieSecret,
  key:settings.db,
  cookie:{},
  store:new MongoStore({
    db:settings.db
  })
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(err,req,res,next){
  var mets='['+new Date()+']'+req.url+'\n';
  errorLog.write(mets+err.stack+'\n');
  next();
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
