import React, { useState } from 'react';
import ReactApexChart from "react-apexcharts";
import './style.css';
import { Typography ,Layout,Breadcrumb,Card,Row,Col,Avatar,Badge,Progress,Tabs,Radio, Button,Rate  } from 'antd';
import {
    UserOutlined,
    HomeOutlined, 
    ClusterOutlined,
    TagsOutlined,
    InsertRowAboveOutlined,
    CarOutlined,
    UnorderedListOutlined,
    LineChartOutlined,
    SnippetsOutlined,
    EditOutlined
  } from '@ant-design/icons';
  import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
  } from "react-router-dom";

import SummaryData from '../../components/organisms/summaryData';
import GeneralTable from '../../components/organisms/generalTable';
import TransferTable from '../../components/organisms/transferTable';
import AttendanceTable from '../../components/organisms/attendanceTable';
import TasksTable from '../../components/organisms/tasksTable';
import tasksRequests from '../../components/organisms/tasksRequests';
import {
  Link,
  useRouteMatch
} from "react-router-dom";
const { Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;


export default function Profile(props){ 
  let { path, url } = useRouteMatch(); 
  const config = {
    options: {
      chart: {
        dropShadow: {
          enabled: true,
          blur: 1,
          left: 1,
          top: 1
        }
      },dataLabels: {
        enabled: true,
        background: {
          enabled: true,
          borderRadius:2,
        }
      },xaxis: {
        categories: ['الحضور المبكر', 'الانضباط', 'الانصراف', 'نسبة أيام الحضور', 'احترام النظام'],
        labels: {
          show: true,
          style: {
            colors: ["#808080"],
            fontSize: "11px",
            fontFamily: 'jannatR'
          }
        }
      },
      yaxis: {
        min:0,
        max:100,
        tickAmount:5,
      },
      colors: ["#007236", "#002612"],
      stroke: {
        width: 1
      },
      fill: {
        opacity: 0.5
      },
      markers: {
        size: 5
      }
    },
    series: [
      {
        name: "أسامة جليل",
        data: [
          45,
          90,
         60,
          80,
          70,
        ],
      },
    ],
    seriesw: [
      {
        name: "أسامة جليل",
        data: [
          80,
          70,
         85,
          60,
          50,
        ],
      },
    ],
    seriesm: [
      {
        name: "أسامة جليل",
        data: [
          90,
          40,
         80,
          95,
          75,
        ],
      },
    ]
  };
  const [filter,setFilter]=useState(config.series); 
  const  handleSizeChange = e => {
     setFilter([{name:'أسامة جليل',data:[90,60,70,80]}]);
   }

return (
    <Layout className="site-layout">
    <Breadcrumb style={{margin:20}}>
    <Breadcrumb.Item href=""> <HomeOutlined /> </Breadcrumb.Item>
    <Breadcrumb.Item href=""> <UserOutlined /><span>{props.userData.user_name}</span></Breadcrumb.Item>
    <Breadcrumb.Item>الملف الشخصي</Breadcrumb.Item>
  </Breadcrumb>
    <Card
    className="site-layout-card"
    style={{
      margin: '10px 16px',
      padding: 0,
      height:'auto',
    }}
  >
 <Row >
    <Col style={{ display: 'flex',flexDirection: 'column'}}  xs={24} sm={24} md={6} lg={6} xl={6}>
    <Avatar
    size={{ xs: 100, sm: 100, md: 130, lg: 150, xl: 150, xxl: 150 }}
    src="https://i.pravatar.cc/150?img=4"
    style={{display:'block',margin:'10px',alignSelf:'center'}}
    />
    <Text style={{textAlign:'center',fontSize:'20px',marginBottom:'10px'}}>{props.userData.user_name} <Badge status="success"  /></Text>
    <div style={{textAlign:'center',marginBottom:'18px'}}><Badge count={ props.userData.user_id }   style={{ backgroundColor: '#DDDDDD',color:'#000' }} /></div>
    <div style={{textAlign:'center'}}><Button type='primary'>الملف الشخصي</Button></div>
    </Col>
    <Col xs={24} sm={24} md={10} lg={10} xl={10}>
      <div className="taggedInfo"><Text><ClusterOutlined /> {props.userData.category.name} </Text></div>
      <div className="taggedInfo"><Text><TagsOutlined />{props.userData.job}</Text></div>
      <div className="taggedInfo" style={{marginTop:'10px'}}><Rate disabled allowHalf defaultValue={2.5} /></div>
      <div className="taggedInfo" style={{marginTop:'30px'}}> <Progress strokeColor='#ff0000' type='circle' percent={80} format={percent => 4000}/></div>
      <div className="taggedInfo" style={{marginTop:'10px',paddingRight:'25px',fontSize:'18px'}}><Text>5000</Text></div>
    </Col>
    <Col xs={24} sm={24} md={8} lg={8} xl={8} style={{textAlign:'center',marginBottom:'-50px'}}>
    <div>
    <ReactApexChart
      options={config.options}
      series={filter}
      type="radar"
      height="300"
      width="350"
      style={{padding:0}}
    />
    <div style={{top:'-50px',position:'relative'}} onChange={handleSizeChange} >
    <Radio.Group defaultValue="day" buttonStyle="solid" >
      <Radio.Button value="day">يوم</Radio.Button>
      <Radio.Button value="week"> أسبوع</Radio.Button>
      <Radio.Button value="month">شهر </Radio.Button>
    </Radio.Group>
    </div>
    </div>
    </Col>
  </Row>
  <Row style={{marginTop:'10px'}}>
  <Tabs tabPosition="bottom" defaultActiveKey="1" style={{width:'100%'}}>
    <TabPane
      tab={
        <Link to={url} >
        <span>
        <LineChartOutlined />
      إحصائيات
        </span>
        </Link>
      }
      key="1"
    >
    </TabPane>
    <TabPane
      tab={
        <Link to={`${url}/general-table`} >
        <span>
        <UnorderedListOutlined />
      السجل العام
        </span>
        </Link>
      }
      key="2"
    >
    </TabPane>
    <TabPane
      tab={
        <Link to={`${url}/attendance-table`} >
        <span>
          <InsertRowAboveOutlined />
        سجل الحضور 
        </span>
        </Link>
      }
      key="3"
    >
    </TabPane>
    <TabPane
      tab={
        <Link to={`${url}/transfer-table`}>
        <span>
          <CarOutlined />
        كشف المواصلات
        </span>
        </Link>
      }
      key="4"
    >
    </TabPane>
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
    >
    </TabPane>
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
    >
    </TabPane>
    <TabPane
      tab={
        <Link to={`${url}/tasks-table`}>
        <span>
        <span class="anticon anticon-snippets">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
           <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
        </svg></span>
          التتنبيهات 
        </span>
        </Link>
      }
      key="7"
    >
    </TabPane>
  </Tabs>  </Row>
  </Card>
  <Layout   style={{
      margin: '0px 16px',
      padding: 0,
      height:'auto',
    }}
  >  
      <Switch>
          <Route path={path} exact>
            <SummaryData/>
          </Route>
          <Route path={`${path}/general-table`} component={GeneralTable} />
          <Route path={`${path}/attendance-table`} component={AttendanceTable} />
          <Route path={`${path}/transfer-table`} component={TransferTable} />
          <Route path={`${path}/tasks-table`} component={TasksTable} />
          <Route path={`${path}/tasks-requests`} component={tasksRequests} />
          <Redirect to="" />
        </Switch>
  </Layout>
  </Layout>
);
 };
