const { nanoid } = require("nanoid");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
require("dotenv").config();

const loginForm = (req, res) => {
  res.render("login", { mensajes: req.flash("mensajes") });
};

const registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/register");
  }

  const { userName, email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });
    if (user) {
      throw new Error("Ya existe el usuario");
    }
    user = new User({ userName, email, password, tokenConfirm: nanoid() });
    await user.save();

    //enviar correo con confirmacion de cuenta
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "46512fac742ee9",
        pass: "d1ea4f40c960a4"
      }
    });
    await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: user.email,
      subject: "verifique cuenta de correo",
      html: `<a href="http://localhost:5000/auth/confirmarCuenta/${user.tokenConfirm}">verificar cuenta aquí</a>`,
    });

    req.flash("mensajes", [{ msg: "Revisa tu correo y valida tu cuenta" }]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/register");
  }
};

const registerForm = (req, res) => {
  res.render("register", { mensajes: req.flash("mensajes") });
};

const confirmarCuenta = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ tokenConfirm: token });

    if (!user) throw new Error("No se encontro el user");

    user.cuentaConfirmada = true;
    user.tokenConfirm = null;
    await user.save();
    req.flash("mensajes", [{ msg: "Cuenta verificada" }]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/login");
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) throw new Error("no existe este email");

    if (!user.cuentaConfirmada) throw new Error("cuenta no  confirmada");

    if (!(await user.comparePassword(password)))
      throw new Error("contraseña incorrecta");

    req.login(user, function (err) {
      if (err) throw new Error("error al crear la sesion");
      return res.redirect("/");
    });
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
  }
};
const cerrarSesion = (req, res) => {
  req.logout();
  return res.redirect("/");
};

module.exports = {
  loginUser,
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  cerrarSesion,
};
