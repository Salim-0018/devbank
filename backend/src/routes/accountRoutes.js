const express = require("express");

const {
    createAccount,
    getAccount
} = require("../controllers/accountController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    createAccount
);

router.get(
    "/",
    authenticateToken,
    getAccount
);

module.exports = router;
