const mongoose = require("mongoose");
mongoose
  .connect(process.env.URI)
  .then(() => console.log("Conectado"))
  .catch((e) => console.log("fallo la conexion" + e));
