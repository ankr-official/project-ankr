import { useRef } from "react";

/**
 * 모달 배경(오버레이) 클릭 닫기.
 * 패널 안에서 눌러 배경에서 뗀 드래그(텍스트 선택 등)는 브라우저가 배경 click으로 처리하므로,
 * 배경에서 눌렀다가 배경에서 뗀 경우에만 onClose 호출.
 * 사용: <div className="fixed inset-0 ..." {...useBackdropClose(onClose)}>
 */
export function useBackdropClose(onClose) {
    const pressedOnBackdrop = useRef(false);
    return {
        onMouseDown: e => {
            pressedOnBackdrop.current = e.target === e.currentTarget;
        },
        onClick: e => {
            if (pressedOnBackdrop.current && e.target === e.currentTarget) onClose();
            pressedOnBackdrop.current = false;
        },
    };
}
