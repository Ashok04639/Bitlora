const API_BASE_URL = `http://${window.location.hostname}:3000`;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API request failed: ${response.status}`);
  }

  return data;
}

export const api = {
  baseUrl: API_BASE_URL,

  health() {
    return request("/api/health");
  },

  balance(userId = 1) {
    return request(`/api/balance?userId=${encodeURIComponent(userId)}`);
  },

  markets() {
    return request("/api/markets");
  },

  transactions() {
    return request("/api/transactions");
  },

  trades(userId = 1) {
    return request(`/api/trades?userId=${encodeURIComponent(userId)}`);
  },

  assets(userId = 1) {
    return request(`/api/assets?userId=${encodeURIComponent(userId)}`);
  },

  orderBook(pair) {
    return request(`/api/orderbook?pair=${encodeURIComponent(pair)}`);
  },

  orders(userId = 1) {
    return request(`/api/orders?userId=${encodeURIComponent(userId)}`);
  },

  placeOrder({
    pair,
    side,
    type,
    userId = 1,
    price,
    amount,
  }) {
    return request("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        pair,
        side,
        type,
        userId,
        price: type === "Market" ? 0 : price,
        amount,
      }),
    });
  },

  cancelOrder(orderId, userId = 1) {
    return request(`/api/orders/${orderId}/cancel`, {
      method: "POST",
      body: JSON.stringify({
        userId,
      }),
    });
  },
};
