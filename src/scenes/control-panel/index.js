import React, { useState } from 'react';
import { Typography ,Layout,Menu} from 'antd';
import './style.css';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    ApartmentOutlined,
    SettingOutlined,
    DollarCircleOutlined,
    FileTextOutlined,
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
import wagesReport from '../../components/organisms/wagesReport';
import discountsReport from '../../components/organisms/discountsReport';
import debtReport from '../../components/organisms/debtsReport';
import longDebtReport from '../../components/organisms/longDebtReport';
import transportReport from '../../components/organisms/transportReport';
import settingsPane from '../../components/organisms/settingsPane';
import {STATISTICS} from '../../routes';
const { Content } = Layout;
const { Text } = Typography;
const { Sider } = Layout;
const { SubMenu } = Menu;

export default function ControlPanel(props){

  let { path, url } = useRouteMatch(); 

   const [collapsed,setCollapased]=useState(false);
  const toggle = () => {
    setCollapased(!collapsed); 
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
  <Link to={url}>
  بيانات وإحصائيات
  </Link>
  </Menu.Item>
  <Menu.Item key="2" icon={<ApartmentOutlined />}>
   الإدارات 
  </Menu.Item>
  <Menu.Item key="3"  icon={<UserOutlined />} >
  <Link to={`${url}/emp-cards`} >
   الموظفين
  </Link>
  </Menu.Item>
  <SubMenu key="4" icon={<FileTextOutlined />} title="تقارير">
       <Menu.Item key="sub1">
        <Link to={`${url}/discounts-reports`} >
          خلاصة الغياب والتأخرات
        </Link>
        </Menu.Item>
        <Menu.Item key="sub2">
        <Link to={`${url}/wages-report`} >
          خلاصة الأجور
        </Link>
        </Menu.Item>
        <Menu.Item key="sub3">
        <Link to={`${url}/transport-reports`} >
         إجمالي المواصلات
        </Link>
        </Menu.Item>
        <Menu.Item key="sub4">الدوام الإضافي</Menu.Item>
  </SubMenu> 
  <SubMenu key="" icon={<DollarCircleOutlined />} title="السلف والقروض">
       <Menu.Item key="sub5">
        <Link to={`${url}/debts-report`}  >
السلف نصف الشهرية        
</Link>
        </Menu.Item>
        <Menu.Item key="sub6">
        <Link to={`${url}/long-debts-report`}  >
         القروض (الأقساط) 
        </Link>
        </Menu.Item>
  </SubMenu> 
  <Menu.Item key="6" icon={<SettingOutlined />} >
  <Link to={`${url}/settings`} >
التهيئة والإعدادات
  </Link>
  </Menu.Item>
</Menu>
</Sider>
    <Layout>    
    <Switch>
          <Route path={path} exact>
            <Statistics/>
          </Route>
          <Route path={`${path}/emp-cards`} component={EmpCards} />
          <Route path={`${path}/wages-report`} component={wagesReport} />       
          <Route path={`${path}/discounts-reports`} component={discountsReport} />         
          <Route path={`${path}/debts-report`} component={debtReport} />  
          <Route path={`${path}/long-debts-report`} component={longDebtReport} />       
          <Route path={`${path}/transport-reports`} component={transportReport} />         
          <Route path={`${path}/settings`} component={settingsPane} />
        </Switch>
        </Layout>
  </Layout>
);
}