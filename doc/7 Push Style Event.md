## Demo: Push Style Event


&nbsp;


As mentioned in the previous tutorial, Redfish in OpenBMC provides two ways to communicate with the event service. 
The previous tutorial demonstrated the implementation of SSE. 
Now, let's explore Push Style Events. These two methods essentially achieve the same objective but differ in their approach. 
You only need to choose the one that you prefer or find convenient.



&nbsp;

To switch between SSE and Push Style Event, set the below flags as true/false.
For example, if you'd like to use SSE, please set `useSSEevent` as true and `isUsePushEvent` as false, and vice versa.


file location: 

```javascript
server-center-ui\src\redux\reboot\slice.js
```

&nbsp;

```javascript
const initialState = {
  
  ... 

  useSSEevent: true,
  isUsePushEvent: false,
};

```

&nbsp;

&nbsp;


Regarding the principle of Push Style Events, we quote the description from the official documentation as follows:

> Unlike the SSE (where bmcweb act as server) push style events works in different way. In this case, BMC acts as HTTP client and send the data to webserver running on external system. In case of SSE, connection will be kept alive till stream closes but in push style events, connections are opened on need and closes immediately after pushing event/report data.


&nbsp;

According to the description in the official documentation above, in the SSE method, our Node.js acts as the client, and the BMC serves as the server. However, in the Push Style Event method, our Node.js acts as the server, and the BMC serves as the client. Therefore, the Node.js code will resemble the typical code for handling frontend requests. The only difference is that now the requester is not the frontend but the BMC.

As the recipient of requests, Node.js needs to inform the BMC where to send the requests. Therefore, the Destination parameter needs to be filled with the external address, port, and router path of Node.js, as follows:


```javascript

    const data = {
      Destination:
        "https://" + localIPAddress + ":" + pushEventPort + "/Events",
      Context: "Test_Context",
      Protocol: "Redfish",
      EventFormatType: "Event",
      SubscriptionType: "RedfishEvent",
      RegistryPrefixes: ["OpenBMC", "TaskEvent"],
      ResourceTypes: ["Task"],
    };
 

```


&nbsp;


&nbsp;

A more detailed code is as below.
First, obtain the gateway IP using a helper method named `getLocalIPAddress()`.
Then, subscribe push events with the post data in the above code.
Next, parse the subscription ID from the response header.



&nbsp;

file location: 

```javascript
server-center\EventService\PushEvent\PushEvent.cjs
```

&nbsp;



```javascript
const subscribePushEvent = async ({ ip, token }) => {
  const ipResponse = await getLocalIPAddress()
    .then(async (ip) => {
      console.log("\n\n Local IP Address with Non-empty Gateway:", ip);
      return {
        status: 200,
        data: ip,
      };
    })
    .catch((error) => {
      return {
        status: 500,
        error: error.message,
      };
    });

  const localIPAddress = ipResponse.data;

  if (!localIPAddress) {
    return ipResponse;
  }

  const data = {
    Destination: "https://" + localIPAddress + ":" + pushEventPort + "/Events",
    Context: "Test_Context",
    Protocol: "Redfish",
    EventFormatType: "Event",
    SubscriptionType: "RedfishEvent",
    RegistryPrefixes: ["OpenBMC", "TaskEvent"],
    ResourceTypes: ["Task"],
  };

  return await createAxiosInstance(ip, token)
    .post("/redfish/v1/EventService/Subscriptions", data)
    .then((res) => {
      let location = res?.headers?.location;
      if (!location) {
        return {
          status: 400,
          error: "Failed to parse subscription ID.",
        };
      }

      const api = "/redfish/v1/EventService/Subscriptions/";
      const subscriptionId = location.replace(api, "");

      return {
        status: res.status,
        data: {
          subscriptionId: subscriptionId,
        },
      };
    })
    .catch((error) => {
      printPushEventErrMsg(ip, error);
      const errorDetail = getSubscribeErrDetail(error?.response?.data);
      const err = errorDetail === NO_DATA ? error : errorDetail;

      return {
        status: error?.response?.status || 400,
        error: err,
      };
    });
};
```


&nbsp;


After the execution of the above subscription code, OpenBMC Redfish (acting as the client) will start sending requests to our Node.js server (acting as the server),
 with the router path set to `/Events`.


There are several crucial points that must be noted, as follows:

1. Every time OpenBMC sends requests to the /Events router, Node.js must respond (for example, with a status code of 200 or 500). If the Node.js does not respond anything, this will lead OpenBMC to consider the connection unsuccessful, and as a result, it won't send any subsequent events.

2. When Node.js sends a response, two crucial header manipulations must be performed. These necessary steps are not explicitly documented in the official OpenBMC documentation but were discovered by our Axiomtek team during the development process. The first part of the header that needs handling is the `Connection` header. When sending a response, Node.js must set the `Connection` value to `close`. Failure to do so will result in the default value `keep-alive` being used for `Connection`, causing OpenBMC to stop sending subsequent events. This phenomenon may be attributed to the fundamental difference between Push Style events and SSE. SSE maintains a continuous connection without interruption after establishment, while Push Style events require an immediate connection termination after each event is sent. The second part of the header that needs handling is the `Transfer-Encoding` header. When sending a response, Node.js must remove the `Transfer-Encoding` header. If not removed, `Transfer-Encoding` will default to `chunk`, and when our Axiomtek team were tracing the `OpenBMC bmcweb` (back-end) source code, we discovered that it does not handle responses in `chunk` format. Hence, it is imperative to remove this header.

&nbsp;


Regarding the implementation of the above points, please refer to the following code:



&nbsp;

file location: 

```javascript
server-center\EventService\PushEvent\PushEvent.cjs
```

&nbsp;



```javascript

app.use((req, res, next) => {
  res.setHeader("Connection", "close");
  res.removeHeader("Transfer-Encoding");
  next();
});



const initPushStyleEvent = () => {

	......


  app.post("/Events", async (req, res) => {
    try {
      let json = circularJSON.stringify(req);
      let jsonObject = JSON.parse(json);
      const address =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const ip = address?.replace(/^.*:/, "");

      io.emit("pushEvent", { data: jsonObject, ip: ip });

      console.log("\n\n First message: ", jsonObject.body?.Events?.[0].Message);
      let msg = "";
      msg += jsonObject.body?.Events?.[0]?.Message;
      // notifyLine(msg); // TODO: Line Notify
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end();
    } catch (error) {
      console.log("\n\n Push event error:", error);
      res.writeHead(500, { "Content-type": "application/json" });
      res.end();
    }
  });

  ......

}

```



&nbsp;



&nbsp;


## Front-end receives Push Style Events through web sockets

&nbsp;

When Node.js receives an event from OpenBMC, it should send this event to the front-end webpage.
Node.js and front-end (React.js) can communicate through web sockets.
In the below front-end code, a custom hook named `usePushEvent` is defined, establishing a web socket connection with the back-end.
Upon receiving an event, `usePushEvent` will dispatch the data to the Redux store, and then a toast will pop up on the webpage.

&nbsp;

file location: 

```javascript
server-center-ui\src\helpers\EventService\usePushEvent.js
```

&nbsp;



```javascript
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
```



&nbsp;



&nbsp;

