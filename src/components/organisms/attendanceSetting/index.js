/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import moment from 'moment';

import './style.css';
import { Typography ,Layout,Tabs,Form, Spin,Table,Button, DatePicker,Col,TimePicker , Row,Popconfirm,Select,Card, notification,Input, InputNumber, Modal } from 'antd';
import {SwapOutlined,FormOutlined,DeleteOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {FileExcelOutlined} from '@ant-design/icons';
import {Env} from './../../../styles';
const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
const {RangePicker}=DatePicker;


export default function AttendanceSetting(props){
    const [form] = Form.useForm();
    const [load,setLoad]=useState(false);
    const [data,setData]=useState([]);
    const [selected,setSelected]=useState([]);
    const [update,setUpdate]=useState(0);
    const [types,setTypes]=useState([]);

    const [confirmLoading,setConfirmLoading]=useState(false);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [visible,setVisible]=useState(false);
    const [selectedIndex,setSelectedIndex]=useState(null);

    const [isModalVisible,setIsModalVisible]=useState(false);

    const [durationForm] = Form.useForm();

    useEffect(() => {
        axios.get(Env.HOST_SERVER_NAME+'durations')
          .then(response => {
            setData(response.data);
           setLoad(false);
          }).catch(function (error) {
            console.log(error);
          });

          axios.get(Env.HOST_SERVER_NAME+'durationtypes')
          .then(response => {
            setTypes(response.data);
          }).catch(function (error) {
            console.log(error);
          });

      },[update]);

      const columns = [
        {
          title: 'العنوان',
          dataIndex: 'title',
          key: 'title',
          sorter: (a, b) => a.title.length - b.title.length,
          sortOrder: sortedInfo.columnKey === 'title' && sortedInfo.order,
          ellipsis: false,
        },   
         {
          title: 'النوع',
          dataIndex: 'durationtype',
          key: 'durationtype',
          sorter: (a, b) => a.durationtype.length - b.durationtype.length,
          sortOrder: sortedInfo.columnKey === 'durationtype' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'تاريخ البدء',
          dataIndex: 'startDate',
          key: 'startDate',
          sorter: (a, b) => a.startDate - b.startDate,
          sortOrder: sortedInfo.columnKey === 'startDate' && sortedInfo.order,
          ellipsis: false,
        },
        {
          title: 'تاريخ الانتهاء',
          dataIndex: 'endDate',
          key: 'endDate',
          sorter: (a, b) => a.endDate - b.endDate,
          sortOrder: sortedInfo.columnKey === 'endDate' && sortedInfo.order,
          ellipsis: false,
        },
        {
          title: 'وقت الحضور',
          dataIndex: 'startTime',
          key: 'startTime',
          sorter: (a, b) => a.startTime - b.startTime,
          sortOrder: sortedInfo.columnKey === 'startTime' && sortedInfo.order,
          ellipsis: false,
        },
        {
          title: 'سماح الحضور',
          dataIndex: 'allowedStartTime',
          key: 'allowedStartTime',
          sorter: (a, b) => a.allowedStartTime - b.allowedStartTime,
          sortOrder: sortedInfo.columnKey === 'allowedStartTime' && sortedInfo.order,
          ellipsis: false,
        },
        {
          title: 'وقت الانصراف',
          dataIndex: 'endTime',
          key: 'endTime',
          sorter: (a, b) => a.endTime - b.endTime,
          sortOrder: sortedInfo.columnKey === 'endTime' && sortedInfo.order,
          ellipsis: false,
        },
        {
          title: 'سماح الانصراف',
          dataIndex: 'allowedEndTime',
          key: 'allowedEndTime',
          sorter: (a, b) => a.allowedEndTime - b.allowedEndTime,
          sortOrder: sortedInfo.columnKey === 'allowedEndTime' && sortedInfo.order,
          ellipsis: false,
        },
        {
          title: "",
          dataIndex: "",
          width:'140px',
          key: "",
          render: (_, record, index) => (
            <>
            <Button
              onClick={function () {
                setIsModalVisible(true);
                durationForm.setFieldsValue({
                  'id':record.id,
                  'title':record.title,
                  'durationtype_id':record.durationtype_id,
                  'date_range':[moment(record.startDate),moment(record.endDate)],
                  'time_range':[moment(record.startTime,'HH:mm'),moment(record.endTime,'HH:mm')],
                  'allowed_range':[moment(record.allowedStartTime,'HH:mm'),moment(record.allowedEndTime,'HH:mm')],
                });
              }}
              type="primary"
              shape="round"
              icon={<FormOutlined />}
            ></Button>
        <Popconfirm
          key={record.id}
          title={'هل أنت متأكد من حذف الفترة؟ '}
          visible={visible && selectedIndex==record.id}
          onConfirm={function(){deleteDur(record.id);}}
          okButtonProps={{loading:confirmLoading }}
          onCancel={function(){setVisible(false);}}
        ></Popconfirm>
            <Button
            style={{marginRight:'5px', backgroundColor: "#fff", borderColor: "#ff0000",color:"#f00" }}
            onClick={function () {setVisible(true);setSelectedIndex(record.id)}}
            type="primary"
            shape="round"
            icon={<DeleteOutlined />}
          ></Button>
          </>
          ),
        },
      
      ];
const deleteDur=(id)=>{
  axios.delete(Env.HOST_SERVER_NAME+'duration/'+id)
  .then(response => {
    console.log(response.data);
    setUpdate(update+1);
    setConfirmLoading(false);
    openNotification('bottomLeft','تمت العملية بنجاح!');
    setIsModalVisible(false);
  }).catch(function (error) {
    setConfirmLoading(false);
    console.log(error);
  });
}
    const openNotification = (placement,text) => {
      notification.success({
        message:text ,
        placement,
        duration:10,
      });
    }
  const addDuration=()=>{
    setConfirmLoading(true);

    var values={
      id:durationForm.getFieldValue('id'),
      title:durationForm.getFieldValue('title'),
      startDate:durationForm.getFieldValue('date_range')[0].format('YYYY-MM-DD'),
      endDate:durationForm.getFieldValue('date_range')[1].format('YYYY-MM-DD'),
      startTime:durationForm.getFieldValue('time_range')[0].format('HH:mm'),
      endTime:durationForm.getFieldValue('time_range')[1].format('HH:mm'),
      allowedStartTime:durationForm.getFieldValue('allowed_range')[0].format('HH:mm'),
      allowedEndTime:durationForm.getFieldValue('allowed_range')[1].format('HH:mm'),
      durationtype_id:durationForm.getFieldValue('durationtype_id'),
    }

    axios.post(Env.HOST_SERVER_NAME+'durations',values)
    .then(response => {
      console.log(response.data);
      setUpdate(update+1);
      setConfirmLoading(false);
      openNotification('bottomLeft','تمت العملية بنجاح!');
      setIsModalVisible(false);
    }).catch(function (error) {
      setConfirmLoading(false);
      console.log(error);
    });
    
    }

return (
    <Layout>
    <Card>
      <Text style={{fontSize:'20px',marginBottom:'40px'}}>إدارة الدوام</Text> 
      <Button type="primary" style={{float:'left'}} 
      onClick={()=>{
        setIsModalVisible(true);
      }}
      >
        إضافة فترة
      </Button>
      <Modal confirmLoading={confirmLoading} title="إضافة فترة " visible={isModalVisible}  onOk={function(){ addDuration()}} onCancel={function(){setIsModalVisible(false);durationForm.resetFields()}}>
        <Form form={durationForm}>
          <Form.Item
            name="id"
            hidden={true}
            style={{display:"none"}}
            >
              <Input />
          </Form.Item>
          <Form.Item label={'التسمية'} name="title" >
            <Input />
          </Form.Item>
          <Form.Item label="النوع" name="durationtype_id" >
        <Select
          showSearch
          style={{ width: 300 }}
         // onSelect={handleSelectChange}
          options={types}
          placeholder="ابحث لاختيار نوع"
          optionFilterProp="children"
          notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
          filterOption={(input, option) =>
           option.props.children?.indexOf(input) >= 0 ||
           option.props.value?.indexOf(input) >= 0 ||
            option.props.label?.indexOf(input) >= 0
          }
        filterSort={(optionA, optionB) =>
           optionA.props?.children?.localeCompare(optionB.props.children)
        }
        ></Select>
        </Form.Item>
        <Form.Item name={'date_range'} label="الفترة">
          <RangePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name={'time_range'} label="وقت الحضور والانصراف">
            <TimePicker.RangePicker format="HH:mm" />
        </Form.Item>
        <Form.Item name={'allowed_range'} label="أوقات السماح">
            <TimePicker.RangePicker format="HH:mm" />
        </Form.Item>
        </Form>
      </Modal>
      <Row style={{marginTop:'50px'}}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} span={24}>
        <Table scroll={{x: '1000px' }}  loading={load} columns={columns}  dataSource={data}/>
      </Col>
      </Row>     
    </Card>
    </Layout>
);
    
 }
