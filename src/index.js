import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import rootStore from "./redux/store";
import "./Theme.scss";
import "bootstrap";
import { WebSocketProvider } from "./helpers/WebSocket/WebSocketContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={rootStore.store}>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
