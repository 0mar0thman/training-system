const express = require('express');
const router = express.Router();
const {
    getSheets,
    getSheetById,
    addRow,
    updateRow,
    deleteRow,
    deleteSheet
} = require('../controllers/dynamicSheetController');

router.get('/', getSheets);
router.get('/:id', getSheetById);
router.post('/:id/rows', addRow);
router.put('/:id/rows/:rowIndex', updateRow);
router.delete('/:id/rows/:rowIndex', deleteRow);
router.delete('/:id', deleteSheet);

module.exports = router;
