/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import axios from 'axios';
import { Env } from '../../../styles';
import { useCookies, CookiesProvider } from 'react-cookie';
import './style.css';
import { DatePicker, Space, Form, Table, Button, Modal, Card, Radio, Input, Select, Progress, Tag, Typography } from 'antd';
import { ExportOutlined, FormOutlined } from '@ant-design/icons';
const { Text } = Typography;

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const exportToExcel = (type, fn, dl) => {

  var elt = document.getElementsByTagName('table')[0];
  if (elt) {
    var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl ?
      excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
      excel.writeFile(wb, fn || ('طلبات الإجازات.' + (type || 'xlsx')));
  }
}

export default function tasksRequests() {
  const [cookies, setCookie, removeCookie] = useCookies(["userId"]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [start, setStart] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState(null);
  const [statusType, setStatusType] = useState(null);
  const [accepter, setAccepter] = useState(null);
  const [notes, setNotes] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const user = cookies.user;
  useEffect(() => {
    axios.get(Env.HOST_SERVER_NAME + 'get-tasks-requests/' + user.user_id + '/' + start + '/' + end)
      .then(response => {
        setData(response.data['tasks']);
        setAccepter(response.data['type']);
      });
  });


  const handleChange = (pagination, filters, sorter) => {

    setFilteredInfo(filters);
    setSortedInfo(sorter);

  };
  const processRequest = (selected) => {
    setSelected(selected);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  }
  const handleOk = () => {
    var values={
      "user_id": cookies.user.user_id,
      "vid":selected.vid,
      "status":statusType,
      "note":notes,
      "accepter":accepter,
    }
    axios.post(Env.HOST_SERVER_NAME+`accept-task`,values)
      .then(function (response) {
        if(response.statusText=="OK"){
          alert('تم التحديث بنجاح')
        } 
      })
   .catch(function (error) {
   console.log(error);
   });
    setIsModalVisible(false);
  }
  const changeType=(e)=>{
    setStatusType(e);
  }
  const changeNotes=(e)=>{
    setNotes(e);
    console.log(e.target.value);
  }
  const columns = [
    {
      title: 'الموظف',
      dataIndex: 'user',
      key: 'user',
      filters: [
        { text: 'Joe', value: 'Joe' },
        { text: 'Jim', value: 'Jim' },
      ],
      filteredValue: filteredInfo.user || null,
      onFilter: (value, record) => record.user.includes(value),
      sorter: (a, b) => a.user.length - b.user.length,
      sortOrder: sortedInfo.columnKey === 'user' && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: 'الوظيفة',
      dataIndex: 'job',
      key: 'job',
      filters: [
        { text: 'Joe', value: 'Joe' },
        { text: 'Jim', value: 'Jim' },
      ],
      filteredValue: filteredInfo.job || null,
      onFilter: (value, record) => record.job.includes(value),
      sorter: (a, b) => a.job.length - b.job.length,
      sortOrder: sortedInfo.columnKey === 'job' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'الإدارة',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Joe', value: 'Joe' },
        { text: 'Jim', value: 'Jim' },
      ],
      filteredValue: filteredInfo.category || null,
      onFilter: (value, record) => record.category.includes(value),
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: sortedInfo.columnKey === 'category' && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: 'من',
      dataIndex: 'date_from',
      key: 'date_from',
      sorter: (a, b) => a.date_from - b.date_from,
      sortOrder: sortedInfo.columnKey === 'date_from' && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: 'إلى',
      dataIndex: 'date_to',
      key: 'date_to',
      filters: [
        { text: 'London', value: 'London' },
        { text: 'New York', value: 'New York' },
      ],
      filteredValue: filteredInfo.date_to || null,
      onFilter: (value, record) => record.date_to.includes(value),
      sorter: (a, b) => a.date_to.length - b.date_to.length,
      sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: 'التفاصيل',
      dataIndex: 'description',
      key: 'description',
      filteredValue: filteredInfo.description || null,
      ellipsis: true,
    },
    {
      title: 'مدة المهمة/الإجازة',
      dataIndex: 'period',
      key: 'period',
      filters: [
        { text: 'London', value: 'London' },
        { text: 'New York', value: 'New York' },
      ],
      filteredValue: filteredInfo.period || null,
      onFilter: (value, record) => record.period.includes(value),
      sorter: (a, b) => a.period.length - b.period.length,
      sortOrder: sortedInfo.columnKey === 'period' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'المسؤول المباشر',
      dataIndex: 'direct_manager',
      key: 'direct_manager',
      filters: [
        { text: 'معتمدة', value: 'معتمدة' },
        { text: 'في الانتظار', value: 'في الانتظار' },
        { text: 'مرفوضة', value: 'مرفوضة' },
      ],
      filteredValue: filteredInfo.direct_manager || null,
      onFilter: (value, record) => record.direct_manager.includes(value),
      sorter: (a, b) => a.direct_manager.length - b.direct_manager.length,
      sortOrder: sortedInfo.columnKey === 'direct_manager' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'مدير الإدارة',
      dataIndex: 'dept_manager',
      key: 'dept_manager',
      filters: [
        { text: 'معتمدة', value: 'معتمدة' },
        { text: 'في الانتظار', value: 'في الانتظار' },
        { text: 'مرفوضة', value: 'مرفوضة' },
      ],
      filteredValue: filteredInfo.dept_manager || null,
      onFilter: (value, record) => record.dept_manager.includes(value),
      sorter: (a, b) => a.dept_manager.length - b.dept_manager.length,
      sortOrder: sortedInfo.columnKey === 'dept_manager' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'شؤون الموظفين',
      dataIndex: 'hr_manager',
      key: 'hr_manager',
      filters: [
        { text: 'معتمدة', value: 'معتمدة' },
        { text: 'في الانتظار', value: 'في الانتظار' },
        { text: 'مرفوضة', value: 'مرفوضة' },
      ],
      filteredValue: filteredInfo.hr_manager || null,
      onFilter: (value, record) => record.hr_manager.includes(value),
      sorter: (a, b) => a.hr_manager.length - b.hr_manager.length,
      sortOrder: sortedInfo.columnKey === 'hr_manager' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'الأمين العام',
      dataIndex: 'gerenal_sec',
      key: 'gerenal_sec',
      filters: [
        { text: 'معتمدة', value: 'معتمدة' },
        { text: 'في الانتظار', value: 'في الانتظار' },
        { text: 'مرفوضة', value: 'مرفوضة' },
      ],
      filteredValue: filteredInfo.gerenal_sec || null,
      onFilter: (value, record) => record.gerenal_sec.includes(value),
      sorter: (a, b) => a.gerenal_sec.length - b.gerenal_sec.length,
      sortOrder: sortedInfo.columnKey === 'gerenal_sec' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'مراجعة الطلب',
      dataIndex: 'vid',
      key: 'vid',
      render: (vid,record,index) => <Button onClick={function () { processRequest(record); }} style={{ backgroundColor: '#007236', borderColor: '#007236' }} type="primary" shape="round" icon={<FormOutlined />} ></Button>

    }

  ];

  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <span><Progress type="circle" percent={12} width={80} style={{ marginLeft: '5px', display: 'inline-block' }} /></span>
          <span style={{ display: 'flex', flexDirection: 'column', paddingTop: '10px', marginRight: '5px' }}>
            <div style={{ marginBottom: '5px' }}>الطلبات المنجزة</div>
            <div style={{ color: '#828282' }}> لقد أنجزت 12 طلباً</div>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <span><Progress type="circle" percent={30} width={80} style={{ marginLeft: '5px', display: 'inline-block' }} /></span>
          <span style={{ display: 'flex', flexDirection: 'column', paddingTop: '10px', marginRight: '5px' }}>
            <div style={{ marginBottom: '5px' }}>طلبات تحت الانتظار</div>
            <div style={{ color: '#828282' }}>  30 طلباً في انتظارك</div>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <span><Progress type="circle" percent={100} width={80} style={{ marginLeft: '5px', display: 'inline-block' }} /></span>
          <span style={{ display: 'flex', flexDirection: 'column', paddingTop: '10px', marginRight: '5px' }}>
            <div style={{ marginBottom: '5px' }}>سرعة الإنجاز</div>
            <div style={{ color: '#828282' }}> غالباً يتم الإنجاز خلال 5 أيام</div>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Button style={{ float: 'left', marginBottom: '30px' }} onClick={function () { exportToExcel('xlsx') }} type='primary'><ExportOutlined /> تصدير كملف اكسل</Button>
        </div>
      </div>
      <Modal title="مراجعة الطلبات" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <div style={{marginBottom:'20px'}}> تقدم <span style={{fontWeight:'900',fontFamily:'jannatR'}}> {selected?selected.user:''} </span> - <span style={{fontWeight:'900',fontFamily:'jannatR'}}> {selected?selected.job:''} </span> - <span style={{fontWeight:'900',fontFamily:'jannatR'}}> {selected?selected.category:''} </span> بطلب اعتماد  <span style={{fontWeight:'900',fontFamily:'jannatR'}}> {selected?selected.vactype:''} </span> للفترة من <span style={{fontWeight:'900',fontFamily:'jannatR'}}> {selected?selected.date_from:''} </span> إلى الفترة <span style={{fontWeight:'900',fontFamily:'jannatR'}}> {selected?selected.date_to:''} </span> بإجمالي <span style={{fontWeight:'900',fontFamily:'jannatR'}}> {selected && selected.days>0?selected.days+' يوم ':''}</span>
        <span style={{fontWeight:'900',fontFamily:'jannatR'}}> {selected && selected.period!=0?selected.period:''}</span>
        </div>
        <div>
        <Select
          showSearch
          style={{ width: 200,marginBottom:'20px' }}
          placeholder="قم بتعيين حالة الطلب"
          optionFilterProp="children"
          onSelect={changeType}
          filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
         filterSort={(optionA, optionB) =>
         optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
        }
        >
        <Option value="1">اعتماد</Option>
        <Option value="0">رفض</Option>
      </Select>
      <TextArea onChange={changeNotes} placeholder="ملاحظات" row={3} ></TextArea>
        </div>
      </Modal>
      <Table columns={columns} dataSource={data} onChange={handleChange} />
    </Card>
  );
}
