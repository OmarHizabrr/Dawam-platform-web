/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import './style.css';
import { Typography ,Layout,Tabs,Table, Button,Modal, DatePicker, Select,Card } from 'antd';
import {SwapOutlined,FormOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {Env} from './../../../styles';
import moment from 'moment';

const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
const {RangePicker}=DatePicker;

export default function transferTable(props){
      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [eventsLog,setEventsLog]=useState([]);
      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
      const [total,setTotal]=useState(0);
      const [start,setStart]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
      const [end,setEnd]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));  
      const [currentMonth,setCurrentMonth]=useState(moment().format('MMMM'));   
     
     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {
        const id=cookies.user;
        axios.get(Env.HOST_SERVER_NAME+'transport-amounts/'+id.user_id+'/'+start+'/'+end)
        .then(response => {
          setData(response.data);
          setLoad(false);
        }).catch(function (error) {
          console.log(error);
        });
        var tot=0.0;
        for(var i=0;i<data.length;i++){
           tot+=parseFloat(data[i].transfer_value);
        }
        setTotal(tot);
       });

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
      };
      const changeRange=(all,date)=>{
        //const id=cookies.user;
        setLoad(true);
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
    const onChange=(all,data)=>{
      setCurrentMonth(all.format('MMMM'));
  
      var startDay=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value;
      var endDay=props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value;
  
      setStart(moment(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
      setEnd(moment(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));
  
      }
return (
    <Layout>
    <Card>
    <div className='transHeader'>
    <div style={{float:'right',marginBottom:'20px'}}>إجمالي المبلغ المستحق : <span>{total}</span> | <span style={{marginRight:'10px'}}> عدد الايام: {data.length}</span></div>
    
    <div className='tasksOper'>
    <div style={{marginLeft:'10px'}}>
        <span>اختر شهرًا : </span>
        <DatePicker  defaultValue={moment()} onChange={onChange} picker="month" />
      </div> 
    <div className='tasksRange' >
    <span>اختر فترة : </span>
    <RangePicker value={[moment(start,"YYYY-MM-DD"),moment(end,"YYYY-MM-DD")]}  onCalendarChange={changeRange} />
    </div>
    </div>
    </div>
    <Table loading={load} style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onCalendarChange={handleChange} />
    </Card>
    </Layout>
);
    
 }
