const { Router } = require("express");
const {
  createTest,
  updateTest,
  deleteTest,
  getTestById,
  getTestsBySubject,
} = require("../controller/test.service");

const router = Router();

// Test yaratish
router.post("/create", async (req, res) => {
  try {
    const { subjectId, question, options } = req.body;
    const test = await createTest(subjectId, question, options);
    res.json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Testni yangilash
router.put("/update/:id", async (req, res) => {
  try {
    const test = await updateTest(req.params.id, req.body);
    res.json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Testni o‘chirish
router.delete("/delete/:id", async (req, res) => {
  try {
    const test = await deleteTest(req.params.id);
    res.json({ message: "Test o‘chirildi", test });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bitta testni olish
router.get("/:id", async (req, res) => {
  try {
    const test = await getTestById(req.params.id);
    res.json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Subjectdagi barcha testlar
router.get("/subject/:subjectId", async (req, res) => {
  try {
    const tests = await getTestsBySubject(req.params.subjectId);
    res.json(tests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
