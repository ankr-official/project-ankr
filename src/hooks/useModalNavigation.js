import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useModalNavigation = (data) => {
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
            } else {
                setSelectedItem(null);
                navigate("/", { replace: true });
            }
        } else if (!match) {
            setSelectedItem(null);
        }
    }, [location.pathname, data, navigate]);

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