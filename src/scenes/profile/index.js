import dayjs from "dayjs";
import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router-dom";
import { Env } from "../../styles";
import "./style.css";

import {
  ApartmentOutlined,
  CarOutlined,
  ClusterOutlined,
  DollarCircleOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InsertRowAboveOutlined,
  LineChartOutlined,
  PlusCircleOutlined,
  SnippetsOutlined,
  StarOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Form,
  Input,
  Layout,
  Rate,
  Row,
  Tabs,
  Typography,
} from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../firebase/FirebaseServices";
import { Redirect, Route, Switch } from "react-router-dom";
import Spinner from "../../components/molecules/Spinner";

import AlertsTable from "../../components/organisms/alertsTable";
import AttendanceTable from "../../components/organisms/attendanceTable";
import AwardsSystem from "../../components/organisms/awardsSystem";
import BonusTable from "../../components/organisms/bonusTable";
import DeptsTable from "../../components/organisms/deptsTable";
import EmployeeModal from "../../components/organisms/empCards/EmployeeModal";
import GeneralTable from "../../components/organisms/generalTable";
import SummaryData from "../../components/organisms/summaryData";
import TasksRequests from "../../components/organisms/tasksRequests";
import TasksTable from "../../components/organisms/tasksTable";
import TransferTable from "../../components/organisms/transferTable";
import UsersPerformance from "../../components/organisms/usersPerformance";
import ViolationsRecords from "../../components/organisms/violationsRecords";
import SpiderChart from '../../components/SpiderChart';

import { Link, useRouteMatch } from "react-router-dom";
const { Content } = Layout;
const { TabPane } = Tabs;
const { Text } = Typography;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

export default function Profile(props) {
  let { path, url } = useRouteMatch();

  const [cookies, setCookie, removeCookie] = useCookies(["userId"]);
  const [type, setType] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const location = useLocation();

  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [load, setLoad] = useState(true);

  const [data, setData] = useState([]);

  const [categories, setCategories] = useState([]);
  const [durations, setDurations] = useState([]);
  const [types, setTypes] = useState([]);

  const [phones, setPhones] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [preworks, setPreworks] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [userFormDisable, setUserFormDisable] = useState(true);
  const [setting, setSetting] = useState([]);

  const [start, setStart] = useState(
    new Date(new Date().setDate(new Date().getDate() - 31))
      .toISOString()
      .slice(0, 10)
  );
  const [end, setEnd] = useState(
    new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .slice(0, 10)
  );
  // const [start,setStart]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
  // const [end,setEnd]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));

  const [star, setStar] = useState(0);
  const [spiderData, setSpiderData] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);

  const [modalLoad, setModalLoad] = useState(false);
  function callback(key) {
    // console.log(key);
  }
  const UploadProps = {
    showUploadList: {
      showRemoveIcon: true,
      showDownloadIcon: true,
      downloadIcon: "Download",
    },
  };
  //console.log(cookies.user);
  let user = props.userData;
  // let  user=location.userData;
  if (location.userData != null) user = location.userData;

  const openShowUser = () => {
    // console.log(Object.keys(user).map((key) => [Number(key), user[key]]));
    var user = data;
    var birth = user.birth_date;
    var assign = user.assignment_date;
    userform.setFieldsValue(user);
    userform.setFieldsValue({ birth_date: dayjs(birth, "YYYY-MM-DD") });
    userform.setFieldsValue({ assignment_date: dayjs(assign, "YYYY-MM-DD") });
    userform.setFieldsValue({ password: null });
    setIsVisibleModal(true);

    var conts = phones;
    conts = conts.filter(function (e) {
      return e.user_id == user.id;
    });
    userform.setFieldsValue({ contacts: conts });

    var quals = qualifications;
    quals = quals.filter(function (e) {
      return e.user_id == user.id;
    });

    quals.forEach((element) => {
      element.qual_year = dayjs(element.qual_year, "YYYY");
    });
    userform.setFieldsValue({ qualifications: quals });
    //setQualifications(quals);

    var pworks = preworks;
    pworks = pworks.filter(function (e) {
      return e.user_id == user.id;
    });
    pworks.forEach((element) => {
      element.work_period = [
        dayjs(element.date_from, "YYYY"),
        dayjs(element.date_to, "YYYY"),
      ];
    });
    userform.setFieldsValue({ preworks: pworks });
    //setPreworks(pworks);

    //------------------------------------------
    var attachs = attachments;
    attachs = attachs.filter(function (e) {
      return e.user_id == user.id;
    });
    userform.setFieldsValue({ attachments: attachs });
    setPreworks(pworks);
    //-----------------------------
  };
  useEffect(() => {
    FirebaseServices.getSalaryInfoForPeriod(user.user_id, start, end)
      .then(dataBody => {
        // Calculate Star Rating (Evaluation Score) if logic differs or use response data directly if calculated in backend
        // Old frontend logic:
        // setStar(1-((parseFloat(response.data.lists[0].lateTimePrice || 0)+parseInt(Math.round(((response.data.count[0].count-(response.data.lists[0]['attendanceDays'] || 0))*( response.data.lists[0].salary/response.data.count[0].count)))))/(response.data.lists[0].salary )));

        // Using safe access with optional chaining
        const list = dataBody.lists && dataBody.lists[0] ? dataBody.lists[0] : {};
        const count = dataBody.count && dataBody.count[0] ? dataBody.count[0].count : 30; // Default 30 to avoid div by zero

        const salary = parseFloat(list.salary || 0);
        if (salary > 0) {
          const latePrice = parseFloat(list.lateTimePrice || 0);
          const attDays = parseFloat(list.attendanceDays || 0);
          const absentDays = count - attDays;
          const absentPrice = Math.round(absentDays * (salary / count));

          const totalDeduction = latePrice + absentPrice;
          const starRating = 1 - (totalDeduction / salary);
          setStar(starRating > 0 ? starRating : 0);
        } else {
          setStar(0);
        }


        setSpiderData([
          Math.round(dataBody.att_count[0].att_count / dataBody.att_count[0].count * 100) || 0,
          Math.round(dataBody.id_count[0].id_count / dataBody.id_count[0].count * 100) || 0,
          Math.round(dataBody.leave_count[0].leave_count / dataBody.leave_count[0].count * 100) || 0,
          Math.round((dataBody.lists[0]?.attendanceDays || 0) / dataBody.count[0].count * 100) || 0,
          // Using vac_count array structure
          Math.round((dataBody.vac_count[0]?.late_vacs || 0) / (dataBody.vac_count[0]?.count || 1) * 100) || 100

        ]);

        setAttendanceData(dataBody);


      }).catch(function (error) {
        console.log(error);
      });

    FirebaseServices.getUsersInfo()
      .then((dataBody) => {
        setCategories(dataBody["categroies"]);
        setDurations(dataBody["durations"]);
        setTypes(dataBody["types"]);
      })
      .catch(function (error) {
        console.log(error);
      });
    FirebaseServices.getUserDataComplete(user.id)
      .then((dataBody) => {
        setData(dataBody["user"]);
        setPhones(dataBody["phones"] || []);
        setQualifications(dataBody["qualifications"] || []);
        setPreworks(dataBody["preworks"] || []);
        setAttachments(dataBody["attachments"] || []);
        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
      });

    FirebaseServices.getUserType(props.userData.id)
      .then((data) => {
        setType(data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [start, end]);

  const config = {
    options: {
      chart: {
        dropShadow: {
          enabled: true,
          blur: 1,
          left: 1,
          top: 1,
        },
      },
      dataLabels: {
        enabled: true,
        background: {
          enabled: true,
          borderRadius: 2,
        },
      },
      xaxis: {
        categories: [
          "الحضور المبكر",
          "الانضباط",
          "الانصراف",
          "نسبة أيام الحضور",
          "احترام النظام",
        ],
        labels: {
          show: true,
          style: {
            colors: ["#808080"],
            fontSize: "11px",
            fontFamily:
              "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          },
        },
      },
      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 5,
      },
      colors: ["#0972B6", "#002612"],
      stroke: {
        width: 1,
      },
      fill: {
        opacity: 0.5,
      },
      markers: {
        size: 5,
      },
    },
    series: [
      {
        name: "النسبة",
        data: spiderData,
      },
    ],
  };

  const [filter, setFilter] = useState(config.series);
  const handleSizeChange = (e) => {
    setFilter([{ name: "أسامة جليل", data: [90, 60, 70, 80] }]);
  };

  const requestPane = () => {
    if (
      (props.userData && props.userData?.role_id == 1) ||
      (type && type != 3) ||
      props.userData?.general_manager == 1
    ) {
      return (
        <TabPane
          tab={
            <Link to={`${url}/tasks-requests`}>
              <span>
                <SnippetsOutlined />
                المراجعات
              </span>
            </Link>
          }
          key="6"
        ></TabPane>
      );
    }
  };
  const showModal = () => {
    setIsVisibleModal(true);
  };

  const handleOk = () => {
    setIsVisibleModal(false);
  };

  const handleCancel = () => {
    setIsVisibleModal(false);
  };
  const onFinish = () => { };
  const getCurrentTab = () => {
    switch (location.pathname) {
      case "/profile":
        return "1";
      case "/profile/general-table":
        return "2";
      case "/profile/attendance-table":
        return "3";
      case "/profile/transfer-table":
        return "4";
      case "/profile/tasks-table":
        return "5";
      case "/profile/tasks-requests":
        return "6";
      case "/profile/alerts":
        return "7";
      case "/profile/depts-table":
        return "8";
      case "/profile/dept-violations":
        return "9";
      case "/profile/dept-performance":
        return "10";
      case "/profile/bonus-time":
        return "11";
    }
  };
  const [userform] = Form.useForm();

  const clampPercent = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  };

  const starPercent = clampPercent(Math.round((Number(star) || 0) * 100));
  const starRateValue = Math.max(0, Math.min(5, Math.round((starPercent / 20) * 2) / 2));

  if (!user) {
    return (
      <Layout className="site-layout">
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spinner />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="site-layout">
      <Card
        className="site-layout-card"
        style={{
          margin: "10px 16px",
          padding: 0,
          height: "auto",
        }}
      >
        <Row className="userProfile">
          <EmployeeModal
            isVisibleModal={isVisibleModal}
            onCancel={function () {
              userform.resetFields();
              setIsVisibleModal(false);
            }}
            onFinish={function () {
              setModalLoad(true);
              onFinish();
            }}
            modalLoad={modalLoad}
            userFormDisable={userFormDisable}
            selectedUser={null}
            user={user}
            userform={userform}
            types={types}
            categories={categories}
            durations={durations}
            attachments={attachments}
            UploadProps={UploadProps}
            callback={callback}
          />
          <Col
            style={{ display: "flex", flexDirection: "column" }}
            xs={24}
            sm={24}
            md={6}
            lg={6}
            xl={6}
          >
            <Avatar
              size={{ xs: 100, sm: 100, md: 130, lg: 150, xl: 150, xxl: 150 }}
              src={Env.HOST_SERVER_STORAGE + (user?.avatar || "")}
              style={{ display: "block", margin: "10px", alignSelf: "center" }}
            />
            <Text
              style={{
                textAlign: "center",
                fontSize: "20px",
                marginBottom: "10px",
              }}
            >
              {user?.user_name || user?.name} <Badge status="success" />
            </Text>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <Badge
                count={user?.user_id}
                overflowCount={99999}
                style={{ backgroundColor: "#DDDDDD", color: "#000" }}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <Button type="primary" onClick={() => openShowUser()}>
                الملف الوظيفي {props.aboutProps}
              </Button>
            </div>
          </Col>

          <Col className="userData" xs={24} sm={24} md={10} lg={10} xl={10}>
            <div className="taggedInfo">
              <Text>
                <ClusterOutlined /> {user?.category?.name || "بدون إدارة"}{" "}
              </Text>
            </div>
            <div className="taggedInfo">
              <Text>
                <TagsOutlined />
                {user?.job || "بدون وظيفة"}
              </Text>
            </div>
            <div
              className="taggedInfo"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <Text>
                <DollarCircleOutlined /> الراتب:
              </Text>
              <Input
                bordered={false}
                style={{
                  width: "100px",
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  padding: 0,
                  backgroundColor: "transparent",
                }}
                readOnly={true}
                value={new Intl.NumberFormat("en-EN").format(user?.salary || 0)}
                type="text"
              />
            </div>
            <div className="taggedInfo" style={{ marginTop: "10px" }}>
              <Rate disabled allowHalf value={starRateValue} />{" "}
              {starPercent}%
            </div>

            {/* نظام الجوائز الجديد مع التصميم الأصلي */}
            <AwardsSystem
              userData={user}
              attendanceData={attendanceData}
              setting={props.setting || []}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={8}
            lg={8}
            xl={8}
            style={{ textAlign: "center", marginBottom: "-50px" }}
          >
            <div className="spider" style={{ width: "100%", maxWidth: "360px", margin: "0 auto" }}>
              <div className='spider'>
                <SpiderChart data={spiderData} />
              </div>
            </div>
          </Col>
        </Row>
        <Row className="profile-row">
          <Tabs
            className="profile-tabs"
            style={{ paddingRight: "10px", width: "100%" }}
            tabPosition="bottom"
            activeKey={getCurrentTab()}
          >
            <TabPane
              tab={
                <Link
                  to={url}
                  hidden={location.userData != null ? true : false}
                >
                  <span>
                    <LineChartOutlined />
                    إحصائيات
                  </span>
                </Link>
              }
              key="1"
            ></TabPane>
            <TabPane
              tab={
                <Link
                  to={`${url}/general-table`}
                  hidden={location.userData != null ? true : false}
                >
                  <span>
                    <UnorderedListOutlined />
                    السجل العام
                  </span>
                </Link>
              }
              key="2"
              active={true}
            ></TabPane>
            <TabPane
              tab={
                <Link
                  to={`${url}/depts-table`}
                  hidden={location.userData != null ? true : false}
                >
                  <span>
                    <ApartmentOutlined />
                    سجل الإدارات
                  </span>
                </Link>
              }
              key="8"
            ></TabPane>

            {type != 3 && (
              <TabPane
                tab={
                  <Link to={`${url}/dept-performance`}>
                    <span>
                      <StarOutlined />
                      انضباط الموظفين
                    </span>
                  </Link>
                }
                key="10"
              ></TabPane>
            )}

            <TabPane
              tab={
                <Link to={`${url}/attendance-table`}>
                  <span>
                    <InsertRowAboveOutlined />
                    سجل حضوري
                  </span>
                </Link>
              }
              key="3"
            ></TabPane>

            <TabPane
              tab={
                <Link to={`${url}/bonus-time`}>
                  <span>
                    <PlusCircleOutlined />
                    الدوام الإضافي
                  </span>
                </Link>
              }
              key="11"
            ></TabPane>
            {props.setting &&
              props.setting.filter((item) => item.key == "admin.transports")[0]
                ?.value == 1 && (
                <TabPane
                  tab={
                    <Link to={`${url}/transfer-table`}>
                      <span>
                        <CarOutlined />
                        المواصلات
                      </span>
                    </Link>
                  }
                  key="4"
                ></TabPane>
              )}

            <TabPane
              tab={
                <Link to={`${url}/tasks-table`}>
                  <span>
                    <EditOutlined />
                    الإجازات والمهام
                  </span>
                </Link>
              }
              key="5"
            ></TabPane>

            {requestPane()}

            {
              <TabPane
                tab={
                  <Link to={`${url}/dept-violations`}>
                    <span>
                      <WarningOutlined />
                      المخالفات
                    </span>
                  </Link>
                }
                key="9"
              ></TabPane>
            }

            <TabPane
              tab={
                <Link
                  to={`${url}/alerts`}
                  hidden={location.userData != null ? true : false}
                >
                  <span>
                    <span className="anticon anticon-snippets">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-bell"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                      </svg>
                    </span>
                    الإشعارات
                  </span>
                </Link>
              }
              key="7"
            ></TabPane>
          </Tabs>
        </Row>
      </Card>
      <Layout
        style={{
          margin: "0px 16px",
          padding: 0,
          height: "auto",
        }}
      >
        <Switch>
          <Route path={path} exact>
            <SummaryData
              spiderData={spiderData}
              showModal={openShowUser}
              setting={setting}
              userData={user}
              star={star}
            />
          </Route>
          <Route path={`${path}/general-table`}>
            <GeneralTable setting={props.setting} user={user} />
          </Route>
          <Route path={`${path}/depts-table`}>
            <DeptsTable setting={props.setting} />
          </Route>
          <Route
            path={`${path}/attendance-table`}
            component={() => (
              <AttendanceTable setting={props.setting} user={cookies.user} />
            )}
          />
          <Route
            path={`${path}/transfer-table`}
            component={() => (
              <TransferTable setting={props.setting} user={cookies.user} />
            )}
          />
          <Route
            path={`${path}/tasks-table`}
            component={() => (
              <TasksTable setting={props.setting} user={cookies.user} />
            )}
          />
          <Route
            path={`${path}/tasks-requests`}
            component={() => (
              <TasksRequests setting={props.setting} user={cookies.user} />
            )}
          />
          <Route
            path={`${path}/dept-violations`}
            component={() => (
              <ViolationsRecords
                setting={props.setting}
                type="Manager"
                user={cookies.user}
              />
            )}
          />

          <Route
            path={`${path}/dept-performance`}
            component={() => (
              <UsersPerformance
                setting={props.setting}
                type="Manager"
                user={cookies.user}
              />
            )}
          />
          <Route
            path={`${path}/bonus-time`}
            component={() => (
              <BonusTable
                setting={props.setting}
                type="Manager"
                user={cookies.user}
              />
            )}
          />

          <Route
            path={`${path}/alerts`}
            component={() => (
              <AlertsTable
                type="Manager"
                setting={props.setting}
                user={cookies.user}
              />
            )}
          />
          <Redirect to="" />
        </Switch>
      </Layout>
    </Layout>
  );
}
