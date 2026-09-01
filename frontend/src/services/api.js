const API_URL = import.meta.env.VITE_API_URL;

const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }

        throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong"
        );
    }

    return data;
};

// ==================== AUTH ====================

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

// ==================== ACCOUNT ====================

export const getAccount = (token) => {
    return apiRequest("/accounts", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// ==================== TRANSACTIONS ====================

export const getTransactions = (token) => {
    return apiRequest("/transactions/history", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const depositMoney = (
    token,
    amount,
    description
) => {
    return apiRequest("/transactions/deposit", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            amount,
            description
        })
    });
};

export const withdrawMoney = (
    token,
    amount,
    description
) => {
    return apiRequest("/transactions/withdraw", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            amount,
            description
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
            amount,
            description
        })
    });
};
