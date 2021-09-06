/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import './style.css';
import { Typography ,Layout,Tabs,Table, Button,Modal, DatePicker, Select,Card } from 'antd';
import {SwapOutlined,FormOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {Env} from './../../../styles';
const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
const {RangePicker}=DatePicker;

export default function transportReport(){
      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [eventsLog,setEventsLog]=useState([]);
      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
      const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
      const [end,setEnd]=useState(new Date().toISOString().slice(0, 10));    
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {
         setLoad(true);
        axios.get(Env.HOST_SERVER_NAME+'transport-cumulative/'+start+'/'+end)
        .then(response => {
          setData(response.data);
          setLoad(false);
        });
       },[start,end]);

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
      };
      const changeRange=(all,date)=>{
        setStart(date[0]);
        setEnd(date[1]);
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
        title: 'اسم الموظف',
        dataIndex: 'name',
        key: 'name',
        filters: [
          { text: 'Joe', value: 'Joe' },
          { text: 'Jim', value: 'Jim' },
        ],
        filteredValue: filteredInfo.name || null,
        onFilter: (value, record) => record.name.includes(value),
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'المسى الوظيفي',
        dataIndex: 'job',
        key: 'job',
        sorter: (a, b) => a.job.length - b.job.length,
        sortOrder: sortedInfo.columnKey === 'job' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الإدارة',
        dataIndex: 'department',
        key: 'department',
        sorter: (a, b) => a.department.length - b.department.length,
        sortOrder: sortedInfo.columnKey === 'department' && sortedInfo.order,
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
        title: 'المبلغ المستحق',
        dataIndex: 'transportAmount',
        key: 'transportAmount',
        sorter: (a, b) => a.transportAmount - b.transportAmount,
        sortOrder: sortedInfo.columnKey === 'transportAmount' && sortedInfo.order,
        ellipsis: true,
      }, 
    ];
return (
    <Layout>
    <Card>
    <div style={{float:'left',marginBottom:'20px'}}>
    <span>اختر فترة : </span>
    <RangePicker  onCalendarChange={changeRange} />
    </div>
    <Table loading={load} style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onCalendarChange={handleChange} />
    </Card>
    </Layout>
);
    
 }
