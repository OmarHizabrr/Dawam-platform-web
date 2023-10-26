import React, { useState, useEffect } from 'react';
import './style.css';
import axios from 'axios';
import {Typography,Row,Col,Avatar,Button,Card, Spin, Form,Input, Layout,Badge,Radio, Rate } from 'antd';

import moment from 'moment';

import { useCookies,CookiesProvider  } from 'react-cookie';
import {useLocation} from 'react-router-dom';
import {
  ClusterOutlined,
  DollarCircleOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import {Env} from './../../../styles';

import ReactApexChart from "react-apexcharts";
const {Text} = Typography;

/* eslint-disable react-hooks/rules-of-hooks */
export default function summaryData (props) {
  const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
  const location = useLocation();

  const [start,setStart]=useState(null);     
  const [end,setEnd]=useState(null);  

  const [data,setData]=useState([]);
  const [serData,setSerData]=useState([]);
  const [salSpin,setSalSpin]=useState(true);
  const [attDates,setAttDates]=useState([]);
  const [attAtt,setAttAtt]=useState([]);
  const [attLeave,setAttLeave]=useState([]);
  const [attSpin,setAttSpin]=useState(true);
  const [thresholds,setThresholds]=useState([]);
  const [attCount,setAttCount]=useState(0);
  const [leaveCount,setLeaveCount]=useState(0);
  const [spiderData,setSpiderData]=useState([]);

  const [star,setStar]=useState(0); 

  const config = {
    options: {
      chart: {
        width: 380,
        type: "pie"
      },
     
        colors: ['#008FFB', '#775DD0', '#FEB019','#FF4560', '#B8C22E', '#00E396'],
    
      labels: ["سُلف", "أقساط", "تأخرات", "غياب","جزاءات","صافي الاستحقاق"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ],
    series: serData,
    }
  };
  const config2={
    series: [{
      name: 'صافي الدوام',
      data: attAtt
    },{
      name: 'الدوام المثالي',
      data:thresholds
    }],
    options: {
      chart: {
        height: 350,
        type: 'area'
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show:true,
        curve: 'smooth',
        width:2,
      },
      xaxis: {
        type: 'datetime',
        categories: attDates
      },
      yaxis:{
        type:'datetime',
        min: 0,
        max: 660,
        tickAmount:7,
      },
      tooltip: {
        style:{
          fontFamily:'jannatR',
          marginLeft:'5px',
        },
        x: {
          show:true,
          format: 'dd-MM-yyyy'
        },
        y:{         
          format:'HH:mm',
          formatter: function (val, opts) {
            return parseInt(val/60)+":"+(val%60);
        },
        }
      },
    },
  }
  const configSpider = {
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
      colors: ["#0972B6", "#002612"],
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
        name: "النسبة",
        data: props.spiderData,
      },
    ]
  };
  const id=cookies.user; 
  let  user=props.userData;
  // let  user=location.userData;
  if(location.userData != null) 
       user=location.userData;
 
  const [filter,setFilter]=useState(configSpider.series); 

  const  handleSizeChange = e => {
    setFilter([{name:'أسامة جليل',data:[90,60,70,80]}]);
  }
function getTwentyFourHourTime(amPmString) { 
    var d = new Date("1/7/2022 " + amPmString); 
    return d.getHours() + ':' + d.getMinutes(); 
}

function getMinutesTime(amPmString) {
 
  if(amPmString!=null){
    var d = amPmString.split(':'); 
    var m=(parseInt(d[0])*60) + parseInt(d[1]);
    return m; 
  }
  else return 0;
}

useEffect(() => {

    if(props.setting.length){  
    setStart(props.setting?moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'):null);
    setEnd(props.setting?moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'):null);
  }
  else{
    var setting;
    axios.get(Env.HOST_SERVER_NAME+'setting')
    .then(response => {
       setting=response.data;
       setStart(moment(moment().format('YYYY-MM')+"-"+setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
       setEnd(moment(moment().format('YYYY-MM')+"-"+setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));   
    }).catch(function (error) {
      console.log(error);
    }); 
  }
    axios.get(Env.HOST_SERVER_NAME+'salary-info/'+id.user_id+'/'+start+'/'+end)
    .then(response => {
      setData(response.data); 
          
      setSerData([parseInt(response.data.lists[0]['debt'] || 0),parseInt(response.data.lists[0]['long_debt'] || 0), parseInt(response.data.lists[0]['lateTimePrice'] || 0), parseInt(Math.round(((response.data.count[0].count-(response.data.lists[0]['attendanceDays']|| 0))*( response.data.lists[0].salary/30)))), parseInt(response.data.lists[0]['vdiscount'] || 0) ,
      response.data.lists[0].salary - (Math.round(response.data.lists[0].debt || 0)+Math.round(((response.data.count[0].count-response.data.lists[0].attendanceDays)*(response.data.lists[0].salary/30))+parseFloat(response.data.lists[0].lateTimePrice || 0))+Math.round(response.data.lists[0].symbiosis || 0)+Math.round(response.data.lists[0].long_debt || 0)) ]);
      setSalSpin(false);

      var dates=[];
      var atts=[];
     // var leaves=[];
     var thr=[];
     response.data.logs.map(function(item){
     
      //if(item.dayName!='الجمعة'){
        dates.push(item.date);
        
        if(item.workHours==0   && item.discount==0) {
          thr.push(0);
          atts.push(0);
        }
        else {
          thr.push(getMinutesTime(item.duartion));
          atts.push(getMinutesTime(item.workHours));
        }
      //}
      //  leaves.push(getTwentyFourHourTime(item.leave_time));
    });
      setAttDates(dates);
      setAttAtt(atts);
      setThresholds(thr);
     // setAttLeave(leaves);
      setAttSpin(false);
    }).catch(function (error) {
      console.log(error);
    });

  },[start,end]);

  return(
    <Layout>
    <Card
     className="site-layout-card userProfileSummary"
     style={{
       margin: '10px 16px',
       padding: 0,
       height:'auto',
     }}>
    <Row >
    <Col style={{ display: 'flex',flexDirection: 'column'}}  xs={24} sm={24} md={6} lg={6} xl={6}>
    <Avatar
    size={{ xs: 100, sm: 100, md: 130, lg: 150, xl: 150, xxl: 150 }}
    src={Env.HOST_SERVER_STORAGE+user.avatar}
    style={{display:'block',margin:'10px',alignSelf:'center'}}
    />
    <Text style={{textAlign:'center',fontSize:'20px',marginBottom:'10px'}}>{user.user_name} <Badge status="success"  /></Text>
    <div style={{textAlign:'center',marginBottom:'18px'}}><Badge count={ user.user_id }   style={{ backgroundColor: '#DDDDDD',color:'#000' }} /></div>
    <div style={{textAlign:'center'}}><Button onClick={props.showModal} type='primary' >الملف الوظيفي </Button></div>
    </Col>
    <Col className='userData' xs={24} sm={24} md={10} lg={10} xl={10}>
      <div className="taggedInfo"><Text><ClusterOutlined /> {user.category.name} </Text></div>
      <div className="taggedInfo"><Text><TagsOutlined />{user.job}</Text></div>
      <div className="taggedInfo"><Text><DollarCircleOutlined /> الراتب: <Input.Password bordered={false} style={{width:'100px'}} readOnly={true} value={new Intl.NumberFormat('en-EN').format(user.salary)} iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}/></Text></div>
      <div className="taggedInfo" style={{marginTop:'10px'}}>
        <Rate disabled allowHalf value={Math.round(props.star*10)/2} /> {Math.round(props.star*100)}%
      </div>
    </Col>
    <Col xs={24} sm={24} md={8} lg={8} xl={8} style={{textAlign:'center',marginBottom:'-50px'}}>
    <div className='spider'>
    <ReactApexChart
      options={configSpider.options}
      series={configSpider.series}
      type="radar"
      height="300"
      width="350"
      style={{padding:0}}
    />
    <div  style={{top:'-50px',position:'relative'}} onChange={()=>handleSizeChange()} >

    </div>
    </div>
    </Col>
  </Row>
  </Card>
    <Row className="summary" style={{paddingBottom:'10px'}}>

    <Col className='pieColumn' lg={10} sm={24}>
    <Card>
    <Spin spinning={salSpin}>
    <ReactApexChart
      className="pie-chart"
      options={config.options}
      series={config.options.series}
      type="pie"
      height="400"
      width="400"
      style={{padding:0,textAlign:'center'}}
    />
    <div style={{textAlign:'center',paddingBottom:'20px'}}>
    <Text>ملخص المستحقات للفترة  {start+" - "+end} </Text>
    </div>
    </Spin>
    </Card>
    </Col>
    <Col className='pieColumn' lg={14} sm={24}>
    <Card>
    <Spin spinning={attSpin}>
    <ReactApexChart
      options={config2.options}
      series={config2.series}
      type="area"
      height="250"
      style={{padding:0}}
    />
     <div style={{textAlign:'center',}}>
    <Text>حركة الحضور والانصراف لآخر 30 يوماً</Text>
    </div>
    </Spin>
    </Card>
    </Col>   
     </Row>
     </Layout>
     );
}