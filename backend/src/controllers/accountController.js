const db = require("../config/database");

const generateAccountNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);

    return timestamp + random;
};

const createAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        const [existingAccounts] = await db.query(
            "SELECT id FROM accounts WHERE user_id = ?",
            [userId]
        );

        if (existingAccounts.length > 0) {
            return res.status(409).json({
                message: "User already has a bank account"
            });
        }

        const accountNumber = generateAccountNumber();

        const [result] = await db.query(
            `INSERT INTO accounts
            (user_id, account_number, balance, status)
            VALUES (?, ?, 0.00, 'ACTIVE')`,
            [userId, accountNumber]
        );

        res.status(201).json({
            message: "Bank account created successfully",
            account: {
                id: result.insertId,
                account_number: accountNumber,
                balance: 0.00,
                status: "ACTIVE"
            }
        });

    } catch (error) {
        console.error("Account creation error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

       const getAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        const [accounts] = await db.query(
            `SELECT id, account_number, balance, status, created_at
             FROM accounts
             WHERE user_id = ?`,
            [userId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({
                message: "Bank account not found"
            });
        }

        res.json({
            account: accounts[0]
        });

    } catch (error) {
        console.error("Get account error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createAccount,
    getAccount
};
