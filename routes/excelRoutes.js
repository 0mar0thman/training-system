// routes/excelRoutes.js

const express = require("express");
const multer = require("multer");
const { uploadExcel } = require("../controllers/excelController");

const router = express.Router();

// Memory storage — file kept as buffer, never written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx or .xls files are allowed."));
    }
  },
});

router.post("/upload", upload.single("file"), uploadExcel);

module.exports = router;