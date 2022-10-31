/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

import {Env} from './../../../styles';
import AttendanceTable from './../attendanceTable';
import TasksTable from './../tasksTable';
import ReactApexChart from "react-apexcharts";

import { Card, Avatar,Layout,Row,Col,Upload ,Typography,Badge,Dropdown,Rate,Menu,Skeleton,Space,InputNumber,Select,Modal, Button,Form,Input,notification, DatePicker,Collapse,Progress,Spin} from 'antd';
import './style.css';
import { NavHashLink as NavLink } from 'react-router-hash-link';
import { PlusOutlined,UploadOutlined, TagsOutlined,ClockCircleOutlined, ClusterOutlined ,MoreOutlined,MinusCircleOutlined,PrinterOutlined,FileOutlined} from '@ant-design/icons';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    Link,
    useRouteMatch
  } from "react-router-dom";

const { Meta } = Card;
const { Text } = Typography;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

export default function EmpCards(props){ 
    let { path, url } = useRouteMatch(); 

    const [data,setData]=useState([]);
    const [categories,setCategories]=useState([]);
    const [durations,setDurations]=useState([]);
    const [types,setTypes]=useState([]);

    const [phones,setPhones]=useState([]);
    const [qualifications,setQualifications]=useState([]);
    const [preworks,setPreworks]=useState([]);
    const [attachments,setAttachments]=useState([]);

    const [load,setLoad]=useState(true);
    const [today,setToday]=useState(new Date().toISOString().split('T')[0]);
    const [isVisibleModal,setIsVisibleModal]=useState(false);
    const [isRVisibleModal,setIsRVisibleModal]=useState(false);

    const [isAVisibleModal,setIsAVisibleModal]=useState(false);
    const [isTVisibleModal,setIsTVisibleModal]=useState(false);
    const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
    const [end,setEnd]=useState(new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0,10));
    const [starList,setStarList]=useState([]); 
    const [modalLoad,setModalLoad]=useState(false);
    const [userFormDisable,setUserFormDisable]=useState(true);

    const [selectedUser,setSelectedUser]=useState(null);
    const [userData,setUserData]=useState(null);
    const [vacsData,setVacsData]=useState([]);
    const [vacsCats,setVacsCats]=useState([]);
    const [discData,setDiscData]=useState([]);
    const [attDates,setAttDates]=useState([]);
    const [attAtt,setAttAtt]=useState([]);
    const [attCount,setAttCount]=useState(0);
    const [leaveCount,setLeaveCount]=useState(0);
    const [thresholds,setThresholds]=useState([]);
    const [spiderData,setSpiderData]=useState([]);
    const [reportLoad,setReportLoad]=useState(true);
    const [selectedUserName,setSelectedUserName]=useState("");

    const  UploadProps = {
      showUploadList: {
        showRemoveIcon: true,
        showDownloadIcon: true,
        downloadIcon: 'Download',
      },
    };

    const [userform] = Form.useForm();
    const [formDate] = Form.useForm();

    useEffect(() => {       
      setLoad(true);
      axios.get(Env.HOST_SERVER_NAME+'users/'+today+'/'+start+'/'+end)
      .then(response => {
        setData(response.data['users']);
        setPhones(response.data['phones']);
        setQualifications(response.data['qualifications']);
        setPreworks(response.data['preworks']);
        setAttachments(response.data['attachments']);        
        var stars=[];
        response.data['lists'].forEach(function(e){
          var avg=(((response.data.count[0].count-e.attendanceDays)*(e.salary/response.data.count[0].count))+parseInt(e.lateTimePrice || 0))/e.salary;
          stars.push({'user_id':e.user_id,'star':Math.round((1-avg)*10)/2});
        });
        setStarList(stars);

        setLoad(false);
      
      }).catch(function (error) {
        console.log(error);
      });
      axios.get(Env.HOST_SERVER_NAME+'users-info/')
      .then(response => {
        setCategories(response.data['categroies']);
        setDurations(response.data['durations']);
        setTypes(response.data['types']);
      }).catch(function (error) {
        console.log(error);
      });
     },[]);
     function callback(key) {
     // console.log(key);
    }

    function toTimestamp(strDate){
      var datum = Date.parse(strDate);
      return datum/1000;
   }
   const printReport=()=>{

   // const doc = new jsPDF({orientation: "landscape",format: 'a4',});  

    //const element = printRef.current;
    const input = document.getElementsByClassName('emp-report-modal')[0];
    html2canvas(input, { logging: true, letterRendering: 1, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf =new jsPDF({orientation: "landscape",format: 'a4', unit: "in"}); 
        
        pdf.addImage(imgData, 'JPEG', 0, 0,11.693,8.267);
        // pdf.output('dataurlnewwindow');
        pdf.save("download.pdf");
      })
    ;

  }
  const printTestReport=()=>{
    var report=document.getElementsByClassName('emp-report-modal')[0];
    //var report=document.body;
   var mywindow = window.open('');
    mywindow.document.write("<html><head><title></title> <style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500&display=swap'); body{font-family:Tajawal;font-size:12px;margin:0}  </style><style type='text/css' media='print'>@page { size: A4 landscape; print-color-adjust: exact !important;  -webkit-print-color-adjust: exact !important;}</style>");
    mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
    mywindow.document.write(report.innerHTML);
    mywindow.document.write('</body></html>');
    
    mywindow.document.close();  

   mywindow.onload = function() { // wait until all resources loaded 
    mywindow.focus(); // necessary for IE >= 10
    mywindow.print();  // change window to mywindow
    mywindow.close();// change window to mywindow
};
  }
   const intervals = [
    { label: 'سنوات', seconds: 31536000 },
    { label: 'أشهر', seconds: 2592000 },
    { label: 'أيام', seconds: 86400 },
    { label: 'ساعات', seconds: 3600 },
    { label: 'دقائق', seconds: 60 },
    { label: 'ثواني', seconds: 1 }
  ];
  const sintervals = [
    { label: 'سنة', seconds: 31536000 },
    { label: 'شهر', seconds: 2592000 },
    { label: 'يوم', seconds: 86400 },
    { label: 'ساعة', seconds: 3600 },
    { label: 'دقيقة', seconds: 60 },
    { label: 'ثانية', seconds: 1 }
  ];
  const dintervals = [
    { label: 'سنتين', seconds: 31536000 },
    { label: 'شهرين', seconds: 2592000 },
    { label: 'يومين', seconds: 86400 },
    { label: 'ساعتين', seconds: 3600 },
    { label: 'دقيقتين', seconds: 60 },
    { label: 'ثانيتين', seconds: 1 }
  ];
  function timeSince(date) {
   
     // const datet=new Date(date);
      const seconds = Math.floor(((new Date().getTime())-(new Date(date).getTime()))/1000);  
      const interval = intervals.find(i => i.seconds < seconds);
      const sinterval = sintervals.find(i => i.seconds < seconds);
      const dinterval = dintervals.find(i => i.seconds < seconds);
      //alert(date);
      const count = Math.floor(seconds / interval?.seconds);
      if(count===1)
        return `منذ ${sinterval?.label}`;
      else if(count===2)  return `منذ ${dinterval?.label}`;
      else
      return `منذ ${count} ${count > 2 && count <= 10 ?interval?.label:sinterval?.label}`;
    }
    const listData = [];
for (let i = 0; i < 16; i++) {
  listData.push(<Col style={{padding:'10px',display:load?'':'none'}}  span={6}>
  <Skeleton loading={load}  avatar active={load}></Skeleton>
  </Col>);
}

const onFinish=()=>{
  var formData=new FormData();
  const config = {
    headers: {
      'content-type': 'application/json',
    },
  };
 var userData=userform.getFieldsValue();


  for (const key in userData) {
    if (Array.isArray(userData[key])) {
      for(const attach in userData[key]){
        for(const attachData in userData[key][attach]){
          formData.append(key+"["+attach+"]["+attachData+"]",userData[key][attach][attachData]);
        }
        
      }
    }
    else{ 
      formData.append(key, userData[key]);
    }
  }
  
  axios.post(Env.HOST_SERVER_NAME+'users/add',formData).then(res => {
    console.log(res.data);
    if(res.status==200){
      notification.success({
        message:'تمت العملية بنجاح' ,
        placement:'bottomLeft',
        duration:0,
      });
      userform.resetFields();
      setIsVisibleModal(false);
      setModalLoad(false);
      setUserFormDisable(true);   
    }
    else{
    alert("فشل إضافة موظف");
    setModalLoad(false);
  }
}).catch(err =>{ console.log(err);
  alert("فشل إضافة موظف");
  setModalLoad(false);

}); 
}
var options = {
  title: {
    text: 'خلاصة الخصميات',
    align: 'center',
    margin: 10,
    offsetX: 0,
    offsetY: 0,
    floating: false,
    style: {
      fontSize:  '14px',
      fontWeight:  'bold',
      fontFamily:  'jannatR',
      color:  '#263238'
    },
},
  series: discData,
  chart: {
  type: 'donut',
},
labels: ["سُلف", "أقساط", "تأخرات", "غياب","جزاءات"],
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
var voptions = {
  title: {
    text: 'خلاصة الإجازات',
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
  name: 'مدة الإجازة',
  data: vacsData
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
  enabled: false
},
legend: {
  show: false
},
xaxis: {
  categories:vacsCats,
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
      return val + " دقيقة";
  },
  },
},
};
const sconfig = {
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
      data: spiderData,
    },
  ],
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
    title: {
      text: 'حركة الحضور والانصراف',
      align: 'center',
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating:true,
      style: {
        fontSize:  '14px',
        fontWeight:  'bold',
        fontFamily:  'jannatR',
        color:  '#263238'
      },
  },
    chart: {
      height: 400,
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
const openAttModal=(user)=>{

  setSelectedUser(user);
  setIsAVisibleModal(true);
}
const openTaskModal=(user)=>{
  setSelectedUser(user);
  setIsTVisibleModal(true);
}
const openShowUser=(user)=>{
 // console.log(Object.keys(user).map((key) => [Number(key), user[key]]));
 setSelectedUser(user);
 var birth=user.birth_date;
 var assign=user.assignment_date;
  userform.setFieldsValue(user);
  userform.setFieldsValue({'birth_date':moment(birth, 'YYYY-MM-DD')});
  userform.setFieldsValue({'assignment_date':moment( assign, 'YYYY-MM-DD')});
  userform.setFieldsValue({'password':null});
  setIsVisibleModal(true);

  var conts=phones;
  conts=conts.filter(function (e) { return e.user_id == user.id; });
  userform.setFieldsValue({'contacts':conts});

  var quals=qualifications;
  quals=quals.filter(function (e) { return e.user_id == user.id; });

  quals.forEach(element => {
    element.qual_year=moment(element.qual_year, 'YYYY');
  });
  userform.setFieldsValue({'qualifications':quals});
  //setQualifications(quals);

  var pworks=preworks;
  pworks=pworks.filter(function (e) { return e.user_id == user.id; });
  pworks.forEach(element => {
    element.work_period=[moment(element.date_from, 'YYYY'),moment(element.date_to, 'YYYY')]
  });
  userform.setFieldsValue({'preworks':pworks});
  //setPreworks(pworks);

  //------------------------------------------
  var attachs=attachments;
  attachs=attachs.filter(function (e) { return e.user_id == user.id; });
  userform.setFieldsValue({'attachments':attachs});
  
  //-----------------------------
  
}
function getMinutesTime(amPmString) {
  if(amPmString){
    var d = amPmString.split(':'); 
    var m=(parseInt(d[0])*60) + parseInt(d[1]);
    return m; 
  }
  else return 0;
}
const openShowReport=(user)=>{
  setReportLoad(true);
  setSelectedUser(user);
  getUserData(user); 
 }

 const resetReport=()=>{
    setUserData(null);
    setAttCount(0);
    setLeaveCount(0);
    setDiscData([]);
    setSpiderData([]);
    setVacsData([]);
    setVacsCats([]);
    setAttDates([]);
    setAttAtt([]);
    setThresholds([]);
    formDate.resetFields();
  setStart(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
  setEnd(new Date().toISOString().slice(0, 10));
 }
 const getUserData=(user)=>{
  setReportLoad(true);
  axios.get(Env.HOST_SERVER_NAME+'user-info/'+user.user_id+'/'+start+'/'+end)
  .then(response => {
    
    setUserData(response.data);
    setAttCount(response.data.att_count[0].att_count);
    setLeaveCount(response.data.leave_count[0].leave_count);
    setDiscData([parseInt(response.data.lists[0]['debt'] || 0),parseInt(response.data.lists[0]['long_debt'] || 0), parseInt(response.data.lists[0]['lateTimePrice'] || 0), parseInt(Math.round(((response.data.count[0].count-(response.data.lists[0]['attendanceDays']|| 0))*( response.data.lists[0].salary/30)))), parseInt(response.data.lists[0]['vdiscount'] || 0)]);
    setSpiderData([Math.round(response.data.att_count[0].att_count/response.data.att_count[0].count*100) || 0,Math.round(response.data.id_count[0].id_count/response.data.id_count[0].count*100) || 0,Math.round(response.data.leave_count[0].leave_count/response.data.leave_count[0].count*100) || 0,Math.round(response.data.lists[0].attendanceDays/response.data.count[0].count*100) || 0,Math.round(response.data.vac_count[0].late_vacs/response.data.vac_count[0].count*100) || 0]);
    //console.log(response.data.lists[0].attendanceDays);
    var vdata=[];
    var vcats=[];
    response.data.vacstypes.forEach(item => {
      var vacs_search=response.data.vacs.filter(function (e) { return e.id == item.id; });
      if(vacs_search.length>0){
        var vac_count= vacs_search[0]?.cumHours;
        vdata.push(getMinutesTime(vac_count));;
      }
      else{
        var vac_count=0;
        vdata.push(0);
      }
      
      vcats.push([item.name,vac_count]);
      
    });
    setVacsData(vdata);
    setVacsCats(vcats);

    var dates=[];
    var atts=[];
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
    
    setReportLoad(false);
  }).catch(function (error) {
    console.log(error);
  });
 }
 const changeRange=(all,date)=>{
  
  setStart(date[0]);
  setEnd(date[1]);
  getUserData(selectedUser); 
}
return(
<Layout>
    <Button
    className='addBtn'
    onClick={function(){userform.resetFields();setUserFormDisable(false);setIsVisibleModal(true);}}
     style={{zIndex:'1000',position:'fixed',bottom:'20px',width:'55px',height:'55px',left:'20px'}} shape="circle" icon={<PlusOutlined />} type="primary">
    </Button>   
    <Modal id='emp-report' title={<div style={{backgroundColor:'#fff'}}><Text>تقرير الموظف</Text><div style={{float:'left',marginLeft:'100px'}}><RangePicker value={[moment(start),moment(end)]} onCalendarChange={changeRange} /><Button style={{backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button></div></div>} footer={[]} centered={true} className='emp-report-modal' width={1400}  visible={isRVisibleModal}  onOk={function(){setModalLoad(true);onFinish();}} onCancel={function(){resetReport();setSelectedUser(null);setIsRVisibleModal(false);}}>
        <Spin spinning={reportLoad}>
        <Row>
          <Col xs={24} sm={24} md={5} lg={5} xl={5} span={5} style={{justifyContent:'center'}}>
            <div style={{display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <Avatar
              size={{ xs: 60, sm: 60, md: 80, lg: 100, xl: 100, xxl: 100 }}
              src={Env.HOST_SERVER_STORAGE+selectedUser?.avatar}
              style={{display:'block',margin:'10px',alignSelf:'center'}}
            />
            <Rate style={{textAlign: 'center',marginBottom:'5px'}} disabled allowHalf value={starList?.filter(function (e) { return e.user_id == selectedUser?.user_id; })[0]?.star} />   
            <Text style={{textAlign:'center',fontSize:'16px',marginBottom:'5px'}}>{selectedUser?.user_name} <Badge count={selectedUser?.user_id} overflowCount={99999}  style={{ backgroundColor: '#DDDDDD',color:'#000' }} /></Text>
            <Text style={{textAlign:'center',fontSize:'16px',marginBottom:'5px'}}>{selectedUser?.category} </Text>
            <Text style={{textAlign:'center',fontSize:'16px',marginBottom:'5px'}}>{selectedUser?.job} </Text>
            </div>
            <div>
              <ReactApexChart
                options={sconfig.options}
                series={sconfig.series}
                type="radar"
                height="270"
                width="320"
              />
            </div>
          </Col>
          <Col xs={24} sm={24} md={19} lg={19} xl={19} span={19}  style={{padding:'20px',backgroundColor:'#F0F2F5'}}>
            <section className='dawam-section'>
              <div>
                <div className='card' style={{padding:'10px 20px',width:'190px',borderRadius:'10px',color:'#fff',background: "linear-gradient(90deg,#ffbf96,#fe7096)"}}>
                  <div>
                    <div style={{marginBottom:'10px'}}>أيام الدوام</div>
                    <div style={{fontSize:'12px',marginTop:'10px'}}>{userData?.lists[0]?.attendanceDays} من {userData?.count[0]?.count}</div>
                  </div>
                  <div>
                    <Progress trailColor={'transparent'} strokeColor={'#fff'} width={50} type="circle" percent={Math.round(userData?.lists[0].attendanceDays/userData?.count[0].count*100)} />
                  </div>
                </div>
                <div className='card' style={{padding:'10px 20px',width:'190px',borderRadius:'10px',background: "linear-gradient(90deg,#90caf9,#047edf 99%)"}}>
                  <div>
                    <div style={{marginBottom:'10px'}}>انضباط الحضور</div>
                    <div style={{fontSize:'12px',marginTop:'10px'}}>{attCount} من {userData?.att_count[0].count}</div>
                  </div>
                  <div>
                  <Progress trailColor={'transparent'} strokeColor={'#fff'} width={50} type="circle" percent={Math.round(attCount/userData?.att_count[0].count*100)} />
                  </div>
                </div>
                <div className='card' style={{padding:'10px 20px',width:'190px',borderRadius:'10px',background: "linear-gradient(90deg,#84d9d2,#07cdae)"}}>
                  <div>
                    <div style={{marginBottom:'10px'}}>انضباط الانصراف</div>
                    <div style={{fontSize:'12px',marginTop:'10px'}}>{leaveCount} من {userData?.leave_count[0].count}</div>
                  </div>
                  <div>
                  <Progress trailColor={'transparent'} strokeColor={'#fff'} width={50} type="circle" percent={Math.round(leaveCount/userData?.leave_count[0].count*100)} />
                  </div>
                </div>
                <div className='card' style={{padding:'10px 20px',width:'190px',borderRadius:'10px',background: "linear-gradient(90deg,#E2B0FF,#9F44D3)"}}>
                  <div>
                    <div style={{marginBottom:'10px'}}>التأخرات</div>
                    <div style={{fontSize:'12px',marginTop:'10px'}}>{parseInt(userData?.lists[0].lateTime/60)+":"+parseInt(userData?.lists[0].lateTime)%60}</div>
                  </div>
                  <div>
                  <ClockCircleOutlined style={{ fontSize: '30px', color: '#fff' }} />
                  </div>
                </div>
                <div className='card' style={{padding:'10px 20px',width:'190px',borderRadius:'10px',background: "linear-gradient(to left,  #603813, #b29f94)"}}>
                  <div>
                    <div style={{marginBottom:'10px'}}>الوقت الفائض</div>
                    <div style={{fontSize:'12px',marginTop:'10px'}}>{parseInt(userData?.lists[0].bonusTime/60)+":"+parseInt(userData?.lists[0].bonusTime)%60}</div>
                  </div>
                  <div>
                  <ClockCircleOutlined style={{ fontSize: '30px', color: '#fff' }} />
                  </div>
                </div>
              </div>                                                 
            </section>
            <Row style={{marginTop:'10px'}}>
              <Col xs={24} sm={24} md={18} lg={18} xl={18} span={18} style={{flexGrow: 1,paddingLeft:'10px'}}>
                <div className='dawam-section stat'>
                  <div>
                  <ReactApexChart
                    options={options}
                    series={options.series}
                    type="donut"
                    height="350"
                    width="350"
                  />
                  </div>
                  <div>
                  <ReactApexChart
                    options={voptions}
                    series={voptions.series}
                    type="bar"
                    height="200"
                    width="350"
                  />
                  </div>
                  <div>

                  </div>
                </div>
              </Col>
              <Col xs={24} sm={24} md={6} lg={6} xl={6} span={6} style={{ flexGrow: 1}}>
                <div style={{padding:'5px',height: '100%'}} className='dawam-section vio'>
                  <h3>المخالفات</h3>
                  <div style={{marginTop:'10px'}}>
                    <table className='vio-table' style={{width:'100%'}}>
                    {userData?.violations?.map((item) => {
                      return <tr><td>{item.vio_name}</td><td><Badge showZero style={{ backgroundColor: '#FF4560' }} count={item.vio_count}/></td></tr>
                    })}
                    </table>

                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col  xs={24} sm={24} md={24} lg={24} xl={24} span={24} style={{marginTop:'10px',backgroundColor:'#F0F2F5'}}>
              <div className='dawam-section'>
              <ReactApexChart
                options={config2.options}
                series={config2.series}
                type="area"
                height="250"
                style={{padding:0}}
              />
              </div>
              </Col>
            </Row>
          </Col>
        </Row>
        </Spin>
    </Modal>
    <Modal okButtonProps={{ disabled:  userFormDisable  }} confirmLoading={modalLoad} centered={true} className='emp-modal' width={1200} title="بيانات الموظف" visible={isVisibleModal}  onOk={function(){setModalLoad(true);onFinish();}} onCancel={function(){setSelectedUser(null);userform.resetFields();setIsVisibleModal(false);}}>
     <Form   form={userform} onFinish={onFinish}>
      <Row style={{backgroundColor:'#F6F6F6'}}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8} className='personal-data' span={8} style={{padding:'20px'}}>
        <div style={{backgroundColor:'#fff',borderRadius:'10px',display:'flex',flexDirection:'column',padding:'10px 20px'}}>
        <Avatar
           size={{ xs: 60, sm: 60, md: 80, lg: 100, xl: 100, xxl: 100 }}
          src={selectedUser?Env.HOST_SERVER_STORAGE+selectedUser.avatar:""}
           style={{display:'block',margin:'10px 10px 20px',alignSelf:'center'}}
        />
        <Text style={{fontWeight:'700',marginBottom:'10px'}}>{'البيانات الشخصية'}</Text>
        <Form.Item
        name="id"
        hidden={true}
        style={{display:"none"}}
        >
          <Input/>
       </Form.Item>
       
        <Form.Item
        label="الاسم رباعيًا"
        name="name"
      
        >
          <Input disabled={userFormDisable} />
       </Form.Item>
       <Form.Item name={'sex'} label="الجنس">
        <Select 
        disabled={userFormDisable}
        options={types.filter(function(e){return e.parent==1;})}
        optionFilterProp="children"
       filterOption={(input, option) =>
         option.props.children?.indexOf(input) >= 0 ||
         option.props.label?.indexOf(input) >= 0
       }
       filterSort={(optionA, optionB) =>
         optionA.props?.children?.localeCompare(optionB.props.children)
       }
        >
        </Select>
      </Form.Item>
       <Form.Item name={'birth_date'} label="تاريخ الميلاد">
        <DatePicker disabled={userFormDisable}  format="YYYY-MM-DD"  style={{width:'100%'}} />
      </Form.Item>
      <Form.Item name={'birth_place'} label="مكان الميلاد">
        <Input disabled={userFormDisable}    style={{width:'100%'}} />
      </Form.Item>
      <Form.Item name={'marital_status'} label="الحالة الاجتماعية">
        <Select 
        options={types.filter(function(e){return e.parent==2;})}
        optionFilterProp="children"
       filterOption={(input, option) =>
         option.props.children?.indexOf(input) >= 0 ||
         option.props.label?.indexOf(input) >= 0
       }
       filterSort={(optionA, optionB) =>
         optionA.props?.children?.localeCompare(optionB.props.children)
       }
        disabled={userFormDisable} >

        </Select>
      </Form.Item>
      <Form.Item name={'children_no'}  label="عدد الأولاد">
        <InputNumber disabled={userFormDisable} style={{width:'100%'}} />
      </Form.Item>
      <Form.Item
        label="رقم الهوية"
        name="id_no"
        >
          <Input disabled={userFormDisable} />
       </Form.Item>
       <Form.Item name={'id_type'} label="نوع الهوية">
        <Select 
        options={types.filter(function(e){return e.parent==3;})}
        optionFilterProp="children"
       filterOption={(input, option) =>
         option.props.children?.indexOf(input) >= 0 ||
         option.props.label?.indexOf(input) >= 0
       }
       filterSort={(optionA, optionB) =>
         optionA.props?.children?.localeCompare(optionB.props.children)
       }
        disabled={userFormDisable}>

        </Select>
      </Form.Item>
        </div>
        </Col>
        <Col xs={24} sm={24} md={16} lg={16} xl={16} span={16} style={{padding:'20px 0px 20px 20px'}}>
        <div style={{backgroundColor:'#fff',borderRadius:'10px',display:'flex',flexDirection:'column',padding:'10px 20px'}}>
        <Collapse defaultActiveKey={['1','2','3','4','5','6']} onChange={callback}>
          <Panel header="البيانات الوظيفة" key="1">
            <div>
              <div style={{display:'flex',flexDirection:'row'}}>
              <Form.Item style={{marginLeft:'5px',flex:2}} label="الوظيفة" name="job">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{marginLeft:'5px',flex:2}} label="الدرجة" name="level">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item  style={{marginLeft:'5px',flex:3}} label="الإدارة" name="category_id">
                <Select 
                disabled={userFormDisable}
                options={categories}
                optionFilterProp="children"
               filterOption={(input, option) =>
                 option.props.children?.indexOf(input) >= 0 ||
                 option.props.label?.indexOf(input) >= 0
               }
               filterSort={(optionA, optionB) =>
                 optionA.props?.children?.localeCompare(optionB.props.children)
               }
                >
                </Select>
              </Form.Item>
              </div>
              <div style={{display:'flex',flexDirection:'row'}}>
              <Form.Item style={{flex:3,marginLeft:'5px'}} label="تاريخ الانضمام" name="assignment_date">
                <DatePicker disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{flex:3}} label="نوع الدوام" name="durationtype_id">
                <Select
                 disabled={userFormDisable}
                 options={durations}
                 optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children?.indexOf(input) >= 0 ||
                  option.props.label?.indexOf(input) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.props?.children?.localeCompare(optionB.props.children)
                }
                 >
                </Select>
              </Form.Item>
              <Form.Item style={{flex:2}} label="حالة التوظيف" name="status">
                <Select 
                options={types.filter(function(e){return e.parent==5;})}
                optionFilterProp="children"
               filterOption={(input, option) =>
                 option.props.children?.indexOf(input) >= 0 ||
                 option.props.label?.indexOf(input) >= 0
               }
               filterSort={(optionA, optionB) =>
                 optionA.props?.children?.localeCompare(optionB.props.children)
               }
                disabled={userFormDisable}>
                </Select>
              </Form.Item>
              </div>
              <div style={{display:'flex',flexDirection:'row'}}>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="الراتب" name="salary">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item  style={{flex:1}} label="عملة الراتب" name="salary_currency">
                <Select 
                options={types.filter(function(e){return e.parent==4;})}
                optionFilterProp="children"
               filterOption={(input, option) =>
                 option.props.children?.indexOf(input) >= 0 ||
                 option.props.label?.indexOf(input) >= 0
               }
               filterSort={(optionA, optionB) =>
                 optionA.props?.children?.localeCompare(optionB.props.children)
               }
                disabled={userFormDisable}>
                </Select>
              </Form.Item>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="بدل المواصلات" name="transfer_value">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="مبلغ التكافل" name="symbiosis">
                <Input disabled={userFormDisable} />
              </Form.Item>

              </div>
            </div>
          </Panel>
          <Panel header="معلومات التواصل" key="2">
           <div>
             <div style={{display:'flex',flexDirection:'row'}}>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="عنوان السكن" name="address">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="البريد الإلكتروني" name="email">
                <Input disabled={userFormDisable} />
              </Form.Item>
              </div>
              <Form.List name="contacts">
        {(fields, { add, remove }) => {
          //fields=[{"key":"1","name":"re"},{"key":"2","name":"re2"}];
          return <>
            {
            fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'id']}
                  style={{display:'none'}}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  label={'نوع الرقم'}
                  name={[name, 'phone_type']}
                  rules={[{ required: true, message: 'Missing first name' }]}
                >
                  <Input disabled={userFormDisable} placeholder="نوع الرقم" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'phone_number']}
                  label={'رقم الهاتف'}
                  rules={[{ required: true, message: 'Missing last name' }]}
                >
                  <Input disabled={userFormDisable} placeholder="الرقم" />
                </Form.Item>
                 
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة رقم هاتف
              </Button>
            </Form.Item>
          </>
        }}
      </Form.List>          
           </div>
          </Panel>
          <Panel header="بيانات النظام" key="3">
            <div>
              <div style={{display:'flex',flexDirection:'row'}}>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="الرقم الوظيفي" name="user_id">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="اسم المستخدم" name="user_name">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="كلمة المرور" name="password">
                <Input.Password disabled={userFormDisable} />
              </Form.Item>
              </div>
            </div>
          </Panel> 
          <Panel header="المؤهلات العلمية" key="4">
           <div>
            <Form.List name="qualifications">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'id']}
                  style={{display:'none'}}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>

                <Form.Item
                  {...restField}
                  label={'اسم المؤهل '}
                  name={[name, 'qual_name']}
                  rules={[{ required: true, message: 'اسم المؤهل مطلوب' }]}
                >
                  <Input disabled={userFormDisable} placeholder="اسم المؤهل " />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'qual_year']}
                  label={'سنة الحصول عليه'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <DatePicker disabled={userFormDisable} picker="year" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'qual_source']}
                  label={'جهة الحصول عليه'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة مؤهل              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>   
           </div>
          </Panel>
          <Panel header="الوظائف السابقة" key="5">
          <div>
            <Form.List name="preworks">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'id']}
                  style={{display:'none'}}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  label={'اسم الوظيفة '}
                  name={[name, 'job_name']}
                  rules={[{ required: true, message: 'اسم الوظيفة مطلوب' }]}
                >
                  <Input disabled={userFormDisable} placeholder="اسم الوظيفة " />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'work_period']}
                  label={'فترة العمل'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <RangePicker  disabled={userFormDisable} picker="year" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'work_place']}
                  label={'الجهة'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة وظيفة سابقة              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>   
           </div>
          </Panel>
          <Panel header="الملفات المرفقة" key="6">
          <div>
            <Form.List name="attachments">
        {(fields, { add, remove }) => {

       return  <>
            {
            
            fields.map(({ key, name, ...restField },index) => {
             
            return ( 
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'id']}
                  style={{display:'none'}}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  label={'اسم المرفق '}
                  name={[name, 'attach_name']}
                  rules={[{ required: true, message: 'اسم المرفق مطلوب' }]}
                >
                  <Input disabled={userFormDisable} placeholder="اسم المرفق " />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'attach_path']}
                  //getValueFromEvent={getFile}
                  getValueFromEvent={({file}) => file.originFileObj}
                  label={'الملف المرفق'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                <Upload 
                      listType="text"
                      props={UploadProps}
                >
                  <Button type='primary'><UploadOutlined/> رفع الملف</Button>  
                  </Upload>
                </Form.Item>
                 <a target='_BLANK' href={attachments[index]?Env.HOST_SERVER_STORAGE+attachments[index]['attach_path']:""}> <FileOutlined hidden={!attachments[index]} /> {attachments[index]? attachments[index]['attach_name']:""}</a>                
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>);
        })}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة مرفق              </Button>
            </Form.Item>
          </>;
        }}
      </Form.List>   
           </div>
          </Panel>
       </Collapse>
        </div>
        </Col>
      </Row>
      </Form>
    </Modal>
  <Modal centered={true} className='att-modal' width={1200} title={" سجل حضور | "+selectedUserName} visible={isAVisibleModal}  onOk={function(){ }} onCancel={function(){setIsAVisibleModal(false);setSelectedUser(null);}}>
      <AttendanceTable setting={props.setting} user={selectedUser} key={isAVisibleModal}></AttendanceTable>
  </Modal>
  <Modal centered={true} className='task-modal' width={1200} title={"سجل إجازات | "+selectedUserName} visible={isTVisibleModal}  onOk={function(){ }} onCancel={function(){setIsTVisibleModal(false);setSelectedUser(null);}}>
      <TasksTable setting={props.setting} user={selectedUser} key={isTVisibleModal}></TasksTable>
  </Modal>
<Row gutter={[{xs: 2, sm: 16, md: 24, lg: 32 },{xs:2, sm: 16, md: 24, lg: 32 }]} style={{padding:20}}>
{listData}
{data.map(user=>{
 return <Col xs={24} sm={12} md={12} lg={8} xl={6} style={{padding:'10px',marginBottom: '-30px'}}  span={6}>
<Card className='content' style={{alignItems:'center',borderTopLeftRadius:'10px',borderTopRightRadius:'10px'}}>
  <Dropdown  
  overlay={<Menu>
        <Menu.Item key="1" onClick={function(){setSelectedUserName(user.name);openAttModal(user);}}>
        سجل الحضور
        </Menu.Item>
        <Menu.Item key="1" onClick={function(){openTaskModal(user);}}>
        سجل الإجازات
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3"  onClick={function(){userform.resetFields();setUserFormDisable(true);openShowUser(user);}}>عرض البيانات</Menu.Item>
        <Menu.Item key="4"  onClick={function(){userform.resetFields();setUserFormDisable(false);openShowUser(user);}}>تعديل البيانات</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="5"  onClick={function(){setIsRVisibleModal(true);openShowReport(user);}}>التقرير التفصيلي</Menu.Item>
      </Menu>} 
  trigger={['click']} > 
   <a style={{float:'left',fontSize:'20px'}} className="ant-dropdown-link" onClick={e => e.preventDefault()}>
     <MoreOutlined  key="ellipsis" />
    </a>
  </Dropdown>
<div  onClick={function(){userform.resetFields();setUserFormDisable(true);openShowUser(user);}} className='card-content' style={{display:'flex',flexDirection:'column'}}>
<Avatar
    size={{ xs: 60, sm: 60, md: 80, lg: 100, xl: 100, xxl: 100 }}
    src={Env.HOST_SERVER_STORAGE+user.avatar}
    style={{display:'block',margin:'10px',alignSelf:'center'}}
    />
    <Text style={{textAlign:'center',fontSize:'18px',marginBottom:'5px'}}>{user.user_name} </Text>
    <div style={{textAlign:'center'}}><Badge count={user.user_id} overflowCount={99999}  style={{ backgroundColor: '#DDDDDD',color:'#000' }} /></div>
    <Rate style={{textAlign: 'center',marginBottom:'5px'}} disabled allowHalf value={starList?.filter(function (e) { return e.user_id == user.user_id; })[0]?.star} />
    <Text style={{textAlign:'center',fontSize:'13px',color:user.leave_time==null && user.attendance_time==null?'#7E7D7C':'#000'}}>{user.leave_time==null && user.attendance_time!=null?
    ' متواجد الآن' :
       'غير متواجد '+timeSince((user.last_occ))
    } 
     <Badge  style={{marginRight:'5px'}} status={
      user.leave_time==null && user.attendance_time!=null?
    'success' :
    'default'
    }  />
     </Text>
</div>
  </Card>
  <Card className='footer' style={{borderBottomLeftRadius:'10px',borderBottomRightRadius:'10px'}}>
    <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}> 
    <Text style={{color:'#7E7D7C',fontSize:'12px'}}><ClusterOutlined /> {user.category} </Text>
    <Text style={{textAlign:'center',fontSize:'12px',color:'#7E7D7C'}}><TagsOutlined /> {user.job} </Text>
    </div>
  </Card>
</Col>
})}
  </Row>
</Layout>
);

}