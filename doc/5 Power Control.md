# Demo: Power Control (Power on/off)



&nbsp;

The corresponding commits of this tutorial are: 

  - front-end commit: 'feat: power on/off (power controll) API'
  - back-end commit: 'feat: power control API (power on/off API)'

&nbsp;

&nbsp;

## Identify the corresponding Redfish API

&nbsp;



To examine the power control functionalities on the webpage, you may navigate to [https://IP-of-your-device/#/operations/server-power-operations](https://IP-of-your-device/#/operations/server-power-operations),
 and the webpage for power control will be displayed, as shown in the figure below.

&nbsp;


![](https://drive.google.com/uc?id=1ERR0EHS6u1oi9QDmZjO9yaRp_JS73k1D)


&nbsp;

The corresponding code of the above webpage in the figure is as follows:



&nbsp;

file location:

```javascript
webui-vue\src\views\Operations\ServerPowerOperations\ServerPowerOperations.vue
```
&nbsp;


```javascript
    powerOn() {
      this.$store.dispatch('controls/serverPowerOn');
    },
```

&nbsp;

&nbsp;


After tracing the above code, we can identify the relevant Redfish API:

&nbsp;

file location:

```javascript
webui-vue\src\store\modules\Operations\ControlStore.js
```
&nbsp;


```javascript
    serverPowerChange({ commit }, data) {
      commit('setOperationInProgress', true);
      api
        .post('/redfish/v1/Systems/system/Actions/ComputerSystem.Reset', data)
        .catch((error) => {
          console.log(error);
          commit('setOperationInProgress', false);
        });
    },
```

&nbsp;

&nbsp;


## Call Redfish APIs in Node.js

&nbsp;

Rewrite the logic of the above code in [OpenBMC webui-vue](https://github.com/openbmc/webui-vue) into Node.js.



&nbsp;

file location:

```javascript
webui-vue\src\store\modules\Operations\ControlStore.js
```
&nbsp;


```javascript
    serverPowerChange({ commit }, data) {
      commit('setOperationInProgress', true);
      api
        .post('/redfish/v1/Systems/system/Actions/ComputerSystem.Reset', data)
        .catch((error) => {
          console.log(error);
          commit('setOperationInProgress', false);
        });
    },
```

&nbsp;


&nbsp;


## Call API from front-end

&nbsp;

On the front-end side, let's call the API we've just written.

&nbsp;

file location:

```javascript
server-center-ui\src\redux\reboot\slice.js
```
&nbsp;


```javascript
export const powerControl = createAsyncThunk(
  "reboot/powerControl",
  async ({ server, resetType }, { dispatch, getState, rejectWithValue }) => {
    const api = `powercontrol`;
    const postData = {
      username: server.username,
      password: server.password,
      ip: server.ip,
      resetType: resetType,
      token: server.token,
    };

    return await runApi({
      api,
      postData,
      server,
      getState,
      dispatch,
      rejectWithValue,
      params: { resetType: resetType },
    });
  }
);
```

&nbsp;


In the above code, there is a helper function named `runApi()`.
This helper function extracts the common logic of calling APIs.
`runApi()` also utilizes `retryApi()`, a helper method that we implemented in the previous tutorial.

&nbsp;


file location:

```javascript
server-center-ui\src\redux\helper\reduxHelper.js
```
&nbsp;


```javascript

const runApi = async ({
  api,
  postData,
  server,
  getState,
  dispatch,
  rejectWithValue,
  params,
}) => {
  let result;
  let shouldRetry = false;

  if (getState().reboot.debugMode) {
    console.log("\n\n Running API: ", api, ". Post data: ", postData);
  }

  await axios
    .create({
      baseURL: "https://" + getState().reboot.backendIp,
      timeout: apiTimeout,
    })
    .post(api, postData)
    .then((response) => {
      result = { ip: server.ip, response: response };
      result = { ...result, ...params };
    })
    .catch((err) => {
      shouldRetry = true;
      console.error(err);
    });

  if (!shouldRetry) {
    return result;
  }

  const { retrySuccess, retryResult } = await retryApi({
    dispatch: dispatch,
    getState: getState,
    server: server,
    api: api,
    method: "POST",
    params: params,
  });

  if (retrySuccess) {
    return retryResult;
  } else {
    return rejectWithValue(retryResult);
  }
};

```


&nbsp;


&nbsp;


&nbsp;
