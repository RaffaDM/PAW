var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var fs =require('fs');
var multer = require('multer');
var cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json')

const storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,'public/covidTest');
  },
  filename:function(req,file,cb){
    cb(null,file.originalname + '-' + Date.now() );
  }
});
const storage2 = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,'public/events');
  },
  filename:function(req,file,cb){
    cb(null,file.originalname+'_'+req.promoterId+ '_' + req.params.id );
  }
});

var upload = multer({ storage })
var upload2 = multer({ storage2 })

var authRouter = require('./routes/auth');
var adminRouter=require('./routes/admin');
var userRouter=require('./routes/user');
var promoterRouter=require('./routes/promoter');

const {Mongoose} = require('mongoose');

mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost/Bear-19')
  .then(()=> console.log(' connected to DB!'))
  .catch(()=> console.log(' error connecting to DB!'))
var app = express();

app.post("user/file-upload", upload.single("image"),(req,res,err)=>{
  

} )
app.post("promoter/file-upload", upload2.single("image"),(req,res,err)=>{
  
} )
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/', authRouter);
app.use('/api/v1/admin',adminRouter);
app.use('/api/v1/user',userRouter);
app.use('/api/v1/promoter',promoterRouter);
app.use('/api/v1-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
