/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { useCookies,CookiesProvider  } from 'react-cookie';

import './style.css';
import {Table,Layout,Card,Rate,DatePicker,Button,Progress,Dropdown, Space,Menu,Typography} from 'antd';
import {ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import excel from 'xlsx';

import Avatar from 'antd/lib/avatar/avatar';
import axios from 'axios';
import {Env} from './../../../styles';
const {Text}=Typography;

export default function generalTable(props){

      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);

      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [data,setData]=useState([]);
      const [abData,setAbData]=useState([]);
      const [lateData,setLateData]=useState([]);
      const [type,setType]=useState(null);

      const [attAvg,setAttAvg]=useState(0);
      const [abCount,setAbCount]=useState(0);
      const [lateCount,setLateCount]=useState(0);
      const [timelyCount,setTimelyCount]=useState(0);
      const [timelyData,setTimelyData]=useState([]);

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

      const handleMenuClick= (e) => {
        switch (e.key) {
          case '1':
            printReport('abs-report');
            break;
          case '2':
            printReport('late-report');
            break;
          case '3':
            printReport('timely-report');
            break;
          default:
            break;
        }
      };

    const  handleChange = (pagination, filters, sorter) => {
          setFilteredInfo(filters);
          setSortedInfo(sorter);  
      };    
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {
        setLoad(true);

        axios.get(Env.HOST_SERVER_NAME+'user-type/'+props.user?.id)
        .then(response => {
          setType(response.data);
        }).catch(function (error) {
          console.log(error);
        });

        axios.get(Env.HOST_SERVER_NAME+'all-users-log/'+today)
          .then(response => {
            const joinedData = response.data['users'].map(user => {
              const userAttendance =  response.data['logs_test'].find(item => item.user_id === user.user_id);
              return {
                ...user,
                attendance: userAttendance || null, 
              };
            });

            const orderDataByAttendance = joinedData => {
              return joinedData.sort((a, b) => {
                const timeA = parseTimeString(a.attendance?.attendance_time) || 0;
                const timeB = parseTimeString(b.attendance?.attendance_time) || 0;
            
                // If either attendance is null, place it at the end
                if (a.attendance === null) return 1;
                if (b.attendance === null) return -1;
            
                return timeA - timeB;
              });
            };
            
            const parseTimeString = timeString => {
              if (!timeString) return 0;
            
              const [time, meridiem] = timeString.split(' ');
              const [hours, minutes, seconds] = time.split(':').map(Number);
            
              let adjustedHours = hours % 12;
              adjustedHours = meridiem === 'PM' ? adjustedHours + 12 : adjustedHours;
            
              return adjustedHours * 3600 + minutes * 60 + seconds;
            };

            const data=orderDataByAttendance(joinedData);

            setData(data.filter((item)=>item.attendance!=null));

            const abdata=data.filter((item)=>item.attendance==null);
            setAbData(abdata);
            const latedata=data.filter((item)=>item.attendance?.startLateTime<0);
            setLateData(latedata);
            const timelydata=data.filter((item)=>item.attendance?.startLateTime>=0);
            setTimelyData(timelydata);

            setAttAvg(Math.round(data.filter((item)=>item.attendance!=null).length/response.data['users'].length*100));           
            setAbCount(abdata.length);
            setLateCount(latedata.length);
            setTimelyCount(timelydata.length);

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
        render:(avatar,record,index)=>{ return <Text>{index+1}</Text>;},
      },
      {
        title: 'وقت الحضور',
        dataIndex: 'attendance',
        key: 'attendance',
        sorter: (a, b) => a.attendance?.attendance_time.length - b.attendance?.attendance_time.length,
        sortOrder: sortedInfo.columnKey === 'attendance_time' && sortedInfo.order,
        ellipsis: false,
        width:'150px',
        render:(attendance,record,index)=>{return <Text>{record.attendance?.attendance_time}</Text>},
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
          <Text style={{marginRight:'10px'}}>{user_name}</Text>
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
        render:(department,record,index)=>{return <Text>{department}</Text>},

      },
      {
        title: 'الوظيفة',
        dataIndex: 'job',
        key: 'job',
        ellipsis: true,
        render:(job,record,index)=>{return <Text>{job}</Text>},
      },  
    ];

    const printReport=(element)=>{
      var report=document.getElementById(element);
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

    const items = [
      {
        label: 'طباعة الغائبين',
        key: '1',
      },
      {
        label: 'طباعة المتأخرين',
        key: '2',
      },
      {
        label: 'طباعة المنضبطين',
        key: '3',
      },
    ];

    var rank=1;
    var trank=1;
    var index=1;
    var lindex=1;
  
    var days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const menuProps = {
      items,
      onClick: handleMenuClick,
    };

return (
  <Layout>
  <Card bodyStyle={{padding:'10px'}}>
  <div className='generalHeader' >
  <div className='generalData'>
  <div className='attPer'><span>
    <Progress type="circle" percent={Math.round(attAvg)} width={window.innerWidth <= 760?50:70} style={{marginLeft:'5px',display:'inline-block'}} /></span>
      <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
        <div style={{marginBottom:'5px'}}>الحاضرون : <span>{data.length}</span> </div>
        <div>الغائبون : <span>{abCount}</span>  </div>
      </span>
    </div>
    <div className='disPer'><span><Progress type="circle" percent={Math.round((timelyCount/data.length)*100)} width={window.innerWidth <= 760?50:70} style={{marginLeft:'5px',display:'inline-block'}} /></span>
      <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
        <div style={{marginBottom:'5px'}}>المنضبطون : <span>{timelyCount} </span></div>
        <div>المتأخرون : <span>{lateCount}</span></div>
      </span>
    </div>
  </div>
  { type && (props.user.role_id==1)?<div className='generalOper'>     
    <div className='date' style={{marginBottom:'10px',marginLeft:'5px'}}>
      <span>اختر يومًا : </span> <DatePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760} onChange={changeDate} />
    </div>
    <Button style={{display:'block',marginLeft:'5px',marginBottom:'10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>

   <Space style={{display:'inline-block'}}>
    <Dropdown.Button menu={menuProps} trigger={['click']} style={{display:'block',backgroundColor:"#0972B6"}} onClick={function(){printReport('att-report')}} type='primary'><PrinterOutlined /> طباعة الحاضرين</Dropdown.Button></Space> 
  </div>:<></>}
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
                <td>{item.attendance?.attendance_time}</td>
                <td>{item.attendance?.leave_time}</td>
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

 <div id="abs-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header  style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{flex:1}}>
           <img loading="eager" style={{width: "280px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{height:'100%',fontSize: "11px",textAlign: "center",flex:1}}>
            <div style={{height:'50px'}}></div>
           <h1 style={{textAlign:'center',fontSize: " 18px",marginBottom: " 5px",margin: "0"}}>أسماء الموظفين الغائبين</h1>
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
                     <th style={{fontWeight: "100"}}>ملاحظات</th>
                </tr>
            </thead>
            <tbody>
             {abData?.map(item=>(
              <tr style={{height: " 30px",backgroundColor:abData.indexOf(item) %2!=0?'#e6e6e6':'#fff'}}>
                <td>{index++}</td>
                <td>{item.user_id}</td>
                <td>{item.fullname}</td>
                <td style={{fontSize:'8px'}}>{item.department}</td>
                <td style={{fontSize:'8px'}}>{item.job}</td>
                <td>{' '}</td>
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
 <div id="late-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header  style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{flex:1}}>
           <img loading="eager" style={{width: "280px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{height:'100%',fontSize: "11px",textAlign: "center",flex:1}}>
            <div style={{height:'50px'}}></div>
           <h1 style={{textAlign:'center',fontSize: " 18px",marginBottom: " 5px",margin: "0"}}>أسماء الموظفين المتأخرين</h1>
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
                     <th style={{fontWeight: "100"}}>وقت التأخر </th>
                </tr>
            </thead>
            <tbody>
             {lateData.map(item=>(
              <tr style={{height: " 30px",backgroundColor:data.indexOf(item) %2!=0?'#e6e6e6':'#fff'}}>
                <td>{lindex++}</td>
                <td>{item.user_id}</td>
                <td>{item.fullname}</td>
                <td style={{fontSize:'8px'}}>{item.department}</td>
                <td style={{fontSize:'8px'}}>{item.job}</td>
                <td>{item.attendance?.attendance_time}</td>
                <td>{item.attendance?.leave_time}</td>
                <td>{Math.floor(item.attendance?.startLateTime*-1)} دقيقة</td>
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

 <div id="timely-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header  style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{flex:1}}>
           <img loading="eager" style={{width: "280px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{height:'100%',fontSize: "11px",textAlign: "center",flex:1}}>
            <div style={{height:'50px'}}></div>
           <h1 style={{textAlign:'center',fontSize: " 18px",marginBottom: " 5px",margin: "0"}}>حافظة دوام الموظفين المنضبطين</h1>
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
             {timelyData?.map(item=>(
              <tr style={{height: " 30px",backgroundColor:data.indexOf(item) %2!=0?'#e6e6e6':'#fff'}}>
                <td>{trank++}</td>
                <td>{item.user_id}</td>
                <td>{item.fullname}</td>
                <td style={{fontSize:'8px'}}>{item.department}</td>
                <td style={{fontSize:'8px'}}>{item.job}</td>
                <td>{item.attendance?.attendance_time}</td>
                <td>{item.attendance?.leave_time}</td>
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


