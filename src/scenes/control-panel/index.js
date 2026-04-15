import {
  ApartmentOutlined,
  BarChartOutlined,
  BarcodeOutlined,
  CarryOutOutlined,
  DollarCircleOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Drawer, Layout, Menu } from "antd";
import React, { useState } from "react";
import "./style.css";

import {
  Link,
  Redirect,
  Route,
  Switch,
  useLocation,
  useRouteMatch,
} from "react-router-dom";

import DeductionsReport from "../../components/organisms/deductionsReport";
import deptCards from "../../components/organisms/deptCards";
import DiscountsReport from "../../components/organisms/discountsReport";
import EmpCards from "../../components/organisms/empCards";
import Statistics from "../../components/organisms/statistics/";
import AnnualReport from "../../components/organisms/summaryData/annualReport";
import WagesReport from "../../components/organisms/wagesReport";

import DebtReport from "../../components/organisms/debtsReport";
import LongDebtReport from "../../components/organisms/longDebtReport";
import SettingsPane from "../../components/organisms/settingsPane";
import TasksAccounts from "../../components/organisms/tasksAccounts";
import TasksRecords from "../../components/organisms/tasksRecords";
import TransportReport from "../../components/organisms/transportReport";
import TypesTable from "../../components/organisms/typesTable";

import { useCookies } from "react-cookie";
import BonusReport from "../../components/organisms/bonusReport";
import ConnectedDevices from "../../components/organisms/connectedDevices";
import CumTasksReport from "../../components/organisms/cumTasksReport";
import events from "../../components/organisms/events";
import UsersPerformance from "../../components/organisms/usersPerformance";
import ViolationsRecords from "../../components/organisms/violationsRecords";
import ViolationsReport from "../../components/organisms/violationsReport";
import SalariesManagement from "../../components/organisms/salariesManagement";
import WorkTypesTable from "../../components/organisms/workTypesTable";

const { Sider } = Layout;
const { SubMenu } = Menu;

export default function ControlPanel(props) {
  const [visible, setVisible] = useState(false);
  const [cookies] = useCookies(["userId"]);
  const location = useLocation();

  // تحديد العنصر النشط بناءً على المسار الحالي
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.includes("/settings/work-types")) return ["sub23"];
    if (path.includes("/settings/attendance")) return ["sub21"];
    if (path.includes("/settings/backup")) return ["sub22"];
    if (path.includes("/settings")) return ["sub20"];
    if (path.includes("/dept-cards")) return ["2"];
    if (path.includes("/emp-cards")) return ["sub3e"];
    if (path.includes("/salaries-management")) return ["sub3a"];
    if (path.includes("/wages-report")) return ["sub2"];
    if (path.includes("/discounts-reports")) return ["sub1"];
    if (path.includes("/deductions-reports")) return ["sub18"];
    if (path.includes("/bonus-reports")) return ["sub19"];
    if (path.includes("/transport-reports")) return ["sub3"];
    if (path.includes("/cum-tasks-report")) return ["sub8"];
    if (path.includes("/debts-report")) return ["sub5"];
    if (path.includes("/long-debts-report")) return ["sub6"];
    if (path.includes("/types/tasks")) return ["sub17"];
    if (path.includes("/tasks-records")) return ["sub7"];
    if (path.includes("/tasks-accounts")) return ["sub16"];
    if (path.includes("/annual-report")) return ["sub15"];
    if (path.includes("/violations-records")) return ["sub11"];
    if (path.includes("/cum-violation-report")) return ["sub12"];
    if (path.includes("/users-performance-rank")) return ["sub13"];
    if (path.includes("/connected-devices")) return ["sub9"];
    if (path.includes("/events")) return ["sub10"];
    return ["1"]; // الافتراضي
  };

  const menu = () => {
    return (
      <Menu mode="inline" selectedKeys={getSelectedKeys()}>
        {React.createElement(
          collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
          {
            className: "trigger",
            onClick: toggle,
          }
        )}
        <Menu.Item key="1" icon={<BarChartOutlined />}>
          <Link to={url}>بيانات وإحصائيات</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<ApartmentOutlined />}>
          <Link to={`${url}/dept-cards`}>الإدارات</Link>
        </Menu.Item>
        <SubMenu key="3" icon={<UserOutlined />} title="الموظفين">
          <Menu.Item key="sub3e">
            <Link to={`${url}/emp-cards`}>الموظفين</Link>
          </Menu.Item>
          <Menu.Item key="sub3a">
            <Link to={`${url}/salaries-management`}>إدارة الرواتب</Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu key="4" icon={<FileTextOutlined />} title="تقارير وخلاصات">
          <Menu.Item key="sub2">
            <Link to={`${url}/wages-report`}>خلاصة الأجور</Link>
          </Menu.Item>

          <Menu.Item key="sub1">
            <Link to={`${url}/discounts-reports`}>خلاصة الغياب والتأخرات</Link>
          </Menu.Item>

          <Menu.Item key="sub18">
            <Link to={`${url}/deductions-reports`}>خلاصة الاستقطاعات</Link>
          </Menu.Item>

          <Menu.Item key="sub19">
            <Link to={`${url}/bonus-reports`}>تقرير الإضافي</Link>
          </Menu.Item>

          <Menu.Item key="sub3">
            <Link to={`${url}/transport-reports`}>إجمالي المواصلات</Link>
          </Menu.Item>
          <Menu.Item key="sub8">
            {" "}
            <Link to={`${url}/cum-tasks-report`}> تقرير الإجازات </Link>{" "}
          </Menu.Item>
        </SubMenu>
        <SubMenu key="5" icon={<DollarCircleOutlined />} title="السلف والقروض">
          <Menu.Item key="sub5">
            <Link to={`${url}/debts-report`}>السلف نصف الشهرية</Link>
          </Menu.Item>
          <Menu.Item key="sub6">
            <Link to={`${url}/long-debts-report`}>القروض (الأقساط)</Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu key="6" icon={<CarryOutOutlined />} title="الإجازات والمهام">
          <Menu.Item key="sub17">
            {" "}
            <Link to={`${url}/types/tasks`}> أنواع الإجازات </Link>{" "}
          </Menu.Item>
          <Menu.Item key="sub7">
            {" "}
            <Link to={`${url}/tasks-records`}> ترحيل الإجازات </Link>{" "}
          </Menu.Item>
          <Menu.Item key="sub16">
            {" "}
            <Link to={`${url}/tasks-accounts`}> أرصدة الإجازات </Link>{" "}
          </Menu.Item>
          <Menu.Item key="sub15">
            {" "}
            <Link to={`${url}/annual-report`}>تقرير السنوية</Link>{" "}
          </Menu.Item>
        </SubMenu>
        <SubMenu
          key="9"
          icon={<WarningOutlined />}
          title="المخالفات والإنذارات"
        >
          <Menu.Item key="sub11">
            <Link to={`${url}/violations-records`}> ترحيل المخالفات </Link>
          </Menu.Item>
          <Menu.Item key="sub12">
            <Link to={`${url}/cum-violation-report`}> تقرير المخالفات </Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu
          key="10"
          icon={<FileProtectOutlined />}
          title="التقييم والأداء"
        >
          <Menu.Item key="sub13">
            <Link to={`${url}/users-performance-rank`}> تقرير الانضباط </Link>
          </Menu.Item>
          {/* <Menu.Item key="sub14">
        <Link to={`${url}/cum-tasks-report`}  > تقرير الأوسمة  </Link>
        </Menu.Item>
  */}
        </SubMenu>
        <SubMenu key="7" icon={<BarcodeOutlined />} title="أجهزة البصمة">
          <Menu.Item key="sub9">
            <Link to={`${url}/connected-devices`}> الأجهزة المتصلة </Link>
          </Menu.Item>
          <Menu.Item key="sub10">
            <Link to={`${url}/events`}> حركة الأحداث </Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu key="8" icon={<SettingOutlined />} title="التهيئة والإعدادات">
          <Menu.Item key="sub20">
            <Link to={`${url}/settings`}>الإعدادات العامة</Link>
          </Menu.Item>
          <Menu.Item key="sub21">
            <Link to={`${url}/settings/attendance`}>إدارة الدوام</Link>
          </Menu.Item>
          <Menu.Item key="sub23">
            <Link to={`${url}/settings/work-types`}>أنواع الدوام</Link>
          </Menu.Item>
          <Menu.Item key="sub22">
            <Link to={`${url}/settings/backup`}>
              النسخ الاحتياطي والاستعادة
            </Link>
          </Menu.Item>
        </SubMenu>
      </Menu>
    );
  };
  let { path, url } = useRouteMatch();
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const [collapsed, setCollapased] = useState(false);
  const toggle = () => {
    setCollapased(!collapsed);
  };
  return (
    <Layout className="site-layout">
      <Drawer
        className="control-drawer"
        placement={"right"}
        closable={false}
        width={220}
        onClose={onClose}
        visible={visible}
        key={"control-drawer"}
      >
        {menu()}
      </Drawer>
      <Sider
        className="control-menu site-layout-background"
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        {menu()}
      </Sider>
      <Layout>
        {React.createElement(visible ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: "drawer-vis",
          onClick: showDrawer,
        })}
        <Switch>
          {(!props.userData ||
            !(
              props.userData.control_panel == 1 ||
              props.userData.control_panel === 1 ||
              props.userData.general_manager == 1 ||
              props.userData.general_manager === 1
            )) && <Redirect to="/profile" />}
          <Route path={path} exact>
            <Statistics />
          </Route>
          <Route path={`${path}/dept-cards`} component={deptCards} />
          <Route
            path={`${path}/emp-cards`}
            component={() => <EmpCards setting={props.setting} />}
          />
          <Route
            path={`${path}/salaries-management`}
            component={() => <SalariesManagement setting={props.setting} />}
          />
          <Route
            path={`${path}/wages-report`}
            component={() => <WagesReport setting={props.setting} />}
          />
          <Route
            path={`${path}/discounts-reports`}
            component={() => <DiscountsReport setting={props.setting} />}
          />
          <Route
            path={`${path}/deductions-reports`}
            component={() => <DeductionsReport setting={props.setting} />}
          />
          <Route
            path={`${path}/bonus-reports`}
            component={() => <BonusReport setting={props.setting} />}
          />

          <Route
            path={`${path}/debts-report`}
            component={() => <DebtReport setting={props.setting} />}
          />
          <Route
            path={`${path}/tasks-records`}
            component={() => <TasksRecords setting={props.setting} />}
          />
          <Route
            path={`${path}/tasks-accounts`}
            component={() => <TasksAccounts setting={props.setting} />}
          />
          <Route
            path={`${path}/annual-report`}
            component={() => <AnnualReport setting={props.setting} />}
          />

          <Route
            path={`${path}/types/:category`}
            component={() => (
              <TypesTable setting={props.setting} user={props.userData} />
            )}
          />
          <Route
            path={`${path}/violations-records`}
            component={() => (
              <ViolationsRecords
                setting={props.setting}
                user={cookies.user}
                type="Admin"
              />
            )}
          />
          <Route
            path={`${path}/cum-violation-report`}
            component={() => <ViolationsReport setting={props.setting} />}
          />
          <Route
            path={`${path}/cum-tasks-report`}
            component={() => <CumTasksReport setting={props.setting} />}
          />
          <Route
            path={`${path}/long-debts-report`}
            component={() => <LongDebtReport setting={props.setting} />}
          />
          <Route
            path={`${path}/transport-reports`}
            component={() => <TransportReport setting={props.setting} />}
          />
          <Route
            path={`${path}/connected-devices`}
            component={() => <ConnectedDevices setting={props.setting} />}
          />
          <Route
            path={`${path}/users-performance-rank`}
            component={() => (
              <UsersPerformance type="Admin" setting={props.setting} />
            )}
          />
          <Route path={`${path}/events`} component={events} />
          <Route path={`${path}/settings`}>
            <SettingsPane setting={props.setting} />
          </Route>
        </Switch>
      </Layout>
    </Layout>
  );
}
