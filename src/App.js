import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import {React,Suspense} from 'react';
import { Layout } from 'antd';
import MainHeader from './components/Navigation/MainHeader';
import SideMenu from './components/Navigation/SideMenu/';





import Spinner from './components/molecules/Spinner';
import { AuthContext } from './components/context/auth-context';
import {useAuth} from './components/hooks/auth-hook'
import Profile from './scenes/profile' ;
import ControlPanel from './scenes/control-panel/' ;
import About  from './scenes/about/' ;
//import MainNavigation from './components/Navigation/MainNavigation'

import './App.css';

import {
  HOME_ROUTE  ,
  CONTROL_PANEL_ROUTE  ,
  PROFILE_ROUTE,
  ABOUT
} from './routes';

function App() {
  const { token, login, logout, userId } = useAuth();

  let routes;

  if (token) {
    routes = (
      <Switch>
         <Route path="Home_ROUTE" exact>
          <Profile/>
         </Route>
         <Redirect to="" />
       </Switch>      
    );
  } else {
    routes = (
      <Layout  theme="light"  style={{textAlign:'right',fontFamily:'jannatR'}}>
      <MainHeader></MainHeader>
      <Layout>
        <SideMenu></SideMenu>
        <Switch>
          <Route path={HOME_ROUTE} exact>
          </Route>
          <Route path={PROFILE_ROUTE} component={Profile} />
          <Route path={CONTROL_PANEL_ROUTE} component={ControlPanel} />
          <Route path={ABOUT} component={About} />
          <Redirect to="" />
        </Switch>
        </Layout>
        </Layout>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token:token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <Router >
          <Suspense fallback={
            <Spinner/>
          }>
            {routes}
          </Suspense>
          
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
