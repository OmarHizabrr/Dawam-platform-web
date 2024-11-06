import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider } from 'antd';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import dayjs from 'dayjs';
import arEG from 'antd/lib/locale/ar_EG';

import 'dayjs/locale/ar';


import locale from 'antd/locale/ar_EG';

dayjs.locale('ar')

ReactDOM.render(
  <React.StrictMode>
  <ConfigProvider locale={arEG}  theme={{
        components: {
          DatePicker: {
           cellHeight:window.innerWidth <= 760?20:24,
           cellWidth:window.innerWidth <= 760?30:36,
           timeColumnWidth:window.innerWidth <= 760?40:56,
          },
        },

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
