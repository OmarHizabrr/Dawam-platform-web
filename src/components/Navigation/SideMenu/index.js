import React from 'react';
import { Layout, Menu, } from 'antd';
import './style.css';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    ApartmentOutlined,
    ProfileOutlined,
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
<Sider width={200} trigger={null} collapsible collapsed={this.state.collapsed} className="site-layout-background">
<Menu
  mode="inline"
  defaultSelectedKeys={['1']}
  defaultOpenKeys={['sub1']}
  style={{ height: '100%', borderRight: 0 }}
>
    {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
      className: 'trigger',
      onClick: this.toggle,
    })}
  <SubMenu key="sub1" icon={<ApartmentOutlined />} title="الجمعية">
    <Menu.Item key="1">الإدارات</Menu.Item>
    <Menu.Item key="2">الأقسام</Menu.Item>
    <Menu.Item key="3">الوظائف</Menu.Item>
  </SubMenu>
  <SubMenu key="sub2" icon={<UserOutlined />} title="الموظفين">
    <Menu.Item key="5">بيانات الموظفين</Menu.Item>
    <Menu.Item key="6">استقالة موظف</Menu.Item>
  </SubMenu>
  <SubMenu key="sub3" icon={<ProfileOutlined />} title="سير العمل">
    <Menu.Item key="9">أوقات الدوام</Menu.Item>
    <Menu.Item key="10">استثناءات</Menu.Item>
  </SubMenu>
  <SubMenu key="sub4" icon={<SettingOutlined />} title="إدارة النظام">
    <Menu.Item key="11">بيانات عامة</Menu.Item>
    <Menu.Item key="12">نسخة احتياطية</Menu.Item>
  </SubMenu>
</Menu>
</Sider>);
}
};





