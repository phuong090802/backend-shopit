import mongoose from 'mongoose';

const connectionDatabase = () => {

    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(con => {
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
    })

}

export default connectionDatabase;