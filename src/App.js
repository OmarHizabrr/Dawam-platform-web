/* eslint-disable no-unused-vars */
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import {React,Suspense, useState,useEffect } from 'react';

import { Row, Col,Layout, Form, Input, Button } from 'antd';
import axios from 'axios';
import illstarte from './assets/images/loginM.png';
import logo from './assets/images/logo.png';
import { useCookies,CookiesProvider  } from 'react-cookie';
import MainHeader from './components/Navigation/MainHeader';
import Spinner from './components/molecules/Spinner';
import Profile from './scenes/profile' ;
import ControlPanel from './scenes/control-panel/' ;
import Login  from './scenes/login/' ;


import 'moment/locale/ar-ly';

import './App.css';

import {

  CONTROL_PANEL_ROUTE  ,
  PROFILE_ROUTE,
  LOGIN
} from './routes';
import {Env} from './styles'

function App() {
  const [cookies, setCookie]=useCookies(["user"]);
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(false);
  const [setting,setSetting]=useState([]);
  let routes;
  
  const id=cookies.user;

  useEffect(() => {   
     axios.get(Env.HOST_SERVER_NAME+'setting')
     .then(response => {
        setSetting(response.data);
     }).catch(function (error) {
       console.log(error);
     });;

    }, []);

  const onFinish = (values) => {
    setLoading(true);
    axios.post(Env.HOST_SERVER_NAME+`users/login`,  values)
    .then(function (response) {
      if(response.data){
       setCookie("user",response.data);
       setUser(response.data);
      }
      else{
        alert("خطأ في اسم المستخدم أو كلمة المرور!");
        setLoading(false);
      }
     
    },[])
    .catch(function (error) {
      console.log(error);
        alert("هناك مشكلة في الاتصال بالسرفر");
        setLoading(false);
    });
  };
  if (!id) {

    routes = (
      <Layout  className="loginParent"  theme="light" >
      <Row justify="center" className="loginBox">
      <Col span={11} className="mainColumn">
      <img
      className="illstarteImage"
      style={{width:'100%'}}
      src={illstarte}
     />
      </Col>
      <Col span={7}  className="formColumn">
      <div className="formTitle">
        <img
      
          src={logo}
        />
      </div>
      <Form
      name="basic"
      className="loginForm"
      
      onFinish={onFinish}
      initialValues={{
        remember: true,
      }}
    >
      <Form.Item
        label="الرقم الوظيفي"
        name="user_id"
        rules={[
          {
            required: true,
            message: 'ادخل رقمك الوظيفي',
          },
        ]}
      >
        <Input  style={{backgroundColor:'#ADD0E6'}} />
      </Form.Item>

      <Form.Item
        label="كلمة المرور"
        name="password"
        rules={[
          {
            required: true,
            message: 'ادخل كلمة المرور',
          },
        ]}
      >
        <Input.Password  style={{backgroundColor:'#ADD0E6'}}/>
      </Form.Item>
      <Form.Item className="login-btn"  >
        <Button loading={loading} style={{backgroundColor:'#0972B6',color:'#fff',width:'100%',borderColor:'#0972B6'}}   htmlType="submit">
          تسجيل الدخول
        </Button>
      </Form.Item>
    </Form>
      </Col>
    </Row>
    <Row justify="center" className="illustrateBox">
    <img
      className="illstarteImage"
      style={{width:'100%'}}
      src={illstarte}
     />
    </Row>
     </Layout>   
    );
  } else {
    routes = (
      <Layout  theme="light"  style={{textAlign:'right',fontFamily:'jannatR',height:'100%'}}>
      <MainHeader></MainHeader>
      <Layout>    
        <Switch>
          <Route path={PROFILE_ROUTE} render={() => <Profile setting={setting} userData={id} />} />
          <Route path={CONTROL_PANEL_ROUTE} render={() =><ControlPanel setting={setting} userData={id} />} />
          <Route path={LOGIN} component={Login} />
          <Redirect to="/profile" />
        </Switch>
        </Layout>
        </Layout>
    );
  }

  return (
    
    <CookiesProvider >
      <Router >
          <Suspense fallback={
            <Spinner/>
          }>
            {routes}
          </Suspense>       
      </Router>
    </CookiesProvider>
  );
}

export default App;
