const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const RedisRepository = require('./lib/repositories/redis-repository');
const MessageScheduler = require('./lib/message-scheduler');

const echoInTimeRouter = require('./lib/routes/echo-in-time-route');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/', echoInTimeRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.error('Error in app', err)
});

RedisRepository.initClient();
MessageScheduler.run();

module.exports = app;
