import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider } from 'antd';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import locale from 'antd/locale/ar_EG';
import dayjs from 'dayjs';

import 'dayjs/locale/ar';

ReactDOM.render(
  <React.StrictMode>
  <ConfigProvider locale={locale}  theme={{
        token: {
          fontFamily: "Tajawal",
          fontSize: 15, 
          fontWeightStrong:500,
          colorBorderSecondary:"#2f2b3d29",
          colorBgLayout:"#fff",
        }
      }}  direction="rtl">
    <App />
  </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
