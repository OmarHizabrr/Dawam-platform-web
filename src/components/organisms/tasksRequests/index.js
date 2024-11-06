/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import dayjs from 'dayjs';
import excel from "xlsx";
import {ClusterOutlined,TagsOutlined,CheckCircleOutlined,MinusCircleOutlined,CloseCircleOutlined} from '@ant-design/icons';
import axios from "axios";
import {message,notification} from 'antd';
import { Env } from "../../../styles";
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt';
import { useCookies, CookiesProvider } from "react-cookie";
import "./style.css";
import {
  DatePicker,
  Space,
  Form,
  Table,
  Button,
  Modal,
  Card,
  Radio,
  Input,
  Select,
  Progress,
  Tag,
  Typography,
} from "antd";
import { ExportOutlined, FormOutlined } from "@ant-design/icons";
import FormItem from "antd/lib/form/FormItem";
import { useForm } from "rc-field-form";
const { Text } = Typography;

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const exportToExcel = (type, fn, dl) => {
  var elt = document.getElementsByTagName("table")[0];
  if (elt) {
    var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl
      ? excel.write(wb, { bookType: type, bookSST: true, type: "base64" })
      : excel.writeFile(wb, fn || "طلبات الإجازات." + (type || "xlsx"));
  }
};

export default function TasksRequests(props) {
  const [saving,setSaving]=useState(false);

  const [cookies, setCookie, removeCookie] = useCookies(["userId"]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [start,setStart]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
//  const [end,setEnd]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));  
  const [end,setEnd]=useState(dayjs().format('YYYY-MM-DD'));  

  const [currentMonth,setCurrentMonth]=useState(dayjs().format('MMMM')); 
  const [selected, setSelected] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState(null);

  const [givenTasks, setGivenTasks] = useState(null);
  const [restTasks, setRestTasks] = useState(null);

  const [givenLoad, setGivenLoad] = useState(true);

  const [statusType, setStatusType] = useState(null);
  const [accepter, setAccepter] = useState(null);
  const [notes, setNotes] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [startVac,setStartVac]=useState("");
  const [type,setType]=useState(null);
  const [endVac,setEndVac]=useState("");
  const [load,setLoad]=useState(true);
  const [update,setUpdate]=useState(0);
  const [namesFilter,setNamesFilter]=useState([]);
  const [categoriesFilter,setCategoriesFilter]=useState([]);
  const [vacationsFilter,setVacationsFilter]=useState([]);
  const [vacationsTypes,setVacationsTypes]=useState([]);
  const [vacationtype,setVacationtype]=useState([]);
  const [logload,setLogLoad]=useState(true);
  const [totalVac,setTotalVac]=useState("");
  const [countPer,setCountPer]=useState(0);
  const [countRest,setCountRest]=useState(0);

  const user = cookies.user;
  const [form] = Form.useForm();
// check if an element exists in array using a comparer function
// comparer : function(currentElement)


// adds an element to the array if it does not already exist using a comparer 
// function
 
  useEffect(() => {
    setLoad(true);
    axios
      .get(
        Env.HOST_SERVER_NAME +
          "get-tasks-requests/" +
          user.user_id +
          "/" +
          start +
          "/" +
          end
      )
      .then((response) => { 
        setCountPer(Math.round(response.data["count"][0]['done']/response.data["count"][0]['total']*100));
        setCountRest(response.data["count"][0]['total']-response.data["count"][0]['done']);
        setData(response.data["tasks"]);
      
        let names=[];
        let categories=[];
        let vacations=[];
        response.data["tasks"].forEach(element => {  
            if(!names.some(item => element.user == item.text))      
              names.push({text:element['user'],value:element['user']});
            if(!categories.some(item => element.category == item.text))      
              categories.push({text:element['category'],value:element['category']});
            if(!vacations.some(item => element.vactype == item.text))      
              vacations.push({text:element['vactype'],value:element['vactype']});         
        }); 

        setNamesFilter(names);
        setCategoriesFilter(categories);
        setVacationsFilter([...vacationsFilter,...vacations]);     
        setLoad(false);
        setVacationsTypes(response.data['types']);
        setAccepter(response.data["type"]);

      }).catch(function (error) {
        console.log(error);
      });
     // 
    // console.log(namesFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[start,end,update]);

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
   // console.log(filters);
  };
  const processRequest = (selected) => {
    setGivenLoad(true);
    form.resetFields(['range_date','request_type','request_status','notes']);
    setNotes("");

    form.setFieldValue('request_type',selected.vactype);
    form.setFieldValue('range_date',[dayjs(selected ? selected.date_from : "", "YYYY-MM-DD HH:mm"), dayjs(selected ? selected.date_to : "", "YYYY-MM-DD HH:mm")]);

    setTotalVac(selected?.days > 0 ? (parseInt(selected?.days)+1) + " يوم " : "" + selected?.period != 0 ? selected?.period : "");
    setVacationtype(selected.vacation);
    setStartVac(selected.date_from);  
    setEndVac(selected.date_to); 

    setIsModalVisible(true);
    setSelectedLogs(null);
    setLogLoad(true);

    axios.get(Env.HOST_SERVER_NAME+'attendancelogs-between/'+selected.user_id+'/'+selected.date_from+'/'+selected.date_to).then(response=>{
      setSelectedLogs(response.data);
      setLogLoad(false);
    }).catch(function (error) {
      console.log(error);
      setLogLoad(false);
    });
     setGivenTasks(null);
     setRestTasks(null);

    axios.get(Env.HOST_SERVER_NAME+'given-tasks/'+selected.user_id+'/'+start+'/'+end).then(response=>{
      setGivenTasks(response.data.vacs.filter(record => record.id== selected.vacation)[0]?.cumHours);
      var min=response.data.tasksAmount.filter(record => record.vid== selected.vacation)[0]?.rest;
      //var totInMonth=1050;

     
      if(typeof min === 'undefined')
      setRestTasks('-');
      else{
        var startMon=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value

        var perMonth=(30*7*60)/12;
        var curr=parseInt(dayjs(selected.date_from,"YYYY-MM-DD HH:mm").format('MM'));
        var currMonth=parseInt(dayjs(selected.date_from,"YYYY-MM-DD HH:mm").format('DD'))>=startMon?curr+1:curr;
         var restMin=min- (perMonth*(12-currMonth));
      setRestTasks( parseInt(restMin/60).toString().padStart(2, '0') + ":" +(restMin%60).toString().padStart(2, '0'));
      }
      setGivenLoad(false);
    }).catch(function (error) {
      console.log(error);
      setGivenLoad(false);
    });
    
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields(['range_date','request_type','request_status','notes']);
    //setUpdate(update+1);
  };
  const checkPeriod=(all,date)=>{
    if(date[1]!=''){
      const minutes=(new Date(date[1])-new Date(date[0]))/60000;
      var alerta="";
      if(minutes<=420) alerta=(Math.floor(minutes/60)+" ساعة و "+(minutes%60))+" دقيقة ";
      else alerta=(Math.floor(minutes/1440)+1)+" يوم ";
      return alerta;
    }
  }
  const  onRangeChange=(all,dates)=>{ 
    setStartVac(dates[0]);  
    setEndVac(dates[1]); 
    console.log(checkPeriod(all,dates));
    setTotalVac(checkPeriod(all,dates));       
  }
  const handleOk = () => {
    if(statusType!=null){
    setSaving(true); 

    var values = {
      user_id: cookies.user.user_id,
      vid: selected.vid,
      status: statusType,
      date_from:startVac,
      date_to:endVac,
      vacationtype_id:vacationtype,
      note: notes,
      accepter: accepter,
    };
    
    axios.post(Env.HOST_SERVER_NAME + `accept-task`, values)
    .then(function (response) {
     notification.success({
      message:"تم التحديث بنجاح" ,
      placement:'bottomLeft',
      duration:10,
    });
    
    setSaving(false);
    setIsModalVisible(false);
    setUpdate(update+1);
    form.resetFields(['range_date','request_type','request_status','notes']);
    })
    .catch(function (error) {
      console.log("Refused Request : "+error);
      setSaving(false);
    });
  }

  else{
    notification.warning({
      message:"يرجى تحديد حالة الطلب" ,
      placement:'bottomLeft',
      duration:10,
    });
  }

  };
  const changeType = (e) => {
    setStatusType(e);
  };
  const changeVType = (e) => {
    setVacationtype(e);
  };
  const changeNotes = (e) => {
    setNotes(e.target.value);
  };
  const changeRange=(all,date)=>{
    setStart(date[0]);
    setEnd(date[1]);  
  }

  const columns = [
    {
      title: "الموظف",
      dataIndex: "user",
      key: "user",
      filters:namesFilter,
      filterSearch: true,
      filteredValue: filteredInfo.user || null,
      onFilter: (value, record) => record.user.includes(value),
      sorter: (a, b) => a.user.length - b.user.length,
      sortOrder: sortedInfo.columnKey === "user" && sortedInfo.order,
      ellipsis: false,
      render:(user,record,_)=>(
        <Text>
        {user}
        </Text>
      )
    },
    {
      title: "الإدارة",
      dataIndex: "category",
      key: "category",
      filters: categoriesFilter,
      filteredValue: filteredInfo.category || null,
      onFilter: (value, record) => record.category.includes(value),
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: sortedInfo.columnKey === "category" && sortedInfo.order,
      ellipsis: false,
      render:(category,record,_)=>(
        <Text>
        {category}
        </Text>
      )
    },
    {
      title: "النوع",
      dataIndex: "vactype",
      key: "vactype",
      filters: vacationsFilter,
      filteredValue: filteredInfo.vactype || null,
      onFilter: (value, record) => record.vactype.includes(value),
      sorter: (a, b) => a.vactype.length - b.vactype.length,
      sortOrder: sortedInfo.columnKey === "category" && sortedInfo.order,
      ellipsis: false,
      render:(vactype,record,_)=>(
        <Text>
        {vactype}
        </Text>
      )
    },
    {
      title: "من",
      dataIndex: "date_from",
      key: "date_from",
      width:'110px',
      sorter: (a, b) => a.date_from - b.date_from,
      sortOrder: sortedInfo.columnKey === "date_from" && sortedInfo.order,
      ellipsis: false,
      render:(date_from,record,_)=>(
        <Text>
        {date_from.split(':').slice(0, 2).join(':')}
        </Text>
      )
    },
    {
      title: "إلى",
      dataIndex: "date_to",
      key: "date_to",
      width:'110px',
      sorter: (a, b) => a.date_to.length - b.date_to.length,
      sortOrder: sortedInfo.columnKey === "address" && sortedInfo.order,
      ellipsis: false,
      render:(date_to,record,_)=>(
        <Text>
        {date_to.split(':').slice(0, 2).join(':')}
        </Text>
      )
    },
    {
      title: 'تاريخ التقديم',
      dataIndex: 'created_at',
      key: 'created_at',
      width:'110px',
      sorter: (a, b) => a.created_at.length - b.created_at.length,
      sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
      ellipsis: false,
      render:(created_at,record,_)=>(
        <Text>
        {created_at}
        </Text>
      )
    }, 
    {
      title: "مدير الإدارة",
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
      title: "مراجعة الطلب",
      dataIndex: "vid",
      key: "vid",
      render: (vid, record, index) => (
        <Button
          disabled={ props.user.role_id!=1 && record.hr_manager=='معتمدة' }
          onClick={function () {
            setSelected(record);
            processRequest(record);
          }}
          style={{ backgroundColor: "#0972B6", borderColor: "#0972B6" }}
          type="primary"
          shape="round"
          icon={<FormOutlined />}
        ></Button>
      ),
    },
  ];

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

  const onChange=(all,data)=>{
    setCurrentMonth(all.format('MMMM'));

    var startDay=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value;
    var endDay=props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value;

    setStart(dayjs(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
    setEnd(dayjs(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));

    }

  return (
    <Card bodyStyle={{padding:'20px 15px'}}>
      <div
      className="requestsHeader"
      >
        <div className="reauestsProgress">
          <span>
            <Progress
              type="circle"
              percent={countPer}
              width={window.innerWidth <= 760?55:80}
              style={{ marginLeft: "5px", display: "inline-block" }}
            />
          </span>
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: "10px",
              marginRight: "5px",
            }}
          >
            <div style={{ marginBottom: "5px",textAlign:'center'}}>الطلبات المنجزة</div>
            {window.innerWidth <= 760?<></>:<div style={{ color: "#828282" }}> بقي لديك {countRest} طلباً</div>}
          </span>
        </div>
    <div className="requestsRange" > 
    <div style={{marginLeft:'10px',display:'flex',alignItems:'baseline'}}>
        <span>اختر شهرًا : </span>
        <DatePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760}  defaultValue={dayjs()} onChange={onChange} picker="month" />
    </div>  
    {window.innerWidth <= 760?<></>:<div style={{marginBottom:'10px',marginLeft:'5px'}}><span>اختر فترة : </span>
    <RangePicker needConfirm={true}   inputReadOnly={window.innerWidth <= 760} value={[dayjs(start,"YYYY-MM-DD"),dayjs(end,"YYYY-MM-DD")]} onChange={changeRange} />
    </div>}
    <div className="requestsBtn">   
    {window.innerWidth <= 760?<></>:<Button style={{display:'block',float:"left",marginBottom:'10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>}
    </div>
    </div>
      </div>
      <Modal
        centered
        title="مراجعة الطلبات"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={saving}
        width={'530px'}
      >
      <Form form={form}>
        <div style={{ marginBottom: "20px" }}>
        <div className="taggedInfo" style={{fontWeight:'700',fontFamily: 'Tajawal'}}>
          {" "}
          مقدم الطلب : {" "}
          <span style={{ fontWeight: "400", fontFamily: "Tajawal" }}>
            {" "}
            {selected ? selected.user : ""}{" "}
          </span>{" "}
          <Text style={{display:'block',marginTop:'10px',fontWeight:'400'}}> <span style={{fontWeight:'700'}}>الإدارة:</span>  {selected ? selected.category : ""} , {selected ? selected.job : ""} </Text></div>          
          <div className="taggedInfo" style={{fontWeight:'700'}}> التفاصيل : <Text  style={{fontFamily: 'Tajawal',fontWeight:'400'}}>{selected ? selected.description : ""}</Text></div>
          <div className="taggedInfo" style={{fontWeight:'700'}}> الإجمالي : <Text  style={{fontFamily: 'Tajawal',fontWeight:'400',color:'#f00'}}>
           {totalVac.split(':').slice(0, 2).join(':')}
          </Text></div>
          <div className="taggedInfo" style={{fontFamily: 'Tajawal'}}><Text>الفترة :   </Text></div>
          <FormItem name={'range_date'}>
          <RangePicker needConfirm={true} 
    inputReadOnly={window.innerWidth <= 760}
            showTime={{ format: "HH:mm" }}
            value={[dayjs(selected ? selected.date_from : "", "YYYY-MM-DD HH:mm"), dayjs(selected ? selected.date_to : "", "YYYY-MM-DD HH:mm")]}
            format="YYYY-MM-DD HH:mm"
            onChange= {onRangeChange}
          />
          </FormItem>
            <Table loading={logload}  pagination={false} style={{textAlign:'center!important'}}   columns={dcolumns}  dataSource={selectedLogs} onChange={handleChange} />         
        </div>
        <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>        
        <FormItem style={{marginBottom:'0px',fontFamily:'Tajawal'}} name={'request_type'} label={'نوع الطلب '}>
          <Select
            
            value={selected? selected.vactype:""}
            style={{ width: 150, marginBottom: "20px" }}
            placeholder="اختر نوع الطلب"
            optionFilterProp="children"
            onSelect={changeVType}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children
                .toLowerCase()
                .localeCompare(optionB.children.toLowerCase())
            }
          >
            {vacationsTypes?.map(function(item){return (<Option key={item.id}  value={item.id}>{item.name}</Option>)})}           
          </Select>
        </FormItem>
        <FormItem rules={[{ required: true, message: 'اختر حالة الطلب' }]} style={{marginBottom:'0px'}} name={'request_status'} label={'حالة الطلب'}>
          <Select
            style={{ width: 200, marginBottom: "20px" }}
            placeholder="اختر حالة الطلب"
            optionFilterProp="children"
            onSelect={changeType}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children
                .toLowerCase()
                .localeCompare(optionB.children.toLowerCase())
            }
          >
            <Option value="1">اعتماد</Option>
            <Option value="0">رفض</Option>
          </Select>
          </FormItem>
            </div>
          <div style={{marginBottom:'10px'}}>
            <div>الممنوحة: <span style={{fontWeight:'600',color:'#f00',marginLeft:'30px'}}>{givenTasks??0}</span>      المتبقية: <span style={{fontWeight:'600',color:'#f00'}}>{restTasks??0}</span> </div>
          </div>
          <FormItem name={'notes'}>
          <TextArea
            onChange={changeNotes}
            placeholder="ملاحظات"
            row={3}
          ></TextArea>       
          </FormItem>
        </Form>
      </Modal>
      <Table scroll={{x: '1000px' }} loading={load} columns={columns} dataSource={data} onChange={handleChange} />
    </Card>
  );
}


