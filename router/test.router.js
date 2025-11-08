
const { Router } = require("express");
const {
  all_public_tests,
  test_by_id,
  create_test,
  add_question_to_test,
} = require("../controller/test.service");
const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    const test = await create_test(name, description);
    res.json(test);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/:id/question", async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctOption } = req.body;
    await add_question_to_test(id, question, options, correctOption);
    const updatedTest = await test_by_id(id);
    res.json(updatedTest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/all/public", async (req, res) => {
  const tests = await all_public_tests();
  res.send(tests);
});

router.get("/:id", async (req, res) => {
  const test = await test_by_id(req.params.id);
  res.send(test);
});

module.exports = router;
