import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toastList: [],
};

export const toastStackSlice = createSlice({
  name: "toastStack",
  initialState,
  reducers: {
    addToast: (state, action) => {
      const index = state.toastList.findIndex(
        (toast) => toast.id === action.payload.id
      );
      if (index < 0) {
        state.toastList = [...state.toastList, action.payload];
      }
    },
    deleteToast: (state, action) => {
      state.toastList = state.toastList.filter(
        (toast) => toast.id !== action.payload.id
      );
    },
  },
  extraReducers: {},
});

export const { addToast, deleteToast } = toastStackSlice.actions;
