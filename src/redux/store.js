import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { rebootMiddleware, rebootSlice } from "./reboot/slice";
import { toastStackSlice } from "./ToastStack/slice";

const rootReducer = combineReducers({
  reboot: rebootSlice.reducer,
  toastStack: toastStackSlice.reducer,
  // TODO: sensor
  // TODO: Line Notify
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(rebootMiddleware.middleware),

  devTools: true,
});

export default { store };
