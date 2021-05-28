const express = require("express");
const { createCategory, fetchCategory } = require("../../controllers/User/category");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const router = express.Router();

router.post("/createCategory",createCategory);

router.get("/fetchCategory",
            checkSession,
            checkIsactive,
            fetchCategory);


module.exports = router