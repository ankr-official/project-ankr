import { auth } from "../config/firebase";

const BASE_URL = `https://asia-northeast3-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`;

const ownerCall = async (name, body = null) => {
  const idToken = await auth.currentUser.getIdToken();
  const res = await fetch(`${BASE_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`,
    },
    body: body ? JSON.stringify(body) : "{}",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
};

export const listUsers = () => ownerCall("listUsers");
export const setUserRole = (uid, role) => ownerCall("setUserRole", { uid, role });
export const setUserDisabled = (uid, disabled, reason = "") => ownerCall("setUserDisabled", { uid, disabled, reason });
export const deleteUser = (uid) => ownerCall("deleteUser", { uid });

export const deleteSelf = async () => {
  const idToken = await auth.currentUser.getIdToken();
  const res = await fetch(`${BASE_URL}/deleteSelf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`,
    },
    body: "{}",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
};
