// import dotenv from 'dotenv';
import connectionDatabase from './config/dbConnect.js';
import errorMiddleware from './middlewares/error.js';
import app from './app.js';
import { v2 as cloudinary } from 'cloudinary';

// bắt sự kiện uncaughtException
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down server due to uncaugth exception');
    process.exit(1);
});

// dotenv.config({ path: 'config/config.env' });

connectionDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

app.use(errorMiddleware);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

// bắt sự kiện unhandledRejection
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shut down the server due to Unhandle Promise rejection');
    server.close(() => {
        process.exit(1);
    });
});