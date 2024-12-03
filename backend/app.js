const express = require('express');
const app = express();
const UserRouts = require('./routes/user_routes')
const addminrouts = require('./routes/admin_routes')
require('dotenv').config()
const cookieparser = require('cookie-parser')
const port = process.env.PORT || 3000;
const connection = require('./database/database')
const {notFound, errorHandler} = require('./middlewares/error')
app.use(cookieparser())
app.use(express.json())


app.use(UserRouts)

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  app.use(notFound)
  app.use(errorHandler)