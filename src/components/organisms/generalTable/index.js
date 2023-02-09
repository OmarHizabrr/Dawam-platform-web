/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { useCookies,CookiesProvider  } from 'react-cookie';

import './style.css';
import {Table,Layout,Card,Rate,DatePicker,Button,Progress} from 'antd';
import ReactApexChart from "react-apexcharts";
import {ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';

import Avatar from 'antd/lib/avatar/avatar';
import axios from 'axios';
import {Env} from './../../../styles';
const {RangePicker}=DatePicker;

export default function generalTable(props){
  const [cookies, setCookie, removeCookie]=useCookies(["userId"]);

      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [data,setData]=useState([]);
      const [stdata,setStData]=useState([]);
      const [attAvg,setAttAvg]=useState(0);
      const [abCount,setAbCount]=useState(0);
      const [lateCount,setLateCount]=useState(0);
      const [timelyCount,setTimelyCount]=useState(0);

      const [load,setLoad]=useState(true);
      const [today,setToday]=useState(new Date().toISOString().split('T')[0]);
      const [starList,setStarList]=useState([]); 

      const id=cookies.user;   
      const changeDate=(all,date)=>{
         setToday(date); 
      }
      function onLoad() {
        document.getElementById("elemID").scrollIntoView({ behavior: 'smooth' }); 
      }
    const  handleChange = (pagination, filters, sorter) => {
          setFilteredInfo(filters);
          setSortedInfo(sorter);  
      };    
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {
        setLoad(true);
        axios.get(Env.HOST_SERVER_NAME+'all-users-log/'+today)
          .then(response => {
            setData(response.data['logs']);
            setAttAvg(Math.round(response.data.logs.length/response.data['users_count']*100));           
            setAbCount(response.data['users_count']-response.data.logs.length);
            setLateCount(response.data.late_count[0].lateCount);
            setTimelyCount(response.data.logs.length-response.data.late_count[0].lateCount);

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
      }, [today]);

    const columns = [
      {
        title: 'الترتيب',
        key: 'avatar',
        dataIndex: 'avatar',
        ellipsis: false,
        width:'70px',
        render:(avatar,record,index)=>index+1,
      },
      {
        title: 'وقت الحضور',
        dataIndex: 'attendance_time',
        key: 'attendance_time',
        sorter: (a, b) => a.attendance_time.length - b.attendance_time.length,
        sortOrder: sortedInfo.columnKey === 'attendance_time' && sortedInfo.order,
        ellipsis: false,
        width:'150px',
      }, 
      {
        title: 'الاسم',
        dataIndex: 'user_name',
        key: 'user_name',
        ellipsis: false,
        width:'180px',
        render:(user_name,record )=> (
          <div>
          <Avatar src={Env.HOST_SERVER_STORAGE+record.avatar}>
          </Avatar>
          <span style={{marginRight:'10px'}}>{user_name}</span>
          </div>
        )
      },
      {
        title: 'تقييم الانضباط',
        dataIndex: 'user_id',
        key: 'user_id',
        ellipsis: false,
        width:'180px',
        render:(user_id,record )=> (
          <Rate style={{textAlign: 'center',marginBottom:'5px'}} disabled allowHalf value={starList?.filter(function (e) { return e.user_id == user_id; })[0]?.star} />
        )
      },
      {
        title: 'الإدارة',
        dataIndex: 'department',
        key: 'department',
        sorter: (a, b) => a.department - b.department,
        sortOrder: sortedInfo.columnKey === 'department' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الوظيفة',
        dataIndex: 'job',
        key: 'job',
        ellipsis: true,
      },  
   
    ];
 
    const printReport=()=>{
      var report=document.getElementById('att-report');
      //var report=document.body;
     var mywindow = window.open('');
      mywindow.document.write("<html><head><title></title> <style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500&display=swap'); body{font-family:Tajawal;font-size:12px;margin:0}  </style><style type='text/css' media='print'>@page { size: portrait; }</style>");
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
    const exportToExcel=(type,fn,dl)=>{

      var elt = document.getElementsByClassName('print-table')[0];
      if(elt){
       var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
       return dl ?
       excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
       excel.writeFile(wb, fn || ('حافظة دوام ليوم '+ days[new Date(today ).getDay()]+" الموافق "+today +"."+(type || 'xlsx')));  
      }
    }
    var rank=1;
    var days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

return (
  <Layout>
  <Card>
  <div className='generalHeader' >
  <div className='generalData'>
  <div className='attPer'><span>
    <Progress type="circle" percent={Math.round(attAvg)} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
      <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
        <div style={{marginBottom:'5px'}}>الحاضرون : <span>{data.length}</span> </div>
        <div>الغائبون : <span>{abCount}</span>  </div>
      </span>
    </div>
    <div className='disPer'><span><Progress type="circle" percent={Math.round((timelyCount/data.length)*100)} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
      <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
        <div style={{marginBottom:'5px'}}>المنضبطون : <span>{timelyCount} </span></div>
        <div>المتأخرون : <span>{lateCount}</span></div>
      </span>
    </div>
  </div>
  <div className='generalOper'>     
    <div style={{marginBottom:'10px',marginLeft:'5px'}}><span>اختر يوم : </span>
    <DatePicker onChange={changeDate} /></div>
    <Button style={{display:'block',marginLeft:'5px',marginBottom:'10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
    <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
    </div>
    </div>
    <Table 
    className='genTable'
    onRow={(record, rowIndex) => {
     
    if(record.user_id==id.user_id){
   
    return {
      style:{backgroundColor:'#D3D3D3'},
      onLoad:event=>{onLoad();},
      id:"elemID",
    };
    }
  }}
     pagination={false}  scroll={{x: '1000px' }} loading={load} columns={columns} dataSource={data} onChange={handleChange} />
    </Card>
    <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header  style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{flex:1}}>
           <img loading="eager" style={{width: "280px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{height:'100%',fontSize: "11px",textAlign: "center",flex:1}}>
            <div style={{height:'50px'}}></div>
           <h1 style={{textAlign:'center',fontSize: " 18px",marginBottom: " 5px",margin: "0"}}>حافظة دوام الموظفين</h1>
           <h2 style={{textAlign:'center',fontSize: " 14px",fontWeight: " 200",margin: "0"}}>ليوم {days[new Date(today ).getDay()] } الموافق {today}</h2>
       </div>
       <div style={{padding:'20px 30px 20px 10px',fontWeight:'600',fontSize:'14px',textAlign:'right',width:'100%',flex:1}}>
         <div>نسبة الحضور: {Math.round(attAvg)+'%'}</div>
         <div>عدد المنضبطين: {timelyCount}</div>
         <div>عدد المتأخرين: {lateCount}</div>
         <div>عدد المتغيبين: {abCount}</div>
       </div>

    </header> 
    <div >
        <table className='print-table' style={{fontSize: "11px",width: " 100%",textAlign: " center",marginTop: " 20px"}}>
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                    <th style={{fontWeight: "100"}}>م</th>
                    <th style={{fontWeight: "100",fontSize:'8px'}}>الرقم الوظيفي</th>
                     <th style={{fontWeight: "100"}}>الاسم</th>
                     <th style={{fontWeight: "100"}}>الإدارة</th>
                     <th style={{fontWeight: "100"}}>الوظيفة</th>
                     <th style={{fontWeight: "100"}}>زمن الحضور</th>
                     <th style={{fontWeight: "100"}}>زمن الانصراف</th>
                     <th style={{fontWeight: "100"}}>الدوام الفعلي</th>
                </tr>
            </thead>
            <tbody>
             
             {data.map(item=>(
              <tr style={{height: " 30px",backgroundColor:data.indexOf(item) %2!=0?'#e6e6e6':'#fff'}}>
                <td>{rank++}</td>
                <td>{item.user_id}</td>
                <td>{item.fullname}</td>
                <td style={{fontSize:'8px'}}>{item.department}</td>
                <td style={{fontSize:'8px'}}>{item.job}</td>
                <td>{item.attendance_time}</td>
                <td>{item.leave_time}</td>
                <td>{item.workHours}</td>
              </tr>
             ))}
            </tbody>
        </table>
    </div>
    <div style={{display: "flex",flexDirection: "row",marginTop: "20px",textAlign: "center"}}>
       <div style={{width: "50%",fontWeight: "900"}}>المختص</div>
       <div style={{width: "50%",fontWeight: "900"}}>مدير الشؤون</div>
     </div>  
     <div style={{marginTop: " 20px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #0972B6",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
     </div>
 </div> 
 </div>
</Layout>
);
 }


