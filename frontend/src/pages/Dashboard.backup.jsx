import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAccount,
    getTransactions,
    depositMoney,
    withdrawMoney,
    transferMoney
} from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const [action, setAction] = useState(null);
    const [amount, setAmount] = useState("");
    const [receiverAccount, setReceiverAccount] = useState("");
    const [description, setDescription] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
            navigate("/login");
            return;
        }

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const loadDashboard = async () => {
            try {
                const accountData = await getAccount(token);
                const transactionData = await getTransactions(token);

                setAccount(accountData.account);
                setTransactions(transactionData.transactions);

            } catch (error) {
                console.error(error);

                if (
                    error.message.includes("token") ||
                    error.message.includes("expired")
                ) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }

                setError(error.message);

            } finally {
                setLoading(false);
            }
        };

        loadDashboard();

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const handleTransaction = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        setMessage("");
        setError("");
        setActionLoading(true);

        try {
            let result;

            if (action === "deposit") {
                result = await depositMoney(
                    token,
                    amount,
                    description || "Money deposit"
                );
            }

            if (action === "withdraw") {
                result = await withdrawMoney(
                    token,
                    amount,
                    description || "Money withdrawal"
                );
            }

            if (action === "transfer") {
                result = await transferMoney(
                    token,
                    receiverAccount,
                    amount,
                    description || "Money transfer"
                );
            }

            setMessage(result.message);

            setAmount("");
            setReceiverAccount("");
            setDescription("");
            setAction(null);

            const accountData = await getAccount(token);
            const transactionData = await getTransactions(token);

            setAccount(accountData.account);
            setTransactions(transactionData.transactions);

        } catch (error) {
            console.error(error);
            setError(error.message);

        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600 text-lg">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">

            <nav className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

                    <h1 className="text-2xl font-bold text-blue-600">
                        DevBank
                    </h1>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>

                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Welcome, {user?.name}
                    </h2>

                    <p className="text-gray-500 mt-1">
                        Manage your DevBank account
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 bg-green-100 text-green-700 px-4 py-3 rounded-lg">
                        {message}
                    </div>
                )}

                {account && (
                    <div className="bg-blue-600 text-white rounded-2xl p-8 shadow-lg mb-8">

                        <p className="text-blue-100">
                            Current Balance
                        </p>

                        <h3 className="text-4xl font-bold mt-2">
                            ₹{Number(account.balance).toFixed(2)}
                        </h3>

                        <div className="mt-8">
                            <p className="text-blue-100 text-sm">
                                Account Number
                            </p>

                            <p className="text-xl font-semibold tracking-wider">
                                {account.account_number}
                            </p>
                        </div>

                        <div className="mt-4">
                            <span className="inline-block bg-green-500 px-3 py-1 rounded-full text-sm">
                                {account.status}
                            </span>
                        </div>

                    </div>
                )}
                
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    <button
                        onClick={() => {
                            setAction("deposit");
                            setMessage("");
                            setError("");
                        }}
                        className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition"
                    >
                        <h3 className="text-xl font-bold text-green-600">
                            Deposit
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Add money to your account
                        </p>
                    </button>

                    <button
                        onClick={() => {
                            setAction("withdraw");
                            setMessage("");
                            setError("");
                        }}
                        className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition"
                    >
                        <h3 className="text-xl font-bold text-orange-500">
                            Withdraw
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Withdraw money from your account
                        </p>
                    </button>

                    <button
                        onClick={() => {
                            setAction("transfer");
                            setMessage("");
                            setError("");
                        }}
                        className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition"
                    >
                        <h3 className="text-xl font-bold text-blue-600">
                            Transfer
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Send money to another account
                        </p>
                    </button>

                </div>


                            {action && (
                    <div className="bg-white rounded-2xl shadow p-6 mb-8">

                        <div className="flex justify-between items-center mb-6">

                            <h3 className="text-xl font-bold text-gray-800 capitalize">
                                {action}
                            </h3>

                            <button
                                onClick={() => setAction(null)}
                                className="text-gray-500 hover:text-gray-800 text-xl"
                            >
                                ✕
                            </button>

                        </div>

                        <form
                            onSubmit={handleTransaction}
                            className="space-y-5"
                        >

                            {action === "transfer" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Receiver Account Number
                                    </label>

                                    <input
                                        type="text"
                                        value={receiverAccount}
                                        onChange={(e) =>
                                            setReceiverAccount(e.target.value)
                                        }
                                        placeholder="Enter receiver account number"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(e.target.value)
                                    }
                                    placeholder="Enter amount"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>

                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Optional description"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg"
                            >
                                {actionLoading
                                    ? "Processing..."
                                    : `Confirm ${action}`}
                            </button>

                        </form>

                    </div>
                )}

                              <div className="bg-white rounded-2xl shadow overflow-hidden">

                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold text-gray-800">
                            Transaction History
                        </h3>
                    </div>

                    {transactions.length === 0 ? (

                        <div className="p-6 text-gray-500">
                            No transactions found.
                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50">
                                    <tr>

                                        <th className="text-left px-6 py-4">
                                            Type
                                        </th>

                                        <th className="text-left px-6 py-4">
                                            Amount
                                        </th>

                                        <th className="text-left px-6 py-4">
                                            Description
                                        </th>

                                        <th className="text-left px-6 py-4">
                                            Status
                                        </th>

                                        <th className="text-left px-6 py-4">
                                            Date
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {transactions.map((transaction) => (

                                        <tr
                                            key={transaction.id}
                                            className="border-t"
                                        >

                                            <td className="px-6 py-4 font-semibold">
                                                {transaction.transaction_type}
                                            </td>

                                            <td className="px-6 py-4">
                                                ₹
                                                {Number(
                                                    transaction.amount
                                                ).toFixed(2)}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {transaction.description}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="text-green-600 font-semibold">
                                                    {transaction.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(
                                                    transaction.created_at
                                                ).toLocaleString()}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}

export default Dashboard;
