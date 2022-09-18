/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import axios from 'axios';
import './style.css';
import ZKLib from 'node-zklib';
import logoText from '../../../assets/images/logo-text.png';
import {Env} from '../../../styles';
import { useCookies,CookiesProvider  } from 'react-cookie';
import './style.css';
import { DatePicker, Space,Form,Table, Button,Modal,Card,Radio,Input,Select,Upload,notification,Typography } from 'antd';
import {EditOutlined,ImportOutlined} from '@ant-design/icons';
const {Text}=Typography;
const {Option}=Select;
const { RangePicker } = DatePicker;
const {TextArea}=Input;

export default function events() {
  const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
  const [filteredInfo,setFilteredInfo]=useState({});
  const [sortedInfo,setSortedInfo]=useState({});
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [startVac,setStartVac]=useState("");
  const [type,setType]=useState(null);
  const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
  const [end,setEnd]=useState(new Date().toISOString().slice(0, 10)); 
  const [endVac,setEndVac]=useState("");
  const [notes,setNotes]=useState("");
  const [data,setData]=useState([]);
  const [load,setLoad]=useState(true);
  
  const [uploading,setUploading]=useState(false);
  const [connected,setConnected]=useState(true);
  const user=cookies.user;
  useEffect(() => {
    setLoad(true);
    axios.get(Env.HOST_SERVER_NAME+'events'+'/'+start+'/'+end)
    .then(response => {
      setData(response.data);
      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });
  },[start,end]);

    const handleTypeChange=(e)=>{
      setType(e);
    }
    const  handleChange = (pagination, filters, sorter) => {
 
          setFilteredInfo(filters);
          setSortedInfo(sorter);

      };
    const  onRangeChange=(all,dates)=>{ 
        setStartVac(dates[0]);  
        setEndVac(dates[1]);        
      }
     const  showModal = () => {
          setIsModalVisible(true);
      };  
     const handleOk = () => {
        var values={
          "user_id": cookies.user.user_id,
          "startDate":startVac,
          "endDate":endVac,
          "type":type,
          "note":notes
        }
        axios.post(Env.HOST_SERVER_NAME+`add-task`,values)
          .then(function (response) {
            if(response.statusText=="OK"){
              alert('تم إرسال الإجازة بنجاح')
            }           
          })
       .catch(function (error) {
        alert('error..');
        console.log(error);
       });
        setIsModalVisible(false); 
      }; 
    const  notesChange=(e)=>{
       setNotes(e.target.value);       
      } 
      const columns = [
        {
          title: 'اسم الموظف',
          dataIndex: 'fullname',
          key: 'fullname',
          ellipsis: true,
        },
        {
          title: 'الرقم الوظيفي',
          dataIndex: 'user_id',
          key: 'user_id',
          ellipsis: true,
        },
        {
          title: 'التاريخ',
          dataIndex: 'events_datetime',
          key: 'events_datetime',
          ellipsis: true,
          render:(dt)=>dt?.split(" ")[0],
        },     
        {
          title: 'الوقت',
          dataIndex: 'events_datetime',
          key: 'events_datetime ',
          ellipsis: true,
          render:(dt)=>dt?.split(" ")[1],

        },
  
      ];
      const handleCancel=()=>{
        setIsModalVisible(false);
      }
     const testConnection= async ()=>{
        // ZKLib = require('./zklib')
            let zkInstance = new ZKLib('192.168.0.201', 4370, 10000, 4000);
            try {
                // Create socket to machine 
                await zkInstance.createSocket();
                // Get general info like logCapacity, user counts, logs count
                // It's really useful to check the status of device 
                console.log(await zkInstance.getInfo());
            } catch (e) {
                console.log(e)
                if (e.code === 'EADDRINUSE') {
                }
            }              
     }
     const changeRange=(all,date)=>{
      setStart(date[0]);
      setEnd(date[1]);       
    }
    const openNotification = (placement,text) => {
      notification.success({
        message:text ,
        placement,
        duration:0,
      });
    }
    const testUpload=(file)=>{
      setUploading(true);
      const reader = new FileReader();
      const rABS = !!reader.readAsBinaryString;

      reader.onload = e => {
        const bstr = e.target.result;

        const wb = excel.read(bstr, { type: rABS ? "binary" : "array" });

        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* Convert array of arrays */
        const data = excel.utils.sheet_to_json(ws, {header:1});
        /* Update state */
        events='[';
        data.forEach(element => {
          events+='{"user_id":"'+element[0]+'","events_datetime":"'+element[1]+'"},';
        });
        events=events.substring(0, events.length - 1)+']';
        console.log(events);
        axios.post(Env.HOST_SERVER_NAME+'events-import',JSON.parse(events))
         .then(response => {
           console.log(response);
           setUploading(false);
           openNotification('bottomLeft','تم الاستيراد بنجاح');
           }).catch(function (error) {
            alert('يوجد مشكلة في الاتصال بالسرفر!');
            setUploading(false);
           });
       
      };
      if (rABS) reader.readAsBinaryString(file);
      else reader.readAsArrayBuffer(file);

      // Prevent upload
      return false;
    }
return (
    <Card>
    <div className='discountHeader' >  
    <div className='discountRange' ><span>اختر فترة : </span>
    <RangePicker  onCalendarChange={changeRange} />
    </div>   
   <Upload
    accept=".xlsx, .csv" 
    showUploadList={false} 
    
    beforeUpload={file => {testUpload(file)}}
    >
    <Button loading={uploading} className='discountBtn' style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} type='primary'><ImportOutlined /> استيراد البصمات </Button>
    </Upload>
    </div>
    <Modal title="تقديم إجازة / مهمة" visible={isModalVisible} onOk={function(){handleOk()}} onCancel={function(){handleCancel()}}>
    </Modal>
    <Table scroll={{x: '1000px' }} loading={load} columns={columns}  dataSource={data} onChange={handleChange} />
    </Card>
);
 }

