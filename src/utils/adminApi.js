import { auth } from "../config/firebase";

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
export const setUserRole = async (uid, role) => {
  const idToken = await auth.currentUser.getIdToken();
  const res = await fetch(`${BASE_URL}/setUserRole`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-secret": SECRET,
      "Authorization": `Bearer ${idToken}`,
    },
    body: JSON.stringify({ uid, role }),
  });
  if (!res.ok) { const text = await res.text(); throw new Error(text || `HTTP ${res.status}`); }
  return res.json();
};
export const setUserDisabled = (uid, disabled, reason = "") => call("setUserDisabled", { uid, disabled, reason });
export const deleteUser = (uid) => call("deleteUser", { uid });

export const getSuspensionReason = (email) =>
  fetch(`${BASE_URL}/getSuspensionReason`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).then((r) => r.json());
