const mongoose = require('mongoose')
const mongoURI =
  'mongodb+srv://omkark:mh15dz3599@motorqproject.ds52zpj.mongodb.net/'

const connectToMongo = () => {

  mongoose
    .connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
    }) 
    .then(() => console.log('Database connected!'))
    .catch((err) => console.log(err))
}

module.exports = connectToMongo
