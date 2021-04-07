import React from 'react';
import './style.css';
import {Table } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
const data = [
    {
      key: '1',
      avatar:'https://i.pravatar.cc/150?img=4',
      day: 'خلدون السامعي',
      date: 'الإحصاء وتقنية المعلومات',
      fees: 'مدير',
      attendanceTime:'07:00'
    },
    {
      key: '2',
      avatar:'https://i.pravatar.cc/150?img=4',
      day: 'أسامة عبدالله',
      date: 'الإحصاء وتقنية المعلومات',
      fees: 'مهندس برمجيات',
      attendanceTime:'07:30'
    },
    {
      key: '3',
      avatar:'https://i.pravatar.cc/150?img=4',
      day: 'عادل عقلان',
      date: 'العلاقات والإعلام',
      fees: 'مدير',
      attendanceTime:'08:00'
    },
    {
      key: '4',
      avatar:'https://i.pravatar.cc/150?img=4',
      day: 'أيمن البدر',
      date: 'العلاقات والإعلام',
      fees: 'مختص',
      attendanceTime:'08:30'
    },
  ];
export default class generalTable extends React.Component{
    state = {
        filteredInfo: null,
        sortedInfo: null,
      };
    
      handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
          filteredInfo: filters,
          sortedInfo: sorter,
        });
      };    
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
        dataIndex: 'day',
        key: 'day',
        filters: [
          { text: 'السبت', value: 'السبت' },
          { text: 'الأحد', value: 'الأحد' },
        ],
        filteredValue: filteredInfo.day || null,
        onFilter: (value, record) => record.day.includes(value),
        sorter: (a, b) => a.day.length - b.day.length,
        sortOrder: sortedInfo.columnKey === 'day' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الإدارة',
        dataIndex: 'date',
        key: 'date',
        sorter: (a, b) => a.date - b.date,
        sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الوظيفة',
        dataIndex: 'fees',
        key: 'fees',
        filters: [
          { text: 'London', value: 'London' },
          { text: 'New York', value: 'New York' },
        ],
        filteredValue: filteredInfo.fees || null,
        onFilter: (value, record) => record.fees.includes(value),
        sorter: (a, b) => a.fees.length - b.fees.length,
        sortOrder: sortedInfo.columnKey === 'fees' && sortedInfo.order,
        ellipsis: true,
      },  
      {
        title: 'وقت الحضور',
        dataIndex: 'attendanceTime',
        key: 'attendanceTime',
        filters: [
          { text: 'London', value: 'London' },
          { text: 'New York', value: 'New York' },
        ],
        filteredValue: filteredInfo.attendanceTime || null,
        onFilter: (value, record) => record.attendanceTime.includes(value),
        sorter: (a, b) => a.attendanceTime.length - b.attendanceTime.length,
        sortOrder: sortedInfo.columnKey === 'attendanceTime' && sortedInfo.order,
        ellipsis: true,
      },   
    ];
return (
    <Table columns={columns} dataSource={data} onChange={this.handleChange} />
);
    }
 }
