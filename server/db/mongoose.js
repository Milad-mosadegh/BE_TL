const connectDB = async () => {
    const mongoose = require('mongoose')
    const db = `mongodb+srv://admin:milad3667@my-projects-phh6v.mongodb.net/pa-project?retryWrites=true&w=majority`
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        console.log('Mongo Atlas server is ready');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}
module.exports = connectDB;