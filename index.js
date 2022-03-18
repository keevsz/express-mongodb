const expres = require("express");
const { create } = require("express-handlebars");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/User");
const csrf = require("csurf");
const MongoStore = require("connect-mongo");
require("dotenv").config();
const clientDB = require("./database/db");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

const app = expres();
const corsOptions = {
  credentials: true,
  origin: process.env.PATHHEROKU || "*",
  methods: ["GET", "POST"],
};
app.use(cors());
app.use(
  session({
    secret: process.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    name: "session-user",
    store: MongoStore.create({
      clientPromise: clientDB,
      dbName: process.env.DBNAME,
    }),
    cookie: {
      secure: process.env.MODO === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);
//SESIONES express
// app.get("/ruta-protegida", (req, res) => {
//   res.json(req.session.usuario || "sin sesion de usuario");
// });

// app.get("/crear-sesion", (req,res)=>{
//   req.session.usuario= "kevin"
//   res.redirect("/ruta-protegida")
// })

// app.get("/destruir-sesion", (req,res)=>{
//   req.session.destroy()
//   res.redirect("/ruta-protegida")
// })

//SEsSION FLASH
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

//preguntas
passport.serializeUser((user, done) =>
  done(null, { id: user._id, userName: user.userName })
);
passport.deserializeUser(async (user, done) => {
  const userdb = await User.findById(user.id);
  return done(null, { id: userdb._id, userName: userdb.userName });
});

// app.get("/mensaje-flash", (req, res) => {
//   res.json(req.flash("mensaje"))
// });
// app.get("/crear-mensaje", (req,res)=>{
//   req.flash("mensaje", "este es un mensaje de error")
//   res.redirect("/mensaje-flash")
// })
const hbs = create({
  extname: ".hbs",
  partialsDir: ["views/components"],
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use(expres.static(__dirname + "/public"));
app.use(expres.urlencoded({ extended: true })); // habilitando formularios

app.use(csrf());
app.use(mongoSanitize());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Puerto: " + PORT);
  console.log("Conectando...");
});
