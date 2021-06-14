import React from 'react';
import { Layout, Menu, } from 'antd';
import './style.css';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    ApartmentOutlined,
    SettingOutlined,
  } from '@ant-design/icons';

const { Sider } = Layout;
const { SubMenu } = Menu;

export default class SideMenu extends React.Component {
    state = {
        collapsed: false,
      };
    
      toggle = () => {
        this.setState({
          collapsed: !this.state.collapsed,
        });
      };
      
render(){
  return ( 
<Sider style={{height:"100%"}} width={200} trigger={null} collapsible collapsed={this.state.collapsed} className="site-layout-background">
<Menu
  mode="inline"
  defaultSelectedKeys={['1']}
  style={{ height: '100%', borderRight: 0 }}
>
    {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
      className: 'trigger',
      onClick: this.toggle,
    })}
  <Menu.Item key="1" icon={<ApartmentOutlined />}>
  بيانات وإحصائيات
  </Menu.Item>
  <Menu.Item key="2" icon={<ApartmentOutlined />}>
   الإدارات 
  </Menu.Item>
  <Menu.Item key="3"  icon={<UserOutlined />} >
الموظفين
  </Menu.Item>
  <Menu.Item key="4" icon={<SettingOutlined />} >
  الإعدادات
  </Menu.Item>
</Menu>
</Sider>);
}
};





