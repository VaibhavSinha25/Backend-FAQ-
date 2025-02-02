const express = require("express");
const faqController = require("../controllers/faqController");
const router = express.Router();

router.route("/").get(faqController.getFaq).post(faqController.createFaq);

router
  .route("/:id")
  .patch(faqController.updateFaq)
  .delete(faqController.deleteFaq);

module.exports = router;
