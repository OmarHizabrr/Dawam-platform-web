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
import { DatePicker, Space,Form,Table, Button,Modal,Card,Radio,Input,Select,Progress,Tag,Typography } from 'antd';
import {ExportOutlined,FormOutlined,PrinterOutlined} from '@ant-design/icons';
const {Text}=Typography;
const {Option}=Select;
const { RangePicker } = DatePicker;
const {TextArea}=Input;

//const ZKLib = require('./zklib');

export default function ConnectedDevices(props) {
  
  const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
  const [filteredInfo,setFilteredInfo]=useState({});
  const [sortedInfo,setSortedInfo]=useState({});
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [startVac,setStartVac]=useState("");
  const [type,setType]=useState(null);
  const [endVac,setEndVac]=useState("");
  const [notes,setNotes]=useState("");
  const [data,setData]=useState([]);
  const [load,setLoad]=useState(true);
  const [connected,setConnected]=useState(true);
  const user=cookies.user;


  useEffect(() => {
    setLoad(true);
    axios.get(Env.HOST_SERVER_NAME+'connected-devices')
    .then(response => {
      setData(response.data);
      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });
  },[]);

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
          title: 'اسم الجهاز',
          dataIndex: 'dev_name',
          key: 'dev_name',
          ellipsis: true,
        },
        {
          title: 'عنوان الآيبي IP',
          dataIndex: 'dev_ip',
          key: 'dev_ip',
          ellipsis: true,
        },
        {
          title: 'رقم المنفذ port',
          dataIndex: 'dev_port',
          key: 'dev_port',
          ellipsis: true,
        },     
        {
          title: 'الحالة',
          dataIndex: 'status',
          key: 'status',
          ellipsis: true,
        }, 
      ];
      const handleCancel=()=>{
        setIsModalVisible(false);
      }
  const testConnection= async ()=>{
   

    let zkInstance = new ZKLib('192.168.0.201', 4370, 10000, 4000);
    try {
        // Create socket to machine 
        await zkInstance.createSocket()
        // It's really useful to check the status of device 
        console.log(await zkInstance.getInfo())
    } catch (e) {
        console.log(e)
        if (e.code === 'EADDRINUSE') {
        }
    }

    
    }

return (
    <Card>
    <div style={{display:'flex',flexDirection:'row',justifyContent:'flex-end'}}>   
    <Button style={{display:'block',marginLeft:'5px',marginBottom:'10px'}} onClick={function(){testConnection()}} type='primary'><ExportOutlined /> سحب البصمات </Button>
    <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){}} type='primary'><PrinterOutlined /> حذف البصمات </Button>
    </div>
    <Modal centered title="تقديم إجازة / مهمة" visible={isModalVisible} onOk={function(){handleOk()}} onCancel={function(){handleCancel()}}>
    </Modal>
    <Table loading={load} columns={columns}  dataSource={data} onChange={handleChange} />
    </Card>
);
 }

