const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Jimp = require("jimp");

module.exports.formPerfil = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.render("perfil", {
      user: req.user,
      imagen: user.imagen,
      mensajes: req.flash("mensajes"),
    });
  } catch (error) {
    req.flash("mensajes", [{ msg: "no se puede leer perfil" }]);
    return res.redirect("/perfil");
  }
};

module.exports.editarFotoPerfil = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.maxFileSize = 50 * 1024 * 1024;
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        throw new Error("Falló la carga");
      }

      const file = files.myFile;
      if (file.originalFilename === "") {
        throw new Error("Agrega una imagen");
      }

      if (!(file.mimetype === "image/jpeg" || file.mimetype === "image/png")) {
        throw new Error("Agregue una imagen .jpeg o .png");
      }
      if (file.size > 50 * 1024 * 1024) {
        throw new Error("Menos de 50mb");
      }

      const extension = file.mimetype.split("/")[1];
      const dirFile = path.join(
        __dirname,
        `../public/img/perfiles/${req.user.id}.${extension}`
      );
      fs.renameSync(file.filepath, dirFile);

      const image = await Jimp.read(dirFile);
      image.resize(200, 200).quality(90).writeAsync(dirFile);

      const user = await User.findById(req.user.id);
      user.imagen = `${req.user.id}.${extension}`;
      await user.save();

      req.flash("mensajes", [{ msg: "Listo" }]);
      return res.redirect("/perfil");
    } catch (error) {
      console.log(error);
      req.flash("mensajes", [{ msg: error.message }]);
      return redirect("/perfil");
    }
  });
};
