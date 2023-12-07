import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { rebootMiddleware, rebootSlice } from "./reboot/slice";


const rootReducer = combineReducers({
  reboot: rebootSlice.reducer,
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
