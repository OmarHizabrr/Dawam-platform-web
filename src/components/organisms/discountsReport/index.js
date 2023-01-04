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
import moment from 'moment';

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
export default function DiscountsReport(props){
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});

      const [data,setData]=useState([]);
      const [pdata, setPData] = useState([]);

      const [categories,setCategories]=useState([]);
      const [namesFilter,setNamesFilter]=useState([]);
      const [categoriesFilter,setCategoriesFilter]=useState([]);
      const [load,setLoad]=useState(true);
      const [count,setCount]=useState(0);
      const [start,setStart]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
      const [end,setEnd]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));  
      const [currentMonth,setCurrentMonth]=useState(moment().format('MMMM'));   
          // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {
       setLoad(true);
        axios.get(Env.HOST_SERVER_NAME+'discounts-list/'+start+'/'+end)
        .then(response => {

          let names=[];
          let categories=[];
          response.data["lists"].forEach(element => {  
            if(!names.some(item => element.name == item.text))      
              names.push({text:element['name'],value:element['name']});
            if(!categories.some(item => element.category == item.text))      
              categories.push({text:element['category'],value:element['category']});        
        }); 
        setNamesFilter(names);
        setCategoriesFilter(categories);

          setData(response.data.lists);
          setPData(response.data.lists);

          setCount(response.data.count[0].count);
          setCategories(response.data.categories);
          setLoad(false);
        }).catch(function (error) {
          console.log(error);
        });
       }, [start,end]);

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);

        if(filters){       
          Object.keys(filters).forEach(key => {
            if(filters[key]!=null){
              setPData(data.filter(item => filters[key].includes(item[key])));
            }
            else
              setPData(data);           
          });               
        }

       
      };
      const changeRange=(all,date)=>{
        //const id=cookies.user;
        setStart(date[0]);
        setEnd(date[1]);
     
       
      }

    const columns = [
      {
        title: 'الاسم',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        ellipsis: false,
        filters:namesFilter,
        filterSearch: true,
        filterMode:'tree',
        onFilter: (value, record) => record.name.includes(value),
      },
      {
        title: 'الإدارة',
        dataIndex: 'category',
        key: 'category',
        sorter: (a, b) => a.category.length - b.category.length,
        sortOrder: sortedInfo.columnKey === 'category' && sortedInfo.order,
        filters:categoriesFilter,
        filterMode:'tree',        
        onFilter: (value, record) => record.category.includes(value),
      },
      {
        title: 'المسمى الوظيفي',
        dataIndex: 'job',
        key: 'job',
        sorter: (a, b) => a.job - b.job,
        sortOrder: sortedInfo.columnKey === 'job' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الاستحقاق',
        dataIndex: 'salary',
        key: 'salary',
        sorter: (a, b) => a.salary.length - b.salary.length,
        sortOrder: sortedInfo.columnKey === 'salary' && sortedInfo.order,
        ellipsis: true,
        render:(salary)=>salary +" ر.ي",
      },     
       {
        title: 'الغياب',
        dataIndex: 'attendanceDays',
        key: 'attendanceDays',
        sorter: (a, b) => a.attendanceDays - b.attendanceDays,
        sortOrder: sortedInfo.columnKey === 'attendanceDays' && sortedInfo.order,
        ellipsis: true,
        render:(attendanceDays,record,_)=> record.fingerprint_type=='22'?count-attendanceDays:0,
      },
      {
        title: 'خصميات الغياب',
        dataIndex: ['salary','attendanceDays'],
        key: 'absencePrice',
        sorter: (a, b) => ((a.salary/30)*(count-a.attendanceDays)) - ((b.salary/30)*(count-b.attendanceDays)),
        sortOrder: sortedInfo.columnKey === 'absencePrice' && sortedInfo.order,
        ellipsis: true,
        render:(attendanceDays,row)=>row.fingerprint_type=='22'?Math.round(((row.salary/30)*(count-row.attendanceDays))*100)/100 :0,
      },
      {
        title: 'التأخرات',
        dataIndex: 'lateTime',
        key: 'lateTime',
        sorter: (a, b) => {
          if(a && a.lateTime && a.lateTime.length && b && b.lateTime && b.lateTime.length) {
              return a.lateTime.length - b.lateTime.length;
          } else if(a && a.lateTime && a.lateTime.length) {
              return -1;
          } else if(b && b.lateTime && b.lateTime.length) {
              return 1;
          }
                return 0;
      },
        sortOrder: sortedInfo.columnKey === 'lateTime' && sortedInfo.order,
        ellipsis: true,
        render:(lateTime,row)=>row.fingerprint_type=='22'?lateTime:0,
      },
      {
        title: 'خصميات التأخرات',
        dataIndex: 'lateTimePrice',
        key: 'lateTimePrice',
        sorter: (a, b) => a.lateTimePrice - b.lateTimePrice,
        sortOrder: sortedInfo.columnKey === 'lateTimePrice' && sortedInfo.order,
        ellipsis: false,
        render:(lateTimePrice,row)=>row.fingerprint_type=='22'?Math.round(lateTimePrice):0,        
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
    function getMinutesTime(amPmString) {
      if(amPmString){
        var d = amPmString.split(':'); 
        var m=(parseInt(d[0])*60) + parseInt(d[1]);
        return m; 
      }
      else return 0;
    }
    const onChange=(all,data)=>{
      setCurrentMonth(all.format('MMMM'));
  
      var startDay=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value;
      var endDay=props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value;
  
      setStart(moment(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
      setEnd(moment(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));
  
      }
    var index=0;
    var tsal=0;
    var tltimes=0;
    var tldiscounts=0;
    var tatimes=0;
    var tadiscounts=0;
    var ttotal=0;
    var tttotalateTime=0;
return (
    <Layout>
    <Card>
    <div style={{marginBottom:'10px'}}>
      <div className='discountHeader' style={{marginBottom:'10px'}}>
      <div style={{marginLeft:'10px'}}>
        <span>اختر شهرًا : </span>
        <DatePicker  defaultValue={moment()} onChange={onChange} picker="month" />
      </div> 
        <div className='discountRange' style={{marginBottom:'10px'}}><span>اختر فترة : </span>
          <RangePicker value={[moment(start,"YYYY-MM-DD"),moment(end,"YYYY-MM-DD")]} onCalendarChange={changeRange} />
        </div>
        <div className='discountBtn'>
          <Button style={{display:'block',margin:'0 10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
          <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
        </div>
      </div>
    </div>
    <Table loading={load}  style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onChange={handleChange} />
    </Card>
    <div id="att-report"style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <table style={{fontSize: "11px",width: " 100%",textAlign: " center",marginTop: " 20px"}}>
    <thead>
    <tr style={{border:'none'}}>
    <th colSpan={13}>  
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 15px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>خلاصة الغياب والتأخرات لشهر {currentMonth}</h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200",margin: "0"}}>للفترة من {start} إلى {end}</h2>
       </div>     
       <div style={{width: "20%"}}>

       </div>
    </header> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',fontSize: '14px',borderBottom:'1px solid black'}} >

    </div>

    </th>
    </tr>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                <th style={{fontWeight: "100"}} rowSpan="2">م</th>              
                     <th style={{fontWeight: "100"}} rowSpan="2">الاسم</th>
                     <th style={{fontWeight: "100",width:'60px'}} rowSpan="2">الوظيفة</th>
                     <th style={{fontWeight: "100"}} rowSpan="2">الاستحقاق</th>
                     <th style={{fontWeight: "100"}} colSpan="2">التأخرات</th>
                     <th style={{fontWeight: "100"}} colSpan="2">الغياب</th>
                     <th style={{fontWeight: "100"}} colSpan="2">إجمالي الخصم</th>
                </tr>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "20px"}}>
                <th style={{fontWeight: "100"}}>الساعات</th>
                <th style={{fontWeight: "100"}}>الخصم</th>
                <th style={{fontWeight: "100"}}>الأيام</th>
                <th style={{fontWeight: "100"}}>الخصم</th>
                <th style={{fontWeight: "100"}}>الساعات</th>
                <th style={{fontWeight: "100"}}>المبلغ</th>
                </tr>
            </thead>
            <tbody>
            {
             categories.map(item=>{
              var catData=pdata.filter(record => record.category==item.name);
              var sal=0;
              var ltimes=0;
              var ldiscounts=0;
              var atimes=0;
              var adiscounts=0;
              var total=0;
              var ttotalateTime=0;

              if(catData.length) 
              return (
            <>
              {
              catData.map(item=>{

                item.lateTimePrice=item.fingerprint_type=='22'? item.lateTimePrice:0;
                item.lateTime=item.fingerprint_type=='22'? item.lateTime:0;
                item.attendanceDays=item.fingerprint_type=='22'? item.attendanceDays:count;

                sal+=parseFloat(item.salary);

                //ltimes+=getMinutesTime(item.lateTime);
                ltimes+=Math.round(getMinutesTime(item.lateTime))<0?0:Math.round(getMinutesTime(item.lateTime));
                ldiscounts+=Math.round(item.lateTimePrice)<0?0:Math.round(item.lateTimePrice);

                var atim=count-item.attendanceDays;
                atim=atim<0?0:atim;
                atimes+=atim;
                var adis=parseFloat((item.salary/30)*(atim));
                adiscounts+=adis;
                var tot=parseFloat(item.lateTimePrice)+adis;
                total+=tot;

                tsal+=parseFloat(item.salary);
                tltimes+=getMinutesTime(item.lateTime);
                tldiscounts+=Math.round(item.lateTimePrice);
                tatimes+=atim;
                tadiscounts+=adis;
                ttotal+=tot;
                var totalateTime=(atim*7*60)+getMinutesTime(item.lateTime);
                ttotalateTime+=totalateTime;
                tttotalateTime+=totalateTime;

              return  (
              <tr style={{height: " 30px",backgroundColor:++index %2!=0?'#e6e6e6':'#fff'}}>
                <td>{index}</td>
                <td style={{fontSize:'10px'}}>{item.name}</td>
                <td style={{fontSize:'8px',width:'60px'}}>{item.job}</td>
                <td>{new Intl.NumberFormat('en-EN').format(item.salary)}</td>
                <td>{item.lateTime}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(item.lateTimePrice/5)*5)}</td>
                <td>{atim}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(adis/5)*5)}</td>
                <td>{parseInt(totalateTime/60)+":"+(totalateTime%60)}</td>               
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(tot/5)*5)}</td>
              </tr>
              );
             })
              }
              <tr style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{item.name}</td>               
                <td>{new Intl.NumberFormat('en-EN').format(sal)}</td>
                <td>{parseInt(ltimes/60)+":"+(ltimes%60)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(ldiscounts/5)*5)}</td>
                <td>{atimes}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(adiscounts/5)*5)}</td>
                <td>{parseInt(ttotalateTime/60)+":"+(ttotalateTime%60)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(total/5)*5)}</td>
              </tr>
            </>            
              );
              })}
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
              <td colSpan={3}>{'الإجمالي العام'}</td>               
                <td>{new Intl.NumberFormat('en-EN').format(tsal)}</td>
                <td>{parseInt(tltimes/60)+":"+(tltimes%60)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(tldiscounts/5)*5)}</td>
                <td>{tatimes}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(tadiscounts/5)*5)}</td>
                <td>{parseInt(tttotalateTime/60)+":"+(tttotalateTime%60)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(ttotal/5)*5)}</td>
              </tr>

            </tbody>
    <tfoot>
      <tr>
        <th colSpan={13}>
          <div style={{display: "flex",flexDirection: "row",textAlign: "center"}}>
            <div style={{width: "50%",fontWeight: "900"}}>شؤون الموظفين</div>
            <div style={{width: "50%",fontWeight: "900"}}>مدير الشؤون الإدارية</div>
            <div style={{width: "50%",fontWeight: "900"}}>المحاسب</div>
            <div style={{width: "50%",fontWeight: "900"}}>المسؤول المالي</div>
          </div>
        </th>
      </tr>
    </tfoot>
    </table> 
     <div style={{marginTop: "50px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #0972B6",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
     </div>
 </div> 
 </div>
    </Layout>
);
    
 }

