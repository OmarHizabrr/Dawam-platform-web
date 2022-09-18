/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';
import './style.css';
import { Typography ,Layout,Tabs,Menu, Button,Modal,Row,Col,DatePicker, Select,Card } from 'antd';
import {HistoryOutlined,DollarCircleOutlined,ClockCircleOutlined,IssuesCloseOutlined,ToolOutlined} from '@ant-design/icons';
import axios from 'axios';
import GeneralSetting from './../GeneralSetting';
import Backup from './../BackupPane';

import {Env} from './../../../styles';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    Link,
    useRouteMatch
  } from "react-router-dom";
export default function SettingsPane(props){
    let { path, url } = useRouteMatch(); 

      const [data,setData]=useState([]);    
      const [categories,setCategories]=useState([]);
      const [load,setLoad]=useState(true);
      const [count,setCount]=useState(0);
      const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
      const [end,setEnd]=useState(new Date().toISOString().slice(0, 10));    
      // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {
       setLoad(true);
       
        axios.get(Env.HOST_SERVER_NAME+'wages-list/'+start+'/'+end)
        .then(response => {
         
          setCount(response.data.count[0].count);
          setData(response.data.lists);
          setCategories(response.data.categories);
          setLoad(false);
        }).catch(function (error) {
          console.log(error);
        });;

       }, [start,end]);


return (
    <Layout>
    <Card style={{height:'100%'}}>
        <Row>
          <Col xs={24} sm={24} md={4} lg={4} xl={4} span={4} style={{height:'100%'}}>
            <Menu defaultSelectedKeys={['1']}>
                <Menu.Item key="1" icon={<ToolOutlined />}><Link to={`${url}`} > الإعدادات العامة</Link></Menu.Item>
                <Menu.Item key="2" icon={<ClockCircleOutlined />}><Link to={`${url}/attendance`} >إدارة الدوام</Link></Menu.Item>
                <Menu.Item key="3" icon={<HistoryOutlined />}><Link to={`${url}/backup`} >النسخ الاحتياطي والاستعادة</Link></Menu.Item>
            </Menu>
          </Col>
            <Col xs={24} sm={24} md={20} lg={20} xl={20} span={20} style={{borderRight:'1px solid #E3E4E9',padding:'20px'}}>
                <Switch>
                    <Route path={path} exact>
                        <GeneralSetting setting={props.setting}/>
                    </Route>
                    <Route path={`${path}/attendance`} component={GeneralSetting} />
                    <Route path={`${path}/backup`} component={Backup} />

                </Switch>
            </Col>
        </Row>
    </Card>
    </Layout>
);
    
 }
