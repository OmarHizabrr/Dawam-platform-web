/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';
import './style.css';
import { Typography ,Layout,Tabs,Table, Button,Modal, DatePicker, Select,Card } from 'antd';
import {SwapOutlined,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {FileExcelOutlined} from '@ant-design/icons';
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
   excel.writeFile(wb, fn || ('كشف الخصميات.' + (type || 'xlsx')));  
  }
}
export default function transportReport(){
    const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [eventsLog,setEventsLog]=useState([]);
      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
      const [count,setCount]=useState(0);
      const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
      const [end,setEnd]=useState(new Date().toISOString().slice(0, 10));    
      // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {
       setLoad(true);
        axios.get(Env.HOST_SERVER_NAME+'transport-cumulative/'+start+'/'+end)
        .then(response => {
          setData(response.data);
          setLoad(false);
        });

       }, [start,end]);

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
      };
      const changeRange=(all,date)=>{
        //const id=cookies.user;
        setStart(date[0]);
        setEnd(date[1]);
      /*  console.log("range changed : "+last+"|"+today);
        setLoad(true);
        axios.get(Env.HOST_SERVER_NAME+'get-att-days-count/'+last+'/'+today)
        .then(response => {
          setCount(response.data[0].count);
        });
        axios.get(Env.HOST_SERVER_NAME+'discounts-list/'+last+'/'+today)
        .then(response => {
          setData(response.data);
          setLoad(false);
        });*/
       
      }
    const  showModal = () => {
        setIsModalVisible(true);
      };  
     const handleOk = () => {
        setIsModalVisible(false);

      }; 
    const selectMonth=(value)=>{
     
      }  

      const columns = [
        {
          title: 'اسم الموظف',
          dataIndex: 'name',
          key: 'name',
          filters: [
            { text: 'Joe', value: 'Joe' },
            { text: 'Jim', value: 'Jim' },
          ],
          filteredValue: filteredInfo.name || null,
          onFilter: (value, record) => record.name.includes(value),
          sorter: (a, b) => a.name.length - b.name.length,
          sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'المسى الوظيفي',
          dataIndex: 'job',
          key: 'job',
          sorter: (a, b) => a.job.length - b.job.length,
          sortOrder: sortedInfo.columnKey === 'job' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'الإدارة',
          dataIndex: 'department',
          key: 'department',
          sorter: (a, b) => a.department.length - b.department.length,
          sortOrder: sortedInfo.columnKey === 'department' && sortedInfo.order,
          ellipsis: true,
        }, 
        {
          title: 'عدد الأيام',
          dataIndex: 'transportCount',
          key: 'transportCount',
          sorter: (a, b) => a.transportCount - b.transportCount,
          sortOrder: sortedInfo.columnKey === 'transportCount' && sortedInfo.order,
          ellipsis: true,
        }, 
        {
          title: 'المستحق اليومي',
          dataIndex: 'transfer_value',
          key: 'transfer_value',
          sorter: (a, b) => a.transfer_value - b.transfer_value,
          sortOrder: sortedInfo.columnKey === 'transfer_value' && sortedInfo.order,
          ellipsis: true,
        },    
        {
          title: 'إجمالي المبلغ المستحق',
          dataIndex: 'transportAmount',
          key: 'transportAmount',
          sorter: (a, b) => a.transportAmount - b.transportAmount,
          sortOrder: sortedInfo.columnKey === 'transportAmount' && sortedInfo.order,
          ellipsis: true,
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
      mywindow.focus();
  
      mywindow.print();
      mywindow.close();   
      /* var printContents = document.getElementById("att-report").innerHTML;
      var originalContents = document.body.innerHTML;
  
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;*/ 
    }
return (
    <Layout>
    <Card>
    <div style={{float:'left',marginBottom:'10px'}}>
    <div style={{float:'left',marginBottom:'10px'}}>
    <div style={{marginBottom:'10px'}}><span>اختر فترة : </span>
    <RangePicker  onCalendarChange={changeRange} /></div>
    <div style={{float: 'left'}}>
    <Button style={{display:'block',marginBottom:'10px',width:'160px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /> تصدير كملف اكسل </Button>
    <Button style={{display:'block',width:'160px',backgroundColor:"#007236",borderColor:"#007236"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /> طباعة السجل </Button>
   </div>
    </div>
    </div>
    <Table loading={load}  style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onChange={handleChange} />
    </Card>
    <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={logoText}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>كشف المواصلات</h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200",margin: "0"}}>للفترة من {start} إلى {end}</h2>
       </div>     
       <div style={{width: "20%"}}>

       </div>
    </header> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',fontSize: '14px',borderBottom:'1px solid black'}} >

    </div>
    <div >
        <table style={{fontSize: "12px",width: " 100%",textAlign: " center",marginTop: " 20px"}}>
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#007236",height: "25px"}}>
                <th style={{fontWeight: "100"}} rowSpan="2">م</th>              
                     <th style={{fontWeight: "100"}} >الاسم</th>
                     <th style={{fontWeight: "100"}} >الوظيفة</th>
                     <th style={{fontWeight: "100"}} >الإدارة</th>
                     <th style={{fontWeight: "100"}} >عدد الأيام</th>
                     <th style={{fontWeight: "100"}} >المستحق اليومي</th>
                     <th style={{fontWeight: "100"}} >إجمالي المبلغ المستحق</th>
                     <th style={{fontWeight: "100"}} >التوقيع</th>

                </tr>
            </thead>
            <tbody>
             
             {data.map(item=>(
              <tr style={{height: " 25px",backgroundColor:data.indexOf(item) %2!=0?'#e6e6e6':'#fff'}}>
                <td>{data.indexOf(item)+1}</td>
                <td>{item.name}</td>
                <td>{item.job}</td>
                <td>{item.department}</td>
                <td>{item.transportCount}</td>
                <td>{item.transfer_value}</td>
                <td>{item.transportAmount}</td>
                <td><pre>             </pre></td>
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
         <div style={{backgroundColor: " #007236",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
     </div>
 </div> 
 </div>
    </Layout>
);
    
 }
