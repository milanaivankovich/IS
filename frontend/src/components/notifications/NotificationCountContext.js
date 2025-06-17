// Context.js
import React, { createContext, useContext, useState } from "react";

const NotifCountContext = createContext();

export const NotifCountProvider = ({ children }) => {
    const [notifCount, setNotifCount] = useState(0);

    return (
        <NotifCountContext.Provider value={{ notifCount, setNotifCount }}>
            {children}
        </NotifCountContext.Provider>
    );
};

export const useNotifCountContext = () => useContext(NotifCountContext);
