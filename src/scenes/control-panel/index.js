import React, { useState } from 'react';
import { Typography ,Layout,Menu, Drawer} from 'antd';
import './style.css';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    ApartmentOutlined,
    SettingOutlined,
    DollarCircleOutlined,
    FileTextOutlined,
    WarningOutlined,
    FileProtectOutlined, 
    BarcodeOutlined,
    BarChartOutlined,
    CarryOutOutlined,
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
import deptCards from '../../components/organisms/deptCards';
import WagesReport from '../../components/organisms/wagesReport';
import discountsReport from '../../components/organisms/discountsReport';
import debtReport from '../../components/organisms/debtsReport';
import longDebtReport from '../../components/organisms/longDebtReport';
import transportReport from '../../components/organisms/transportReport';
import SettingsPane from '../../components/organisms/SettingsPane';
import tasksRecords from '../../components/organisms/tasksRecords';
import tasksAccounts from '../../components/organisms/tasksAccounts';

import violationsRecords from '../../components/organisms/violationsRecords';
import connectedDevices from '../../components/organisms/connectedDevices';
import events from '../../components/organisms/events';
import cumTasksReport from '../../components/organisms/cumTasksReport';
import violationsReport from '../../components/organisms/violationsReport';
import usersPerformance from '../../components/organisms/usersPerformance';

import {STATISTICS} from '../../routes';
const { Content } = Layout;
const { Text } = Typography;
const { Sider } = Layout;
const { SubMenu } = Menu;

export default function ControlPanel(props){
  const [visible, setVisible] = useState(false);

  let { path, url } = useRouteMatch(); 
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

   const [collapsed,setCollapased]=useState(false);
  const toggle = () => {
    setCollapased(!collapsed); 
  };
 return(
    <Layout className="site-layout">
      <Drawer
      className='control-drawer'
placement={'right'}
closable={false}
onClose={onClose}
visible={visible}
key={'control-drawer'}
>
<Menu
  mode="inline"
  defaultSelectedKeys={['1']}
>
    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
      className: 'trigger',
      onClick: toggle,
    })}
  <Menu.Item key="1" icon={<BarChartOutlined />}>
  <Link to={url}>
  بيانات وإحصائيات
  </Link>
  </Menu.Item>
  <Menu.Item key="2" icon={<ApartmentOutlined />}>
  <Link to={`${url}/dept-cards`} >
   الإدارات
  </Link> 
  </Menu.Item>
  <Menu.Item key="3"  icon={<UserOutlined />} >
  <Link to={`${url}/emp-cards`} >
   الموظفين
  </Link>
  </Menu.Item>
  <SubMenu key="4" icon={<FileTextOutlined />} title="تقارير وخلاصات">
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
  <SubMenu key="5" icon={<DollarCircleOutlined />} title="السلف والقروض">
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
  <SubMenu key="6" icon={<CarryOutOutlined />} title="الإجازات والمهام">
       <Menu.Item key="sub7">
        <Link to={`${url}/tasks-records`}  > ترحيل الإجازات    </Link>
        </Menu.Item>
        <Menu.Item key="sub8">
        <Link to={`${url}/cum-tasks-report`}  > تقرير الإجازات  </Link>
        </Menu.Item>
  </SubMenu>
  <SubMenu key="9" icon={<WarningOutlined />} title="المخالفات والإنذارات">
       <Menu.Item key="sub11">
        <Link to={`${url}/violations-records`}  > ترحيل المخالفات    </Link>
        </Menu.Item>
        <Menu.Item key="sub12">
        <Link to={`${url}/cum-violation-report`}  > تقرير المخالفات  </Link>
        </Menu.Item>
  </SubMenu>
  <SubMenu key="10" icon={<FileProtectOutlined />} title="التقييم والأداء">
       <Menu.Item key="sub13">
        <Link to={`${url}/tasks-records`}  > تقرير الانضباط     </Link>
        </Menu.Item>
        <Menu.Item key="sub14">
        <Link to={`${url}/cum-tasks-report`}  > تقرير الأوسمة  </Link>
        </Menu.Item>
        <Menu.Item key="sub15">
        <Link to={`${url}/cum-tasks-report`}  > تقرير الأداء  </Link>
        </Menu.Item>
        </SubMenu>
  <SubMenu key="7" icon={<BarcodeOutlined />} title="أجهزة البصمة">
       <Menu.Item key="sub9">
        <Link to={`${url}/connected-devices`}  > الأجهزة المتصلة    </Link>
        </Menu.Item>
        <Menu.Item key="sub10">
        <Link to={`${url}/events`}  >  حركة الأحداث  </Link>
        </Menu.Item>
  </SubMenu>
  <Menu.Item key="8" icon={<SettingOutlined />} >
  <Link to={`${url}/settings`} >
التهيئة والإعدادات
  </Link>
  </Menu.Item>
</Menu>
</Drawer>
    <Sider className='control-menu site-layout-background' trigger={null} collapsible collapsed={collapsed}>
<Menu
  mode="inline"
  defaultSelectedKeys={['1']}
>
    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
      className: 'trigger',
      onClick: toggle,
    })}
  <Menu.Item key="1" icon={<BarChartOutlined />}>
  <Link to={url}>
  بيانات وإحصائيات
  </Link>
  </Menu.Item>
  <Menu.Item key="2" icon={<ApartmentOutlined />}>
  <Link to={`${url}/dept-cards`} >
   الإدارات
  </Link> 
  </Menu.Item>
  <Menu.Item key="3"  icon={<UserOutlined />} >
  <Link to={`${url}/emp-cards`} >
   الموظفين
  </Link>
  </Menu.Item>
  <SubMenu key="4" icon={<FileTextOutlined />} title="تقارير وخلاصات">
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
  <SubMenu key="5" icon={<DollarCircleOutlined />} title="السلف والقروض">
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
  <SubMenu key="6" icon={<CarryOutOutlined />} title="الإجازات والمهام">
       <Menu.Item key="sub7">
        <Link to={`${url}/tasks-records`}  > ترحيل الإجازات    </Link>
        </Menu.Item>
        <Menu.Item key="sub16">
        <Link to={`${url}/tasks-accounts`}  > أرصدة الإجازات    </Link>
        </Menu.Item>
        <Menu.Item key="sub8">
        <Link to={`${url}/cum-tasks-report`}  > تقرير الإجازات  </Link>
        </Menu.Item>
  </SubMenu>
  <SubMenu key="9" icon={<WarningOutlined />} title="المخالفات والإنذارات">
       <Menu.Item key="sub11">
        <Link to={`${url}/violations-records`}  > ترحيل المخالفات    </Link>
        </Menu.Item>
        <Menu.Item key="sub12">
        <Link to={`${url}/cum-violation-report`}  > تقرير المخالفات  </Link>
        </Menu.Item>
  </SubMenu>
  <SubMenu key="10" icon={<FileProtectOutlined />} title="التقييم والأداء">
       <Menu.Item key="sub13">
        <Link to={`${url}/users-performance-rank`}  > تقرير الانضباط     </Link>
        </Menu.Item>
        <Menu.Item key="sub14">
        <Link to={`${url}/cum-tasks-report`}  > تقرير الأوسمة  </Link>
        </Menu.Item>
        <Menu.Item key="sub15">
        <Link to={`${url}/cum-tasks-report`}  > تقرير الأداء  </Link>
        </Menu.Item>
        </SubMenu>
  <SubMenu key="7" icon={<BarcodeOutlined />} title="أجهزة البصمة">
       <Menu.Item key="sub9">
        <Link to={`${url}/connected-devices`}  > الأجهزة المتصلة    </Link>
        </Menu.Item>
        <Menu.Item key="sub10">
        <Link to={`${url}/events`}  >  حركة الأحداث  </Link>
        </Menu.Item>
  </SubMenu>
  <Menu.Item key="8" icon={<SettingOutlined />} >
  <Link to={`${url}/settings`} >
التهيئة والإعدادات
  </Link>
  </Menu.Item>
</Menu>

</Sider>
    <Layout>
    {React.createElement(visible ? MenuUnfoldOutlined : MenuFoldOutlined, {
      className: 'drawer-vis',
      onClick: showDrawer,
    })}    
    <Switch>
          <Route path={path} exact>
            <Statistics/>
          </Route>
          <Route path={`${path}/dept-cards`} component={deptCards} />
          <Route path={`${path}/emp-cards`} component={()=> <EmpCards setting={props.setting}/> } />
          <Route path={`${path}/wages-report`} component={()=> <WagesReport setting={props.setting}/>} />       
          <Route path={`${path}/discounts-reports`} component={discountsReport} />         
          <Route path={`${path}/debts-report`} component={debtReport} /> 
          <Route path={`${path}/tasks-records`} component={tasksRecords} /> 
          <Route path={`${path}/tasks-accounts`} component={tasksAccounts} /> 

          <Route path={`${path}/violations-records`} component={violationsRecords} />
          <Route path={`${path}/cum-violation-report`} component={violationsReport} />    
          <Route path={`${path}/cum-tasks-report`} component={cumTasksReport} />   
          <Route path={`${path}/long-debts-report`} component={longDebtReport} />       
          <Route path={`${path}/transport-reports`} component={transportReport} />   
          <Route path={`${path}/connected-devices`} component={connectedDevices} />
          <Route path={`${path}/users-performance-rank`} component={usersPerformance} />         
          <Route path={`${path}/events`} component={events} />               
          <Route path={`${path}/settings`}  >
            <SettingsPane setting={props.setting}/>
          </Route>
        </Switch>
        </Layout>
  </Layout>
);
}