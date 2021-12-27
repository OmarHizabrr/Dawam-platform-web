/* eslint-disable react-hooks/rules-of-hooks */
import React,{useState,useEffect} from 'react';
import './style.css';
import {Table } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import {Env} from './../../../styles';
export default function alertsTable (){
      const [data, setData] = useState([]);
      const [filteredInfo, setFilteredInfo] = useState([]);
      const [sortedInfo, setSortedInfo] = useState([])
      const [cookies, setCookie, removeCookie]=useCookies(["user"]);
      const id=cookies.user;
    const  handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        setFilteredInfo(filters);
        setSortedInfo(sorter);
      };    
      useEffect(() => {
        axios.get(Env.HOST_SERVER_NAME+'alerts/'+id.id)
          .then(response => {
            setData(response.data);
          });
      });
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
            title: 'الرابط',
            dataIndex: 'link',
            key: 'link',
            ellipsis: true,
            render:(l)=>(<a href={l}>فتح</a>),
          },   
      ];
return(
    <Table columns={columns} dataSource={data} onChange={handleChange} />
);
 }
