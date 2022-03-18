const mongoose = require("mongoose");
require('dotenv').config()
const clientDB = mongoose
  .connect(process.env.URI)
  .then((n) => {
    console.log("Conectado")
    return n.connection.getClient()
})
  .catch((e) => console.log("fallo la conexion" + e));
module.exports = clientDB