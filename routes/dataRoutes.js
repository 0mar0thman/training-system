const express = require('express');
const router = express.Router();
const { getStats, getCompanies, getCourses, getTrainees, getCourseStats, getCourseDetails, updateAttendance } = require('../controllers/dataController');

// تعريف الروابط
router.get('/stats', getStats);
router.get('/companies', getCompanies);
router.get('/courses', getCourses);
router.get('/trainees', getTrainees);

router.get('/courses/stats', getCourseStats);
router.get('/courses/:id', getCourseDetails);
router.put('/courses/:courseId/attendance', updateAttendance);

module.exports = router;