const express = require("express");
const router = express.Router();
const adminProtect = require("../middlewares/adminMiddleware");
// const protect = require("../middleWare/authMiddleware");
const {  getUserListController } = require("../controllers/adminController");

router.get("/user-list", adminProtect, getUserListController );

module.exports = router;
