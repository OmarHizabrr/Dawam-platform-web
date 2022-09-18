/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';
import './style.css';
import { Typography ,Layout,Tabs,Form, Upload,Button, DatePicker, Row,Col,Select,Card, notification,Input, InputNumber } from 'antd';
import {SwapOutlined,FormOutlined,UploadOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {FileExcelOutlined} from '@ant-design/icons';
import {Env} from './../../../styles';
const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
const {RangePicker}=DatePicker;


export default function Backup(props){
    const [form] = Form.useForm();
    const [load,setLoad]=useState(false);


    const onFinish=(values)=>{
        setLoad(true);
        setLoad(false);
      }

    const openNotification = (placement,text) => {
      notification.success({
        message:text ,
        placement,
        duration:0,
      });
    }
return (
    <Layout>
      <Card>
        
      </Card>
    </Layout>
);
    
 }
