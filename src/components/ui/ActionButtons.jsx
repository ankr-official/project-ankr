import { useRef, useEffect } from "react";
import { useLoginDropdown } from "../../contexts/LoginDropdownContext";
import LoginDropdown from "../LoginDropdown";

const LOGIN_ID = "action-report";

export const ActionButtons = ({ onSearchOpen, isLoggedIn, onReportClick }) => {
  const { activeLoginId, openLoginDropdown, closeLoginDropdown } = useLoginDropdown();
  const showLogin = activeLoginId === LOGIN_ID;
  const loginRef = useRef(null);

  useEffect(() => {
    if (!showLogin) return;
    const handleClick = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) closeLoginDropdown();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showLogin]);

  const handleReportClick = () => {
    if (isLoggedIn) {
      onReportClick();
    } else {
      showLogin ? closeLoginDropdown() : openLoginDropdown(LOGIN_ID);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 justify-center items-center mt-16 w-full md:flex-row">
        <div className="relative w-full md:w-fit" ref={loginRef}>
          <button
            onClick={handleReportClick}
            className="px-4 py-2 w-full text-white bg-indigo-600 rounded md:w-fit lg:hover:text-indigo-900 active:bg-white active:text-indigo-900 lg:hover:bg-white"
          >
            행사 제보하기
          </button>
          {showLogin && (
            <LoginDropdown position="top" align="center" onClose={closeLoginDropdown} />
          )}
        </div>
      </div>
      <a onClick={onSearchOpen}>
        <p className="p-2 m-auto mt-6 text-center text-indigo-400 underline cursor-pointer w-fit active:text-indigo-600 lg:hover:text-indigo-600">
          *혹시 이미 등록된 행사일까요?
        </p>
      </a>
    </>
  );
};
