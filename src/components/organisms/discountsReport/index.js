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

export default function discountsReport(){
      const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [eventsLog,setEventsLog]=useState([]);
      const [data,setData]=useState([]);
      const [load,setLoad]=useState(true);
      const [count,setCount]=useState(0);

     // eslint-disable-next-line react-hooks/rules-of-hooks
     useEffect(() => {

        const id=cookies.user;
        let now=new Date();
        let last=new Date(now.setDate(now.getDate() - 30)).toISOString().slice(0,10);
        let today=new Date().toISOString().slice(0, 10);

        axios.get(Env.HOST_SERVER_NAME+'get-att-days-count/'+last+'/'+today)
        .then(response => {
          setCount(response.data[0].count);
        });
        axios.get(Env.HOST_SERVER_NAME+'discounts-list/'+last+'/'+today)
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
        const id=cookies.user;
        let last=date[0];
        let today=date[1];
        console.log("range changed : "+last+"|"+today);
        setLoad(true);
        axios.get(Env.HOST_SERVER_NAME+'get-att-days-count/'+last+'/'+today)
        .then(response => {
          setCount(response.data[0].count);
        });
        axios.get(Env.HOST_SERVER_NAME+'discounts-list/'+last+'/'+today)
        .then(response => {
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
     
      }  

  /*  let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};*/
    const columns = [
      {
        title: 'الاسم',
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
        title: 'المسمى الوظيفي',
        dataIndex: 'job',
        key: 'job',
        sorter: (a, b) => a.job - b.job,
        sortOrder: sortedInfo.columnKey === 'job' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الاستحقاق',
        dataIndex: 'salary',
        key: 'salary',
        sorter: (a, b) => a.salary.length - b.salary.length,
        sortOrder: sortedInfo.columnKey === 'salary' && sortedInfo.order,
        ellipsis: true,
        render:(salary)=>salary +" ر.ي",
      },     
       {
        title: 'الغياب',
        dataIndex: 'attendanceDays',
        key: 'attendanceDays',
        sorter: (a, b) => a.attendanceDays.length - b.attendanceDays.length,
        sortOrder: sortedInfo.columnKey === 'attendanceDays' && sortedInfo.order,
        ellipsis: true,
        render:(attendanceDays)=> count-attendanceDays,
      },
      {
        title: 'خصميات الغياب',
        dataIndex: ['salary','attendanceDays'],
        key: 'absencePrice',
        sorter: (a, b) => a.absencePrice.length - b.absencePrice.length,
        sortOrder: sortedInfo.columnKey === 'absencePrice' && sortedInfo.order,
        ellipsis: true,
        render:(attendanceDays,row)=>Math.round(((row.salary/30)*(count-row.attendanceDays))*100)/100 + " ر.ي",
      },
      {
        title: 'التأخرات',
        dataIndex: 'lateTime',
        key: 'lateTime',
        sorter: (a, b) => a.lateTime.length - b.lateTime.length,
        sortOrder: sortedInfo.columnKey === 'lateTime' && sortedInfo.order,
        ellipsis: true,
        render:lateTime=>{
          let h=Math.floor(lateTime/60);
          let m=lateTime%60;
          let ht="";
          let mt="";
          let sp=" و ";
          if (h==0){ht="";sp=""}
          else if(h==1) {ht="ساعة"}
          else if(h==2) {ht="ساعتين"}
          else if(h>=3 && h<=10) {ht=h+" ساعات"}
          else {ht=h+" ساعة"}
          if (m==0){mt=""}
          else if(m==1) {mt="دقيقة"}
          else if(m==2) {mt="دقيقتين"}
          else if(m>=3 && m<=10) {mt=m+" دقائق"}
          else {mt=m+" دقيقة"}
          if(h==0 && m==0) {sp=" لا يوجد تأخرات "}
          return ht+sp+mt;},
      },
      {
        title: 'خصميات التأخرات',
        dataIndex: 'lateTimePrice',
        key: 'lateTimePrice',
        sorter: (a, b) => a.lateTimePrice - b.lateTimePrice,
        sortOrder: sortedInfo.columnKey === 'lateTimePrice' && sortedInfo.order,
        ellipsis: false,
        render:(lateTimePrice)=>Math.round(lateTimePrice)+" ر.ي"        
      },
    ];
return (
    <Layout>
    <Card>
    <div style={{float:'left',marginBottom:'20px'}}>
    <span>اختر فترة : </span>
    <RangePicker   onChange={changeRange} />
    </div>
    <Table loading={load}  style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onChange={handleChange} />
    </Card>
    </Layout>
);
    
 }
