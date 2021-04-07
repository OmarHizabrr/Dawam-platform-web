import React from 'react';
import './style.css';
import { Typography ,Layout,Tabs,Table, Button,Modal, Row } from 'antd';
import {SwapOutlined,FormOutlined} from '@ant-design/icons';

const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const data = [
    {
      key: '1',
      name: 'السبت',
      age: '12-01-2020',
      address: '08:24:00',
      leaveTime:'08:24:00',
      netDawam:'7:24:00',
      lateTime:'02:40:00',
      status:'danger'
    },
    {
      key: '2',
      name: 'الأحد',
      age: '12-01-2020',
      address: '08:24:00',
      leaveTime:'08:24:00',
      netDawam:'7:24:00',
      lateTime:'02:40:00',
      status:'success'
    },
    {
      key: '3',
      name: 'الإثنين',
      age: '12-01-2020',
      address: '08:24:00',
      leaveTime:'08:24:00',
      netDawam:'7:24:00',
      lateTime:'02:40:00',
      status:'warning'
    },
    {
      key: '4',
      name: 'الثلاثاء',
      age: '12-01-2020',
      address: '08:24:00',
      leaveTime:'08:24:00',
      netDawam:'7:24:00',
      lateTime:'02:40:00',
      status:'seccess'
    },
  ];

  
export default class attendanceTable extends React.Component{
    state = {
        filteredInfo: null,
        sortedInfo: null,
        isModalVisible:false,
      };
    
      handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
          filteredInfo: filters,
          sortedInfo: sorter,
        });
      };
       showModal = () => {
        this.setState({
          isModalVisible:true,
        });
      };  
      handleOk = () => {
        this.setState({
          isModalVisible:false,
        });
      };   
render(){
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [
      {
        title: 'اليوم',
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
        title: 'التاريخ',
        dataIndex: 'age',
        key: 'age',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'وقت الحضور',
        dataIndex: 'address',
        key: 'address',
        filters: [
          { text: 'London', value: 'London' },
          { text: 'New York', value: 'New York' },
        ],
        filteredValue: filteredInfo.address || null,
        onFilter: (value, record) => record.address.includes(value),
        sorter: (a, b) => a.address.length - b.address.length,
        sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
        ellipsis: true,
      },     
       {
        title: 'وقت الانصراف',
        dataIndex: 'leaveTime',
        key: 'leaveTime',
        filters: [
          { text: 'London', value: 'London' },
          { text: 'New York', value: 'New York' },
        ],
        filteredValue: filteredInfo.leaveTime || null,
        onFilter: (value, record) => record.leaveTime.includes(value),
        sorter: (a, b) => a.leaveTime.length - b.leaveTime.length,
        sortOrder: sortedInfo.columnKey === 'leaveTime' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'صافي الدوام',
        dataIndex: 'netDawam',
        key: 'netDawam',
        filters: [
          { text: 'London', value: 'London' },
          { text: 'New York', value: 'New York' },
        ],
        filteredValue: filteredInfo.netDawam || null,
        onFilter: (value, record) => record.netDawam.includes(value),
        sorter: (a, b) => a.netDawam.length - b.netDawam.length,
        sortOrder: sortedInfo.columnKey === 'netDawam' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'التأخرات',
        dataIndex: 'lateTime',
        key: 'lateTime',
        filters: [
          { text: 'London', value: 'London' },
          { text: 'New York', value: 'New York' },
        ],
        filteredValue: filteredInfo.lateTime || null,
        onFilter: (value, record) => record.lateTime.includes(value),
        sorter: (a, b) => a.lateTime.length - b.lateTime.length,
        sortOrder: sortedInfo.columnKey === 'lateTime' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الحدث',
        key: 'action',
        render: () =><Button type="primary" onClick={this.showModal.bind(this)} shape="round" icon={<SwapOutlined />} >الأحداث</Button>
        ,
      },
      {
        title: 'التقديم',
        key: 'action',
        render: () =><Button style={{backgroundColor:'#007236',borderColor:'#007236'}} type="primary" shape="round" icon={<FormOutlined />} >تقديم إجازة</Button>
        ,
      },
    ];
return (
    <Layout>
    <Table columns={columns} scroll={{x: '200vw' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onChange={this.handleChange} />
    </Layout>
);
    }
 }
