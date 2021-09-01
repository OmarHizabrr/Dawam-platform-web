import React from 'react';
import { Badge, Layout, Menu, Dropdown,Avatar  } from 'antd';
import { Typography } from 'antd';
import {UserOutlined,DownOutlined}  from '@ant-design/icons';
import { NavHashLink as NavLink } from 'react-router-hash-link';
import './MainHeader.css';
import {
  CONTROL_PANEL_ROUTE  ,
  PROFILE_ROUTE,
} from './../../routes';
const { Header, Sider, Content } = Layout;
const { Link } = Typography;
const menu = (
  <Menu>
    <Menu.Item key="0">
      <a href="https://www.antgroup.com">1st menu item</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="1">
      <a href="https://www.aliyun.com">2nd menu item</a>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="3">3rd menu item</Menu.Item>
  </Menu>
);
const MainHeader = props => {
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
       <Dropdown overlay={menu} trigger={['click']}>
       <a href="#">
       <Badge count={3} >
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

export default MainHeader;
