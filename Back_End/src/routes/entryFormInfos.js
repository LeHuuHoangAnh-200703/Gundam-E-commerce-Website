const express = require('express');
const router = express.Router();
const entryFormInFoController = require('../controllers/entryFormInFoControllers');

router.get("/", entryFormInFoController.getAllntryFormInfos);
router.get("/:maCTPN", entryFormInFoController.getEntryFormInfo);
router.get("/phieunhap/:maPN", entryFormInFoController.getEntryFormInFoById);
router.post("/", entryFormInFoController.createEntryFormInfo);
router.put("/:maCTPN", entryFormInFoController.updatedEntryFormInfo);
router.delete("/:maCTPN", entryFormInFoController.deleteEntryFormInfo);

module.exports = router;