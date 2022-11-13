/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { useCookies,CookiesProvider  } from 'react-cookie';

import './style.css';
import {Table,Layout,Card,Progress,DatePicker,Button} from 'antd';
import ReactApexChart from "react-apexcharts";
import {ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';

import Avatar from 'antd/lib/avatar/avatar';
import axios from 'axios';
import {Env} from './../../../styles';
const {RangePicker}=DatePicker;

export default function deptsTable(props){
      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [data,setData]=useState([]);
      const [stdata,setStData]=useState([]);
      const [load,setLoad]=useState(true);
      const [today,setToday]=useState(new Date().toISOString().split('T')[0]);
      const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
      const [end,setEnd]=useState(new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0,10));
  
      const id=cookies.user;   
      const changeDate=(all,date)=>{
         setToday(date); 
      }
      function onLoad() {
        document.getElementById("elemID").scrollIntoView({ behavior: 'smooth' }); 
      }
    const  handleChange = (pagination, filters, sorter) => {
      console.log('Various parameters', pagination, filters, sorter);

          setFilteredInfo(filters);
          setSortedInfo(sorter);  
      };    
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {
        setLoad(true);
        axios.get(Env.HOST_SERVER_NAME+'categories-cards/'+today+'/'+start+'/'+end)
          .then(response => {
           
            setData(response.data.categories);
            setLoad(false);
          }).catch(function (error) {
            console.log(error);
          });
          
      }, [today]);

    const columns = [
      {
        title: 'الترتيب',
        key: 'att_percent',
        dataIndex: 'att_percent',
        ellipsis: false,
        width:'70px',
        render:(att_percent,record,index)=>index+1,
      },
      {
        title: 'اسم الإدارة',
        dataIndex: 'name',
        key: 'name',
        ellipsis: false,
        width:'150px',
      },
      {
        title: 'نسبة الحضور',
        dataIndex: 'att_percent',
        key: 'att_percent',
        sorter: (a, b) => a.att_percent - b.att_percent,
        sortOrder: sortedInfo.columnKey === 'att_percent' && sortedInfo.order,
        ellipsis: false,
        width:'100px',
        render:(att_percent,record,index)=><Progress className='attPerc' type="circle" width={50} percent={att_percent} strokeColor="#52c41a" />,
      },
      {
        title: 'عدد الموظفين',
        dataIndex: 'tot_users',
        key: 'tot_users',
        sorter: (a, b) => a.tot_users - b.tot_users,
        sortOrder: sortedInfo.columnKey === 'tot_users' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الحاضرون',
        dataIndex: 'att_users',
        key: 'att_users',
        ellipsis: true,
        
      },  
      {
        title: 'الغائبون',
        dataIndex: 'att_users',
        key: 'ab_users',
        
        sorter: (a, b) => a.attendance_time.length - b.attendance_time.length,
        sortOrder: sortedInfo.columnKey === 'att_users' && sortedInfo.order,
        ellipsis: true,
        render:(att_users,record,index)=>record.tot_users-record.att_users,

      },   
    ];
 
    const printReport=()=>{
      var report=document.getElementById('att-report');
      //var report=document.body;
     var mywindow = window.open('');
      mywindow.document.write("<html><head><title></title> <style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500&display=swap'); body{font-family:Tajawal;font-size:12px;margin:0}  </style>");
      mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
      mywindow.document.write(report.innerHTML);
      mywindow.document.write('</body></html>');
  
      mywindow.document.close();
       mywindow.onload = function() { // wait until all resources loaded 
        mywindow.focus(); // necessary for IE >= 10
        mywindow.print();  // change window to mywindow
        mywindow.close();// change window to mywindow
    };  
      /* var printContents = document.getElementById("att-report").innerHTML;
      var originalContents = document.body.innerHTML;
  
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;*/ 
    }
    const exportToExcel=(type,fn,dl)=>{

      var elt = document.getElementsByClassName('print-table')[0];
      if(elt){
       var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
       return dl ?
       excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
       excel.writeFile(wb, fn || ('سجل حضور الإدارات ليوم '+ days[new Date(today ).getDay()]+" الموافق "+today +"."+(type || 'xlsx')));  
      }
    }
    var rank=1;
    var days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

return (
  <Layout className='depts'>
  <Card>
  <div style={{display:'flex',flexDirection:'row',marginBottom:'20px',justifyContent:'space-between'}}>

  <div style={{display:'flex',flex:1,flexDirection:'row',justifyContent:'flex-end'}}>     
    <div style={{marginBottom:'10px',marginLeft:'5px'}}><span>اختر يوم : </span>
    <DatePicker onChange={changeDate} />
    </div>
    <Button style={{display:'block',marginLeft:'5px',marginBottom:'10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
    <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
    </div>
    </div>
    <Table 

    onRow={(record, rowIndex) => {
    
    if(record.id==id.category_id){
   
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
           <h1 style={{textAlign:'center',fontSize: " 18px",marginBottom: " 5px",margin: "0"}}>سجل حضور الإدارات</h1>
           <h2 style={{textAlign:'center',fontSize: " 14px",fontWeight: " 200",margin: "0"}}>ليوم {days[new Date(today ).getDay()] } الموافق {today}</h2>
       </div>
       <div style={{padding:'20px',fontWeight:'600',fontSize:'14px',textAlign:'left',width:'100%',flex:1}}>


       </div>

    </header> 
    <div >
        <table className='print-table' style={{fontSize: "12px",width: " 100%",textAlign: " center",marginTop: " 20px"}}>
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                    <th style={{fontWeight: "100"}}>م</th>
                    <th style={{fontWeight: "100"}}>الإدارة</th>
                    <th style={{fontWeight: "100"}}>نسبة الحضور</th>
                     <th style={{fontWeight: "100"}}>عدد الموظفين</th>
                     <th style={{fontWeight: "100"}}>الحاضرون</th>
                     <th style={{fontWeight: "100"}}>الغائبون</th>
                </tr>
            </thead>
            <tbody>
             
             {data.map(item=>(
              <tr style={{height: " 25px",backgroundColor:data.indexOf(item) %2!=0?'#e6e6e6':'#fff'}}>
                <td>{rank++}</td>
                <td>{item.name}</td>
                <td>{item.att_percent+'%'}</td>
                <td>{item.tot_users}</td>
                <td>{item.att_users}</td>
                <td>{item.tot_users-item.att_users}</td>
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
