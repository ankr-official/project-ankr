import { FORM_URL } from "../../constants";

export const ActionButtons = ({ onSearchOpen }) => {
    return (
        <>
            <div className="flex flex-col gap-4 justify-center items-center mt-16 w-full md:flex-row">
                <button
                    onClick={() => window.open(FORM_URL, "_blank")}
                    className="px-4 py-2 w-full text-white bg-indigo-600 rounded md:w-fit lg:hover:text-indigo-900 active:bg-white active:text-indigo-900 lg:hover:bg-white"
                >
                    행사 제보하기
                </button>
            </div>
            <a onClick={onSearchOpen}>
                <p className="p-2 m-auto mt-6 text-center text-indigo-400 underline cursor-pointer w-fit active:text-indigo-600 lg:hover:text-indigo-600">
                    *혹시 이미 등록된 행사일까요?
                </p>
            </a>
        </>
    );
};