const express = require("express");
const cors = require("cors");
const database = require("./helpers/db/database");
const routes = require("./routes");

const app = express();

//CONFIG .ENV
const dotenv = require('dotenv').config({ path: './config.env' })


app.use(cors());
//Mostra que as requisições do body serão em json
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(routes);




app.listen(process.env.PORT || 3333);
