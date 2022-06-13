const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
        process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB =process.env.DATABASE.replace(
    "<PASSWORD>",
     process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true 
    })
    .then(() => console.log('DB is working!'));

const port = process.env.PORT || 3000;
// process.env.NODE_ENV = 'production';
const server = app.listen(port, () => {
    console.log(process.env.NODE_ENV);
    console.log('Run!');
});

process.on('unhandledRejection', err => {
    server.close(() => {
        process.exit(1);
    });
}); 

process.on('SIGTERM', () => {
    console.log('SIGTERM RECIEVED');
    server.close(() => {
        console.log("Procss terminated!");
    });
}); 