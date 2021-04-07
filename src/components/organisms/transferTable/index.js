import React from 'react';
import './style.css';
import { Typography ,Layout,Tabs,Table } from 'antd';

const { Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;
const data = [
    {
      key: '1',
      day: 'السبت',
      date: '12-01-2020',
      fees: '200',
    },
    {
      key: '2',
      day: 'الأحد',
      date: '12-01-2020',
      fees: '0',

    },
    {
      key: '3',
      day: 'الاثنين',
      date: '12-01-2020',
      fees: '200',
    },
    {
      key: '4',
      day: 'الثلاثاء',
      date: '12-01-2020',
      fees: '200',

    },
  ];
export default class transferTable extends React.Component{
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
        title: 'اليوم',
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
        title: 'التاريخ',
        dataIndex: 'date',
        key: 'date',
        sorter: (a, b) => a.date - b.date,
        sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'المبلغ المستحق',
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
    ];
return (
    <Table columns={columns} dataSource={data} onChange={this.handleChange} />
);
    }
 }
