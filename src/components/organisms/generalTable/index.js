import React from 'react';
import './style.css';
import {Table } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import axios from 'axios';
import {Env} from './../../../styles';

const data = [
    {
      key: '1',
      avatar:'https://i.pravatar.cc/150?img=4',
      user_name: 'خلدون السامعي',
      department: 'الإحصاء وتقنية المعلومات',
      job: 'مدير',
      attendance_time:'07:00'
    },
    {
      key: '2',
      avatar:'https://i.pravatar.cc/150?img=4',
      user_name: 'أسامة عبدالله',
      department: 'الإحصاء وتقنية المعلومات',
      job: 'مهندس برمجيات',
      attendance_time:'07:30'
    },
    {
      key: '3',
      avatar:'https://i.pravatar.cc/150?img=4',
      user_name: 'عادل عقلان',
      department: 'العلاقات والإعلام',
      job: 'مدير',
      attendance_time:'08:00'
    },
    {
      key: '4',
      avatar:'https://i.pravatar.cc/150?img=4',
      user_name: 'أيمن البدر',
      department: 'العلاقات والإعلام',
      job: 'مختص',
      attendance_time:'08:30'
    },
  ];
export default class generalTable extends React.Component{
    state = {
        filteredInfo: null,
        sortedInfo: null,
        data:[]
      };
    
      handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
          filteredInfo: filters,
          sortedInfo: sorter,
        });
      };    
      componentDidMount(){
        axios.get(Env.HOST_SERVER_NAME+'all-users-log/'+new Date().toISOString().split('T')[0])
          .then(response => {
            this.setState({data:response.data});
          });
      }
render(){
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [
      {
        title: 'صورة',
        key: 'avatar',
        dataIndex: 'avatar',
        render: avatar => (
          <Avatar src={avatar}>
          </Avatar>
        ),
        ellipsis: true,
      },
      {
        title: 'الاسم',
        dataIndex: 'user_name',
        key: 'user_name',
        filters: [
          { text: 'السبت', value: 'السبت' },
          { text: 'الأحد', value: 'الأحد' },
        ],
        filteredValue: filteredInfo.user_name || null,
        onFilter: (value, record) => record.user_name.includes(value),
        sorter: (a, b) => a.user_name.length - b.user_name.length,
        sortOrder: sortedInfo.columnKey === 'user_name' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الإدارة',
        dataIndex: 'department',
        key: 'department',
        sorter: (a, b) => a.department - b.department,
        sortOrder: sortedInfo.columnKey === 'department' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الوظيفة',
        dataIndex: 'job',
        key: 'job',
        filters: [
          { text: 'London', value: 'London' },
          { text: 'New York', value: 'New York' },
        ],
        filteredValue: filteredInfo.job || null,
        onFilter: (value, record) => record.job.includes(value),
        sorter: (a, b) => a.job.length - b.job.length,
        sortOrder: sortedInfo.columnKey === 'job' && sortedInfo.order,
        ellipsis: true,
      },  
      {
        title: 'وقت الحضور',
        dataIndex: 'attendance_time',
        key: 'attendance_time',
        filters: [
          { text: 'London', value: 'London' },
          { text: 'New York', value: 'New York' },
        ],
        filteredValue: filteredInfo.attendance_time || null,
        onFilter: (value, record) => record.attendance_time.includes(value),
        sorter: (a, b) => a.attendance_time.length - b.attendance_time.length,
        sortOrder: sortedInfo.columnKey === 'attendance_time' && sortedInfo.order,
        ellipsis: true,
      },   
    ];
return (
    <Table columns={columns} dataSource={this.state.data} onChange={this.handleChange} />
);
    }
 }
