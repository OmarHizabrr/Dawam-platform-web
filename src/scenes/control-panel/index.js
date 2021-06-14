import React, { useState } from 'react';
import { Typography ,Layout,Menu} from 'antd';
import './style.css';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    ApartmentOutlined,
    SettingOutlined,
  } from '@ant-design/icons';

  import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    Link,
    useRouteMatch
  } from "react-router-dom";
import Statistics from '../../components/organisms/statistics/';
import EmpCards from '../../components/organisms/empCards';
import {STATISTICS} from '../../routes';
const { Content } = Layout;
const { Text } = Typography;
const { Sider } = Layout;
const { SubMenu } = Menu;

export default function ControlPanel(props){

  let { path, url } = useRouteMatch(); 

   const [collapsed,setCollapased]=useState(false);
  const toggle = () => {
    setCollapased(collapsed); 
  };
 return(
    <Layout className="site-layout">
    <Sider style={{height:"100%"}} width={200} trigger={null} collapsible collapsed={collapsed} className="site-layout-background">
<Menu
  mode="inline"
  defaultSelectedKeys={['1']}
  style={{ height: '100%', borderRight: 0 }}
>
    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
      className: 'trigger',
      onClick: toggle,
    })}
  <Menu.Item key="1" icon={<ApartmentOutlined />}>
  بيانات وإحصائيات
  </Menu.Item>
  <Menu.Item key="2" icon={<ApartmentOutlined />}>
   الإدارات 
  </Menu.Item>
  <Menu.Item key="3"  icon={<UserOutlined />} >
  <Link to={`${url}/emp-cards`} >
   الموظفين
  </Link>
  </Menu.Item>
  <Menu.Item key="4" icon={<SettingOutlined />} >
  الإعدادات
  </Menu.Item>
</Menu>
</Sider>
    <Layout>    
    <Switch>
          <Route path={path} exact>
            <Statistics/>
          </Route>
          <Route path={`${path}/emp-cards`} component={EmpCards} />
          <Redirect to="" />
        </Switch>
        </Layout>
  </Layout>
);
}