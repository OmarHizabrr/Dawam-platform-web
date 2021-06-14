import React from 'react';
import { Layout, Menu, } from 'antd';
import { Typography } from 'antd';
import { NavHashLink as NavLink } from 'react-router-hash-link';
import './MainHeader.css';
import {
  CONTROL_PANEL_ROUTE  ,
  PROFILE_ROUTE,
} from './../../routes';
const { Header, Sider, Content } = Layout;
const { Link } = Typography;
const MainHeader = props => {
  return ( 
  <Header theme="light" className="header">
  <div className="logo" />
  <Menu theme="light" mode="horizontal" defaultSelectedKeys={['1']}>
    <Menu.Item key="1"><NavLink to={PROFILE_ROUTE} >الملف الشخصي</NavLink></Menu.Item>
    <Menu.Item key="2"><NavLink to={CONTROL_PANEL_ROUTE} >لوحة التحكم</NavLink></Menu.Item>
  </Menu>
</Header>);
};

export default MainHeader;
