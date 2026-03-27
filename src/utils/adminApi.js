const BASE_URL = `https://asia-northeast3-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;
const SECRET = import.meta.env.VITE_FUNCTION_SECRET;

const call = async (name, body = null) => {
  const res = await fetch(`${BASE_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-secret": SECRET,
    },
    body: body ? JSON.stringify(body) : "{}",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
};

export const listUsers = () => call("listUsers");
export const setUserRole = (uid, role) => call("setUserRole", { uid, role });
export const setUserDisabled = (uid, disabled) => call("setUserDisabled", { uid, disabled });
export const deleteUser = (uid) => call("deleteUser", { uid });
