const express = require("express");

const {
    depositMoney,
    withdrawMoney,
    transferMoney,
    getTransactions
} = require("../controllers/transactionController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/deposit",
    authenticateToken,
    depositMoney
);

router.post(
    "/withdraw",
    authenticateToken,
    withdrawMoney
);

router.post(
    "/transfer",
    authenticateToken,
    transferMoney
);


router.get(
    "/history",
    authenticateToken,
    getTransactions
);

module.exports = router;
