import express from 'express';
import cookieParser from 'cookie-parser';
import products from './routes/product.js';
import auth from './routes/auth.js';
import order from './routes/order.js';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.get('/favicon.ico', (req, res) => res.status(204));
app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);


export default app;