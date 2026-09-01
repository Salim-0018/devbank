const db = require("../config/database");

// ==================== DEPOSIT ====================

const depositMoney = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const userId = req.user.id;
        const { amount, description } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        const depositAmount = Number(amount);

        await connection.beginTransaction();

        const [accounts] = await connection.query(
            `SELECT id, account_number, balance, status
             FROM accounts
             WHERE user_id = ?
             FOR UPDATE`,
            [userId]
        );

        if (accounts.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Bank account not found"
            });
        }

        const account = accounts[0];

        if (account.status !== "ACTIVE") {
            await connection.rollback();

            return res.status(403).json({
                message: "Bank account is not active"
            });
        }

        const newBalance =
            Number(account.balance) + depositAmount;

        await connection.query(
            `UPDATE accounts
             SET balance = ?
             WHERE id = ?`,
            [newBalance, account.id]
        );

        await connection.query(
            `INSERT INTO transactions
             (sender_account_id, receiver_account_id,
              transaction_type, amount, description, status)
             VALUES (?, ?, 'DEPOSIT', ?, ?, 'SUCCESS')`,
            [
                null,
                account.id,
                depositAmount,
                description || "Money deposit"
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Money deposited successfully",
            transaction: {
                type: "DEPOSIT",
                amount: depositAmount,
                account_number: account.account_number,
                balance: newBalance,
                status: "SUCCESS"
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error("Deposit error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });

    } finally {
        connection.release();
    }
};


// ==================== WITHDRAW ====================

const withdrawMoney = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const userId = req.user.id;
        const { amount, description } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        const withdrawAmount = Number(amount);

        await connection.beginTransaction();

        const [accounts] = await connection.query(
            `SELECT id, account_number, balance, status
             FROM accounts
             WHERE user_id = ?
             FOR UPDATE`,
            [userId]
        );

        if (accounts.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Bank account not found"
            });
        }

        const account = accounts[0];

        if (account.status !== "ACTIVE") {
            await connection.rollback();

            return res.status(403).json({
                message: "Bank account is not active"
            });
        }

        const currentBalance = Number(account.balance);

        if (withdrawAmount > currentBalance) {
            await connection.rollback();

            return res.status(400).json({
                message: "Insufficient balance",
                balance: currentBalance
            });
        }

        const newBalance =
            currentBalance - withdrawAmount;

        await connection.query(
            `UPDATE accounts
             SET balance = ?
             WHERE id = ?`,
            [newBalance, account.id]
        );

        await connection.query(
            `INSERT INTO transactions
             (sender_account_id, receiver_account_id,
              transaction_type, amount, description, status)
             VALUES (?, ?, 'WITHDRAW', ?, ?, 'SUCCESS')`,
            [
                account.id,
                null,
                withdrawAmount,
                description || "Money withdrawal"
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Money withdrawn successfully",
            transaction: {
                type: "WITHDRAW",
                amount: withdrawAmount,
                account_number: account.account_number,
                balance: newBalance,
                status: "SUCCESS"
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error("Withdrawal error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });

    } finally {
        connection.release();
    }
};


// ==================== TRANSFER ====================

const transferMoney = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const senderUserId = req.user.id;
        const {
            receiverAccountNumber,
            amount,
            description
        } = req.body;

        if (!receiverAccountNumber || !amount) {
            return res.status(400).json({
                message:
                    "Receiver account number and amount are required"
            });
        }

        const transferAmount = Number(amount);

        if (transferAmount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        await connection.beginTransaction();

        // Sender account
        const [senderAccounts] = await connection.query(
            `SELECT id, account_number, balance, status
             FROM accounts
             WHERE user_id = ?
             FOR UPDATE`,
            [senderUserId]
        );

        if (senderAccounts.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Sender account not found"
            });
        }

        const sender = senderAccounts[0];

        if (sender.status !== "ACTIVE") {
            await connection.rollback();

            return res.status(403).json({
                message: "Sender account is not active"
            });
        }

        // Prevent self transfer
        if (
            sender.account_number ===
            receiverAccountNumber
        ) {
            await connection.rollback();

            return res.status(400).json({
                message:
                    "Cannot transfer money to your own account"
            });
        }

        const senderBalance = Number(sender.balance);

        // Balance check
        if (transferAmount > senderBalance) {
            await connection.rollback();

            return res.status(400).json({
                message: "Insufficient balance",
                balance: senderBalance
            });
        }

        // Receiver account
        const [receiverAccounts] = await connection.query(
            `SELECT id, account_number, balance, status
             FROM accounts
             WHERE account_number = ?
             FOR UPDATE`,
            [receiverAccountNumber]
        );

        if (receiverAccounts.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Receiver account not found"
            });
        }

        const receiver = receiverAccounts[0];

        if (receiver.status !== "ACTIVE") {
            await connection.rollback();

            return res.status(403).json({
                message: "Receiver account is not active"
            });
        }

        const newSenderBalance =
            senderBalance - transferAmount;

        const newReceiverBalance =
            Number(receiver.balance) + transferAmount;

        // Deduct sender
        await connection.query(
            `UPDATE accounts
             SET balance = ?
             WHERE id = ?`,
            [newSenderBalance, sender.id]
        );

        // Add receiver
        await connection.query(
            `UPDATE accounts
             SET balance = ?
             WHERE id = ?`,
            [newReceiverBalance, receiver.id]
        );

        // Record transaction
        await connection.query(
            `INSERT INTO transactions
             (sender_account_id, receiver_account_id,
              transaction_type, amount, description, status)
             VALUES (?, ?, 'TRANSFER', ?, ?, 'SUCCESS')`,
            [
                sender.id,
                receiver.id,
                transferAmount,
                description || "Money transfer"
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Money transferred successfully",

            transaction: {
                type: "TRANSFER",
                amount: transferAmount,
                sender_account: sender.account_number,
                receiver_account: receiver.account_number,
                sender_balance: newSenderBalance,
                receiver_balance: newReceiverBalance,
                status: "SUCCESS"
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error(
            "Transfer error:",
            error.message
        );

        res.status(500).json({
            message: "Internal server error"
        });

    } finally {
        connection.release();
    }
};

const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const [transactions] = await db.query(
            `SELECT
                t.id,
                t.transaction_type,
                t.amount,
                t.description,
                t.status,
                t.created_at,
                sender.account_number AS sender_account,
                receiver.account_number AS receiver_account
             FROM transactions t

             LEFT JOIN accounts sender
                ON t.sender_account_id = sender.id

             LEFT JOIN accounts receiver
                ON t.receiver_account_id = receiver.id

             WHERE sender.user_id = ?
                OR receiver.user_id = ?

             ORDER BY t.created_at DESC`,
            [userId, userId]
        );

        res.status(200).json({
            message: "Transaction history fetched successfully",
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error(
            "Transaction history error:",
            error.message
        );

        res.status(500).json({
            message: "Internal server error"
        });
    }
};
// ==================== EXPORTS ====================

module.exports = {
    depositMoney,
    withdrawMoney,
    transferMoney,
    getTransactions
};
