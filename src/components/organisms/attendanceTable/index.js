/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import './style.css';
import logoText from '../../../assets/images/logo-text.png';
import { Typography ,Layout,Tabs,Table, Button,Progress, DatePicker, Select,Card,Image } from 'antd';
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
export default function attendanceTable(){
      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [eventsLog,setEventsLog]=useState([]);
      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
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
      const id=cookies.user;   
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {
        
        axios.get(Env.HOST_SERVER_NAME+'dawam-info/'+id.user_id+'/'+start+'/'+end)
        .then(response => {
          console.log(response);
          setTotalDays(response.data.count[0].count);
          settotalAtt(response.data.data[0].attendanceDays);
          setTotalLate(response.data.data[0].lateTime);
          setTotalLatePrice(response.data.data[0].lateTimePrice);
          setSalary(response.data.data[0].salary);
          setDsalary(response.data.data[0].dsalary);
          setVacations(response.data.vacs);
          setVacationsTypes(response.data.vacstypes);
          setTotalVacs(response.data.totalvacs);
          console.log(totalVacs);
        });
        setLoad(true);
        
        axios.get(Env.HOST_SERVER_NAME+'attendancelog/'+id.user_id+'/'+start+'/'+end)
        .then(response => {
          setData(response.data);
          setLoad(false);
        });
       },[start,end]);

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
      };
      const changeRange=(all,date)=>{
        setStart(date[0]);
        setEnd(date[1]);       
      }
      const printReport=()=>{
        var report=document.getElementById('att-report');
        //var report=document.body;
       var mywindow = window.open('');
        mywindow.document.write("<html><head><title></title> <style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500&display=swap'); body{font-family:Tajawal;font-size:12px;margin:0}  </style>");
        mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
        mywindow.document.write(report.innerHTML);
        mywindow.document.write('</body></html>');
    
        mywindow.document.close();
        mywindow.focus();
    
        mywindow.print();
        mywindow.close();   
        /* var printContents = document.getElementById("att-report").innerHTML;
        var originalContents = document.body.innerHTML;
    
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;*/ 
      }
    const  showModal = () => {
        setIsModalVisible(true);
      };  
     const handleOk = () => {
        setIsModalVisible(false);

      }; 
    const selectMonth=(value)=>{
      console.log(new Date(new Date().getFullYear(), value, 0).getDate());

      }  
    
  /*  let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};*/
    const columns = [
      {
        title: 'اليوم',
        dataIndex: 'dayName',
        key: 'dayName',
        filters: [
          { text: 'Joe', value: 'Joe' },
          { text: 'Jim', value: 'Jim' },
        ],
        filteredValue: filteredInfo.dayName || null,
        onFilter: (value, record) => record.dayName.includes(value),
        sorter: (a, b) => a.dayName.length - b.dayName.length,
        sortOrder: sortedInfo.columnKey === 'dayName' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'التاريخ',
        dataIndex: 'date',
        key: 'date',
        sorter: (a, b) => a.date - b.date,
        sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'وقت الحضور',
        dataIndex: 'attendance_time',
        key: 'attendance_time',
        sorter: (a, b) => a.attendance_time.length - b.attendance_time.length,
        sortOrder: sortedInfo.columnKey === 'attendance_time' && sortedInfo.order,
        ellipsis: true,
      },     
       {
        title: 'وقت الانصراف',
        dataIndex: 'leave_time',
        key: 'leave_time',
        sorter: (a, b) => a.leave_time.length - b.leave_time.length,
        sortOrder: sortedInfo.columnKey === 'leave_time' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'صافي الدوام',
        dataIndex: 'workHours',
        key: 'workHours',
        sorter: (a, b) => a.workHours.length - b.workHours.length,
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
        render:(discount)=>Math.round(discount)+" ر.ي"        
      },
      {
        title: 'الحدث',
        key: 'action',
        render: () =><Button type="primary" onClick={showModal} shape="round" icon={<SwapOutlined />} ></Button>
        ,
      },
      {
        title: 'التقديم',
        key: 'action',
        render: () =><Button style={{backgroundColor:'#007236',borderColor:'#007236'}} type="primary" shape="round" icon={<FormOutlined />} ></Button>
        ,
      },
    ];

return (
    <Layout>
    <Card>
    <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginBottom:'30px'}}>
    <div style={{display:'flex',flexDirection:'row'}}><span><Progress type="circle" percent={Math.round((totalAtt/totalDays)*100)} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>الدوام المطلوب : <span>{totalDays}</span> يوم </div>
    <div>الدوام الفعلي : <span>{totalAtt}</span> يوم </div>
    </span></div>
    <div style={{display:'flex',flexDirection:'row'}}><span><Progress type="circle" percent={Math.round((totalLatePrice/salary)*100)} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>التأخرات : <span>{totalLate}</span> دقيقة </div>
    <div>إجمالي الخصم : <span>{totalLatePrice}</span> ر.ي </div>
    </span></div>
    <div style={{float:'left',marginBottom:'10px'}}>
    <div style={{marginBottom:'10px'}}><span>اختر فترة : </span>
    <RangePicker  onCalendarChange={changeRange} /></div>
    <div style={{float: 'left'}}>
    <Button style={{display:'block',marginBottom:'10px',width:'160px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /> تصدير كملف اكسل </Button>
    <Button style={{display:'block',width:'160px',backgroundColor:"#007236",borderColor:"#007236"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /> طباعة السجل </Button>
   </div>
    </div>
    </div>
    <Table loading={load} style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onCalendarChange={handleChange} />
    </Card>
    <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "30%"}}>
           <img loading="eager" style={{width: "320px"}} src={logoText}/>
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
    <div>إجمالي الخصم : <span>{totalLatePrice}</span> ر.ي </div>
    </span></div>
    </div>
       </div>
    </header> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',padding: '10px',fontSize: '14px',borderBottom:'1px solid black'}} >
         <div style={{width: " 30%"}}>الاسم:  {id.name}</div>
         <div style={{width: " 20%"}}> الرقم الوظيفي:  {id.user_id} </div>
         <div style={{width: " 20%"}}>الوظيفة:  {id.job}</div>
         <div style={{width: " 30%"}}>الإدارة:  {id.category.name}</div>
    </div>
    <div >
        <table style={{fontSize: "12px",width: " 100%",textAlign: " center",marginTop: " 20px"}}>
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#007236",height: "30px"}}>
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
             
             {data.map(item=>(
              <tr style={{height: " 25px",backgroundColor:item.attendance_time || item.discount==0 || item.types ?data.indexOf(item) %2!=0?'#e6e6e6':'#fff':'rgb(233 184 184)'}}>
                <td>{item.dayName}</td>
                <td>{item.date}</td>
                <td>{item.attendance_time}</td>
                <td>{item.leave_time}</td>
                <td>{item.workHours}</td>
                <td>{item.lateTime}</td>
                <td>{item.vacHours}</td>
                <td>{vacationsTypes.find(it=>it.id==item.types)?vacationsTypes.find(it=>item.types==it.id).name:''}</td>
                <td>{item.bonusTime}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(item.discount))+" ر.ي "}</td>
                <td>{''}</td>
              </tr>
             ))}
            </tbody>
        </table>
    </div>
    <div style={{display: "flex",flexDirection: "row",marginTop: "20px"}}>
        <table style={{fontSize: "12px",width: "50%",textAlign: "center",paddingLeft: "20px"}}>
            <caption style={{fontWeight: "900"}}>خلاصة الإجازات</caption>
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#007236",height: "30px"}}>
                  <th style={{fontWeight: "100"}}>نوع الإجازة</th>
                  {vacationsTypes.map(item=>(
                    <th style={{fontWeight: "100"}}>{item.name}</th>
                  ))}
                </tr>
            </thead>
            <tbody>
                <tr >
                 <td style={{backgroundColor: " #007236",color: "#fff"}}>الممنوحة</td>
                 {vacationsTypes.map(item=>(
                  <td rowspan={item.days?"1":"2"}>{vacations.find(it=>it.id==item.id)?vacations.find(it=>it.id==item.id).cumHours:0}</td>  
                 ))}  
                </tr>
                <tr style={{backgroundColor:'#e6e6e6'}}>
                 <td style={{backgroundColor: "#007236",color: "#fff"}}>المتبقية</td>
                 {vacationsTypes.map(item=>(
                  <td style={{display:item.days>0?'':'none'}}>{totalVacs.find(it=>it.id==item.id)?totalVacs.find(it=>it.id==item.id).restHours:0}</td>  
                 ))}  
                </tr>
            </tbody>
        </table>
        <table style={{fontSize: "12px",width: "50%",textAlign: "center",paddingRight: "20px"}}>
         <caption style={{fontWeight: "900"}}>خلاصة الخصميات</caption>
         <thead>
             <tr style={{color:"#fff",backgroundColor: "#007236",height: "30px"}}>
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
                 <td style={{backgroundColor: "#007236",color: "#fff"}}>المبلغ</td>
                 <td>{new Intl.NumberFormat('en-EN').format(id.salary)+" ر.ي "}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(Math.round(dsalary * (totalDays-totalAtt)))+" ر.ي "}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(totalLatePrice)+" ر.ي "}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(totalDebt)+" ر.ي "}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(totalLoan)+" ر.ي "}</td>
                 <td>{new Intl.NumberFormat('en-EN').format((Math.round(dsalary * (totalDays-totalAtt))+totalLatePrice+totalDebt+totalLoan))+" ر.ي "}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(id.salary-(Math.round(dsalary * (totalDays-totalAtt))+totalLatePrice+totalDebt+totalLoan))+" ر.ي "}</td>
                </tr>
         </tbody>
     </table>
    </div>
    <div style={{display: "flex",flexDirection: "row",marginTop: "20px",textAlign: "center"}}>
       <div style={{width: "50%",fontWeight: "900"}}>المختص</div>
       <div style={{width: "50%",fontWeight: "900"}}>مدير الشؤون</div>
     </div>  
     <div style={{marginTop: " 20px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #007236",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
     </div>
 </div> 
 </div>
</Layout>
);  
 }
