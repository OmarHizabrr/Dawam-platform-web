import React from 'react';
import { Layout, Menu, } from 'antd';
import { Typography } from 'antd';
import { NavHashLink as NavLink } from 'react-router-hash-link';
import './MainHeader.css';
import {
  HOME_ROUTE  ,
  CONTROL_PANEL_ROUTE  ,
  PROFILE_ROUTE,
  ABOUT
} from './../../routes';
const { Header, Sider, Content } = Layout;
const { Link } = Typography;
const MainHeader = props => {
  return ( 
  <Header theme="light" className="header">
  <div className="logo" />
  <Menu theme="light" mode="horizontal" defaultSelectedKeys={['1']}>
  <Menu.Item key="1"><NavLink to={HOME_ROUTE} >الرئيسية</NavLink></Menu.Item>
    <Menu.Item key="2"><NavLink to={PROFILE_ROUTE} >الملف الشخصي</NavLink></Menu.Item>
    <Menu.Item key="3"><NavLink to={CONTROL_PANEL_ROUTE} >لوحة التحكم</NavLink></Menu.Item>
    <Menu.Item key="4"><NavLink to={ABOUT} >من نحن</NavLink></Menu.Item>
  </Menu>
</Header>);
};

export default MainHeader;
