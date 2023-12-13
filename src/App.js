import React, { useRef } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { RebootPage } from "./pages";
import { Header } from "./component/Header/Header";
import { SocialLink } from "./component/SocialLink/SocialLink";
import { GuidePage } from "./pages/guide";
import { useSSE } from "./helpers/EventService/useSSE";
import { usePushEvent } from "./helpers/EventService/usePushEvent";
import { usePushEventWebSocket } from "./helpers/WebSocket/usePushEventWebSocket";
import { useWebSocket } from "./helpers/WebSocket/WebSocketContext";
import { ToastStack } from "./ToastStack/ToastStack";
import "./App.scss";
import "./helpers/fontawesome";

function App() {
  const toastStackRef = useRef();
  const ws = useWebSocket();

  useSSE();
  usePushEvent();
  usePushEventWebSocket({ ws });
  // TODO: Line Notify: useLineNotifyWebSocket({ ws });

  return (
    <div>
      <HashRouter>
        <div className="app-fluid-container">
          <Header />
          {/* toast stack */}
          <ToastStack ref={toastStackRef} id="toast-stack" />

          {/* left side */}
          <div className="app-side-container">
            <SocialLink direction="vertical" />
            <div className="app-side-tilte-container mb-5">
              <div className="app-side-title">Axiomtek</div>
              <div className="app-side-title">Server Center</div>
              <div className="app-side-subtitle-lg">Manage</div>
              <div className="app-side-subtitle-lg">All Servers</div>
              <div className="app-side-subtitle-lg mb-5">on One Site</div>
              <SocialLink />
            </div>
            <div className="app-side-right-decor-line"></div>
            <div className="app-side-version">1.0</div>
          </div>

          {/* right side */}

          <div className="app-right-container">
            <Routes>
              <Route path="/reboot" element={<RebootPage />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="*" element={<RebootPage />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </div>
  );
}

export default App;
