import dotenv from 'dotenv';

import createError from 'http-errors';
import Express from 'express';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import usersRouter from './routes/users';
// envファイルの読み込み
dotenv.config();

const app = Express();

// ミドルウェア設定
app.use(logger('dev'));
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN_URL }));
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(compression()); // gzip圧縮して返す

// apiルータへ
app.use('/users', usersRouter);

// ダミー
app.get('/', (req, res) => {
  res.status(200).send('Welcome to auto unfollow api server!');
});

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err: any, req: Express.Request, res: Express.Response) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
export default app;
