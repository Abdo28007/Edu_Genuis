const mongoose = require('mongoose')
require('dotenv').config()

const port = process.env.PORT || "5000"
const db = process.env.MongoDB_URI
const connection = mongoose.connect(db)
.then(() => {
    console.log(`exemple at ${port} `)
})
.catch((error) => {
   console.log(error);
})

module.exports = connection