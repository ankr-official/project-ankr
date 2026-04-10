import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useModalNavigation = (data, { loadYear, knownYears = [], loadedYears, metaLoaded } = {}) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // /event/:id URL 접근 시 meta 로드 완료 후 미로드 연도 전체 병렬 요청
    useEffect(() => {
        const match = location.pathname.match(/^\/event\/(.+)/);
        if (!match || !metaLoaded) return;
        knownYears.forEach(y => {
            if (!loadedYears?.has(y)) loadYear?.(y);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, metaLoaded]);

    // 데이터 갱신마다 이벤트 탐색
    useEffect(() => {
        const match = location.pathname.match(/^\/event\/(.+)/);
        if (!match) {
            setSelectedItem(null);
            return;
        }
        if (data.length === 0) return;

        const idFromUrl = match[1];
        const item = data.find(d => d.id === idFromUrl);
        if (item && item.confirm) {
            setSelectedItem(item);
            return;
        }

        // 모든 연도 로드 완료 후에도 없으면 잘못된 URL
        if (metaLoaded && knownYears.every(y => loadedYears?.has(y))) {
            setSelectedItem(null);
            navigate("/", { replace: true });
        }
    }, [location.pathname, data, navigate, knownYears, loadedYears, metaLoaded]);

    const handleModalOpen = item => {
        if (item.confirm) {
            setSelectedItem(item);
            navigate(`/event/${item.id}`, {
                replace: false,
                state: { modal: true },
            });
        }
    };

    const handleModalClose = () => {
        setSelectedItem(null);
        navigate("/");
    };

    return {
        selectedItem,
        handleModalOpen,
        handleModalClose,
    };
};
