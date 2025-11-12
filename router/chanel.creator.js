const express = require("express");
const {
  create_chanel,
  all_chanels,
} = require("../controller/chanel.service.js");
const router = express.Router();

router.post("/create", create_chanel);

router.get("/all/", all_chanels);
module.exports = router;
