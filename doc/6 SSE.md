# Demo: SSE

&nbsp;

The corresponding commits of this tutorial are: 

  - front-end commit: 'feat: SSE subscription (Event Service)'
  - back-end commit: 'feat: SSE API (Event Service)'

&nbsp;


Redfish in OpenBMC provides a feature called event service. The event service sends events such as sensor fan warnings, invalid user logins, power on/off events ..., etc., to its subscribers.
To view more events, you can navigate to [https://IP-of-your-device/#/logs/event-logs](https://IP-of-your-device/#/logs/event-logs).

![](https://drive.google.com/uc?id=1tQXhwwBQNGRstLXpeSGxKlKe505OIorf)


&nbsp;

&nbsp;

## SSE and Push Style Events

&nbsp;


To subscribe and receive events of the event service, there are two available methods: SSE (Server-Sent Events) and Push Style Events. 
You can choose either one to implement based on your needs or preferences.


&nbsp;

Let's begin with SSE. Before diving into the implementation, please review the guidelines and usage information for SSE in OpenBMC Redfish on the official website: [Redfish EventService design](https://github.com/openbmc/docs/blob/master/designs/redfish-eventservice.md).


&nbsp;

&nbsp;

## Subscribe SSE events in Node.js

&nbsp;



First, let's create an API to handle subscription requests from the front-end.

&nbsp;

file location: 

```javascript
server-center\API\SseApi.cjs
```

&nbsp;



```javascript
const setupSseApi = (app) => {
  app.post("/subscribesse", async (req, res) => {
    console.log("\n\n router: /subscribesse", req.body);
    if (req?.body?.server) {
      subscribeSse(req.body.server);
      res.writeHead(200, { "Content-type": "application/json" });
      res.end();
    } else {
      res.writeHead(400, { "Content-type": "application/json" });
      res.end();
    }
  });
};
```

&nbsp;


&nbsp;

The above router handler code snippet calls a method named `subscribesse()`.

`subscribesse()` create an EventSource instance to subscribe the event service.
According to the official document, [Redfish EventService design](https://github.com/openbmc/docs/blob/master/designs/redfish-eventservice.md), 
the SSE url is `/redfish/v1/EventService/Subscriptions/SSE`.

&nbsp;

file location: 

```javascript
server-center\EventService\SSE\sseClient.cjs

```

&nbsp;



```javascript

const subscribeSse = ({ token, ip }) => {
  const sseUrl = "https://" + ip + "/redfish/v1/EventService/Subscriptions/SSE";
  const es = new EventSource(sseUrl, {
    headers: {
      "X-Auth-Token": token,
      Accept: "text/event-stream",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    },
    withCredentials: true,
    https: {
      rejectUnauthorized: false,
    },
  });

  es.onopen = es.onmessage = function (event) {
    frontendClient.send(event, ip);
  };

  es.onerror = function (event) {
    const errMsg = `SSE subscription ERROR: ${ip}. Type: ${event.type}. Data: ${event.data}`;

    console.log(errMsg);
    es.close();
  };
};


```

&nbsp;


&nbsp;



## Node.js sends events to front-end (React.js)

&nbsp;

In the above code, Node.js acts as an SSE client, and OpenBMC acts as an SSE server.
But now, to send events to front-end, Node.js should act as an SSE server.
That is to say, Node.js has two different roles.
So far, the role of Node.js has been the client, and OpenBMC has acted as the server.
However, in the following scenario, the role of Node.js will change to the server, and React.js will act as the client.
Baring this concept in mind, let's create an SSE server that receives `/stream` urls.

&nbsp;

file location: 

```javascript
server-center\EventService\SSE\sseServer.cjs
```

&nbsp;



```javascript
const sseServer = function sseServer(cb, port) {
  const PORT = 5555;
  const server = http.createServer(function (req, res) {
    if (req.url !== "/stream") {
      console.log("\nThe request is not stream");
      return res.end();
    }

    const clientSender = frontendSender(req, res);
    cb(clientSender);
  });

  server
    .listen(PORT, function () {
      if (verbose)
        console.log("\n\n SSE Server running, listening at port " + PORT + ".");
    })
    .once("error", function (err) {
      if (err.code != "EADDRINUSE") return fn(err);
      console.log("\n\n SSE error: port " + PORT + " is in use ");
    });
};

```


&nbsp;

Within the function `sseServer()` presented above, a function named `frontendSender()` is called.
This `frontendSender()` creates a helper that sends events to the client side (the front-end webpage).
This client has a method named `send()`, which wil process the event received from OpenBMC,
and then send the event to front-end webpage (React.js).


&nbsp;

file location: 

```javascript
server-center\EventService\SSE\sseServer.cjs
```

&nbsp;



```javascript
const frontendSender = (req, res) => {
  req.socket.setNoDelay(true);

  res.writeHead(200, {
    "Access-Control-Allow-Origin": "127.0.0.1:3006",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  return {
    send: function send(data, ip) {
      if (data?.data) {
        const jsonObj = JSON.parse(data.data);
        jsonObj.ip = ip;
        let jsonStr = JSON.stringify(jsonObj);
        res.write("data: " + jsonStr + "\n\n");
        console.log("\n\n extract SSE message ", jsonObj?.Events?.[0].Message);
        // notifyLine("SSE: " + jsonObj?.Events?.[0].Message); // TODO: Line Notify
      }
    },
    close: function close(callback) {
      res.on("close", function () {
        if (itAlive) clearInterval(itAlive);
        if (callback) callback();
      });
    },
  };
};
```


&nbsp;


&nbsp;

## Front-end (React.js) receives SSE events from Node.js


&nbsp;

We create a custom hook named `useSSE`. 
Since Node.js acts as an SSE server, and front-end acts as an SSE client, 
front-end should create an EventSource instance.
Upon receiveing an event, this `useSSE` hook will add the event into the toast list,
so a toast will appear on the webpage.

&nbsp;

file location: 

```javascript
server-center-ui\src\helpers\EventService\useSSE.jsx
```

&nbsp;



```javascript
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

```

&nbsp;

&nbsp;


&nbsp;

