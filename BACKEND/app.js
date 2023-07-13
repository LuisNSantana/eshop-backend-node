const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv/config");

//cors
app.use(cors());
//allows all request '*'
app.options('*', cors());

const api = process.env.API_URL;
const port = process.env.PORT_DEV;

const productsRoutes = require("./routers/products");
const categoryRoutes = require("./routers/categories");
const usersRoutes = require("./routers/users");
const ordersRoutes = require("./routers/orders");
const authJwt = require("./helpers/jwt");
//const errorHandler = require("./helpers/error-handler");

//middlewares
app.use(express.json());
app.use(morgan("tiny"));
mongoose.set('strictQuery', false);
app.use(authJwt());
const path = require("path")
app.use("/public/uploads", express.static(path.join(__dirname, "/public/uploads"))) 
app.use((err, req, res, next) =>{
  if(err){
    res.status(500).json({message: err.message});
  }
});
//routers
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoryRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);



//database connection
try {
  mongoose.connect(process.env.URI_MONGO);
  console.log("Connected to DB ok 👌");
} catch (e) {
  console.log("no se pudo conectar a la bd", e);
}

app.listen(port, () => {
  console.log("listening on port 👌👌: " + port);
});
