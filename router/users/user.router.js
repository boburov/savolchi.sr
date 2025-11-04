const { Router } = require("express");
const { all_users } = require("../../service/user.service");
const router = Router();

router.get("/all", async (req, res) => {
  const users = await all_users();

  res.send(users);
});

module.exports = router;
