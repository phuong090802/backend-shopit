import express from 'express';
import cookieParser from 'cookie-parser';
import products from './routes/product.js';
import auth from './routes/auth.js';
import order from './routes/order.js';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from './middlewares/cors.js';


const app = express();

app.use(cors);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());


app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);

export default app;