const API_URL = "http://localhost:5000/api";

const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};


export const loginUser = (email, password) => {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });
};


export const registerUser = (name, email, password) => {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            name,
            email,
            password
        })
    });
};


export const getAccount = (token) => {
    return apiRequest("/accounts", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};


export const getTransactions = (token) => {
    return apiRequest("/transactions/history", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};


export const depositMoney = (token, amount, description) => {
    return apiRequest("/transactions/deposit", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            amount: Number(amount),
            description: description || "Money deposit"
        })
    });
};


export const withdrawMoney = (token, amount, description) => {
    return apiRequest("/transactions/withdraw", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            amount: Number(amount),
            description: description || "Money withdrawal"
        })
    });
};


export const transferMoney = (
    token,
    receiverAccountNumber,
    amount,
    description
) => {
    return apiRequest("/transactions/transfer", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            receiverAccountNumber,
            amount: Number(amount),
            description: description || "Money transfer"
        })
    });
};
