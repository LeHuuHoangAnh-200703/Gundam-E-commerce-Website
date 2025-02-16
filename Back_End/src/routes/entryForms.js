const express = require('express');
const router = express.Router();
const entryFormController = require('../controllers/entryFormControllers');

router.get("/", entryFormController.getAllEntryForms);
router.get("/:maPN", entryFormController.getEntryForm);
router.post("/", entryFormController.createEntryForm);
router.put("/:maPN", entryFormController.updatedEntryForm);
router.delete("/:maPN", entryFormController.deleteEntryForm);
router.get("/kiemtra/:maPN", entryFormController.checkQuantity);

module.exports = router;