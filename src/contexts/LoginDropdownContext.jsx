import { createContext, useContext, useState } from "react";

const LoginDropdownContext = createContext(null);

export function LoginDropdownProvider({ children }) {
  const [activeId, setActiveId] = useState(null);

  const openLoginDropdown = (id) => setActiveId(id);
  const closeLoginDropdown = () => setActiveId(null);

  return (
    <LoginDropdownContext.Provider value={{ activeLoginId: activeId, openLoginDropdown, closeLoginDropdown }}>
      {children}
    </LoginDropdownContext.Provider>
  );
}

export function useLoginDropdown() {
  return useContext(LoginDropdownContext);
}
