import { useEffect } from "react";
import { useSelector, useAppDispatch } from "../../redux/hooks";
import { addToast } from "../../redux/ToastStack/slice";

const usePushEventWebSocket = ({ ws }) => {
  const dispatch = useAppDispatch();
  const isUsePushEvent = useSelector((state) => state.reboot.isUsePushEvent);

  const debugMode = useSelector((s) => s.reboot.debugMode);

  useEffect(() => {
    if (ws && isUsePushEvent) {
      setupWebSocketEvent();
      setTimeout(() => {
        ws.emit("getMessage", "Front-end push event websocket connected.");
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
        if (debugMode)
          console.log(
            "Push Event: ",
            response.ip,
            " : ",
            eventData.EventId,
            " : ",
            eventData.Message
          );
      } else {
        if (debugMode) console.error("Error parsing push event", response);
      }
    });
  };
};

export { usePushEventWebSocket };
