/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import axios from 'axios';
import './style.css';
import moment from 'moment';
import dayjs from 'dayjs';

import {Env} from '../../../styles';
import './style.css';
import { DatePicker, Space,Form,Table, Button,Modal,Card,Spin,Input,Select,Progress,Popconfirm,notification,Typography } from 'antd';
import {CheckCircleOutlined,MinusCircleOutlined,CloseCircleOutlined,ExportOutlined,FormOutlined,DeleteOutlined,PrinterOutlined} from '@ant-design/icons';
const {Text}=Typography;
const {Option}=Select;
const { RangePicker } = DatePicker;
const {TextArea}=Input;


const exportToExcel=(type,fn,dl)=>{

    var elt = document.getElementsByTagName('table')[0];
    if(elt){
     var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
     return dl ?
     excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
     excel.writeFile(wb, fn || ('الإجازات والمهام.' + (type || 'xlsx')));  
    }
} 
export default function tasksTable(props) {
  const [selectedIndex,setSelectedIndex]=useState(null);
  const [filteredInfo,setFilteredInfo]=useState({});
  const [sortedInfo,setSortedInfo]=useState({});
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [isuModalVisible,setIsUModalVisible]=useState(false);

  const [startVac,setStartVac]=useState("");
  const [type,setType]=useState(null);
  const [userType,setUserType]=useState(null);

  const [endVac,setEndVac]=useState("");
  const [start,setStart]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
//  const [end,setEnd]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));  
  const [end,setEnd]=useState(moment().format('YYYY-MM-DD'));  

  const [currentMonth,setCurrentMonth]=useState(moment().format('MMMM'));   
  const [star,setStar]=useState(0); 

  const [notes,setNotes]=useState("");
  const [tstypes,setTstypes]=useState([]);
  const [data,setData]=useState([]);
  const [vacations,setVacations]=useState([]);
  const [vacationsTypes,setVacationsTypes]=useState([]);
  const [vacationsAmount,setVacationsAmount]=useState([]);

  const [totalConsumedVacs,setTotalConsumedVacs]=useState([]);
  const [load,setLoad]=useState(true);
  const [loadt,setLoadt]=useState(true);
  const [saving,setSaving]=useState(false);
  const [usaving,setUSaving]=useState(false);

  const [visible, setVisible] = React.useState(false);
  const [uvisible, setUVisible] = React.useState(false);
  const [vacationsFilter,setVacationsFilter]=useState([]);
  const [givenTasks, setGivenTasks] = useState(null);
  const [restTasks, setRestTasks] = useState(null);
  const [totalDays,setTotalDays]=useState(0);
  const [totalAtt,settotalAtt]=useState(0);
  const [totalLate,setTotalLate]=useState(0);
  const [givenLoad, setGivenLoad] = useState(true);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [datefromValue,setDatefromValue]=useState(null);
  const [datetoValue,setDatetoValue]=useState(null);
  const [vacType,setVacType]=useState(null);
  const [annuPerc,setAnnuPerc]=useState(null);
  const [annuDays,setAnnuDays]=useState(null);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [logload,setLogLoad]=useState(true);
  const [totalVac,setTotalVac]=useState("");
  const [requiredTasks,setRequiredTasks]=useState([]); 
  const [vacId,setVacId]=useState();
  const [edit,setEdit]=useState();
  const [update,setUpdate]=useState(null);
  const [form] = Form.useForm();
  const [uform] = Form.useForm();

  useEffect(() => {
    axios.get(Env.HOST_SERVER_NAME+'user-type/'+props.user?.id)
      .then(response => {
       setUserType(response.data);
      }).catch(function (error) {
        console.log(error);
      });

    axios.get(Env.HOST_SERVER_NAME+'get-tasks-types')
    .then(response => {
      setTstypes(response.data);
      setLoadt(false);
    }).catch(function (error) {
      console.log(error);
    });

    axios.get(Env.HOST_SERVER_NAME+'tasks-info/'+props.user.user_id+'/'+start+'/'+end)
        .then(response => {
        
          setVacations(response.data.vacs);
          setVacationsTypes(response.data.vacstypes);
          setTotalConsumedVacs(response.data.vacs);
        
          setRequiredTasks(response.data.requiredTasks);
          setVacationsAmount(response.data.tasksAmount);

          
        if(response.data.tasksAmount.length){
          var times=response.data.tasksAmount?.find(it=>it.vid==2);
        
          setAnnuPerc(times?.rest/times?.amount_m*100);
          setAnnuDays(times?.rest);
        }
        else{
          setAnnuPerc(0);
          setAnnuDays(0);
        }
        }).catch(function (error) {
          console.log(error);
        });
    
    setLoad(true);
    axios.get(Env.HOST_SERVER_NAME+'get-tasks/'+props.user.user_id+'/'+start+'/'+end)
    .then(response => {

      let vacations=[];
      response.data.forEach(element => {  
        if(!vacations.some(item => element.name == item.text))      
        vacations.push({text:element['name'],value:element['name']});       
    }); 
    setVacationsFilter([...vacationsFilter,...vacations]);
      setData(response.data);
     // setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });

    axios.get(Env.HOST_SERVER_NAME+'dawam-info/'+props.user.user_id+'/'+start+'/'+end)
    .then(response => {
      setTotalDays(response.data.count[0].count);
      settotalAtt(response.data.data[0].attendanceDays);
      setTotalLate(response.data.data[0].lateTime);
      
      setStar(1-((parseFloat(response.data.lists.lateTimePrice || 0)+parseInt((response.data.count[0].count-(response.data.lists['attendanceDays'] || 0))*(response.data.lists.salary/response.data.count[0].count)))/parseInt(response.data.lists.salary)));
      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });

  },[start,end,update,props.user]);

  const printReport=()=>{
    var report=document.getElementById('task-report');
    //var report=document.body;
   var mywindow = window.open('');
    mywindow.document.write("<html><head><title></title> <style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500&display=swap'); body{font-family:Tajawal;font-size:12px;margin:0}  </style>");
    mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
    mywindow.document.write(report.innerHTML);
    mywindow.document.write('</body></html>');
    mywindow.print();
  }

  const disabledDate = (current) => {
      // Calculate the date two days ago
      var daysCount=props.setting.filter((item)=> item.key == "admin.vacations_tolerance")[0]?.value*1;
      var count= isNaN(daysCount)?1:daysCount;

      const twoDaysAgo =  dayjs().subtract(count, 'day').endOf('day');
  
    // Disable dates that are before two days ago
    return current && current < twoDaysAgo;
  };

  const getGivenRest=(e,start)=>{
    axios.get(Env.HOST_SERVER_NAME+'given-tasks/'+props.user.user_id+'/'+start+'/'+end).then(response=>{
      setGivenTasks(response.data.vacs.filter(record => record.id== e)[0]?.cumHours);
      
      var min=response.data.tasksAmount.filter(record => record.vid== e)[0]?.rest;


      if(typeof min === 'undefined')
      setRestTasks('-');
      else{
        var startMon=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value

        if(e==2){
        var perMonth=(30*7*60)/12;
        }
        else{
          var perMonth=0;
        }
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
  const handleTypeChange=(e)=>{
      setType(e);
      getGivenRest(e,startVac);
    }
  const handleUTypeChange=(e)=>{
      setVacType(e);
      getGivenRest(e,startVac);
    }
  const  handleChange = (pagination, filters, sorter) => {
          setFilteredInfo(filters);
          setSortedInfo(sorter);
      };

  const onRangeChange=(all,dates)=>{ 
        setStartVac(dates[0]);  
        setEndVac(dates[1]); 
        setDatefromValue(dates[0]);
        setDatetoValue(dates[1]);
        checkPeriod(all,dates); 
        axios.get(Env.HOST_SERVER_NAME+'attendancelogs-between/'+props.user.user_id+'/'+dates[0]+'/'+dates[1]).then(response=>{
          setSelectedLogs(response.data);
          setLogLoad(false);
        }).catch(function (error) {
          console.log(error);
          setLogLoad(false);
        });      
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

  const  showModal = () => {
        setIsModalVisible(true);
        setSelectedLogs(null);
      }; 

  const handleOk = () => {
    
       var values={
          "user_id": props.user.user_id,
          "startDate":startVac,
          "endDate":endVac,
          "type":type,
          "note":notes
        }
       
        axios.post(Env.HOST_SERVER_NAME+`add-task`,values)
          .then(function (response) { 
          
            openNotification('bottomLeft',<Text>{'تم إرسال الإجازة بنجاح'}</Text>);
            setSaving(false);
            setIsModalVisible(false);    
            setUpdate(update+1);
            form.resetFields(['date_range','task_type','notes']);
            setTotalVac("");
            setType(null);
            setNotes(null);
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

  const handleuOk = () => {
        var values={
           "id":vacId,
           "startDate":datefromValue,
           "endDate":datetoValue,
           "type":vacType,
           "note":notes
         }
        axios.post(Env.HOST_SERVER_NAME+`update-task`,values)
           .then(function (response) { 

             openNotification('bottomLeft',<Text>{'تم تعديل الإجازة بنجاح'}</Text>);
             setUSaving(false);
             setIsUModalVisible(false);    
             setUpdate(update+1);
             uform.resetFields(['date_range','task_type','notes']);
             setTotalVac("");
             setVacType(null);
             setNotes(null);
             setGivenTasks(0);
             setRestTasks(0);
           })
        .catch(function (error) {
         console.log(error);
         notification.error({
           message:'فشل إرسال الإجازة!' ,
           placement:'bottomLeft',
           duration:10,
         });
         setUSaving(false);
         setIsUModalVisible(false);    
         setUSaving(false);

        });
       }; 

  const openNotification = (placement,text) => {
        notification.success({
          message:text ,
          placement,
          duration:10,
        });
      }

  const deleteTask = (record) => {
       
        axios.delete(Env.HOST_SERVER_NAME+'delete-task/'+record.id)
           .then(response => {
             setVisible(false);
             setConfirmLoading(false);
             openNotification('bottomLeft',<span> {'تم حذف الإجازات/المهام بنجاح.' }</span>);
             setUpdate(update+1);
            }).catch(function (error) {
             console.log(error);
           });
       }; 
       
  const handlePOk = (record) => {
        setConfirmLoading(true);
        deleteTask(record);
      };
  const handlePCancel = () => {
        setVisible(false);
      };
  const handleuCancel = () => {
        setIsUModalVisible(false);
        setTotalVac("");
        setVacType(null);
        setGivenTasks(0);
        setRestTasks(0);
        setNotes(null);
        uform.resetFields(['date_range','task_type','notes']);
      };
  const  notesChange=(e)=>{
       setNotes(e.target.value);    
      } 
  const updateTask=(record)=>{
        axios.put(Env.HOST_SERVER_NAME+'update-task/'+record.id+'/'+vacType+'/'+datefromValue+'/'+datetoValue)
        .then(response => {        
          setVisible(false);
          setConfirmLoading(false);
          
          openNotification('bottomLeft',<span>{ 'تم تعديل الإجازات/المهام بنجاح.' }</span>);
          setUpdate(update+1);
        }).catch(function (error) {
          console.log(error);
          setUpdate(1);
        });
    }
      const columns = [
        {
          title: 'النوع',
          dataIndex: 'name',
          key: 'name',
          filters: vacationsFilter,
          filteredValue: filteredInfo.name || null,
          onFilter: (value, record) => record.name.includes(value),
          sorter: (a, b) => a.name.length - b.name.length,
          sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
          ellipsis: true,
          render:(amount,record,index)=>{
            if(index==edit){
              return (
              <Select showSearch style={{width:120}}  optionFilterProp="children"
              notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}             
              onSelect={function(e){setVacType(e)}}
               filterOption={(input, option) =>
                option.props.children?.indexOf(input) >= 0 ||
                option.props.value?.indexOf(input) >= 0 ||
                 option.props.label?.indexOf(input) >= 0
               }
             filterSort={(optionA, optionB) =>
                optionA.props?.children?.localeCompare(optionB.props.children)
             } 
            // onChange={function(e){}} 
             onPressEnter={function(){updateTask(record);setEdit(null)}}
            defaultValue={record.vac_id}>
                            {tstypes.map(item => (
                              <Option key={item.value} value={item.value}>
                                {item.label}
                              </Option>
                            ))}
              </Select>)
            }
            else{
              return (<Text>{amount}</Text>)
            }      
          }
        },
        {
          title: 'من',
          dataIndex: 'date_from',
          key: 'date_from',
          
          sorter: (a, b) => a.date_from - b.date_from,
          sortOrder: sortedInfo.columnKey === 'date_from' && sortedInfo.order,
          ellipsis: false,
          render:(amount,record,index)=>{
            if(index==edit){
              return (<Input onChange={function(e){setDatefromValue(e.target.value)}} onPressEnter={function(){updateTask(record);setEdit(null);}} defaultValue={moment(amount,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')}></Input>)
            }
            else{
              return (<Text>{moment(amount,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')}</Text>)
            }      
          },
        },
        {
          title: 'إلى',
          dataIndex: 'date_to',
          key: 'date_to',
          
          sorter: (a, b) => a.date_to.length - b.date_to.length,
          sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
          ellipsis: false,
          render:(amount,record,index)=>{
            if(index==edit){
              return (<Input onChange={function(e){setDatetoValue(e.target.value)}} onPressEnter={function(){updateTask(record);setEdit(null)}} defaultValue={moment(amount,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')}></Input>)
            }
            else{
              return (<Text>{moment(amount,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')}</Text>)
            }      
          }
        },
        {
          title: 'تاريخ التقديم',
          dataIndex: 'created_at',
          key: 'created_at',
          sorter: (a, b) => a.created_at.length - b.created_at.length,
          sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
          ellipsis: false,
        },        
         {
          title: 'التفاصيل',
          dataIndex: 'description',
          key: 'description',
          sorter: (a, b) => a.description.length - b.description.length,
          sortOrder: sortedInfo.columnKey === 'description' && sortedInfo.order,
          ellipsis: true,
        },

        {
          title: 'مدة المهمة/الإجازة',
          dataIndex: 'period',
          key: 'period',
          sorter: (a, b) => a.period.length - b.period.length,
          sortOrder: sortedInfo.columnKey === 'period' && sortedInfo.order,
          ellipsis: true,
          render:(period,record,index)=>{
            if(record.days>0)
               return parseInt(record.days)+1;
               else
               return period;
          },
        },
        {
          title: "مدير الإدارة",
          hidden: userType!=3 ,
          dataIndex: "dept_manager",
          key: "dept_manager",
          filters: [
            { text: "معتمدة", value: "معتمدة" },
            { text: "في الانتظار", value: "في الانتظار" },
            { text: "مرفوضة", value: "مرفوضة" },
          ],
          filteredValue: filteredInfo.dept_manager || null,
          onFilter: (value, record) => record.dept_manager.includes(value),
          sorter: (a, b) => a.dept_manager.length - b.dept_manager.length,
          sortOrder: sortedInfo.columnKey === "dept_manager" && sortedInfo.order,
          ellipsis: false,
          render:(el)=>el=="معتمدة"?<CheckCircleOutlined style={{fontSize:'25px',color:'#0972B6'}} />:el=="في الانتظار"?<MinusCircleOutlined style={{fontSize:'25px',color:'#FFDD1C'}}/>:<CloseCircleOutlined style={{fontSize:'25px',color:'#f00'}}/>,
        },
        {
          title: props.setting.filter((item)=> item.key == "admin.general_manager")[0]?.value,
          dataIndex: "gerenal_sec",
          key: "gerenal_sec",
          className: "gensec",
          filters: [
            { text: "معتمدة", value: "معتمدة" },
            { text: "في الانتظار", value: "في الانتظار" },
            { text: "مرفوضة", value: "مرفوضة" },
          ],
          filteredValue: filteredInfo.gerenal_sec || null,
          onFilter: (value, record) => record.gerenal_sec.includes(value),
          sorter: (a, b) => a.gerenal_sec.length - b.gerenal_sec.length,
          sortOrder: sortedInfo.columnKey === "gerenal_sec" && sortedInfo.order,
          ellipsis: false,
          render:(el)=>el=="معتمدة"?<CheckCircleOutlined style={{fontSize:'25px',color:'#0972B6'}} />:el=="في الانتظار"?<MinusCircleOutlined style={{fontSize:'25px',color:'#FFDD1C'}}/>:<CloseCircleOutlined style={{fontSize:'25px',color:'#f00'}}/>,
        },
        {
          title: "شؤون الموظفين",
          dataIndex: "hr_manager",
          key: "hr_manager",
          filters: [
            { text: "معتمدة", value: "معتمدة" },
            { text: "في الانتظار", value: "في الانتظار" },
            { text: "مرفوضة", value: "مرفوضة" },
          ],
          filteredValue: filteredInfo.hr_manager || null,
          onFilter: (value, record) => record.hr_manager.includes(value),
          sorter: (a, b) => a.hr_manager.length - b.hr_manager.length,
          sortOrder: sortedInfo.columnKey === "hr_manager" && sortedInfo.order,
          ellipsis: false,
          render:(el)=>el=="معتمدة"?<CheckCircleOutlined style={{fontSize:'25px',color:'#0972B6'}} />:el=="في الانتظار"?<MinusCircleOutlined style={{fontSize:'25px',color:'#FFDD1C'}}/>:<CloseCircleOutlined style={{fontSize:'25px',color:'#f00'}}/>,
        },
        {
          title: "",
          width:100,
          render: (vid, record, index) => (
            <Button
              disabled={record.dept_manager!='في الانتظار' || record.gerenal_sec!='في الانتظار' || record.hr_manager!='في الانتظار'}
              onClick={function () {uform.setFieldsValue({notes:record.description,date_range:[moment(record.date_from,"YYYY-MM-DD HH:mm") , moment(record.date_to, "YYYY-MM-DD HH:mm")],task_type:record.vac_id});setVacId(record.id);setVacType(record.vac_id);setDatefromValue(record.date_from);setDatetoValue(record.date_to);getGivenRest(record.vac_id,record.date_from);setNotes(record.description);setSelectedLogs(null);setIsUModalVisible(true);}}
              className={'edit-btn'}
              style={{ backgroundColor: "#fff", borderColor: "#0972B6",color:"#0972B6" }}
              type="primary"
              shape="round"
              icon={<FormOutlined />}
            >
            </Button>
          ),
        } ,  
       {
          title: "",
          width:100,
          render: (vid, record, index) => (
        <Popconfirm
          key={record.id}
          title={'هل أنت متأكد من حذف الإجازة '}
          visible={visible && selectedIndex==record.id}
          onConfirm={function(){handlePOk(record);}}
          okButtonProps={{ loading: confirmLoading }}
          onCancel={handlePCancel}
        >
            <Button
              disabled={record.dept_manager!='في الانتظار' || record.gerenal_sec!='في الانتظار' || record.hr_manager!='في الانتظار'}
              onClick={function () {showPopconfirm(record.id);}}
              className={'delete-btn'}
              style={{ backgroundColor: "#fff", borderColor: "#ff0000",color:"#f00" }}
              type="primary"
              shape="round"
              icon={<DeleteOutlined />}
            ></Button>
            </Popconfirm>
          ),
        }
  
      ].filter(item => !item.hidden);
      const dcolumns = [
        {
          title: 'التاريخ',
          dataIndex: 'date',
          key: 'date',
          sorter: (a, b) => a.date.length - b.date.length,
          sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
          ellipsis: true,
    
        },
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
      ];
      const handleCancel=()=>{
        setIsModalVisible(false);
        setType(null);
        setGivenTasks(0);
        setRestTasks(0);
        setTotalVac("");
        setNotes(null);
        form.resetFields(['date_range','task_type','notes']); 
      }
      const showPopconfirm = (id) => {
        setVisible(true);
        setSelectedIndex(id);
      };
      const changeRange=(all,date)=>{
        setStart(date[0]);
        setEnd(date[1]);       
      }
      var days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      var index=1;

      const onChange=(all,data)=>{
        setCurrentMonth(all.format('MMMM'));
    
        var startDay=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value;
        var endDay=props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value;
    
        setStart(moment(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
        setEnd(moment(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));
    
        }

return (
    <Card>
    <div className='tasksHeader'>
      <div className='tasksData'>
        <span><Progress type="circle" percent={Math.round(annuPerc?annuPerc:0)} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
        <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
          <div style={{marginBottom:'5px'}}>رصيد السنوية</div>
          <div> المتبقي : {annuDays?  (Math.round(annuDays/60/7*100)/100) :0} يوم </div>
        </span>
      </div>
  
      <div className='tasksOper'>
      <div style={{marginLeft:'10px'}}>
        <span>اختر شهرًا : </span>
        <DatePicker  defaultValue={moment()} onChange={onChange} picker="month" />
      </div>  
        <div className='tasksRange' style={{marginBottom:'10px',marginLeft:'5px'}}><span>اختر فترة : </span>
          <RangePicker  value={[moment(start,"YYYY-MM-DD"),moment(end,"YYYY-MM-DD")]} onCalendarChange={changeRange} />
        </div>
        <div className='tasksBtn'>   
          <Button style={{marginBottom:'10px',marginLeft:'5px',backgroundColor:'#FAA61A',border:'none'}} onClick={showModal} type='primary'><FormOutlined /> تقديم إجازة </Button>
          <Button disabled={load} style={{display:'block',marginLeft:'5px',marginBottom:'10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
          <Button disabled={load} style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
        </div>
      </div>
    </div>
<Modal title="تقديم إجازة / مهمة" confirmLoading={saving} visible={isModalVisible} onOk={function(){setSaving(true);handleOk()}} onCancel={function(){handleCancel()}}>
    <Form form={form} >
    <Form.Item className='rangee' name={'date_range'} label="فترة الإجازة / المهمة :">
    <Space>
    <RangePicker
     showTime={{
        defaultValue: [moment(props.setting.filter((item)=> item.key == 'duration_start')[0]?.value, 'HH:mm'), moment(props.setting.filter((item)=> item.key == 'duration_end')[0]?.value, 'HH:mm')],
      }}
      disabledDate={disabledDate}
      format="YYYY-MM-DD HH:mm"  
      onCalendarChange={function(all,dates){onRangeChange(all,dates);}}
    />
  </Space>
  <div style={{marginTop:'10px',fontWeight:600}}>مدة الإجازة: <Text type="danger">{totalVac}</Text></div> 
    </Form.Item>
    <Table loading={logload}  pagination={false} style={{textAlign:'center!important'}}   columns={dcolumns}  dataSource={selectedLogs} onCalendarChange={handleChange} />         
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
    <TextArea row={3} onChange={notesChange}></TextArea>
    </Form.Item>
    </Form>
    </Modal>

    <Modal title="تعديل إجازة / مهمة" confirmLoading={usaving} visible={isuModalVisible} onOk={function(){setUSaving(true);handleuOk()}} onCancel={function(){handleuCancel()}}>
    <Form form={uform} >
    <Form.Item className='rangee' name={'date_range'} label="فترة الإجازة / المهمة :">
    <Space>
    <RangePicker
      format="YYYY-MM-DD HH:mm"
      value={[moment(datefromValue,"YYYY-MM-DD HH:mm"), moment(datetoValue, "YYYY-MM-DD HH:mm")]}
      showTime
      disabledDate={disabledDate}
      onCalendarChange={function(all,dates){onRangeChange(all,dates);}}
    />
  </Space>
  <div style={{marginTop:'10px',fontWeight:600}}>مدة الإجازة: <Text type="danger">{totalVac}</Text></div> 

    </Form.Item>
    <Table loading={logload}  pagination={false} style={{textAlign:'center!important'}}   columns={dcolumns}  dataSource={selectedLogs} onCalendarChange={handleChange} />         
    <Form.Item name={'task_type'} label="نوع الإجازة">
    <Select
    showSearch
    notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
    style={{ width: 150 }}
    onSelect={handleUTypeChange}
    value={vacType}
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
    <TextArea row={3} onChange={notesChange}></TextArea>
    </Form.Item>
    </Form>
    </Modal>
    <Table loading={load} columns={columns} scroll={{x: '1000px' }}  dataSource={data} onChange={handleChange} />
    <div id="task-report"  style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 16px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>حافظة الإجازات  والمهام لشهر {currentMonth}</h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200",margin: "0"}}>للفترة من {start} إلى {end}</h2>
       </div>     
       <div style={{width: "20%"}}>

       </div>
    </header> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',padding: '10px 0',fontSize: '14px',borderBottom:'1px solid black'}} >
         <div style={{width: " 30%"}}>الاسم:  {props.user.name}</div>
         <div style={{width: " 20%"}}> الرقم الوظيفي:  {props.user.user_id} </div>
         <div style={{width: " 20%"}}>الوظيفة:  {props.user.job}</div>
         <div style={{width: " 30%"}}>الإدارة:  {typeof props.user.category === 'object'?props.user.category.name:props.user.category}</div>
    </div>
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',padding: '10px 0',fontSize: '14px'}} >
    <div style={{width: " 30%"}}>الدوام المطلوب:  {totalDays}</div>
    <div style={{width: " 30%"}}>أيام الغياب:  {totalDays-totalAtt}</div>
    <div style={{width: " 30%"}}>التأخرات بالساعة:  {parseInt(totalLate/60)}:{totalLate%60}</div>
    <div style={{width: " 30%"}}>نسبة الانضباط:  {Math.round(star*100)}%</div>
    </div>
    <div >
        <table style={{fontSize: "12px",width: " 100%",textAlign: " center",marginTop: " 0px"}} >
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                     <th colSpan={4} style={{fontWeight: "100"}}>الفترة</th>
                     <th colSpan={2} style={{fontWeight: "100"}}>الإجمالي</th>
                     <th rowSpan={2} style={{fontWeight: "100"}}>نوع الإجازة/المهمة</th>
                     <th rowSpan={2} style={{fontWeight: "100"}}>التفاصيل</th>
                     <th rowSpan={2} style={{fontWeight: "100",width:'90px'}}>{userType!=3?props.setting.filter((item)=> item.key == "admin.general_manager")[0]?.value:'مدير الإدارة'}</th>
                     <th rowSpan={2} style={{fontWeight: "100",width:'90px'}}>الشؤون</th>
                </tr>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                     <th  style={{fontWeight: "100"}}></th>
                     <th  style={{fontWeight: "100"}}>اليوم</th>
                     <th  style={{fontWeight: "100"}}>التاريخ</th>
                     <th  style={{fontWeight: "100"}}>الوقت</th>
                     <th  style={{fontWeight: "100"}}>أيام</th>
                     <th  style={{fontWeight: "100"}}>ساعات</th>
                </tr>
            </thead>
            <tbody>           
             {data.map(item=>{
          
               return(
              <>
              <tr style={{height: " 25px"}}>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}}>من</td>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}}>{days[new Date(item.date_from ).getDay()]}</td>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}}>{item.date_from.split(" ")[0]}</td>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}}>{moment(item.date_from.split(" ")[1],'HH:mm:ss').format('hh:mm A')}</td>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}} rowSpan={2}>{item.days>0 ? parseInt(item.days)+1:item.days}</td>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}} rowSpan={2}>{item.period?.replace(/(\d{1,2}:\d{2}):\d{2}/, "$1")}</td>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}} rowSpan={2}>{item.name}</td>
                <td style={{width:'150px',backgroundColor: index%2==0?'#e6e6e6':'#fff'}} rowSpan={2}>{item.description}</td>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}} rowSpan={2}>{userType!=3? (item.gerenal_sec=='في الانتظار'?"":item.gerenal_sec) : (item.dept_manager=='في الانتظار'?"":item.dept_manager)}</td>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}} rowSpan={2}>{item.hr_manager=='في الانتظار'?"":item.hr_manager}</td>
              </tr>
              <tr style={{height: " 25px"}}>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}}>إلى</td>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}}>{days[new Date(item.date_to ).getDay()]}</td>
                <td style={{backgroundColor: index%2==0?'#e6e6e6':'#fff'}}>{item.date_to?.split(" ")[0]}</td>
                <td style={{backgroundColor: index++%2==0?'#e6e6e6':'#fff'}}>{moment(item.date_to?.split(" ")[1],'HH:mm:ss').format('hh:mm A')}</td>
              </tr>
              </>
              );
             })}
            </tbody>
        </table>
    </div>
    <div style={{padding:'0px 50px',marginTop:'30px'}}>
    <table style={{fontSize: "12px",width: "100%",textAlign: "center",paddingLeft: "20px"}}>
            <caption style={{fontWeight: "900"}}>خلاصة الإجازات المعتمدة</caption>
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
                 <td style={{backgroundColor: " #0972B6",color: "#fff"}}>المطلوبة</td>
                 {vacationsTypes.map(item=>(
                  <td >{requiredTasks.find(it=>it.vac_id==item.id)?requiredTasks.find(it=>it.vac_id==item.id).duration :0}</td>  
                 ))}  
                </tr>
                <tr >
                 <td style={{backgroundColor: " #0972B6",color: "#fff"}}>الممنوحة</td>
                 {vacationsTypes.map(item=>(
                  <td rowspan={item.days>0?"1":"2"}>{totalConsumedVacs.find(it=>it.id==item.id)?totalConsumedVacs.find(it=>it.id==item.id).cumHours :0}</td>  
                 ))}  
                </tr>
                <tr style={{backgroundColor:'#e6e6e6'}}>
                 <td style={{backgroundColor: "#0972B6",color: "#fff"}}>المتبقية</td>
                 {vacationsTypes.map(item=>{
                  var min=vacationsAmount.find(it=>it.vid==item.id)?vacationsAmount.find(it=>it.vid==item.id).rest:0;
                  
                 return <td style={{display:item.days>0?'':'none'}}>{ parseInt(min/60)+":"+min%60}</td>  
                 })}  
                </tr>
            </tbody>
    </table>
    </div>
    <div style={{display: "flex",flexDirection: "row",marginTop: "20px",textAlign: "center"}}>
       <div style={{width: "50%",fontWeight: "900"}}>الموظف</div>
       <div style={{width: "50%",fontWeight: "900"}}>المسؤول المباشر</div>
       <div style={{width: "50%",fontWeight: "900"}}>مدير الإدارة</div>
       <div style={{width: "50%",fontWeight: "900"}}>المختص</div>
       <div style={{width: "50%",fontWeight: "900"}}>مدير الشؤون</div>
     </div>  
     <div style={{marginTop: " 20px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #0972B6",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
     </div>
 </div> 
 </div>
    </Card>
);
 }

