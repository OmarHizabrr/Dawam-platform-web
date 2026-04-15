/* eslint-disable no-unused-vars */
import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Carousel,
  Col,
  ConfigProvider,
  Form,
  Input,
  Layout,
  Modal,
  Row,
  Typography,
  message,
  theme,
} from "antd";
import { FirebaseServices } from "./firebase/FirebaseServices";
import dayjs from "dayjs";
import { Suspense, useEffect, useMemo, useState } from "react";
import firebase from 'firebase/app';
import 'firebase/firestore';
import { db } from "./firebase/firebaseConfig";
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
import Profile from "./scenes/profile";
import ControlPanel from "./scenes/control-panel";
import Login from "./scenes/login";
import AccountsList from "./scenes/accounts-list";
import CreateCompany from "./scenes/create-company";

import "antd/dist/reset.css";
import "./App.css";

import { CONTROL_PANEL_ROUTE, LOGIN, PROFILE_ROUTE } from "./routes";

const { Text, Title } = Typography;

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(["user", "remember"]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [setting, setSetting] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(localStorage.getItem('selectedAccountId'));
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  const id = cookies.user;

  // Theme tokens and RTL
  const antdTheme = useMemo(
    () => ({
      algorithm: theme.defaultAlgorithm,
      token: {
        colorPrimary: "#2563eb",
        colorInfo: "#2563eb",
        borderRadius: 12,
        fontFamily:
          "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      },
      direction: "rtl",
    }),
    []
  );

  useEffect(() => {
    if (!id?.user_id) return;
    FirebaseServices.getSetting(id.user_id)
      .then((data) => {
        setSetting(data);
      })
      .catch((error) => {
        message.warning("تعذر جلب الإعدادات، سيتم المحاولة لاحقًا.");
        console.log(error);
      });
  }, [id?.user_id]);

  const onFinish = async (values) => {
    if (loading) return;
    setLoading(true);
    try {
      const { user_id, password, remember } = values;

      const usersQuery = db.collectionGroup('employees').where('user_id', '==', user_id);
      const querySnapshot = await usersQuery.get();

      const userDoc = querySnapshot.docs.find(d => d.data().password === password);

      if (userDoc) {
        const userDataFromDb = userDoc.data();
        userDataFromDb.id = userDoc.id;

        const accountIdFromPath = userDoc.ref.parent.parent?.id || "default";

        const finalUserData = {
          ...userDataFromDb,
          account_id: accountIdFromPath
        };

        localStorage.setItem('userData', JSON.stringify(finalUserData));

        setCookie("user", finalUserData, {
          path: "/",
          sameSite: "lax",
          maxAge: remember ? 60 * 60 * 24 * 14 : undefined,
        });

        if (remember) {
          setCookie("remember", "1", {
            path: "/",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 14,
          });
        } else {
          removeCookie("remember");
        }

        const settingsSnap = await db.collection(`accounts/${accountIdFromPath}/settings`).get();
        const settingsArray = settingsSnap.docs.map((doc) => ({ key: doc.id, value: doc.data() }));

        setSetting(settingsArray);
        setUser(finalUserData);
        message.success("تم تسجيل الدخول بنجاح");
      } else {
        message.error("خطأ في الرقم الوظيفي أو كلمة المرور");
      }
    } catch (error) {
      console.log(error);
      message.error("تعذر الاتصال بقاعدة البيانات. يرجى المحاولة لاحقًا.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (accountId) => {
    setSelectedAccount(accountId);
    localStorage.setItem('selectedAccountId', accountId);
  };

  const handleCreateCompany = () => {
    setIsCreatingCompany(true);
  };

  const handleBackToAccounts = () => {
    setIsCreatingCompany(false);
    setSelectedAccount(null);
    localStorage.removeItem('selectedAccountId');
  };

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  let routes;

  if (isCreatingCompany) {
    routes = <CreateCompany onBack={handleBackToAccounts} />;
  } else if (!selectedAccount) {
    routes = <AccountsList onSelect={handleAccountSelect} onCreateNew={handleCreateCompany} />;
  } else if (!id) {
    routes = (
      <Layout className="loginParent" theme="light">
        <Card bordered={false} className="loginCard">
          <div className="brandHeader" aria-label="الشعار">
            <Button
              type="text"
              icon={<ArrowRightOutlined />}
              onClick={handleBackToAccounts}
              style={{ position: 'absolute', right: 0 }}
            />
            <div className="brandLogos">
              <img className="brandLogo" src={logo} alt="الشعار الرئيسي" />
              <span className="brandDivider" aria-hidden="true" />
              <img className="brandLogo alt" src={Assoc} alt="الشعار الآخر" />
            </div>
            <button
              className="helpIcon"
              title="Dawam v3.0.0 - تعليمات"
              onClick={showModal}
              aria-label="عرض التعليمات والإصدار"
            >
              <InfoCircleOutlined />
            </button>
          </div>

          <Row gutter={[32, 32]} align="middle" justify="space-between" className="loginContent">
            <Col xs={24} md={12} className="visualPane">
              <img className="heroImage" src={illstarte} alt="loginHero" />
            </Col>

            <Col xs={24} md={12} lg={9} className="formPane">
              <div className="formHeader">
                <Title level={3} className="formTitle">تسجيل الدخول للمؤسسة: {selectedAccount}</Title>
                <Text type="secondary" className="formSubtitle">مرحبًا بك. يرجى إدخال بيانات الدخول للمتابعة.</Text>
                <Button type="link" onClick={handleBackToAccounts} style={{ padding: 0 }}>تغيير المؤسسة</Button>
              </div>

              <Form
                name="loginForm"
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ remember: !!cookies.remember }}
                requiredMark={false}
              >
                <Form.Item
                  label="الرقم الوظيفي"
                  name="user_id"
                  rules={[{ required: true, message: "فضلاً أدخل رقمك الوظيفي" }]}
                >
                  <Input size="large" prefix={<UserOutlined />} />
                </Form.Item>

                <Form.Item
                  label="كلمة المرور"
                  name="password"
                  rules={[{ required: true, message: "فضلاً أدخل كلمة المرور" }]}
                >
                  <Input size="large" prefix={<LockOutlined />} type="text" />
                </Form.Item>

                <Form.Item name="remember" valuePropName="checked">
                  <label className="rememberCheck">
                    <input type="checkbox" />
                    <span>تذكرني</span>
                  </label>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" size="large" loading={loading} htmlType="submit" block>
                    تسجيل الدخول
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>

          <div className="footerMeta">
            <Text type="secondary">Powered by HYAC Software — V3.0.0</Text>
          </div>

          <Modal title="Dawam v3.0.0" open={isModalVisible} onCancel={handleCancel} footer={null} centered>
            <Carousel dotPosition="bottom" autoplay>
              <div className="changelog-page">
                <h3>🛠️ التحسينات الأساسية</h3>
                <ul>
                  <li>إضافة نظام إدارة المؤسسات</li>
                  <li>تحسين تجربة تسجيل الدخول</li>
                  <li>دعم استعراض المؤسسات المسجلة</li>
                </ul>
              </div>
            </Carousel>
          </Modal>
        </Card>
      </Layout>
    );
  } else {
    routes = (
      <Layout theme="light" style={{ textAlign: "right", minHeight: "100%" }}>
        <MainHeader />
        <Layout>
          <Switch>
            <Route path={PROFILE_ROUTE} render={() => <Profile setting={setting} userData={id} />} />
            <Route path={CONTROL_PANEL_ROUTE} render={() => <ControlPanel setting={setting} userData={id} />} />
            <Route path={LOGIN} component={Login} />
            <Redirect to="/profile" />
          </Switch>
        </Layout>
      </Layout>
    );
  }

  return (
    <CookiesProvider>
      <ConfigProvider direction="rtl" theme={antdTheme}>
        <Router>
          <Suspense fallback={<Spinner />}>{routes}</Suspense>
        </Router>
      </ConfigProvider>
    </CookiesProvider>
  );
}

export default App;
