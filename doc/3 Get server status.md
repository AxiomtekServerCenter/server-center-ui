# Demo: Get server status and retry on API failure

&nbsp;

&nbsp;


Recall from the previous tutorial, we have left some 'TODO' tasks.
Now, let's begin with the first task: getting the status of servers.

&nbsp;

The corresponding commits of this tutorial are: 

  - front-end commit: 'feat: call API: get server status'
  - back-end commit: 'feat: get server status API'

&nbsp;

&nbsp;


## Identify the corresponding Redfish API


&nbsp;

Similar to our approach in the previous tutorial, we need to first identify the Redfish API for obtaining the status of servers.
After tracing the code in project [OpenBMC webui-vue](https://github.com/openbmc/webui-vue), we will find the associated Redfish API in this file:

```javascript
webui-vue\src\store\modules\GlobalStore.js
```
&nbsp;

As indicated by the following code snippet, the Redfish API is `/redfish/v1/Systems/system`:

```javascript
    getSystemInfo({ commit }) {
      api
        .get('/redfish/v1/Systems/system')
        .then(
          ({
            data: {
              AssetTag,
              Model,
              PowerState,
              SerialNumber,
              Status: { State } = {},
            },
          } = {}) => {
            commit('setAssetTag', AssetTag);
            commit('setSerialNumber', SerialNumber);
            commit('setModelType', Model);
            if (State === 'Quiesced' || State === 'InTest') {
              // OpenBMC's host state interface is mapped to 2 Redfish
              // properties "Status""State" and "PowerState". Look first
              // at State for certain cases.
              commit('setServerStatus', State);
            } else {
              commit('setServerStatus', PowerState);
            }
          }
        )
        .catch((error) => console.log(error));
    },
```

&nbsp;

&nbsp;


## Call Redfish APIs in Node.js

&nbsp;


We will reference the logic from the above code and rewrite it in a Node.js file, as follows:

&nbsp;

file location: 

```javascript
server-center\index.js
```

&nbsp;

```javascript
app.post("/getserverstatus", async (req, res) => {
  let statusCode;
  let apiResult;
  let serverStatus;

  apiResult = await getServerStatus({
    token: req.body.token,
    ip: req.body.ip,
  });

  if (apiResult && apiResult.status) {
    statusCode = apiResult.status;
    if (
      apiResult.data.Status.State === "Quiesced" ||
      apiResult.data.Status.State === "InTest"
    ) {
      serverStatus = apiResult.data.Status.State;
    } else {
      serverStatus = apiResult.data.PowerState;
    }
  } else {
    statusCode = 400;
  }
  res.writeHead(statusCode, { "Content-type": "application/json" });
  if (statusCode === 200) {
    res.write(serverStatus);
  }

  res.end();
});

async function getServerStatus({ token, ip }) {
  const axiosInstance = createAxiosInstance(ip, token);
  axiosInstance.defaults.withCredentials = true;

  return await axiosInstance
    .get("/redfish/v1/Systems/system")
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error;
    });
}

```

&nbsp;

&nbsp;

## Set the `X-Auth-Token` token in the request header

&nbsp;


In the above code snippet, you'll notice a helper function called `createAxiosInstance()`. 
This function is reusable across our APIs. 
While its implementation is simple (as shown below), there's one crucial point to highlight. 
As you may recall from the previous tutorial, a token is returned upon the login API call. 
It's imperative to set this token in the header in the helper method `createAxiosInstance()`.
OpenBMC identifies the token through the `X-Auth-Token` header. 
So, the request header should be as follows:

&nbsp;


file location:

```javascript
server-center\Helper\ApiHelper.cjs
```

&nbsp;


```javascript

const createAxiosInstance = (ip, token) => {
  return axios.create({
    withCredentials: true,
    baseURL: "https://" + ip,
    headers: {
      "X-Auth-Token": token,
    },
    httpsAgent: new https.Agent({
      keepAlive: true,
      rejectUnauthorized: false,
    }),
  });
};
```

## Retry when API calls fail

&nbsp;

When an API fails, one possible reason is that the token has expired. Therefore, if Node.js returns an error message to the frontend upon API invocation, we need to retry on the frontend side, meaning we have to log in again.

&nbsp;

There are several scenarios where re-login might be necessary, for example:

&nbsp;

### 1. Token Session Expiry:

The default validity period for OpenBMC tokens is 3600 seconds. If the web page remains open for an extended period, the server's token may expire, so a fresh login is needed.

&nbsp;

### 2. Incorrect Server Credentials:

If the username and password of the server are incorrectly entered, we won't obtain a valid token upon entering the web page. However, if we later edit the server information, providing the correct credentials, then the subsequent APIs on this server should use the new token. The way to acquire this new token is by logging in again.



&nbsp;

&nbsp;

### Retry API calls by re-login

&nbsp;

The corresponding front-end commit is `feat: call API: get server status`.

&nbsp;


file location: 

```javascript
server-center-ui\src\redux\reboot\slice.js
```

&nbsp;



```javascript
export const getServerStatus = createAsyncThunk(
  "reboot/getServerStatus",
  async (server, { getState, rejectWithValue, dispatch }) => {
    const api = `getserverstatus`;

    let result;
    let retry = false;

    await axios
      .create({
        baseURL: "https://" + getState().reboot.backendIp,
        timeout: 8000,
      })
      .post(api, {
        username: server.username,
        password: server.password,
        ip: server.ip,
        token: server.token,
      })
      .then((response) => {
        result = { ip: server.ip, response: response };
      })
      .catch((err) => {
        retry = true;
        console.error(err);
      });

    if (!retry) {
      return result;
    }

    const { retrySuccess, retryResult } = await retryApi({
      dispatch: dispatch,
      getState: getState,
      server: server,
      api: api,
      method: "POST",
    });

    if (retrySuccess) {
      return retryResult;
    } else {
      return rejectWithValue(retryResult);
    }

  }
);
```

&nbsp;

As you can see from the above code snippet, there is a helper funciton named `retryApi()`.
Within `retryApi()`, the server will re-login when an API failure occurs. 
It's crucial that when the API is invoked for the second time, the new token, rather than the older one, should be used.
This helper function is reusable, so other APIs also can employ this helper function as well.


file location: 

```javascript
server-center-ui\src\redux\helper\reduxHelper.js
```

&nbsp;



```javascript
const retryApi = async ({
  dispatch,
  getState,
  server,
  params = {},
  api,
  method = "POST",
}) => {
  let retryResult;
  let retrySuccess = false;

  await dispatch(login(server)).then(async () => {
    const index = getState().reboot.serverList.findIndex(
      (s) => s.ip === server.ip
    );
    const newToken = getState().reboot.serverList[index].token;

    const axiosInstance = axios.create({
      baseURL: "https://" + getState().reboot.backendIp,
      timeout: 8000,
    });
    const serverObj = {
      username: server.username,
      password: server.password,
      ip: server.ip,
      token: newToken,
    };
    const body = { ...serverObj, ...params };
    let axiosObj;

    if (method === "POST") {
      axiosObj = axiosInstance.post(api, body);
    } else if (method === "GET") {
      axiosObj = axiosInstance.get(api, body);
    }

    await axiosObj
      .then((response) => {
        retrySuccess = true;
        retryResult = { ip: server.ip, response: response };
        retryResult = { ...retryResult, ...params };
      })
      .catch((err) => {

        console.error(err);
        retrySuccess = false;
        retryResult = {
          ip: server.ip,
          response: err.response ? err.response : err.code,
        };
      });
  });


  return { retrySuccess: retrySuccess, retryResult: retryResult };
};

export { retryApi };

```