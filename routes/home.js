const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const urls = [
    { origin: "www.google.com/kevin", shortURL: "asd2" },
    { origin: "www.google.com/weq", shortURL: "fdf2" },
    { origin: "www.google.com/adds", shortURL: "asd2" },
    { origin: "www.google.com/ewq", shortURL: "3" },
  ];
  // se envia al home las urls
  res.render("home", { urls: urls });
});

module.exports = router;
