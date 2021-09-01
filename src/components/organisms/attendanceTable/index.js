/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import './style.css';
import { Typography ,Layout,Tabs,Table, Button,Progress, DatePicker, Select,Card } from 'antd';
import {SwapOutlined,FormOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {Env} from './../../../styles';
const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
const {RangePicker}=DatePicker;

export default function attendanceTable(){
      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [eventsLog,setEventsLog]=useState([]);
      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
      const [totalDays,setTotalDays]=useState(0);
      const [totalATt,setTotalAtt]=useState(0);
      const [totalLate,setTotalLate]=useState(0);
      const [totalLatePrice,setTotalLatePrice]=useState(0);
      const [salary,setSalary]=useState(0);
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {

        const id=cookies.user;
        let now=new Date();
        let last=new Date(now.setDate(now.getDate() - 15)).toISOString().slice(0,10);
        let today=new Date().toISOString().slice(0, 10);
        axios.get(Env.HOST_SERVER_NAME+'dawam-info/'+id.user_id+'/'+last+'/'+today)
        .then(response => {
          setTotalDays(response.data.count[0].count);
          setTotalAtt(response.data.data[0].attendanceDays);
          setTotalLate(response.data.data[0].lateTime);
          setTotalLatePrice(response.data.data[0].lateTimePrice);
          setSalary(response.data.data[0].salary);
        });
        axios.get(Env.HOST_SERVER_NAME+'attendancelog/'+id.user_id)
        .then(response => {
          setData(response.data);
          setLoad(false);
        });
       });

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
      };
      const changeRange=(all,date)=>{
        console.log(date[0]);
        const id=cookies.user;
        setLoad(true);
        axios.get(Env.HOST_SERVER_NAME+'attendancelog/'+id.user_id+'/'+date[0]+'/'+date[1])
        .then(response => {
          setData([]);
          setData(response.data);
          setLoad(false);
        });
       
      }
    const  showModal = () => {
        setIsModalVisible(true);
      };  
     const handleOk = () => {
        setIsModalVisible(false);

      }; 
    const selectMonth=(value)=>{
      console.log(new Date(new Date().getFullYear(), value, 0).getDate());

      }  

  /*  let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};*/
    const columns = [
      {
        title: 'اليوم',
        dataIndex: 'dayName',
        key: 'dayName',
        filters: [
          { text: 'Joe', value: 'Joe' },
          { text: 'Jim', value: 'Jim' },
        ],
        filteredValue: filteredInfo.dayName || null,
        onFilter: (value, record) => record.dayName.includes(value),
        sorter: (a, b) => a.dayName.length - b.dayName.length,
        sortOrder: sortedInfo.columnKey === 'dayName' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'التاريخ',
        dataIndex: 'date',
        key: 'date',
        sorter: (a, b) => a.date - b.date,
        sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'وقت الحضور',
        dataIndex: 'attendance_time',
        key: 'attendance_time',
        sorter: (a, b) => a.attendance_time.length - b.attendance_time.length,
        sortOrder: sortedInfo.columnKey === 'attendance_time' && sortedInfo.order,
        ellipsis: true,
      },     
       {
        title: 'وقت الانصراف',
        dataIndex: 'leave_time',
        key: 'leave_time',
        sorter: (a, b) => a.leave_time.length - b.leave_time.length,
        sortOrder: sortedInfo.columnKey === 'leave_time' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'صافي الدوام',
        dataIndex: 'netDawam',
        key: 'netDawam',
        sorter: (a, b) => a.netDawam.length - b.netDawam.length,
        sortOrder: sortedInfo.columnKey === 'netDawam' && sortedInfo.order,
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
        title: 'خصميات',
        dataIndex: 'discount',
        key: 'discount',
        sorter: (a, b) => a.discount - b.discount,
        sortOrder: sortedInfo.columnKey === 'discount' && sortedInfo.order,
        ellipsis: false,
        render:(discount)=>Math.round(discount)+" ر.ي"        
      },
      {
        title: 'الحدث',
        key: 'action',
        render: () =><Button type="primary" onClick={showModal} shape="round" icon={<SwapOutlined />} ></Button>
        ,
      },
      {
        title: 'التقديم',
        key: 'action',
        render: () =><Button style={{backgroundColor:'#007236',borderColor:'#007236'}} type="primary" shape="round" icon={<FormOutlined />} ></Button>
        ,
      },
    ];
 
return (
    <Layout>
    <Card>
    <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginBottom:'30px'}}>
    <div style={{display:'flex',flexDirection:'row'}}><span><Progress type="circle" percent={Math.round((totalATt/totalDays)*100)} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>الدوام المطلوب : <span>{totalDays}</span> يوم </div>
    <div>الدوام الفعلي : <span>{totalATt}</span> يوم </div>
    </span></div>
    <div style={{display:'flex',flexDirection:'row'}}><span><Progress type="circle" percent={Math.round((totalLatePrice/salary)*100)} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>التأخرات : <span>{totalLate}</span> دقيقة </div>
    <div>إجمالي الخصم : <span>{totalLatePrice}</span> ر.ي </div>
    </span></div>
    <div style={{float:'left',marginBottom:'20px'}}>
    <span>اختر فترة : </span>
    <RangePicker  onCalendarChange={changeRange} />
    </div>
    </div>
    <Table loading={load} style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onCalendarChange={handleChange} />
    </Card>
    </Layout>
);
    
 }
