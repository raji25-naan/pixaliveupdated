const express = require("express");
const { add_Coins, donate_trees_seeds } = require("../../controllers/User/Donate");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { validateRequest,checkRequestBodyParams,checkQuery } = require("../../middlewares/validator");
const router = express.Router();
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


//add_Coins
router.post("/add_Coins",
            checkSession,
            checkIsactive,
            checkRequestBodyParams("coin"),
            validateRequest,  
            catch_error(add_Coins)
            )

//donate_trees_seeds
router.post("/donate_trees_seeds",
            checkSession,
            checkIsactive,
            checkRequestBodyParams("type"),
            checkRequestBodyParams("coins"),
            checkRequestBodyParams("donatedUser_id"),
            validateRequest,  
            catch_error(donate_trees_seeds)
            )

module.exports = router;