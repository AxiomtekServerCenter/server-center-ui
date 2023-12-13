import {
  createSlice,
  createAsyncThunk,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import axios from "axios";
import { subscribeSse } from "../sse/slice";
import { retryApi, runApi } from "../helper/reduxHelper";

const axiosTimeout = 15000;
const apiTimeout = 8000;

const initialState = {
  debugMode: true,
  token: "",
  serverList: [],
  backendIp: "127.0.0.1:6001",
  isLoginAllMode: false,
  apiMode: false,
  statusApiMode: false,
  chartData: [],
  useSSEevent: false,
  isUsePushEvent: true,
};

export const login = createAsyncThunk(
  "reboot/login",
  async (
    { username, password, ip },
    { dispatch, getState, rejectWithValue }
  ) => {
    const api = `login`;
    return axios
      .create({
        baseURL: "https://" + getState().reboot.backendIp,
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

export const loginAllServers = createAsyncThunk(
  "reboot/loginAllServers",
  async (_, { dispatch, getState }) => {
    dispatch(setStatusApiMode(true));
    dispatch(setIsLoginAllMode(true));

    let promises = [];

    getState().reboot.serverList.forEach((server) => {
      const promiseObj = dispatch(login(server))
        .then(async (res) => {
          onLoginDone({ res, server, dispatch, getState });
        })
        .catch(() => {
          const statusErrData = {
            ip: server.ip,
            status: "error",
            errorMsg: "Failed to login",
          };
          dispatch(setServerStatus(statusErrData));
        });

      promises.push(promiseObj);
    });

    await Promise.allSettled(promises).then(function (results) {
      dispatch(setIsLoginAllMode(false));
      dispatch(setStatusApiMode(false));
      results.forEach(function (res) {});
    });
  }
);

const onLoginDone = async ({ res, server, dispatch, getState }) => {
  if (res.payload.response.status !== 200) {
    const statusErrData = {
      ip: server.ip,
      status: "error",
      errorMsg: "Failed to login.",
    };
    dispatch(setServerStatus(statusErrData));

    return;
  }

  const index = getState().reboot.serverList.findIndex(
    (s) => s.ip === server.ip
  );

  if (index >= 0) {
    await dispatch(getServerStatus(getState().reboot.serverList[index]));
    await dispatch(getServerInfo(getState().reboot.serverList[index]));
    if (getState().reboot.useSSEevent) {
      dispatch(subscribeSse(getState().reboot.serverList[index]));
    }
    if (getState().reboot.isUsePushEvent) {
      await dispatch(subscribePushEvent(getState().reboot.serverList[index]));
    }
  }
};

export const getServerInfo = createAsyncThunk(
  "reboot/getServerInfo",
  async (server, { dispatch, getState, rejectWithValue }) => {
    const api = `getoverview`;
    const postData = { ip: server.ip, token: server.token };

    return await runApi({
      api,
      postData,
      server,
      getState,
      dispatch,
      rejectWithValue,
    });
  }
);

export const getServerStatus = createAsyncThunk(
  "reboot/getServerStatus",
  async (server, { getState, rejectWithValue, dispatch }) => {
    const api = `getserverstatus`;
    const postData = {
      username: server.username,
      password: server.password,
      ip: server.ip,
      token: server.token,
    };

    return await runApi({
      api,
      postData,
      server,
      getState,
      dispatch,
      rejectWithValue,
    });
  }
);

export const getAllServerStatus = createAsyncThunk(
  "reboot/getAllServerStatus",
  async (_, { dispatch, getState }) => {
    dispatch(setStatusApiMode(true));
    let promises = [];
    getState().reboot.serverList.forEach((server) => {
      promises.push(dispatch(getServerStatus(server)));
    });
    Promise.allSettled(promises).then(function (results) {
      dispatch(setStatusApiMode(false));
    });
  }
);

export const getServerList = createAsyncThunk(
  "reboot/getServerList",
  async (_, { getState }) => {
    const backendIp = getState().reboot.backendIp;
    const api = `getservers`;
    const axiosInstance = axios.create({
      baseURL: "https://" + backendIp,
      timeout: apiTimeout,
    });
    const response = await axiosInstance.get(api);

    return response;
  }
);

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

export const powerControlAll = createAsyncThunk(
  "reboot/powerControlAll",
  async ({ selectedServers, resetType }, { dispatch, getState }) => {
    dispatch(setApiMode(true));
    let promises = [];
    selectedServers.forEach((server) => {
      promises.push(dispatch(powerControl({ server, resetType })));
    });

    Promise.allSettled(promises).then(function (results) {
      results.forEach(function (res) {});
      dispatch(setApiMode(false));
    });
  }
);

export const addServer = createAsyncThunk(
  "reboot/addServer",
  async ({ ip, serverName, username, password }, { getState }) => {
    const api = `addserver`;
    const axiosInstance = axios.create({
      baseURL: "https://" + getState().reboot.backendIp,
      timeout: 8000,
    });

    const response = await axiosInstance.post(api, {
      ip: ip,
      serverName: serverName,
      username: username,
      password: password,
    });
    return {
      response: response,
      server: {
        ip: ip,
        serverName: serverName,
        username: username,
        password: password,
      },
    };
  }
);

export const deleteServer = createAsyncThunk(
  "reboot/deleteServer",
  async ({ ip }, { getState, dispatch }) => {
    const api = `deleteserver`;
    const axiosInstance = axios.create({
      baseURL: "https://" + getState().reboot.backendIp,
      timeout: 8000,
    });
    const response = await axiosInstance.post(api, { ip: ip });

    return { response: response, server: { ip: ip } };
  }
);

export const updateServer = createAsyncThunk(
  "reboot/updateServer",
  async (
    { ip, serverName, username, password, checked },
    { getState, dispatch }
  ) => {
    const api = `updateserver`;
    const axiosInstance = axios.create({
      baseURL: "https://" + getState().reboot.backendIp,
      timeout: 8000,
    });
    const response = await axiosInstance.post(api, {
      ip: ip,
      username: username,
      serverName: serverName,
      password: password,
      checked: checked,
    });

    return {
      response: response,
      server: {
        ip: ip,
        serverName: serverName,
        username: username,
        password: password,
        checked: checked,
      },
    };
  }
);

export const onCreateNewServer = createAsyncThunk(
  "reboot/onCreateNewServer",
  async ({ username, password, ip }, { dispatch, getState }) => {
    dispatch(login({ username, password, ip })).then((result) => {
      const data = result.payload.response?.data;
      const token = data?.token;
      const index = getState().reboot.serverList.findIndex((s) => s.ip === ip);

      if (index < 0) return;

      const server = getState().reboot.serverList[index];
      dispatch(getServerStatus(server));
      dispatch(getServerInfo({ ip, token: token }));

      if (getState().reboot.isUsePushEvent) {
        dispatch(subscribePushEvent(server));
      }

      if (getState().reboot.useSSEevent) {
        dispatch(subscribeSse(server));
      }
    });
  }
);

const subscribePushEvent = createAsyncThunk(
  "reboot/subscribePushEvent",
  async ({ ip, token }, { dispatch, getState, rejectWithValue }) => {
    const api = `subscribepushevent`;
    const axiosInstance = axios.create({
      baseURL: "https://" + getState().reboot.backendIp,
      timeout: 8000,
    });
    const response = await axiosInstance.post(api, {
      ip: ip,
      token: token,
    });
    if (response.status === 200) {
      return { ip: ip, data: response.data };
    } else {
      rejectWithValue({ ip: ip, error: response.error });
    }
  }
);

export const unsubscribeAllPushEvent = createAsyncThunk(
  "reboot/unsubscribeAllPushEvent",
  async (_, { dispatch, getState }) => {
    let promises = [];
    getState().reboot.serverList.forEach((server) => {
      promises.push(dispatch(unsubscribePushEvent(server)));
    });
  }
);

export const unsubscribePushEvent = createAsyncThunk(
  "reboot/unsubscribepushevent",
  async ({ ip, token, subscriptionId }, { dispatch, getState }) => {
    const api = `unsubscribepushevent`;
    const axiosInstance = axios.create({
      baseURL: "https://" + getState().reboot.backendIp,
      timeout: 8000,
    });
    const response = await axiosInstance.post(api, {
      ip: ip,
      token: token,
      subscriptionId: subscriptionId,
    });
  }
);

export const rebootSlice = createSlice({
  name: "reboot",
  initialState,
  reducers: {
    setIsLoginAllMode: (state, action) => {
      state.isLoginAllMode = action.payload;
    },
    setApiMode: (state, action) => {
      state.apiMode = action.payload;
    },
    setStatusApiMode: (state, action) => {
      state.statusApiMode = action.payload;
    },
    setServerChecked: (state, action) => {
      state.serverList.forEach((server) => {
        if (server.ip === action.payload.ip) {
          server.checked = action.payload.checked;
        }
      });
    },
    setBackendIp: (state, action) => {
      state.backendIp = action.payload;
    },
    setLoginIp: (state, action) => {
      state.loginIp = action.payload;
    },

    setChartData: (state, action) => {
      state.chartData = action.payload;
    },
    setServerStatus: (state, action) => {
      const index = state.serverList.findIndex(
        (server) => server.ip === action.payload.ip
      );
      if (index >= 0) {
        state.serverList[index].status = action.payload.status;
        state.serverList[index].errorMsg = action.payload.errorMsg;
      }
    },
    getReduxServerList: (state, action) => {
      return state.serverList;
    },
  },

  extraReducers: {
    // ----------------- login reducer -----------------

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
    [login.rejected.type]: (state, action) => {},

    // ----------------- getServerList reducer -----------------

    [getServerList.pending.type]: (state) => {},
    [getServerList.fulfilled.type]: (state, action) => {
      state.serverList = action.payload.data;
    },
    [getServerList.rejected.type]: (state, action) => {},

    // ----------------- getServerStatus reducer -----------------

    [getServerStatus.pending.type]: (state, action) => {
      const index = state.serverList.findIndex(
        (server) => server.ip === action.meta.arg.ip
      );
      if (index < 0) return;

      state.serverList[index].isLoadingPowerStatus = true;
    },
    [getServerStatus.fulfilled.type]: (state, action) => {
      let index = state.serverList.findIndex(
        (server) => server.ip === action.payload.ip
      );
      if (!state.serverList[index]) return;

      state.serverList[index].isLoadingPowerStatus = false;
      state.serverList[index].status = action.payload.response.data;
      state.serverList[index].errorMsg = "";
    },
    [getServerStatus.rejected.type]: (state, action) => {
      const index = state.serverList.findIndex(
        (server) => server.ip === action.payload.ip
      );
      if (!state.serverList[index]) return;

      state.serverList[index].isLoadingPowerStatus = false;
      state.serverList[index].status = "error";
      state.serverList[index].errorMsg = "Can't get power status";
    },

    // ----------------- getServerInfo reducer -----------------

    [getServerInfo.pending.type]: (state) => {},
    [getServerInfo.fulfilled.type]: (state, action) => {
      const index = state.serverList.findIndex(
        (server) => server.ip === action.payload.ip
      );

      if (index < 0) return;

      state.serverList[index].overview = action.payload.response.data;
    },
    [getServerInfo.rejected.type]: (state, action) => {},

    // ----------------- powerControl reducer -----------------
    [powerControl.pending.type]: (state, action) => {
      const index = state.serverList.findIndex(
        (server) => server.ip === action.meta.arg.server.ip
      );
      if (index < 0) return;

      state.serverList[index].isLoadingPowerControlResult = true;
    },
    [powerControl.fulfilled.type]: (state, action) => {
      const index = state.serverList.findIndex(
        (server) => server.ip === action.payload.ip
      );

      if (index >= 0) {
        state.serverList[index].isLoadingPowerControlResult = false;

        let apiResult = action.payload.response.status;
        if (action.payload.response.status === 200) {
          const operation = action.payload.resetType === "On" ? "on" : "off";
          apiResult = "Turned " + operation + ": Success";
        }

        state.serverList[index].apiResult = apiResult;
      }
    },
    [powerControl.rejected.type]: (state, action) => {
      const index = state.serverList.findIndex(
        (server) => server.ip === action.payload.ip
      );

      if (index >= 0) {
        state.serverList[index].isLoadingPowerControlResult = false;
        if (action.payload.response) {
          state.serverList[index].apiResult = action.payload.response.data;
        }
      }
    },

    // ----------------- addServer reducer -----------------

    [addServer.pending.type]: (state) => {},
    [addServer.fulfilled.type]: (state, action) => {
      state.serverList.unshift({
        ip: action.payload.server.ip,
        serverName: action.payload.server.serverName,
        username: action.payload.server.username,
        password: action.payload.server.password,
        checked: true,
        status: "",
        apiResult: "",
      });
    },
    [addServer.rejected.type]: (state, action) => {},

    // ----------------- updateServer reducer -----------------

    [updateServer.pending.type]: (state) => {},
    [updateServer.fulfilled.type]: (state, action) => {
      let index = state.serverList.findIndex(
        (server) => server.ip === action.payload.server.ip
      );

      if (index < 0) return;

      state.serverList[index].serverName = action.payload.server.serverName;
      state.serverList[index].username = action.payload.server.username;
      state.serverList[index].password = action.payload.server.password;
      state.serverList[index].checked = action.payload.server.checked;
    },
    [updateServer.rejected.type]: (state, action) => {},

    // ----------------- deleteServer reducer -----------------

    [deleteServer.pending.type]: (state) => {},
    [deleteServer.fulfilled.type]: (state, action) => {
      const index = state.serverList.findIndex(
        (server) => server.ip === action.payload.server.ip
      );
      state.serverList.splice(index, 1);
    },
    [deleteServer.rejected.type]: (state, action) => {},

    // ----------------- subscribePushEvent reducer -----------------

    [subscribePushEvent.pending.type]: (state) => {},
    [subscribePushEvent.fulfilled.type]: (state, action) => {
      const index = state.serverList.findIndex(
        (server) => server.ip === action.payload.ip
      );

      if (index < 0) return;

      state.serverList[index].subscriptionId =
        action.payload.data.subscriptionId;
    },
    [subscribePushEvent.rejected.type]: (state, action) => {},
  },
});

export const rebootMiddleware = createListenerMiddleware();

rebootMiddleware.startListening({
  actionCreator: powerControlAll.fulfilled,
  effect: (_, { dispatch, unsubscribe, getState }) => {
    setTimeout(() => {
      dispatch(getAllServerStatus());
    }, 3000);
  },
});

rebootMiddleware.startListening({
  actionCreator: getServerList.fulfilled,
  effect: (_, { dispatch, getState }) => {
    dispatch(loginAllServers());
  },
});

export const {
  setIsLoginAllMode,
  setApiMode,
  setServerChecked,
  setBackendIp,
  setStatusApiMode,
  setServerStatus,
  setChartData,
  getReduxServerList,
} = rebootSlice.actions;
