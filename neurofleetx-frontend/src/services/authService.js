const API_URL = "http://localhost:9090/api/auth";

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error();
  return res.json();
};

export const register = async (name, phone, email, password, role) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, email, password, role }),
  });

  if (!res.ok) throw new Error();
  return res.text();
};

export const logoutApi = async () => {
  try {
    await fetch(`${API_URL}/logout`, { method: "POST" });
  } catch (e) {
    console.error(e);
  }
};
