const expres = require("express")
const { create } = require("express-handlebars");

console.log("backend")
const app = expres()

const hbs = create({
    extname: ".hbs",
    partialsDir: ["views/components"]
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");


app.use(expres.static(__dirname + "/public"))
app.use("/", require("./routes/home"))
app.use("/auth", require("./routes/auth"))
app.listen(5000, () => null)