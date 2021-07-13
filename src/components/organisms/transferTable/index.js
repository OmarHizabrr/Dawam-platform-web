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

export default function transferTable(){
      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [eventsLog,setEventsLog]=useState([]);
      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {

        const id=cookies.user;
        let now=new Date();
        let last=new Date(now.setDate(now.getDate() - 30)).toISOString().slice(0,10);
        let today=new Date().toISOString().slice(0, 10);
        axios.get(Env.HOST_SERVER_NAME+'transport-amounts/'+id.user_id+'/'+last+'/'+today)
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
        let now=new Date();
        let last=new Date(now.setDate(now.getDate() - 30)).toISOString().slice(0,10);
        let today=new Date().toISOString().slice(0, 10);
        axios.get(Env.HOST_SERVER_NAME+'transport-amounts/'+id.user_id+'/'+last+'/'+today)        .then(response => {
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
        title: 'المبلغ المستحق',
        dataIndex: 'transfer_value',
        key: 'transfer_value',
        sorter: (a, b) => a.transfer_value - b.transfer_value,
        sortOrder: sortedInfo.columnKey === 'transfer_value' && sortedInfo.order,
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
