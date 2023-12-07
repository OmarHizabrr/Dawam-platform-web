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
export default function attendanceTable(props){
      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [isVModalVisible,setIsVModalVisible]=useState(false);
      const [datefromValue,setDatefromValue]=useState(null);
      const [datetoValue,setDatetoValue]=useState(null);

      const [eventsLog,setEventsLog]=useState([]);
      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
      const [selected, setSelected] = useState([]);
      const [totalDays,setTotalDays]=useState(0);
      const [totalAtt,settotalAtt]=useState(0);
      const [totalLate,setTotalLate]=useState(0);
      const [totalLatePrice,setTotalLatePrice]=useState(0);
      const [salary,setSalary]=useState(0);
      const [start,setStart]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
      const [end,setEnd]=useState(moment().format('YYYY-MM-DD'));  
      const [notes,setNotes]=useState("");

      const [dsalary,setDsalary]=useState(0);
      const [totalDebt,setTotalDebt]=useState(0);
      const [totalLoan,setTotalLoan]=useState(0);
      const [vacations,setVacations]=useState([]);
      const [vacationsTypes,setVacationsTypes]=useState([]);
      const [vacationsAmount,setVacationsAmount]=useState([]);
      const [saving,setSaving]=useState(false);
      const [type,setType]=useState(null);
      const [totalVac,setTotalVac]=useState("");
      const [star,setStar]=useState(0); 

      const [givenTasks, setGivenTasks] = useState(null);
      const [restTasks, setRestTasks] = useState(null);
      const [givenLoad, setGivenLoad] = useState(true);
      const [tstypes,setTstypes]=useState([]);

      const [totalVacs,setTotalVacs]=useState([]);
      const [selUser,setSelUser]=useState(null);
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
    
    let curr=props.setting.filter((item)=> item.key == 'admin.currency')[0]?.value;
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {   
      axios.get(Env.HOST_SERVER_NAME+'attendancelog/'+props.user.user_id+'/'+start+'/'+end)
      .then(response => {
        setData(response.data);
        setPData(response.data);
      }).catch(function (error) {
        console.log(error);
      });

        axios.get(Env.HOST_SERVER_NAME+'dawam-info/'+props.user.user_id+'/'+start+'/'+end)
        .then(response => {
          setTotalDays(response.data.count[0].count);
          settotalAtt(response.data.data[0].attendanceDays);
          setTotalLate(response.data.data[0].lateTime);
          setTotalLatePrice(response.data.data[0].lateTimePrice);
          setSalary(response.data.data[0].salary);
          setDsalary(response.data.data[0].dsalary);
          setVacations(response.data.vacs);
          setVacationsTypes(response.data.vacstypes);
          setVacationsAmount(response.data.tasksAmount);
          setTotalVacs(response.data.totalvacs);
          setTotalDebt(response.data.debt[0]['amount']);
          setTotalLoan(response.data.long_debt[0]['amount']);
          console.log(response.data.data[0].lateTimePrice);
          setStar(1-((parseFloat(response.data.lists.lateTimePrice || 0)+parseInt((response.data.count[0].count-(response.data.lists['attendanceDays'] || 0))*(response.data.lists.salary/response.data.count[0].count)))/parseInt(response.data.lists.salary)));
          setLoad(false);

        }).catch(function (error) {
          console.log(error);
        });
        setLoad(true);
        


        axios.get(Env.HOST_SERVER_NAME+'get-tasks-types')
        .then(response => {
          setTstypes(response.data);
          //setLoadt(false);
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
    const  showVacationModal =(record)=>{
        setIsVModalVisible(true);
        setNotes("");
        setTotalVac("");
        setDatefromValue(record.date+' '+props.setting.filter((item)=> item.key == 'duration_start')[0]?.value);
        setDatetoValue(record.date+' '+props.setting.filter((item)=> item.key == 'duration_end')[0]?.value);
      }
    const handleOk = () => {
        setIsModalVisible(false);
      };
    const openNotification = (placement,text) => {
        notification.success({
          message:text ,
          placement,
          duration:10,
        });
      }
    const handleVOk = () => {

      var values={
        "user_id": props.user.user_id,
        "startDate":datefromValue,
        "endDate":datetoValue,
        "type":type,
        "note":notes,
      }
     
      axios.post(Env.HOST_SERVER_NAME+`add-task`,values)
      .then(function (response) { 
        openNotification('bottomLeft',<Text>{'تم إرسال الإجازة بنجاح'}</Text>);
        setSaving(false);
        setIsVModalVisible(false);    
        form.resetFields(['date_range','task_type','notes']);
        setTotalVac("");
        setDatetoValue("");
        setDatefromValue("");
        setType(null);
        form.resetFields();
        setGivenTasks(0);
        setRestTasks(0);
      })
      .catch(function (error) {
        console.log(error);
          if(error.response.status==409){
          notification.error({
            message:error.response.data.message,
            placement:'bottomLeft',
            duration:10,
          });
          setSaving(false);

        }
        else{
        notification.error({
          message:'فشل إرسال الإجازة!' ,
          placement:'bottomLeft',
          duration:10,
        });
        setSaving(false);
        setIsModalVisible(false);   
        setType(null);
        setNotes(null); 
      }
       });
      };
    
    const selectMonth=(value)=>{
      }  
    
    const columns = [

      {
        title: 'اليوم',
        dataIndex: 'dayName',
        key: 'dayName',
        ellipsis: true,
        render:(dayName,record,_)=>(
          <>
          {/*record.have_vac=='1' && <CopyOutlined style={{marginLeft:'10px'}} />*/}
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
        title: 'التأخرات',
        dataIndex: 'lateTime',
        key: 'lateTime',
        sorter: (a, b) => a.lateTime.length - b.lateTime.length,
        sortOrder: sortedInfo.columnKey === 'lateTime' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title:  'خصميات',
        dataIndex: 'discount',
        key: 'discount',
        sorter: (a, b) => a.discount - b.discount,
        sortOrder: sortedInfo.columnKey === 'discount' && sortedInfo.order,
        ellipsis: false,
        render:(discount)=>Math.round(discount)+" "+curr        
      },
      {
        title: 'الإجازات',
        width:'80px',
        dataIndex: 'have_vac',
        key: 'have_vac',
        ellipsis: true,
        render:(dayName,record,_)=>(
          <>
          {record.have_vac=='1' && <CopyOutlined size={100} style={{marginLeft:'10px'}} />}
          </>
        )
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
      {
        title: 'تقديم',
        key: 'action',
        render: (vid, record, index) => (
          <Button
            onClick={function () {
              showVacationModal(record);
            }}
            type="primary"
            shape="round"
            style={{backgroundColor:'#FAA61A',border:'none'}}
            icon={<FormOutlined />}
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
  const handleVCancel = () => {
    setIsVModalVisible(false);
    setDatefromValue("");
    setDatetoValue("");
  };
  const handleTypeChange=(e)=>{
    setType(e);
    getGivenRest(e,datefromValue);
  }
  const getGivenRest=(e,start)=>{
    axios.get(Env.HOST_SERVER_NAME+'given-tasks/'+props.user.user_id+'/'+start+'/'+end).then(response=>{
      setGivenTasks(response.data.vacs.filter(record => record.id== e)[0]?.cumHours);
      var min=response.data.tasksAmount.filter(record => record.vid== e)[0]?.rest;
      if(typeof min === 'undefined')
      setRestTasks('-');
      else{
        var startMon=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value

        var perMonth=(30*7*60)/12;
        var curr=parseInt(moment(start,"YYYY-MM-DD HH:mm").format('MM'));
        var currMonth=parseInt(moment(start,"YYYY-MM-DD HH:mm").format('DD'))>=startMon?curr+1:curr;
         var restMin=min- (perMonth*(12-currMonth));
      setRestTasks( parseInt(restMin/60).toString().padStart(2, '0') + ":" +(restMin%60).toString().padStart(2, '0'));
      }

      setGivenLoad(false);
    }).catch(function (error) {
      console.log(error);
      setGivenLoad(false);
    });
  }
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
    const  onRangeChange=(all,dates)=>{ 
      checkPeriod(all,dates);
      setDatefromValue(dates[0]);
      setDatetoValue(dates[1]);     
    }
return (
    <Layout className='attendance'>
    <Modal title="تقديم إجازة / مهمة" confirmLoading={saving} visible={isVModalVisible} onOk={function(){setSaving(true);handleVOk()}} onCancel={function(){handleVCancel()}}>
      <Form form={form} >
        <Form.Item className='rangee' name={'date_range'} label="فترة الإجازة / المهمة :">
          <RangePicker value={[moment(datefromValue,"YYYY-MM-DD HH:mm"), moment(datetoValue, "YYYY-MM-DD HH:mm")]} showTime={{defaultValue: [moment(props.setting.filter((item)=> item.key == 'duration_start')[0]?.value, 'HH:mm'), moment(props.setting.filter((item)=> item.key == 'duration_end')[0]?.value, 'HH:mm')],}} format="YYYY-MM-DD HH:mm"  onCalendarChange={function(all,dates){onRangeChange(all,dates);}} />
          <div style={{marginTop:'10px',fontWeight:600}}>مدة الإجازة: <Text type="danger">{totalVac}</Text></div> 
        </Form.Item>
        <Form.Item style={{marginTop:'10px'}} name={'task_type'} label="نوع الإجازة">
        <Select
          showSearch
          notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
          style={{ width: 150 }}
          onSelect={handleTypeChange}
          options={tstypes}
          placeholder="ابحث لاختيار إجازة"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.props.children?.indexOf(input) >= 0 ||
            option.props.label?.indexOf(input) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.props?.children?.localeCompare(optionB.props.children)
          }
        >
      </Select>
  <div style={{marginRight: '10px',display: 'inline-block'}}>
    <div>الممنوحة: <span style={{fontWeight:'600',color:'#f00',marginLeft:'20px'}}>{givenTasks??0}</span>      المتبقية: <span style={{fontWeight:'600',color:'#f00'}}>{restTasks??0}</span> </div>
  </div>
    </Form.Item>
    <Form.Item name={'notes'} label="تفاصيل ">
    <TextArea onChange={function(e){setNotes(e.target.value);}} row={3} ></TextArea>
    </Form.Item>
    </Form>
    </Modal>
    <Modal className='att-model' width={1100} title={"أحداث اليوم | "+detailedDay}  visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
    <Table pagination={false} style={{textAlign:'center!important'}}  scroll={{x: '1000px' }} columns={dcolumns}  dataSource={selected} onCalendarChange={handleChange} />
    </Modal>
    <Card>
  <div className='attHeader'>
    <div className='attPer'><span><Progress type="circle" percent={Math.round((totalAtt/totalDays)*100)} width={70} style={{marginLeft:'5px',display:'inline-block'}} /></span>
      <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
        <div style={{marginBottom:'5px'}}>الدوام المطلوب : <span>{totalDays}</span> يوم </div>
        <div>الدوام الفعلي : <span>{totalAtt}</span> يوم </div>
      </span>
    </div>
    <div className='disPer'><span><Progress type="circle" percent={Math.round((totalLatePrice/salary)*100)} width={70} style={{marginLeft:'5px',display:'inline-block'}} /></span>
      <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
        <div style={{marginBottom:'5px'}}>التأخرات : <span>{parseInt(totalLate/60)} ساعة و {totalLate%60} دقيقة </span></div>
        <div>إجمالي الخصم : <span>{totalLatePrice}</span> {curr}</div>
      </span>
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
           <h1 style={{fontSize: " 18px",marginBottom: " 5px",margin: "0"}}>السجل التفصيلي للموظف</h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200",margin: "0"}}>للفترة من {start} إلى {end}</h2>
       </div>     
       <div style={{width: "35%"}}>
       <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',margin:'20px 5px'}}>
    <div style={{display:'flex',flexDirection:'row'}}>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>الدوام المطلوب : <span>{totalDays}</span> يوم </div>
    <div>أيام الغياب : <span>{totalDays-totalAtt}</span> يوم </div>
    </span></div>
    <div style={{display:'flex',flexDirection:'row'}}>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>التأخرات : <span>{totalLate}</span> دقيقة </div>
    <div>إجمالي الخصم : <span>{totalLatePrice}</span> {curr}</div>
    <div >نسبة الانضباط:  {Math.round(star*100)}%</div>

    </span></div>
    </div>
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
                <td style={{width: "300px"}}>{item.notes}</td>
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
                 {vacationsTypes.map(item=>{
                    var min=vacationsAmount.find(it=>it.vid==item.id)?vacationsAmount.find(it=>it.vid==item.id).rest:0;
                  //<td style={{display:item.days>0?'':'none'}}>{totalVacs.find(it=>it.vid==item.id)?totalVacs.find(it=>it.vid==item.id).rest.replace(/(\d{1,2}:\d{2}):\d{2}/, "$1"):0}</td>  
                 return  <td style={{display:item.days>0?'':'none'}}>{ parseInt(min/60)+":"+min%60}</td>;  

                 })}  
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
               <th style={{fontWeight: "100"}}>صافي الاستحقاق</th>
             </tr>
         </thead>
         <tbody>
             <tr style={{height: "20px"}}>
                 <td style={{backgroundColor: "#0972B6",color: "#fff"}}>المبلغ</td>
                 <td>{new Intl.NumberFormat('en-EN').format(props.user.status==16?props.user.salary:props.user.salary*pdata.length)+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(Math.round(props.user.status==16? (dsalary * (totalDays-totalAtt)): ((pdata.length-totalAtt)*props.user.salary) ))+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(totalLatePrice)+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(totalDebt)+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(totalLoan)+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format((Math.round(props.user.status==16? (dsalary * (totalDays-totalAtt)): ((pdata.length-totalAtt)*props.user.salary) )+parseFloat(totalLatePrice)+parseFloat(totalDebt)+parseFloat(totalLoan)))+" "+curr}</td>
                 <td>{new Intl.NumberFormat('en-EN').format((props.user.status==16?props.user.salary:props.user.salary*pdata.length)-((Math.round(props.user.status==16? (dsalary * (totalDays-totalAtt)): ((pdata.length-totalAtt)*props.user.salary) ))+parseFloat(totalLatePrice)+parseFloat(totalDebt)+parseFloat(totalLoan)))+" "+curr}</td>
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
