/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import moment from 'moment';

import excel from 'xlsx';
import './style.css';
import logoText from '../../../assets/images/logo-text.png';
import { Typography ,Layout,Tabs,Table, Button,Progress, DatePicker, Select,Card,Modal } from 'antd';
import {SwapOutlined,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {Env} from './../../../styles';
const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
const {RangePicker}=DatePicker;
const exportToExcel=(type,fn,dl)=>{

  var elt = document.getElementsByTagName('table')[0];
  if(elt){
   var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
   return dl ?
   excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
   excel.writeFile(wb, fn || ('سجل الحضور.' + (type || 'xlsx')));  
  }
}
export default function attendanceTable(props){
      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [eventsLog,setEventsLog]=useState([]);
      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
      const [selected, setSelected] = useState([]);
      const [totalDays,setTotalDays]=useState(0);
      const [totalAtt,settotalAtt]=useState(0);
      const [totalLate,setTotalLate]=useState(0);
      const [totalLatePrice,setTotalLatePrice]=useState(0);
      const [salary,setSalary]=useState(0);
      const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
      const [end,setEnd]=useState(new Date().toISOString().slice(0, 10)); 
      const [dsalary,setDsalary]=useState(0);
      const [totalDebt,setTotalDebt]=useState(0);
      const [totalLoan,setTotalLoan]=useState(0);
      const [vacations,setVacations]=useState([]);
      const [vacationsTypes,setVacationsTypes]=useState([]);
      const [totalVacs,setTotalVacs]=useState([]);
      const [selUser,setSelUser]=useState(null);
      const [pdata, setPData] = useState([]);

    
      const id=cookies.user;   
      var allWorkHours=0;
      var allLateTimes=0;
      var allVacHours=0;
      var allBonusTimes=0;
      var allDiscounts=0.0;
    
      let curr=props.setting.filter((item)=> item.key == 'admin.currency')[0]?.value;
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {   
     
        axios.get(Env.HOST_SERVER_NAME+'dawam-info/'+props.user.user_id+'/'+start+'/'+end)
        .then(response => {
          setTotalDays(response.data.count[0].count);
          settotalAtt(response.data.data[0].attendanceDays);
          setTotalLate(response.data.data[0].lateTime);
          setTotalLatePrice(response.data.data[0].lateTimePrice);
          setSalary(response.data.data[0].salary);
          setDsalary(response.data.data[0].dsalary);
         // console.log(response.data);
          setVacations(response.data.vacs);
          setVacationsTypes(response.data.vacstypes);
          setTotalVacs(response.data.totalvacs);
          setTotalDebt(response.data.debt[0]['amount']);
          setTotalLoan(response.data.long_debt[0]['amount']);
        }).catch(function (error) {
          console.log('error');

          console.log(error);
        });
        setLoad(true);
        
        axios.get(Env.HOST_SERVER_NAME+'attendancelog/'+props.user.user_id+'/'+start+'/'+end)
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
          console.log(filters);
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
        
        mywindow.document.close();
       // mywindow.focus();
    
       // mywindow.print();
               
      // mywindow.close();   

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
    const  showModal = (record) => {
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
    const selectMonth=(value)=>{
      }  
    
  /*  let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};*/
    const columns = [
      {
        title: 'اليوم',
        dataIndex: 'dayName',
        key: 'dayName',
        ellipsis: true,
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
        title: 'التأخرات',
        dataIndex: 'lateTime',
        key: 'lateTime',
        sorter: (a, b) => a.lateTime.length - b.lateTime.length,
        sortOrder: sortedInfo.columnKey === 'lateTime' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'خصميات',
        dataIndex: 'discount',
        key: 'discount',
        sorter: (a, b) => a.discount - b.discount,
        sortOrder: sortedInfo.columnKey === 'discount' && sortedInfo.order,
        ellipsis: false,
        render:(discount)=>Math.round(discount)+" "+curr        
      },
      {
        title: 'الحدث',
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
        title: 'التأخرات',
        dataIndex: 'lateTime',
        key: 'lateTime',
        sorter: (a, b) => a.lateTime.length - b.lateTime.length,
        sortOrder: sortedInfo.columnKey === 'lateTime' && sortedInfo.order,
        ellipsis: true,
        render:(lateTime)=>lateTime?.toHHMMSS(),
      },
      {
        title: 'الدوام الإضافي',
        dataIndex: 'bonusTime',
        key: 'bonusTime',
        sorter: (a, b) => a.bonusTime.length - b.bonusTime.length,
        sortOrder: sortedInfo.columnKey === 'bonusTime' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'نوع الدوام',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'التقديم',
        key: 'action',
        render: () =><Button style={{backgroundColor:'#0972B6',borderColor:'#0972B6'}} type="primary" shape="round" icon={<FormOutlined />} ></Button>
        ,
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

return (
    <Layout className='attendance'>
    <Modal className='att-model' width={1100} title="أحداث اليوم"  visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
    <Table pagination={false} style={{textAlign:'center!important'}}  scroll={{x: '1000px' }} columns={dcolumns}  dataSource={selected} onCalendarChange={handleChange} />
    </Modal>
    <Card>
  <div className='attHeader'>
    <div className='attPer'><span><Progress type="circle" percent={Math.round((totalAtt/totalDays)*100)} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
      <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
        <div style={{marginBottom:'5px'}}>الدوام المطلوب : <span>{totalDays}</span> يوم </div>
        <div>الدوام الفعلي : <span>{totalAtt}</span> يوم </div>
      </span>
    </div>
    <div className='disPer'><span><Progress type="circle" percent={Math.round((totalLatePrice/salary)*100)} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
      <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
        <div style={{marginBottom:'5px'}}>التأخرات : <span>{parseInt(totalLate/60)} ساعة و {totalLate%60} دقيقة </span></div>
        <div>إجمالي الخصم : <span>{totalLatePrice}</span> {curr}</div>
      </span>
    </div>
    <div className='attOper'>
      <div className='attOperRange' style={{marginBottom:'10px'}}><span>اختر فترة : </span>
          <RangePicker style={{width: '200px'}} onCalendarChange={changeRange} />
      </div>    
      <div className='attOperBtn' style={{float: 'left'}}>
       <Button style={{margin:'0 10px',textAlign:'center',marginLeft:'5px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
        <Button style={{backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
      </div>    
    </div>
  </div>
    <Table  loading={load} style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onChange={handleChange} />
    </Card>
  <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "30%"}}>
           <img loading="eager" style={{width: "320px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "35%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",marginBottom: " 5px",margin: "0"}}>السجل التفصيلي للموظف</h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200",margin: "0"}}>للفترة من {start} إلى {end}</h2>
       </div>     
       <div style={{width: "35%"}}>
       <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',margin:'20px 5px'}}>
    <div style={{display:'flex',flexDirection:'row'}}><span><Progress type="circle" percent={Math.round((totalAtt/totalDays)*100)} width={70} style={{marginLeft:'5px',display:'inline-block'}} /></span>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>الدوام المطلوب : <span>{totalDays}</span> يوم </div>
    <div>الدوام الفعلي : <span>{totalAtt}</span> يوم </div>
    </span></div>
    <div style={{display:'flex',flexDirection:'row'}}><span><Progress type="circle" percent={Math.round((totalLatePrice/salary)*100)} width={70} style={{marginLeft:'5px',display:'inline-block'}} /></span>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>التأخرات : <span>{totalLate}</span> دقيقة </div>
    <div>إجمالي الخصم : <span>{totalLatePrice}</span> {curr}</div>
    </span></div>
    </div>
       </div>
    </header> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',padding: '10px',fontSize: '14px',borderBottom:'1px solid black'}} >
         <div style={{width: " 30%"}}>الاسم:  {props.user.name}</div>
         <div style={{width: " 20%"}}> الرقم الوظيفي:  {props.user.user_id} </div>
         <div style={{width: " 20%"}}>الوظيفة:  {props.user.job}</div>
         <div style={{width: " 30%"}}>الإدارة:  { typeof props.user.category === 'object'?props.user.category.name:props.user.category}</div>
    </div>
    <div >
        <table style={{fontSize: "12px",width: " 100%",textAlign: " center",marginTop: " 20px"}}>
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                     <th style={{fontWeight: "100"}}>اليوم</th>
                     <th style={{fontWeight: "100"}}>التاريح</th>
                     <th style={{fontWeight: "100"}}>زمن الحضور</th>
                     <th style={{fontWeight: "100"}}>زمن الانصراف</th>
                     <th style={{fontWeight: "100"}}>ساعات العمل</th>
                     <th style={{fontWeight: "100"}}>التأخرات</th>
                     <th style={{fontWeight: "100"}}>الإجازات</th>
                     <th style={{fontWeight: "100"}}>نوع الإجازة</th>
                     <th style={{fontWeight: "100"}}>الوقت الفائض</th>
                     <th style={{fontWeight: "100"}}>مبلغ الخصم</th>
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
                <td>{item.lateTime}</td>
                <td>{item.vacHours}</td>
                <td>{item.types?item.types:''}</td>
                <td>{item.bonusTime}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(item.discount))+" "+curr}</td>
                <td>{item.notes}</td>
              </tr>);
             })}
             <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                <td colSpan={4}>الإجمالي</td>
                <td>{allWorkHours.toString().toHHMMSS()}</td>
                <td>{allLateTimes.toString().toHHMMSS()}</td>
                <td>{allVacHours.toString().toHHMMSS()}</td>
                <td>{"-"}</td>
                <td>{allBonusTimes.toString().toHHMMSS()}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(allDiscounts))+" "+curr}</td>
                <td>{"-"}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div style={{display: "flex",flexDirection: "row",marginTop: "20px"}}>
        <table style={{fontSize: "12px",width: "50%",textAlign: "center",paddingLeft: "20px"}}>
            <caption style={{fontWeight: "900"}}>خلاصة الإجازات</caption>
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                  <th style={{fontWeight: "100"}}>نوع الإجازة</th>
                  {vacationsTypes.map(item=>(
                    <th style={{fontWeight: "100"}}>{item.name}</th>
                  ))}
                </tr>
            </thead>
            <tbody>
                <tr >
                 <td style={{backgroundColor: " #0972B6",color: "#fff"}}>الممنوحة</td>
                 {vacationsTypes.map(item=>(
                  <td rowspan={item.days?"1":"2"}>{vacations.find(it=>it.id==item.id)?vacations.find(it=>it.id==item.id).cumHours:0}</td>  
                 ))}  
                </tr>
                <tr style={{backgroundColor:'#e6e6e6'}}>
                 <td style={{backgroundColor: "#0972B6",color: "#fff"}}>المتبقية</td>
                 {vacationsTypes.map(item=>(
                  <td style={{display:item.days>0?'':'none'}}>{totalVacs.find(it=>it.vid==item.id)?totalVacs.find(it=>it.vid==item.id).rest.replace(/(\d{1,2}:\d{2}):\d{2}/, "$1"):0}</td>  
                 ))}  
                </tr>
            </tbody>
        </table>
        <table style={{fontSize: "12px",width: "50%",textAlign: "center",paddingRight: "20px"}}>
         <caption style={{fontWeight: "900"}}>خلاصة الخصميات</caption>
         <thead>
             <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
               <th style={{fontWeight: "100"}}>نوع الخصم</th>
               <th style={{fontWeight: "100"}}>الاستحقاق</th>            
               <th style={{fontWeight: "100"}}>غياب</th>
               <th style={{fontWeight: "100"}}>تأخرات</th>
               <th style={{fontWeight: "100"}}>سلفة</th>
               <th style={{fontWeight: "100"}}>أقساط</th>
               <th style={{fontWeight: "100"}}>الإجمالي</th>
               <th style={{fontWeight: "100"}}>صافي الراتب</th>
             </tr>
         </thead>
         <tbody>
             <tr style={{height: "20px"}}>
                 <td style={{backgroundColor: "#0972B6",color: "#fff"}}>المبلغ</td>
                 <td>{new Intl.NumberFormat('en-EN').format(props.user.salary)+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(Math.round(dsalary * (totalDays-totalAtt)))+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(totalLatePrice)+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(totalDebt)+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(totalLoan)+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format((Math.round(dsalary * (totalDays-totalAtt))+parseFloat(totalLatePrice)+parseFloat(totalDebt)+parseFloat(totalLoan)))+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(props.user.salary-(Math.round(dsalary * (totalDays-totalAtt))+parseFloat(totalLatePrice)+parseFloat(totalDebt)+parseFloat(totalLoan)))+" "+curr}</td>
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
