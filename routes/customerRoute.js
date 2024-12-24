const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { createCustomerOrder,getCustomersByUserId, generateInvoice } = require("../controllers/customerController");
const { upload } = require("../utils/fileUpload");

router.post("/", createCustomerOrder);
// router.patch("/:id", protect, upload.single("image"), updateProduct);
router.get("/:id", getCustomersByUserId);
// router.get("/:id", protect, getProduct);
// router.delete("/:id", protect, deleteProduct);
router.get("/invoice/:customer_id",generateInvoice)
module.exports = router;
