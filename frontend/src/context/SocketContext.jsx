import React, { createContext, useContext, useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

const SocketContext = createContext();
const ENDPOINT = import.meta.env.VITE_REACT_APP_BASEURL;

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [socket, setSocket] = useState(null);

    const storedUser = localStorage.getItem('userDetail');
    const userId = storedUser ? JSON.parse(storedUser)?.id : null;

    useEffect(() => {
        if (userId) {
            const newSocket = socketIOClient(ENDPOINT);
            newSocket.emit('register', userId);
            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [userId]);

    const socketValue = {
        socket,
        data,
        setData,
    };

    return (
        <SocketContext.Provider value={socketValue}>
            {children}
        </SocketContext.Provider>
    );
};
