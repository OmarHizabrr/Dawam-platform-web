import { ConfigProvider } from "antd";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import arEG from "antd/lib/locale/ar_EG";
import dayjs from "dayjs";
import TemporaryRegistrationPage from "./components/TemporaryRegistrationPage";

import "dayjs/locale/ar";

dayjs.locale("ar");
const SHOW_TEMP_REGISTRATION_PAGE = true; // Comment this line to hide temporary page.

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ConfigProvider
      locale={arEG}
      theme={{
        components: {
          DatePicker: {
            cellHeight: window.innerWidth <= 760 ? 20 : 24,
            cellWidth: window.innerWidth <= 760 ? 30 : 36,
            timeColumnWidth: window.innerWidth <= 760 ? 40 : 56,
          },
        },

        token: {
          fontFamily:
            "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          fontSize: 15,
          fontWeightStrong: 500,
          colorBorderSecondary: "#2f2b3d29",
          colorBgLayout: "#fff",
        },
      }}
      direction="rtl"
    >
      {SHOW_TEMP_REGISTRATION_PAGE ? <TemporaryRegistrationPage /> : <App />}
    </ConfigProvider>
  </React.StrictMode>
);

// serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
