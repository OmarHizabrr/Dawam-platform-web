/* eslint-disable react-hooks/rules-of-hooks */
import React,{useState,useEffect} from 'react';
import './style.css';
import {Table,Layout, Card,DatePicker} from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import {Env} from './../../../styles';
const {RangePicker}=DatePicker;

export default function alertsTable (){
      const [data, setData] = useState([]);
      const [filteredInfo, setFilteredInfo] = useState([]);
      const [sortedInfo, setSortedInfo] = useState([])
      const [cookies, setCookie, removeCookie]=useCookies(["user"]);
      const id=cookies.user;
      const [load,setLoad]=useState(true);

      const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
      const [end,setEnd]=useState(new Date(new Date().setDate(new Date().getDate() +1 )).toISOString().slice(0,10));
    const  handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        setFilteredInfo(filters);
        setSortedInfo(sorter);
      };    
      useEffect(() => {
        axios.get(Env.HOST_SERVER_NAME+'alerts/'+id.user_id+'/'+start+'/'+end)
          .then(response => {
            setData(response.data);
            setLoad(false);
          }).catch(function (error) {
            console.log(error);
          });
      },[start,end]);
      const columns = [
        {
          title: 'التنبيه',
          dataIndex: 'text',
          key: 'text',
          sorter: (a, b) => a.text.length - b.text.length,
          sortOrder: sortedInfo.columnKey === 'text' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'تاريخ التنبيه',
          dataIndex: 'created_at',
          key: 'created_at',
          sorter: (a, b) => a.created_at.length - b.created_at.length,
          sortOrder: sortedInfo.columnKey === 'created_at' && sortedInfo.order,
          ellipsis: true,
        }   
      ];
      const changeRange=(all,date)=>{
        //const id=cookies.user;
        setLoad(true);
        setStart(date[0]);
        setEnd(date[1]);      
      }
return(
  <Layout>
  <Card>
  <div style={{float:'left',marginBottom:'20px'}}>
  <span>اختر فترة : </span>
  <RangePicker  onCalendarChange={changeRange} />
  </div>
    <Table loading={load} columns={columns} dataSource={data} onChange={handleChange} />
    </Card>
    </Layout>
);
 }
