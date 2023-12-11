import { useEffect, useState } from "react";
import { useSelector, useAppDispatch } from "../../redux/hooks";
import { addToast } from "../../redux/ToastStack/slice";

const useSSE = () => {
  const dispatch = useAppDispatch();
  const debugMode = useSelector((s) => s.reboot.debugMode);
  const [eventSource, setEventSource] = useState(null);
  const useSSEevent = useSelector((state) => state.reboot.useSSEevent);

  useEffect(() => {
    if (!useSSEevent) return;

    const es = new EventSource("http://127.0.0.1:5555/stream");

    es.addEventListener(
      "message",
      (e) => {
        if (e.data) {
          if (debugMode) console.log("\n\n parse JSON", JSON.parse(e.data));

          const newToast = {};
          newToast.id =
            "toast-" +
            JSON.parse(e.data).ip.replaceAll(".", "-") +
            "-" +
            JSON.parse(e.data).Events[0].EventId;
          newToast.message = JSON.parse(e.data).Events[0].Message;
          newToast.ip = JSON.parse(e.data).ip;
          newToast.serverName = "";
          newToast.beginTime = new Date();
          dispatch(addToast(newToast));
        }
      },
      false
    );

    es.addEventListener(
      "open",
      function (e) {
        if (debugMode) console.log("\n\nSSE Event Source Connected");
      },
      false
    );

    es.addEventListener(
      "error",
      function (e) {
        if (e.target.readyState === EventSource.CLOSED) {
          // for debugging
        } else if (e.target.readyState === EventSource.CONNECTING) {
          // for debugging
        } else {
          console.error("Event source error. ", e);
        }
      },
      false
    );
    setEventSource(es);
  }, []);

  return eventSource;
};

export { useSSE };
