import React from 'react';
import './style.css';
import { Typography ,Layout,Tabs,Table, Button,Modal, Row, Select,Card } from 'antd';
import {SwapOutlined,FormOutlined} from '@ant-design/icons';
import firebase from "../../../utilites/firebase";

const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
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
        eventsLog:[],
        dataS:data,
      };
      componentDidMount(){
        const eventRef=firebase.database().ref('events/38/log').orderByChild("DateTimeRecord");
        console.log(eventRef.toString());
       
        eventRef.on('value', (snapshot) => {
           const events = snapshot.val();
           const todoList = [];
           console.log('eeee');
           for (let id in events) {
             todoList.push({ id, ...events[id] });
             console.log('i');
           }
           this.setState({eventsLog:todoList});
         });
      
       }

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
      selectMonth(value){
      console.log(new Date(new Date().getFullYear(), value, 0).getDate());

      }  
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
    <Card>
    <div >
    <Select
    showSearch
    style={{ width: 200 ,float:'left',marginBottom:'10px'}}
    placeholder="اختر شهر"
    onChange={this.selectMonth}
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
  >
    <Option value="1">يناير</Option>
    <Option value="2">فبراير</Option>
    <Option value="3">مارس</Option>
    <Option value="4">إبريل</Option>
  </Select>
    </div>
    <Table columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onChange={this.handleChange} />
    </Card>
    </Layout>
);
    }
 }
