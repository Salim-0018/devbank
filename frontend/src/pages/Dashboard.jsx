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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-xl">
                    Loading DevBank...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">

            {/* NAVBAR */}
            <nav className="bg-slate-950 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                    <div>
                        <h1 className="text-2xl font-bold tracking-wide">
                            Dev<span className="text-blue-400">Bank</span>
                        </h1>

                        <p className="text-xs text-slate-400">
                            Digital Banking Platform
                        </p>
                    </div>

                    <div className="flex items-center gap-5">

                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-semibold">
                                {user?.name}
                            </p>

                            <p className="text-xs text-slate-400">
                                {user?.email}
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </nav>


            {/* MAIN */}
            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* WELCOME */}
                <div className="mb-8">

                    <p className="text-blue-600 font-semibold">
                        Dashboard
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-1">
                        Welcome back, {user?.name?.split(" ")[0]} 👋
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Manage your account and transactions.
                    </p>

                </div>


                {/* ALERTS */}
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 bg-green-100 border border-green-200 text-green-700 px-5 py-4 rounded-xl">
                        {message}
                    </div>
                )}


                {/* ACCOUNT CARD */}
                {account && (
                    <div className="bg-gradient-to-r from-slate-950 to-blue-900 text-white rounded-3xl p-8 shadow-xl mb-8">

                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">

                            <div>

                                <p className="text-blue-200 text-sm">
                                    Available Balance
                                </p>

                                <h3 className="text-4xl md:text-5xl font-bold mt-2">
                                    ₹{Number(account.balance).toFixed(2)}
                                </h3>

                            </div>

                            <div className="text-left md:text-right">

                                <p className="text-blue-200 text-sm">
                                    Account Status
                                </p>

                                <span className="inline-block mt-2 bg-green-500 px-4 py-1 rounded-full text-sm font-semibold">
                                    {account.status}
                                </span>

                            </div>

                        </div>


                        <div className="mt-10 pt-6 border-t border-white/20">

                            <p className="text-blue-200 text-sm">
                                Account Number
                            </p>

                            <p className="text-2xl font-semibold tracking-widest mt-1">
                                {account.account_number}
                            </p>

                        </div>

                    </div>
                )}


                {/* QUICK ACTIONS */}
                <div className="mb-8">

                    <h3 className="text-xl font-bold text-slate-800 mb-4">
                        Quick Actions
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        <button
                            onClick={() => {
                                setAction("deposit");
                                setMessage("");
                                setError("");
                            }}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 text-left transition"
                        >

                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-4">
                                +
                            </div>

                            <h4 className="text-lg font-bold text-slate-800">
                                Deposit Money
                            </h4>

                            <p className="text-slate-500 text-sm mt-1">
                                Add money to your bank account.
                            </p>

                        </button>


                        <button
                            onClick={() => {
                                setAction("withdraw");
                                setMessage("");
                                setError("");
                            }}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 text-left transition"
                        >

                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-2xl mb-4">
                                ↓
                            </div>

                            <h4 className="text-lg font-bold text-slate-800">
                                Withdraw Money
                            </h4>

                            <p className="text-slate-500 text-sm mt-1">
                                Withdraw money from your account.
                            </p>

                        </button>


                        <button
                            onClick={() => {
                                setAction("transfer");
                                setMessage("");
                                setError("");
                            }}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 text-left transition"
                        >

                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">
                                →
                            </div>

                            <h4 className="text-lg font-bold text-slate-800">
                                Transfer Money
                            </h4>

                            <p className="text-slate-500 text-sm mt-1">
                                Send money to another account.
                            </p>

                        </button>

                    </div>

                </div>


                {/* TRANSACTION FORM */}
                {action && (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">

                        <div className="flex justify-between items-center mb-6">

                            <div>
                                <p className="text-blue-600 text-sm font-semibold uppercase">
                                    Transaction
                                </p>

                                <h3 className="text-2xl font-bold text-slate-800 capitalize">
                                    {action}
                                </h3>
                            </div>

                            <button
                                onClick={() => setAction(null)}
                                className="text-slate-400 hover:text-slate-800 text-2xl"
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={handleTransaction}
                            className="space-y-5"
                        >

                            {action === "transfer" && (
                                <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Receiver Account Number
                                    </label>

                                    <input
                                        type="text"
                                        value={receiverAccount}
                                        onChange={(e) =>
                                            setReceiverAccount(e.target.value)
                                        }
                                        placeholder="Enter account number"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                </div>
                            )}


                            <div>

                                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>


                            <div>

                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Description
                                </label>

                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Optional description"
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>


                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition"
                            >
                                {actionLoading
                                    ? "Processing..."
                                    : `Confirm ${action}`}
                            </button>

                        </form>

                    </div>
                )}


                {/* TRANSACTION HISTORY */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    <div className="p-6 border-b border-slate-200">

                        <h3 className="text-xl font-bold text-slate-800">
                            Transaction History
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Your recent banking activity
                        </p>

                    </div>


                    {transactions.length === 0 ? (

                        <div className="p-8 text-center text-slate-500">
                            No transactions found.
                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-slate-50">

                                    <tr>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                            Type
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                            Amount
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                            Description
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                            Status
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                            Date
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {transactions.map((transaction) => (

                                        <tr
                                            key={transaction.id}
                                            className="border-t border-slate-100 hover:bg-slate-50"
                                        >

                                            <td className="px-6 py-4">

                                                <span className="font-semibold text-slate-800">
                                                    {transaction.transaction_type}
                                                </span>

                                            </td>


                                            <td className="px-6 py-4 font-semibold text-slate-800">
                                                ₹{Number(
                                                    transaction.amount
                                                ).toFixed(2)}
                                            </td>


                                            <td className="px-6 py-4 text-slate-600">
                                                {transaction.description || "-"}
                                            </td>


                                            <td className="px-6 py-4">

                                                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    {transaction.status}
                                                </span>

                                            </td>


                                            <td className="px-6 py-4 text-sm text-slate-500">
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
