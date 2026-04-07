import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useModalNavigation = (data, { loadAllYears, allYearsLoaded } = {}) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const match = location.pathname.match(/^\/event\/(.+)/);
        if (match && data.length > 0) {
            const idFromUrl = match[1];
            const item = data.find(d => d.id === idFromUrl);
            if (item && item.confirm) {
                setSelectedItem(item);
            } else if (allYearsLoaded) {
                // 전체 연도 로드 후에도 없으면 잘못된 URL
                setSelectedItem(null);
                navigate("/", { replace: true });
            } else {
                // 아직 과거 연도 미로드 → 전체 로드 후 재탐색
                loadAllYears?.();
            }
        } else if (!match) {
            setSelectedItem(null);
        }
    }, [location.pathname, data, navigate, allYearsLoaded]);

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