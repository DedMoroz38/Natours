const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const Users = require('../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true 
}).then(() => console.log('DB is working!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
    try{
        await Tour.create(tours);
        await Review.create(reviews);
        await Users.create(users, {validateBeforeSave: false});

        console.log('Dara is successfully loaded!');
    }catch (err){
        console.log(err);
    }
    process.exit();
}

const deleteData = async () => {
    try{
        await Tour.deleteMany();
        await Review.deleteMany();
        await Users.deleteMany();
        console.log('Dara is successfully deleted!');
    }catch (err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    importData();
} else if (process.argv[2] === '--delete'){
    deleteData();
}

console.log(process.argv);