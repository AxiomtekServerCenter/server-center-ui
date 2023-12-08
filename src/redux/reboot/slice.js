import {
  createSlice,
  createAsyncThunk,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import axios from "axios";
import { retryApi } from "../helper/reduxHelper";

const axiosTimeout = 15000;

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

    // todo: getServerInfo
    // todo: subscribePushEvent
    // todo: subscribeSse
  }
};

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
      timeout: 8000,
    });
    const response = await axiosInstance.get(api);

    return response;
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

  },
});

export const rebootMiddleware = createListenerMiddleware();

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
  refreshChartData,
  getReduxServerList,
} = rebootSlice.actions;
