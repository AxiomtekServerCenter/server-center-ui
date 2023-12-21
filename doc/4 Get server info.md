# Demo: Get server info (model name, serial number)

In the previous tutorial, we have accomplished one of the 'TODO' tasks.
Now, let's continue with the second task: getting the information of servers.

&nbsp;

The corresponding commits of this tutorial are: 

  - front-end commit: 'feat: get server info (overview) API'
  - back-end commit: 'feat: get server info (overview) API'

&nbsp;

&nbsp;

## Identify the corresponding Redfish API

&nbsp;


On the landing page of the webui-vue, some basic information of the device is shown.
Kindly navigate to [https://IP-of-your-device/#/](https://<IP-of-your-device>/#/), the webpage as illustrated in the below figure will show up.
We want to get the information enclosed within the red box in the below image, i.e., the model name and serial number.

&nbsp;


![](https://drive.google.com/uc?id=1NVC6O8xd0cj-na162Bx6fZfpbdd0m6_A)


&nbsp;



In project [OpenBMC webui-vue](https://github.com/openbmc/webui-vue) that you've cloned,
the corresponding code of server information is presented below. 
As indicated in the following code, the component dispatches `getSystem` to the VUEX store.

&nbsp;

file location:

```javascript
webui-vue\src\views\Overview\OverviewServer.vue
```
&nbsp;


```javascript
  created() {
    this.$store.dispatch('system/getSystem').finally(() => {
      this.$root.$emit('overview-server-complete');
    });
  },
```

&nbsp;

&nbsp;

Then, after tracing the relevant code of `getSystem`,
you will identify the corresponding Redfish API in this code snippet.
The Redfish API is `/redfish/v1`, but that alone is not sufficient.
The response from `/redfish/v1`  requires post-processing, prompting the need for another API call:

```javascript
api.get(`${response.data.Systems['@odata.id']}/system`)
```

&nbsp;

file location:

```javascript
webui-vue\src\store\modules\HardwareStatus\SystemStore.js
```

&nbsp;


```javascript
  actions: {
    async getSystem({ commit }) {
      return await api
        .get('/redfish/v1')
        .then((response) =>
          api.get(`${response.data.Systems['@odata.id']}/system`)
        )
        .then(({ data }) => commit('setSystemInfo', data))
        .catch((error) => console.log(error));
    },
 

   ......

  },
```

&nbsp;

&nbsp;


## Call Redfish APIs in Node.js

&nbsp;

Just as we did in previous tutorials, our objective now is to rewrite the logic of [OpenBMC webui-vue](https://github.com/openbmc/webui-vue) into Node.js.
The response from `/redfish/v1` is used to call: api.get(`${response.data.Systems["@odata.id"]}/system`).
&nbsp;


file location:

```javascript
server-center\API\overview.cjs
```

&nbsp;

```javascript

const setupOverviewApi = (app) => {
  app.post("/getoverview", async (req, res) => {
    const { ip, token } = req.body;

    response = await getSystemInfo(ip, token);

    if (response.data) {
      let responseData = {};
      responseData[response.name] = response.data;
      sendSuccessResponse(res, responseData);
    } else {
      const status = response.error?.response?.status || 400;
      sendErrorResponse(res, response.error, status);
    }
  });

  const getSystemInfo = (ip, token) => {
    const axiosInstance = createAxiosInstance(ip, token);
    return axiosInstance
      .get("/redfish/v1")
      .then((response) => {
        return axiosInstance.get(
          `${response.data.Systems["@odata.id"]}/system`,
        );
      })
      .then(({ data }) => {
        return {
          name: "SystemInfo",
          data: {
            manufacturer: data.Manufacturer,
            model: data.Model,
            serialNumber: data.SerialNumber,
          },
        };
      })
      .catch((error) => {
        console.log("\n\n System info error: ", error);
        return {
          name: "SystemInfo",
          error: error,
        };
      });
  };
};

```
