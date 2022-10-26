import React from 'react';
import { Typography, Row,Col, Card } from 'antd';
import Layout from 'antd/lib/layout/layout';
import ReactApexChart from "react-apexcharts";
import axios from 'axios';
import {Env} from './../../../styles';
import './style.css';
import  { useState, useEffect } from 'react';

const { Text } = Typography;

export default function Statistics (props) {

  const [discData,setDiscData]=useState([]);
  const [data,setData]=useState([]);
  const [qdata,setQData]=useState([]);
  const [qlabels,setQlabels]=useState([]);
  const [ddata,setDData]=useState([]);
  const [dlabels,setDlabels]=useState([]); 

  const   optionsp= {
                title:{
                 text:'توزيع الموظفين على الإدارات',
                 align:'center',
                 style:{
                     fontFamily:'jannatR',
                 }
                },
              chart: {
                width: 380,
                type: 'pie',
              },
              labels:dlabels,
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }]
            };                   
   const  options = {
      series: discData,
      chart: {
      type: 'donut',
    },
    colors: [ '#775DD0', '#FF4560'],
    labels: ["الوقت المهدور", "وقت الدوام"],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 400
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
    };

    var qoptions = {
      title: {
        text: 'إحصائيات المؤهلات',
        align: 'center',
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: true,
        style: {
          fontSize:  '14px',
          fontWeight:  'bold',
          fontFamily:  'jannatR',
          color:  '#263238'
        },
    },
      series: [{
      name:"العدد",
      data: qdata
    }],
      chart: {
      height: 200,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        columnWidth: '45%',
        distributed: true,
      }
    },
    dataLabels: {
      enabled: true
    },
    legend: {
      show: false
    },
    xaxis: {
      categories:qlabels,
      labels: {
        style: {
          fontFamily:'jannatR',
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      style:{
        fontFamily:'jannatR',
        marginLeft:'5px',
      },
      y:{         
        formatter: function (val, opts) {
          return val;
      },
      },
    },
    };

useEffect(() => {  
  axios.get(Env.HOST_SERVER_NAME+'general-statistics')
  .then(response => {
    console.log(response.data);
    setData(response.data);
    var q=[];
    var l=[];

    response.data.qulaifications.map((item)=>{
      q.push(parseInt(item.count));
      l.push(item.qualification);
    });   
    q??setQData(q);
    l??setQlabels(l);

    var dd=[];
    var dl=[];
    response.data.depts_per.map((item)=>{
      dd.push(parseInt(item.count));
      dl.push(item.category);
    });
    setDData(dd);
    setDlabels(dl);
    setDiscData([response.data.idealTime[0].ideal_time-response.data.workHours[0].workHours,parseFloat(response.data.workHours[0].workHours)]);    
  },[]).catch(function (error) {
    console.log(error);
  });
},[]);

    return(
      <Layout className='stat-layout' >
        <Row style={{margin:'0 0 1.5rem'}}>
          <Col span={24}>
            <Text style={{fontSize:'18px'}}>لوحة البيانات</Text>
          </Col>          
        </Row>
        <Row gutter={[ {xs: 10, sm: 16, md: 24, lg: 32 },{xs: 10, sm: 16, md: 24, lg: 32 }]}  style={{marginTop:'10px'}}>
          <Col xs={24} sm={12} md={12} xl={6} className="gutter-row" span={6} style={{padding:'20px',color:'#fff',fontSize:'16px'}}>
              <div style={{padding:'10px 20px',borderRadius:'10px',background: "linear-gradient(-90deg,#ffbf96,#fe7096)"}}>
                  <div style={{marginBottom:'10px'}}>عدد الموظفين</div>
                  <div style={{fontSize:'22px'}}>{data.users_count} موظفاً</div>
                  <div style={{fontSize:'12px',marginTop:'10px'}}>آخر توظيف منذ {data.latest_assignment?data.latest_assignment[0].assignment_date:''}</div>
              </div>
          </Col>
          <Col xs={24} sm={12} md={12} xl={6} className="gutter-row" span={6} style={{padding:'20px',color:'#fff',fontSize:'16px'}}>
              <div style={{padding:'10px 20px',borderRadius:'10px',background: "linear-gradient(-90deg,#90caf9,#047edf 99%)"}}>
                  <div style={{marginBottom:'10px'}}>عدد الإدارات</div>
                  <div style={{fontSize:'22px'}}>{data.depts_count} إدارات</div>
                  <div style={{fontSize:'12px',marginTop:'10px'}}>متوسط الموظفين لكل إدارة {data.dept_emp_avg}</div>
              </div>
          </Col>
          <Col xs={24} sm={12} md={12} xl={6} className="gutter-row" span={6} style={{padding:'20px',color:'#fff',fontSize:'16px'}}>
              <div style={{padding:'10px 20px',borderRadius:'10px',background: "linear-gradient(-90deg,#84d9d2,#07cdae)"}}>
                  <div style={{marginBottom:'10px'}}>متوسط الأعمار</div>
                  <div style={{fontSize:'22px'}}>{Math.round(data.age_avg)} عاماً</div>
                  <div style={{fontSize:'12px',marginTop:'10px'}}>{data.youngest} أصغر الموظفين عمراً</div>
              </div>
          </Col>
          <Col xs={24} sm={12} md={12} xl={6} className="gutter-row" span={6} style={{padding:'20px',color:'#fff',fontSize:'16px'}}>
              <div style={{padding:'10px 20px',borderRadius:'10px',background: "linear-gradient(-90deg,#E2B0FF,#9F44D3)"}}>
                  <div style={{marginBottom:'10px'}}>عدد الموظفين المتواجدين</div>
                  <div style={{fontSize:'22px'}}>{data.attendance_count} موظفاً</div>
                  <div style={{fontSize:'12px',marginTop:'10px'}}>نسبة حضور الموظفين اليوم {data.attendance_percent}%</div>
              </div>
          </Col>
        </Row>
        <Row gutter={[ {xs: 10, sm: 16, md: 24, lg: 32 },{xs: 10, sm: 16, md: 24, lg: 32 }]}  style={{marginTop:'20px'}}>
           <Col xs={24} sm={24} md={12} xl={12} span={12}>
           <Card>
               <ReactApexChart options={qoptions} series={qoptions.series} type="bar" height={300}  />
            </Card>
           </Col>
           
           <Col xs={24} sm={24} md={12} xl={12} span={12}>
           <Card>
              <ReactApexChart options={optionsp} series={ddata} type="pie"  height={300} />
           </Card>
           </Col>
        </Row>
        <Row>
        <Col xs={24} sm={24} md={10} xl={10} span={10}>
        <Card>
           <ReactApexChart options={options} series={discData} type="donut"  height={300} />
           </Card>
        </Col>
        </Row>
      </Layout>
        );
}

