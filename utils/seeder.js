import dotenv from 'dotenv';
import Product from '../models/product.js';
import connectionDatabase from '../config/database.js';
import products from '../data/products.json' assert { type: 'json' };

// nạp biến môi trường từ một tệp cụ thể
dotenv.config({ path: 'backend/config/config.env' });
connectionDatabase();

const seederProducts = async () => {
    try {
        await Product.deleteMany();
        console.log('Products are deleted');
        await Product.insertMany(products);
        console.log('All products are added.');
        process.exit();
    } catch (err) {
        console.log(err.message);
        process.exit();
    }
}

seederProducts();
