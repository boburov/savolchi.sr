const { Router } = require("express");
const {
  create_subject,
  update_subject,
  delete_subject,
} = require("../controller/subject.service");

const router = Router();

// CREATE
router.post("/create", async (req, res) => {
  try {
    const { name, channelId } = req.body;
    const data = await create_subject(name, channelId);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const data = await update_subject(id, name);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await delete_subject(id);
    res.json({ message: "Subject o‘chirildi", data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
