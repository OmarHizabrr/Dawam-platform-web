/* eslint-disable react-hooks/rules-of-hooks */
import React,{useState,useEffect} from 'react';
import axios from 'axios';
import { Badge, Layout, Menu, Dropdown,Avatar,Button  } from 'antd';
import { Typography } from 'antd';
import {UserOutlined,DownOutlined,PoweroffOutlined}  from '@ant-design/icons';
import { NavHashLink as NavLink } from 'react-router-hash-link';
import { useCookies,CookiesProvider  } from 'react-cookie';
import './MainHeader.css';
import {Env} from './../../styles'
import {
  CONTROL_PANEL_ROUTE  ,
  PROFILE_ROUTE,
} from './../../routes';
const { Header, Sider, Content } = Layout;
const { Link } = Typography;
const menu = (
  <Menu>
    <Menu.Item key="0" style={{marginTop:'8px', textAlign:'center'}}>
      <a href="#">
      <UserOutlined style={{marginLeft:'5px'}}/>
      تعديل الملف الشخصي     
      </a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="1" style={{marginTop:'8px', textAlign:'center'}}>
    <Button style={{backgroundColor:'#f00',fontWeight:'900',borderColor:'#f00',color:'#fff'}}>
    <PoweroffOutlined />
        تسجيل الخروج
    </Button></Menu.Item>
  </Menu>
);



export default function MainHeader() {
  const [count,setCount]=useState(0);
  const [data,setData]=useState([]);
  const [cookies, setCookie, removeCookie]=useCookies(["user"]);
  const id=cookies.user;
  useEffect(() => {
    axios.get(Env.HOST_SERVER_NAME+'alerts-count/'+id.id)
    .then(response => {
     setCount(response.data[0]);
    });
    axios.get(Env.HOST_SERVER_NAME+'unread-alerts/'+id.id)
    .then(response => {
     setData(response.data);
    },[]);
   });
   const alertsMenu =(
   <Menu>
   {data.map(item=>(
     <Menu.Item key="0">
       <a href={item.link}>{item.text}</a>
     </Menu.Item>  
   ))}
   <Menu.Divider />  
   <Menu.Item key="0" style={{textAlign:'center'}}>
   <NavLink to="/alerts">عرض كل الإشعارات</NavLink>
     </Menu.Item>   
   </Menu>
    );
  return ( 
  <Header theme="light" className="header">
  <div className="logo" />
  <Menu theme="light" mode="horizontal" defaultSelectedKeys={['1']}>
    <Menu.Item key="1"><NavLink to={PROFILE_ROUTE} >الملف الشخصي</NavLink></Menu.Item>
    <Menu.Item key="2"><NavLink to={CONTROL_PANEL_ROUTE} >لوحة التحكم</NavLink></Menu.Item>
     <div style={{float:'left'}}>
     <span style={{display:'inline-block',marginLeft:'20px'}}>
       <Avatar size={40} icon={<UserOutlined />} />
       <Dropdown  overlay={menu} trigger={['click']}>
       <a style={{marginRight:'10px'}} className="ant-dropdown-link" onClick={e => e.preventDefault()}>
         أسامة عبدالله<DownOutlined />
        </a> 
       </Dropdown>
       </span>
       <span style={{display:'inline-block'}}>
       <Dropdown overlay={alertsMenu} trigger={['click']}>
       <a href="#">
       <Badge count={count['count']} >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
           <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
          </svg>
        </Badge>
        </a>
        </Dropdown>
        </span>

     </div>
  </Menu>
</Header>);
};


