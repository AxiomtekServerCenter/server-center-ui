import {
  createSlice,
  createAsyncThunk,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import axios from "axios";
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
    refreshChartData: (state, action) => {
      const powerOnCount = state.serverList.filter(
        (server) => server.status && server.status.toLowerCase() === "on"
      ).length;
      const powerOffCount = state.serverList.filter(
        (server) => server.status && server.status.toLowerCase() === "off"
      ).length;
      const noDataCount = state.serverList.filter(
        (server) =>
          server.status &&
          server.status.toLowerCase() !== "on" &&
          server.status.toLowerCase() !== "off"
      ).length;

      state.serverList.forEach((server) => {});
      state.chartData = [powerOnCount, powerOffCount, noDataCount];
    },
    getReduxServerList: (state, action) => {
      return state.serverList;
    },
  },
  extraReducers: {
    // getServerListupdateServer reducer
    [getServerList.pending.type]: (state) => {},
    [getServerList.fulfilled.type]: (state, action) => {
      state.serverList = action.payload.data;
    },
    [getServerList.rejected.type]: (state, action) => {},
  },
});

export const rebootMiddleware = createListenerMiddleware();

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
