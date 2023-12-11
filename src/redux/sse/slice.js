import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const subscribeSse = createAsyncThunk(
  "sse/subscribe",
  async (server, { dispatch, getState, rejectWithValue }) => {
    const api = `subscribesse`;
    return axios
      .create({
        baseURL: "https://" + getState().reboot.backendIp,
        timeout: 8000,
      })
      .post(api, {
        server: server,
      })
      .then((response) => {
        return { response: response };
      })
      .catch((err) => {
        return rejectWithValue({
          response: err.response ? err.response : err.code,
        });
      });
  }
);
