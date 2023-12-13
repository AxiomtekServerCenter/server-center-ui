import React, { createContext, useContext, useEffect, useState } from "react";
import webSocket from "socket.io-client";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const newWs = webSocket("https://127.0.0.1:5502");
    setWs(newWs);

    return () => {
      newWs.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ws = useContext(WebSocketContext);

  return ws;
};
