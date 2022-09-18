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
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});

      const [categories,setCategories]=useState([]);

      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
      const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
      const [end,setEnd]=useState(new Date().toISOString().slice(0, 10));    
      // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {
       setLoad(true);
        axios.get(Env.HOST_SERVER_NAME+'transport-cumulative/'+start+'/'+end)
        .then(response => {
          setData(response.data.records);
          setCategories(response.data.categories);

          setLoad(false);
        }).catch(function (error) {
          console.log(error);
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
      }

      const columns = [
        {
          title: 'اسم الموظف',
          dataIndex: 'name',
          key: 'name',
          sorter: (a, b) => a.name.localeCompare(b.name.length),
          sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'المسى الوظيفي',
          dataIndex: 'job',
          key: 'job',
          sorter: (a, b) => a.job.localeCompare(b.job.length),
          sortOrder: sortedInfo.columnKey === 'job' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'الإدارة',
          dataIndex: 'category',
          key: 'category',
          sorter: (a, b) => a.category.localeCompare(b.category.length),
          sortOrder: sortedInfo.columnKey === 'category' && sortedInfo.order,
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
       mywindow.onload = function() { // wait until all resources loaded 
        mywindow.focus(); // necessary for IE >= 10
        mywindow.print();  // change window to mywindow
        mywindow.close();// change window to mywindow
    };  
    
    }
    var index=0;
    var ttvalue=0;
    var ttamount=0;
    var ttcount=0;
return (
    <Layout>
    <Card>
    <div style={{marginBottom:'10px'}}>
      <div className='discountHeader' style={{marginBottom:'10px'}}>
        <div className='discountRange' style={{marginBottom:'10px'}}><span>اختر فترة : </span>
          <RangePicker  onCalendarChange={changeRange} />
        </div>
        <div className='discountBtn'>
          <Button style={{display:'block',margin:'0 10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
          <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
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
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                <th style={{fontWeight: "100"}} rowSpan="2">م</th>              
                     <th style={{fontWeight: "100"}} >الاسم</th>
                     <th style={{fontWeight: "100"}} >الوظيفة</th>
                     <th style={{fontWeight: "100"}} >عدد الأيام</th>
                     <th style={{fontWeight: "100"}} >المستحق اليومي</th>
                     <th style={{fontWeight: "100"}} >إجمالي المبلغ المستحق</th>
                     <th style={{fontWeight: "100"}} >التوقيع</th>

                </tr>
            </thead>
            <tbody>
            {
             categories.map(item=>{
              var catData=data.filter(record => record.category==item.name);
              var tcount=0;
              var tvalue=0;
              var tamount=0;
    
              return (
            <>
              {
              catData.map(item=>{
                tcount+=item.transportCount*1;
                tvalue+=item.transfer_value*1;
                tamount+=item.transportAmount*1;
                ttvalue+=item.transfer_value*1;
                ttamount+=item.transportAmount*1;
                ttcount+=item.transportCount*1;
              return  (
              <tr style={{height: " 30px",backgroundColor:++index %2!=0?'#e6e6e6':'#fff'}}>
                <td>{index}</td>
                <td>{item.name}</td>
                <td>{item.job}</td>
                <td>{(item.transportCount)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(item.transfer_value)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(item.transportAmount)}</td>
                <td><pre>             </pre></td>
              </tr>
              );

             })
              }
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{item.name}</td>               
                <td>{tcount}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tvalue)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tamount)}</td>
                <td><pre>             </pre></td>
              </tr>
            </>            
              );
              })}
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{'الإجمالي العام'}</td>    
                <td>{ttcount}</td>           
                <td>{new Intl.NumberFormat('en-EN').format(ttvalue)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(ttamount)}</td>                               
                <td><pre>             </pre></td>
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
