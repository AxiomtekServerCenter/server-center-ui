import { useEffect, useState } from "react";
import { useSelector, useAppDispatch } from "../../redux/hooks";
import { addToast } from "../../redux/ToastStack/slice";
import webSocket from "socket.io-client";

const usePushEvent = () => {
  const dispatch = useAppDispatch();
  const [ws, setWs] = useState(null);
  const debugMode = useSelector((s) => s.reboot.debugMode);
  const isUsePushEvent = useSelector((state) => state.reboot.isUsePushEvent);

  useEffect(() => {
    if (!isUsePushEvent) return;

    setWs(webSocket("https://127.0.0.1:5502"));
  }, []);

  useEffect(() => {
    if (ws) {
      setupWebSocketEvent();

      setTimeout(() => {
        sendMessage("Front-end websocket connected.");
      }, 1500);
    }
  }, [ws]);

  const setupWebSocketEvent = () => {
    ws.on("getMessage", (message) => {
      // for debugging
    });

    ws.on("pushEvent", (response) => {
      const eventData = response?.data?.body?.Events?.[0];
      if (eventData) {
        const newToast = {};
        newToast.id =
          "toast-" +
          eventData.Context.replaceAll(".", "-") +
          "-" +
          eventData.EventId;
        newToast.message = eventData.Message;
        newToast.ip = response.ip;
        newToast.serverName = "";
        newToast.beginTime = new Date();

        dispatch(addToast(newToast));

        if (debugMode) {
          console.log(
            `Push Event: ${response.ip} : ${eventData.EventId} : ${eventData.Message}`
          );
        }
      } else {
        if (debugMode) console.error("Error parsing push event", response);
      }
    });
  };

  const sendMessage = (msg) => {
    ws.emit("getMessage", msg);
  };

  return { sendMessage };
};

export { usePushEvent };
