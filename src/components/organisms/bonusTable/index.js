/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/ar-ly';

import excel from 'xlsx';
import './style.css';
import logoText from '../../../assets/images/logo-text.png';
import { Typography,notification ,Layout,Tabs,Table, Button,Progress, DatePicker,Form,Input, Spin,Select,Card,Modal } from 'antd';
import {SwapOutlined,FormOutlined,ExportOutlined,PrinterOutlined,CopyOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {Env} from './../../../styles';
const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
const {RangePicker}=DatePicker;
const {TextArea}=Input;
const exportToExcel=(type,fn,dl)=>{

  var elt = document.getElementsByTagName('table')[0];
  if(elt){
   var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
   return dl ?
   excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
   excel.writeFile(wb, fn || ('سجل الحضور.' + (type || 'xlsx')));  
  }
}
export default function bonusTable(props){
      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [isVModalVisible,setIsVModalVisible]=useState(false);
      const [datefromValue,setDatefromValue]=useState(null);
      const [datetoValue,setDatetoValue]=useState(null);

      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
      const [selected, setSelected] = useState([]);
      const [start,setStart]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
      const [end,setEnd]=useState(moment().format('YYYY-MM-DD'));  
      const [notes,setNotes]=useState("");

      const [saving,setSaving]=useState(false);
      const [type,setType]=useState(null);
      const [totalVac,setTotalVac]=useState("");

      const [givenTasks, setGivenTasks] = useState(null);
      const [restTasks, setRestTasks] = useState(null);
      const [givenLoad, setGivenLoad] = useState(true);

      const [pdata, setPData] = useState([]);
      const [currentMonth,setCurrentMonth]=useState(moment().format('MMMM'));   
      const [detailedDay,setDetailedDay]=useState("");
      const [form] = Form.useForm();

      const id=cookies.user;   
      var allWorkHours=0;
      var allLateTimes=0;
      var allVacHours=0;
      var allBonusTimes=0;
      var allDiscounts=0.0;
    
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {   
      axios.get(Env.HOST_SERVER_NAME+'bonuslog/'+props.user.user_id+'/'+start+'/'+end)
      .then(response => {
        setData(response.data);
        setPData(response.data);
        setLoad(false);
      }).catch(function (error) {
        console.log(error);
      });        
       },[start,end,props.user]);

       const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
        
        if(sorter.order){
          data.sort((a, b) => {return sorter.column.sorter(a, b)});
          setPData(sorter.order=='descend'?data.reverse():data);
        }

        if(filters){       

          Object.keys(filters).forEach(key => {

            if(filters[key]!=null){
              setPData(data.filter(item => filters[key].includes(item[key])));

            }
            
          });               
        }

      };

      const changeRange=(all,date)=>{
        setStart(date[0]);
        setEnd(date[1]);       
      }

      const printReport=()=>{
        var report=document.getElementById('att-report');
        //var report=document.body;
       var mywindow = window.open('');
        mywindow.document.write("<html><head><title></title> <style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500&display=swap'); body{font-family:Tajawal;font-size:12px;margin:0}  </style><style type='text/css' media='print'>@page { size: A4 landscape; print-color-adjust: exact !important;  -webkit-print-color-adjust: exact !important;}</style>");
        mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
        mywindow.document.write(report.innerHTML);
        mywindow.document.write('</body></html>');
        mywindow.print();  // change window to mywindow
       // mywindow.close();

 /*        var printContents = document.getElementById("att-report").innerHTML;
        var originalContents = document.body.innerHTML;
    
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;*/ 
      }

    const  showModal = (record) => {
      setDetailedDay(record.date);
      axios.get(Env.HOST_SERVER_NAME+'attendancelogs/'+props.user.user_id+'/'+record.date)
      .then(response => {
        setSelected(response.data);
      }).catch(function (error) {
        console.log(error);
      });
    
        setIsModalVisible(true);
      };

    const handleOk = () => {
        setIsModalVisible(false);
      };

    const columns = [

      {
        title: 'اليوم',
        dataIndex: 'dayName',
        key: 'dayName',
        ellipsis: true,
        render:(dayName,record,_)=>(
          <>
          {dayName}
          </>
        )
      },
      {
        title: 'التاريخ',
        dataIndex: 'date',
        key: 'date',
        sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
        sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'وقت الحضور',
        dataIndex: 'attendance_time',
        key: 'attendance_time',
        sorter: (a, b) => {
          if(a && a.attendance_time && a.attendance_time.length && b && b.attendance_time && b.attendance_time.length) {
              return a.attendance_time.length - b.attendance_time.length;
          } else if(a && a.attendance_time && a.attendance_time.length) {
              return -1;
          } else if(b && b.attendance_time && b.attendance_time.length) {
              return 1;
          }
                return 0;
      },
        sortOrder: sortedInfo.columnKey === 'attendance_time' && sortedInfo.order,
        ellipsis: true,
      },     
       {
        title: 'وقت الانصراف',
        dataIndex: 'leave_time',
        key: 'leave_time',
        sorter: (a, b) => {
          if(a && a.leave_time && a.leave_time.length && b && b.leave_time && b.leave_time.length) {
              return a.leave_time.length - b.leave_time.length;
          } else if(a && a.leave_time && a.leave_time.length) {
              return -1;
          } else if(b && b.leave_time && b.leave_time.length) {
              return 1;
          }
                return 0;
      },
        sortOrder: sortedInfo.columnKey === 'leave_time' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'صافي الدوام',
        dataIndex: 'workHours',
        key: 'workHours',
        sorter: (a, b) => a.workHours?.localeCompare(b.workHours),
        sortOrder: sortedInfo.columnKey === 'workHours' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الوقت الإضافي',
        dataIndex: 'bonusTime',
        key: 'bonusTime',
        sorter: (a, b) => a.bonusTime?.localeCompare(b.bonusTime),
        sortOrder: sortedInfo.columnKey === 'bonusTime' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'التفاصيل',
        key: 'action',
        render: (vid, record, index) => (
          <Button
            onClick={function () {
              showModal(record);
            }}
            type="primary"
            shape="round"
            icon={<SwapOutlined />}
          ></Button>
          ),
      },
    ];
    const dcolumns = [
      {
        title: 'زمن الدخول',
        dataIndex: 'attendance_time',
        key: 'attendance_time',
        sorter: (a, b) => a.attendance_time.length - b.attendance_time.length,
        sortOrder: sortedInfo.columnKey === 'attendance_time' && sortedInfo.order,
        ellipsis: true,
        render:(attendance_time)=>attendance_time?.split(' ')[1],
      },
      {
        title: 'زمن الخروج',
        dataIndex: 'leave_time',
        key: 'leave_time',
        sorter: (a, b) => a.leave_time.length - b.leave_time.length,
        sortOrder: sortedInfo.columnKey === 'leave_time' && sortedInfo.order,
        ellipsis: true,
        render:(leave_time)=>leave_time?.split(' ')[1],
      },
      {
        title: 'ساعات العمل',
        dataIndex: 'workHour',
        key: 'workHour',
        sorter: (a, b) => a.workHour.length - b.workHour.length,
        sortOrder: sortedInfo.columnKey === 'workHour' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الوقت الإضافي',
        dataIndex: 'bonusTime',
        key: 'bonusTime',
        sorter: (a, b) => a.bonusTime.length - b.bonusTime.length,
        sortOrder: sortedInfo.columnKey === 'bonusTime' && sortedInfo.order,
        ellipsis: true,
      },
    ];
    String.prototype.toHHMMSS = function () {
      var sec_num = parseInt(this, 10); // don't forget the second param
      var hours   = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
      var seconds = sec_num - (hours * 3600) - (minutes * 60);
  
      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
      return hours+':'+minutes+':'+seconds;
  }
  const convertTimeToSeconds=(fullTime)=>{
    var seconds=0;
    if(fullTime==null || fullTime==0){
      seconds=0;
      }
      else{
       var time=fullTime.split(":");
       seconds=((parseInt(time[0]) * 60 * 60) + (parseInt(time[1]) * 60)+parseInt(time[2]));
      }
      return seconds;
  }
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onChange=(all,data)=>{
    setCurrentMonth(all.format('MMMM'));

    var startDay=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value;
    var endDay=props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value;

    setStart(moment(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
    setEnd(moment(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));
    }
    const checkPeriod=(all,date)=>{
      if(date[1]!=''){
        const minutes=(new Date(date[1])-new Date(date[0]))/60000;
        var alerta="";
        if(minutes<=420) alerta=(Math.floor(minutes/60)+" ساعة و "+(minutes%60))+" دقيقة ";
        else alerta=(Math.floor(minutes/1440)+1)+" يوم ";
        setTotalVac(alerta); 
      }
    }

return (
    <Layout className='attendance'>

    <Modal className='att-model' width={1100} title={"أحداث اليوم | "+detailedDay}  visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
    <Table pagination={false} style={{textAlign:'center!important'}}  scroll={{x: '1000px' }} columns={dcolumns}  dataSource={selected} onCalendarChange={handleChange} />
    </Modal>
    <Card>
  <div className='attHeader'>
    <div className='attPer'>
      
    </div>
    <div className='disPer'>
      
    </div>
    <div className='attOper'>
    <div style={{marginLeft:'10px'}}>
        <span>اختر شهرًا : </span>
        <DatePicker defaultValue={moment()} onChange={onChange} picker="month" />
      </div>
      <div className='attOperRange' style={{marginBottom:'10px'}}><span>اختر فترة : </span>
          <RangePicker value={[moment(start,"YYYY-MM-DD"),moment(end,"YYYY-MM-DD")]} style={{width: '230px'}} onCalendarChange={changeRange} />
      </div>    
      <div className='attOperBtn' style={{textAlign: 'left'}}>
       <Button disabled={load} style={{margin:'0 10px',textAlign:'center',marginLeft:'5px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
        <Button disabled={load} style={{backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
      </div>    
    </div>
  </div>
    <Table  loading={load} style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} 
      onRow={(record, rowIndex) => {
        var bc;
        if(record.attendance_time==null || record.leave_time==null)
               bc="#FCEF96";

        return{
          className:record.status,
          style:{backgroundColor:bc,}
        };}}

      dataSource={data} 
      onChange={handleChange} />
    </Card>
  <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "30%"}}>
           <img loading="eager" style={{width: "320px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "35%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",marginBottom: " 5px",margin: "0"}}>سجل الدوم الإضافي</h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200",margin: "0"}}>للفترة من {start} إلى {end}</h2>
       </div>     
       <div style={{width: "35%"}}>

       </div>
    </header> 
    <div class="table-info" style={{display: 'flex',flexDirection: 'row',textAlign: 'center',padding: '10px',fontSize: '14px',borderBottom:'1px solid black'}} >
         <div style={{width: " 30%"}}>الاسم:  {props.user.name}</div>
         <div style={{width: " 20%"}}> الرقم الوظيفي:  {props.user.user_id} </div>
         <div style={{width: " 20%"}}>الوظيفة:  {props.user.job}</div>
         <div style={{width: " 30%"}}>الإدارة:  { typeof props.user.category === 'object'?props.user.category.name:props.user.category}</div>
    </div>
    <div>
        <table style={{fontSize: "12px",width: " 100%",textAlign: " center",marginTop: " 20px"}}>
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                     <th style={{fontWeight: "100"}}>اليوم</th>
                     <th style={{fontWeight: "100"}}>التاريح</th>
                     <th style={{fontWeight: "100"}}>زمن الحضور</th>
                     <th style={{fontWeight: "100"}}>زمن الانصراف</th>
                     <th style={{fontWeight: "100"}}>ساعات العمل</th>

                     <th style={{fontWeight: "100"}}>الوقت الفائض</th>
                     <th style={{fontWeight: "100",width: " 300px"}}>ملاحظات</th>
                </tr>
            </thead>
            <tbody>
             
             {pdata.map(item=>{

               allWorkHours+=convertTimeToSeconds(item.workHours);
               allLateTimes+=convertTimeToSeconds(item.lateTime);
               allVacHours+=convertTimeToSeconds(item.vacHours);
               allBonusTimes+=convertTimeToSeconds(item.bonusTime);
               allDiscounts+=item.discount*1;
               return(
              <tr style={{height: " 25px",backgroundColor:item.attendance_time || item.discount==0 || item.types ?data.indexOf(item) %2!=0?'#e6e6e6':'#fff':'rgb(233 184 184)'}}>
                <td>{item.dayName}</td>
                <td>{item.date}</td>
                <td>{item.attendance_time}</td>
                <td>{item.leave_time}</td>
                <td>{item.workHours}</td>
                <td>{item.bonusTime}</td>
                <td style={{width: "300px"}}>{' '}</td>
              </tr>);
             })}
             <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                <td colSpan={4}>الإجمالي</td>
                <td>{allWorkHours.toString().toHHMMSS()}</td>
                <td>{allBonusTimes.toString().toHHMMSS()}</td>
                <td>{"-"}</td>
                </tr>
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