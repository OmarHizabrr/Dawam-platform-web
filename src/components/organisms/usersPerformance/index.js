/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker,Popconfirm,Table, Button,Card,Input,Select,Typography,Form, Space,Spin,notification,Checkbox,Divider, Layout} from 'antd';
import {ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';
import {useLocation} from 'react-router-dom';
import moment from 'moment';

import {Env} from './../../../styles';

const { RangePicker } = DatePicker;

export default function UsersPerformance (props){
  const location = useLocation();

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [pdata, setPData] = useState([]);
 
  const [load,setLoad]=useState(true);

  const [tstypes,setTstypes]=useState([]);

  const [update,setUpdate]=useState(false);
  const [start,setStart]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
  const [end,setEnd]=useState(moment().format('YYYY-MM-DD'));  
  const [currentMonth,setCurrentMonth]=useState(moment().format('MMMM'));   

  const [namesFilter,setNamesFilter]=useState([]);
  const [categoriesFilter,setCategoriesFilter]=useState([]);

  const columns = [
    {
      title: 'اسم الموظف',
      dataIndex: 'fullname',
      key: 'fullname',
      filters: namesFilter,
      filteredValue: filteredInfo.fullname || null,
      onFilter: (value, record) => record.fullname.includes(value),
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      sortOrder: sortedInfo.columnKey === 'fullname' && sortedInfo.order,
      ellipsis: false,
    },
    location.pathname!="/profile/dept-performance"?   
     {
      title: 'الإدارة',
      dataIndex: 'category',
      
      key: 'category',
      filters: categoriesFilter,
      filteredValue: filteredInfo.category || null,
      onFilter: (value, record) => record.category.includes(value),
      sorter: (a, b) =>a.category.localeCompare(b.category),
      sortOrder: sortedInfo.columnKey === 'category' && sortedInfo.order,
      ellipsis: true,
    }:{},
    {
      title: 'المسمى الوظيفي',
      width:150,
      dataIndex: 'job',
      key: 'job',
      sorter: (a, b) => a.job.localeCompare(b.job),
      sortOrder: sortedInfo.columnKey === 'job' && sortedInfo.order,
      ellipsis: false,
    },   
    {
      title: 'معدل أيام الدوام',
      dataIndex: 'attendance_rate',
      key: 'attendance_rate',
      sorter: (a, b) => a.attendance_rate - b.attendance_rate,
      sortOrder: sortedInfo.columnKey === 'attendance_rate' && sortedInfo.order,
      ellipsis: false,
      render: (attendance_rate, record) => Math.round(attendance_rate*100)+'%',
    },   
    {
      title: 'انضباط الحضور',
      dataIndex: 'att_rate',
      key: 'att_rate',
      sorter: (a, b) => Math.round(Math.round(a.att_rate*100)*a.attendance_rate)-Math.round(Math.round(b.att_rate*100)*b.attendance_rate),
      sortOrder: sortedInfo.columnKey === 'att_rate' && sortedInfo.order,
      ellipsis: false,
      render: (att_rate, record) => Math.round(Math.round(att_rate*100)*record.attendance_rate)+'%',
    },
    {
      title: 'انضباط الانصراف',
      dataIndex: 'leave_rate',
      key: 'leave_rate',
      sorter: (a, b) => Math.round(Math.round(a.leave_rate*100)*a.attendance_rate)-Math.round(Math.round(b.leave_rate*100)*b.attendance_rate),
      sortOrder: sortedInfo.columnKey === 'leave_rate' && sortedInfo.order,
      ellipsis: false,
      render: (leave_rate, record) => Math.round(Math.round(leave_rate*100)*record.attendance_rate)+'%',
    },
    {
      title: 'التأخرات بالساعة',
      dataIndex: 'lateTimes',
      key: 'lateTimes',
      sorter: (a, b) => a.lateTimes - b.lateTimes,
      sortOrder: sortedInfo.columnKey === 'lateTimes' && sortedInfo.order,
      ellipsis: false,
      render: (lateTimes, record) => parseInt((lateTimes/60)/60)+":"+parseInt(lateTimes/60)%60,
    },
    {
      title: 'الوقت الفائض بالساعة',
      dataIndex: 'bonusTime',
      key: 'bonusTime',
      sorter: (a, b) => a.bonusTime - b.bonusTime,
      sortOrder: sortedInfo.columnKey === 'bonusTime' && sortedInfo.order,
      ellipsis: false,
      render: (bonusTime, record) => parseInt((bonusTime/60)/60)+":"+parseInt(bonusTime/60)%60,
    },
    {
      title: 'إجمالي التقييم',
      //dataIndex: 'user_rate',
      key: 'total_rate',
      sorter: (a, b) => Math.round((Math.round(a.attendance_rate*100)+Math.round(Math.round(a.att_rate*100)*a.attendance_rate)+Math.round(Math.round(a.leave_rate*100)*a.attendance_rate))/3) - Math.round((Math.round(b.attendance_rate*100)+Math.round(Math.round(b.att_rate*100)*b.attendance_rate)+Math.round(Math.round(b.leave_rate*100)*b.attendance_rate))/3),
      sortOrder: sortedInfo.columnKey === 'total_rate' && sortedInfo.order,
      ellipsis: false,
      render: (col, record) => Math.round((Math.round(record.attendance_rate*100)+Math.round(Math.round(record.att_rate*100)*record.attendance_rate)+Math.round(Math.round(record.leave_rate*100)*record.attendance_rate))/3)+'%',
    },
  ];


  useEffect(() => {
    
    setLoad(true);   
          axios.get(Env.HOST_SERVER_NAME+'get-emp-names')
          .then(response => {
            var names=[];
           setTstypes(response.data);
           response.data.forEach(element => {  
            names.push({text:element['label'],value:element['label']});       
          }); 
          setNamesFilter(names);
          }).catch(function (error) {
            console.log(error);
          });

    axios.get(Env.HOST_SERVER_NAME+'users-performance-rank/'+start+'/'+end)
    .then(response => {
    
      if(location.pathname="/profile/dept-performance"){
        var dt=response.data.filter(record => record.category==props.user.category.name);
        setData(dt);
        setPData(dt);
      }
      else{
        setData(response.data);
        setPData(response.data);
      }


      let categories=[];
      response.data.forEach(element => {  
          if(!categories.some(item => element.category == item.text))      
            categories.push({text:element['category'],value:element['category']});         
      }); 
      setCategoriesFilter([...categoriesFilter,...categories]);

      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });
   },[start,end,update]);
  
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
  const printReport=()=>{
        var report=document.getElementById('prank-report');
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
  const exportToExcel=(type,fn,dl)=>{

        var elt = document.getElementsByClassName('print-table')[0];
        if(elt){
         var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
         return dl ?
         excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
         excel.writeFile(wb, fn || ('كشف إ دوام ليوم '+"."+(type || 'xlsx')));  
        }
      }
      
   const changeRange=(all,date)=>{
          setStart(date[0]);
          setEnd(date[1]);       
    }
    const onChange=(all,data)=>{
      setCurrentMonth(all.format('MMMM'));
  
      var startDay=props.setting?.filter((item)=> item.key == "admin.month_start")[0]?.value;
      var endDay=props.setting?.filter((item)=> item.key == "admin.month_end")[0]?.value;
  
      setStart(moment(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
      setEnd(moment(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));
  
      }
return (
  <Layout>
    <Card>
    <div className='discountHeader' >
      <div className='discountRange'  >
      <div style={{marginLeft:'10px'}}>
        <span>اختر شهرًا : </span>
        <DatePicker  defaultValue={moment()} onChange={onChange} picker="month" />
      </div>
        <div style={{marginLeft:'10px'}}><span>اختر فترة : </span>
          <RangePicker  value={[moment(start,"YYYY-MM-DD"),moment(end,"YYYY-MM-DD")]} onCalendarChange={changeRange} />
        </div>
      </div>
    <div className='discountBtn'>     
      <Button style={{display:'block',marginLeft:'5px',marginBottom:'10px',backgroundColor:"#0972B6",borderColor:"#0972B6",border:'none'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
      <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
    </div>   
    </div>   
    <Table loading={load} columns={columns} scroll={{x: '1000px' }} dataSource={data}  onChange={handleChange}/>
    </Card>
    <div id="prank-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>تقييم انضباط الموظفين</h1>
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
                     <th style={{fontWeight: "100"}} >الإدارة</th>
                     <th style={{fontWeight: "100"}} >الوظيفة</th>
                     <th style={{fontWeight: "100"}} >معدل الدوام</th>
                     <th style={{fontWeight: "100"}} >انضباط الحضور</th>
                     <th style={{fontWeight: "100"}} >انضباط الانصراف</th>
                     <th style={{fontWeight: "100"}} >التأخرات بالساعة</th>
                     <th style={{fontWeight: "100"}} >الوقت الفائض بالساعة</th>
                     <th style={{fontWeight: "100"}} >إجمالي التقييم</th>
                </tr>
            </thead>
            <tbody>
             
             {pdata.map(item=>(
              <tr style={{height: " 25px",backgroundColor:data.indexOf(item) %2!=0?'#e6e6e6':'#fff'}}>
                <td>{data.indexOf(item)+1}</td>
                <td>{item.fullname}</td>
                <td>{item.category}</td>
                <td>{item.job}</td>
                <td>{Math.round(item.attendance_rate*100)+'%'}</td>
                <td>{Math.round(Math.round(item.att_rate*100)*item.attendance_rate)+'%'}</td>
                <td>{Math.round(Math.round(item.leave_rate*100)*item.attendance_rate)+'%'}</td>
                <td>{ parseInt((item.lateTimes/60)/60)+":"+parseInt(item.lateTimes/60)%60}</td>
                <td>{  parseInt((item.bonusTime/60)/60)+":"+parseInt(item.bonusTime/60)%60}</td>
                <td>{Math.round((Math.round(item.attendance_rate*100)+Math.round(Math.round(item.att_rate*100)*item.attendance_rate)+Math.round(Math.round(item.leave_rate*100)*item.attendance_rate))/3)+'%'}</td>
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