# Demo: Login

&nbsp;


Let's start with the login API.
The corresponding commits are: 

  - front-end commit: 'feat: login OpenBMC API'
  - back-end commit: 'feat: login OpenBMC API'

&nbsp;

&nbsp;


## Identify the corresponding Redfish API

&nbsp;


To implement the login functionality, the initial step is to identify the corresponding Redfish API.
Search for 'login' in the OpenBMC webui-vue project that you cloned to locate the relevant code.

&nbsp;


You will find the associated code in: 
```javascript
webui-vue\src\store\modules\Authentication\AuthenticanStore.js
```

&nbsp;



As indicated by the following code snippet, the Redfish API is '/login':


```javascript

// AuthenticanStore.js

login({ commit }, { username, password }) {
      commit('authError', false);
      return api
        .post('/login', { data: [username, password] })
        .then(() => commit('authSuccess'))
        .catch((error) => {
          commit('authError');
          throw new Error(error);
        });
    },
```

&nbsp;


&nbsp;


&nbsp;



## Call Redfish APIs in Node.js

&nbsp;


The login API is written in file 'index.js', situated at the root folder of the back-end project. 
Call the '/login' API similarly to how it's done in a front-end framework.

&nbsp;


file location: 

```javascript
server-center\index.js
```

&nbsp;


```javascript
app.post("/login", async (req, res) => {
  const { username, password, ip } = req.body;
  const api = `login`;
  const axiosInstance = axios.create({
    withCredentials: true,
    baseURL: "https://" + ip,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  let responseMsg = "";
  let statusCode;

  await axiosInstance
    .post(api, { username, password })
    .then((response) => {
      statusCode = response.status;
      responseMsg = JSON.stringify({ token: response.data.token });
    })
    .catch((error) => {
      console.log(
        `\n\n Login error. Status: ${error?.response?.status}. User: ${username}, IP: ${ip}. Message: ${error?.message}`,
      );
      statusCode = error?.response?.status || 400;
      responseMsg = error?.message || "Unknown reason";
    })
    .finally(() => {
      res.writeHead(statusCode, { "Content-type": "application/json" });
      res.write(responseMsg);
      res.end();
    });
});
```

&nbsp;


&nbsp;


&nbsp;


## Send requests from front-end

&nbsp;


Now, in the front-end project, we can call the above API that we've just implemented.

file location:

```javascript
server-center-ui\src\redux\reboot\slice.js
```

&nbsp;


```javascript
export const login = createAsyncThunk(
  "reboot/login",
  async (
    { username, password, ip },
    { dispatch, getState, rejectWithValue }
  ) => {
    const api = `login`;
    return axios
      .create({
        baseURL: "https://" + getState().rebo qot.backendIp,
        timeout: axiosTimeout,
      })
      .post(api, {
        username: username,
        password: password,
        ip: ip,
      })
      .then((response) => {
        return { ip: ip, response: response };
      })
      .catch((err) => {
        return rejectWithValue({
          ip: ip,
          response: err.response ? err.response : err.code,
        });
      });
  }
);
```

&nbsp;


&nbsp;


Next, we can proceed with further implementation of multi-server login.
In the below code, you'll find some 'TODO' tasks which are currently commented. 
We will implement these functionalities at a later stage.

&nbsp;


file location: 

```javascript
server-center-ui\src\redux\reboot\slice.js
```

&nbsp;


```javascript
export const loginAllServers = createAsyncThunk(
  "reboot/loginAllServers",
  async (_, { dispatch, getState }) => {
    dispatch(setStatusApiMode(true));
    dispatch(setIsLoginAllMode(true));

    let promises = [];

    getState().reboot.serverList.forEach((server) => {
      promises.push(
        dispatch(login(server))
          .then(async (res) => {
            if (res.payload.response.status === 200) {

              // todo: getServerStatus
              // todo: getServerInfo
              // todo: subscribePushEvent
              // todo: subscribeSse
              
            }
          })
          .catch(() => {
            dispatch(
              setServerStatus({
                ip: server.ip,
                status: "error",
                errorMsg: "Failed to login",
              })
            );
          })
      );
    });

    await Promise.allSettled(promises).then(function (results) {
      dispatch(setIsLoginAllMode(false));
      dispatch(setStatusApiMode(false));
      results.forEach(function (res) {});
    });
  }
);

```


&nbsp;


&nbsp;


## Save the token from the response

&nbsp;

When the login API is called and succeeds, Redfish will return a token.
This token is essential for accessing the majority of Redfish APIs. 
Therefore, please ensure to store the token for future use.
We can store tokens in the Redux store, as shown below:

&nbsp;

file location: 

```javascript
server-center-ui\src\redux\reboot\slice.js
```

&nbsp;



```javascript
  extraReducers: {

    [login.pending.type]: (state, action) => {
      const index = state.serverList.findIndex(
        (server) => server.ip === action.meta.arg.ip
      );

      if (index < 0) return;

      state.serverList[index].isLoadingLogin = true;
    },
    [login.fulfilled.type]: (state, action) => {
      let index = state.serverList.findIndex(
        (server) => server.ip === action.payload.ip
      );

      if (index < 0) return;

      state.serverList[index].isLoadingLogin = false;
      state.serverList[index].token = action.payload.response.data.token;
    },
    ...
  }
```

## What's next?

In the above code, specifically, in function loginAllServers(), we have some 'todo' tasks: 

```javascript

              // todo: getServerStatus
              // todo: getServerInfo
              // todo: subscribePushEvent
              // todo: subscribeSse

```
&nbsp;

In the next tutorial, we will start implementing these tasks.

&nbsp;

&nbsp;

