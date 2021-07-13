import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import {React,Suspense} from 'react';
import { Row, Col,Layout, Form, Input, Button } from 'antd';
import axios from 'axios';
import illstarte from './assets/images/loginM.png'
import { useCookies,CookiesProvider  } from 'react-cookie';
import MainHeader from './components/Navigation/MainHeader';
import SideMenu from './components/Navigation/SideMenu/';
import Spinner from './components/molecules/Spinner';
import Profile from './scenes/profile' ;
import ControlPanel from './scenes/control-panel/' ;
import Login  from './scenes/login/' ;
//import MainNavigation from './components/Navigation/MainNavigation'

import './App.css';

import {
  HOME_ROUTE  ,
  CONTROL_PANEL_ROUTE  ,
  PROFILE_ROUTE,
  ABOUT,
  LOGIN
} from './routes';
import {Env} from './styles'
import { useState } from "react";

function App() {
  const [cookies, setCookie, removeCookie]=useCookies(["user"]);
  const [user,setUser]=useState(null);
  let routes;
  const id=cookies.user;

  const onFinish = (values) => {
    //console.log(Env.HOST_SERVER_NAME);
    axios.post(Env.HOST_SERVER_NAME+`users/login`,  values)
    .then(function (response) {
      if(response.data){
       setCookie("user",response.data);
       setUser(response.data);
      }
     
    })
    .catch(function (error) {
      console.log(error);
    });
  };
  if (!id) {

    routes = (
      <Layout  className="loginParent"  theme="light" >
      <Row justify="center" className="loginBox">
      <Col span={11} >
      <img
      style={{width:'100%'}}
      src={illstarte}
     />
      </Col>
      <Col span={7}  >
      <div className="formTitle">
        دوام | Dawam
      </div>
      <Form
      name="basic"
      style={{marginTop:'50px'}}
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
        <Input  style={{backgroundColor:'#C6DFD2'}} />
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
        <Input.Password  style={{backgroundColor:'#C6DFD2'}}/>
      </Form.Item>

      <Form.Item style={{marginTop:'40px'}} >
        <Button style={{backgroundColor:'#007236',width:'100%',borderColor:'#007236'}} type="primary"  htmlType="submit">
          تسجيل الدخول
        </Button>
      </Form.Item>
    </Form>
      </Col>
    </Row>
     </Layout>   
    );
  } else {
    routes = (
      <Layout  theme="light"  style={{textAlign:'right',fontFamily:'jannatR',height:'100%'}}>
      <MainHeader></MainHeader>
      <Layout>    
        <Switch>
          <Route path={PROFILE_ROUTE} render={() => <Profile userData={id} />} />
          <Route path={CONTROL_PANEL_ROUTE} component={ControlPanel} />
          <Route path={LOGIN} component={Login} />
          <Redirect to="" />
        </Switch>
        </Layout>
        </Layout>
    );
  }

  return (
    <CookiesProvider 
      
    >
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
