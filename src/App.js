/* eslint-disable no-unused-vars */
import { InfoCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  Modal,
  Row,
  Typography,
} from "antd";
import axios from "axios";
import { React, Suspense, useEffect, useState } from "react";
import { CookiesProvider, useCookies } from "react-cookie";
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";
import Assoc from "./assets/images/hekma.png";
import illstarte from "./assets/images/loginM.png";
import logo from "./assets/images/logo.png";
import MainHeader from "./components/Navigation/MainHeader";
import Spinner from "./components/molecules/Spinner";
import ControlPanel from "./scenes/control-panel/";
import Login from "./scenes/login/";
import Profile from "./scenes/profile";

import "antd/dist/reset.css";
import "./App.css";

import { CONTROL_PANEL_ROUTE, LOGIN, PROFILE_ROUTE } from "./routes";

import { Colors, Env } from "./styles";
const { Text } = Typography;

function App() {
  const [cookies, setCookie] = useCookies(["user"]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [setting, setSetting] = useState([]);
  // حالة عرض نافذة التعليمات
  const [isModalVisible, setIsModalVisible] = useState(false);

  let routes;
  const id = cookies.user;

  useEffect(() => {
    axios
      .get(Env.HOST_SERVER_NAME + "setting/" + id?.user_id)
      .then((response) => {
        setSetting(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  const onFinish = (values) => {
    setLoading(true);
    axios
      .post(Env.HOST_SERVER_NAME + `users/login`, values)
      .then(function (response) {
        if (response.data) {
          console.log(response.data);
          setCookie("user", response.data.user);
          setSetting(response.data.settings);
          setUser(response.data);
        } else {
          alert("خطأ في اسم المستخدم أو كلمة المرور!");
          setLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error);
        alert("هناك مشكلة في الاتصال بالسرفر");
        setLoading(false);
      });
  };

  // إظهار النافذة عند النقر
  const showModal = () => {
    setIsModalVisible(true);
  };

  // إخفاء النافذة
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (!id) {
    routes = (
      <Layout className="loginParent" theme="light">
        <Card bordered className="loginBox" style={{ position: "relative" }}>
          {/* أيقونة التعليمات */}
          <div
            className="instructions-icon"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              cursor: "pointer",
            }}
            title="Dawam v2.0.2"
            onClick={showModal}
          >
            <InfoCircleOutlined
              style={{ fontSize: "24px", color: "#1890ff" }}
            />
          </div>
          <Row justify={"space-between"}>
            <Col span={11} className="mainColumn">
              <img
                className="illstarteImage"
                style={{ width: "100%" }}
                src={illstarte}
                alt="صورة توضيحية"
              />
            </Col>
            <Col span={7} className="formColumn">
              <div className="formTitle">
                <img
                  style={{
                    height: "80px",
                    width: "auto",
                    marginLeft: "20px",
                    borderLeft: "2px solid",
                    paddingLeft: "10px",
                  }}
                  src={logo}
                  alt="الشعار"
                />
                <img
                  style={{ height: "80px", width: "auto" }}
                  src={Assoc}
                  alt="الشعار الثاني"
                />
              </div>
              <Form
                name="basic"
                className="loginForm"
                onFinish={onFinish}
                initialValues={{ remember: true }}
              >
                <Form.Item
                  label="الرقم الوظيفي"
                  name="user_id"
                  rules={[
                    {
                      required: true,
                      message: "ادخل رقمك الوظيفي",
                    },
                  ]}
                >
                  <Input style={{ backgroundColor: "#ADD0E6" }} />
                </Form.Item>

                <Form.Item
                  label="كلمة المرور"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "ادخل كلمة المرور",
                    },
                  ]}
                >
                  <Input.Password style={{ backgroundColor: "#ADD0E6" }} />
                </Form.Item>
                <Form.Item className="login-btn">
                  <Button
                    loading={loading}
                    style={{
                      backgroundColor: "#0972B6",
                      color: "#fff",
                      width: "100%",
                      borderColor: "#0972B6",
                    }}
                    htmlType="submit"
                  >
                    تسجيل الدخول
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
        <Row justify="center" className="illustrateBox">
          <img
            className="illstarteImage"
            style={{ width: "100%" }}
            src={illstarte}
            alt="صورة توضيحية"
          />
        </Row>
        <div className="powerd-by">
          <Text>Powered by HYAC Software - V2.0.0</Text>
        </div>
        {/* نافذة التعليمات مع تمكين التمرير عند طول المحتوى */}
        <Modal
          title="Dawam v2.0.2"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          centered
          bodyStyle={{ maxHeight: "400px", overflowY: "auto" }} // تمكين التمرير عند تجاوز المحتوى الحد الأقصى
        >
          <p>آخر التحديثات:</p>
          <ul style={{  color: Colors.GRAY_DARK }}>  
            <li >إصلاح نافذة أرصدة الإجازات وأرصدة الإجازة السنوية</li>
            <li>إضافة خاصية حذف رصيد السنوية</li>
            <li>إصلاح مربعات التاريخ </li>
            <li>إضافة واجهة التحديثات إلى النافذة الرئيسية</li>
          </ul>

        </Modal>
      </Layout>
    );
  } else {
    routes = (
      <Layout
        theme="light"
        style={{ textAlign: "right", fontFamily: "Tajawal", height: "100%" }}
      >
        <MainHeader />
        <Layout>
          <Switch>
            <Route
              path={PROFILE_ROUTE}
              render={() => <Profile setting={setting} userData={id} />}
            />
            <Route
              path={CONTROL_PANEL_ROUTE}
              render={() => <ControlPanel setting={setting} userData={id} />}
            />
            <Route path={LOGIN} component={Login} />
            <Redirect to="/profile" />
          </Switch>
        </Layout>
      </Layout>
    );
  }

  return (
    <CookiesProvider>
      <Router>
        <Suspense fallback={<Spinner />}>{routes}</Suspense>
      </Router>
    </CookiesProvider>
  );
}

export default App;
