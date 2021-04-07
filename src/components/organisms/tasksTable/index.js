import React from 'react';
import './style.css';
import { DatePicker, Space,Form,Table, Button,Modal,Card,Radio,Input,Select,Progress,Tag,Typography } from 'antd';
import {CheckCircleOutlined,MinusCircleOutlined,CloseCircleOutlined,PrinterOutlined,FormOutlined} from '@ant-design/icons';
const {Text}=Typography;
const data = [
    {
      key: '1',
      name: 'مهمة',
      age: '12-01-2020 07:30',
      address: '12-01-2020 02:00',
      leaveTime:'نزول تصوير ميداني',
      period:'08:30',
      tag:['success'],
      netDawam:'معتمدة',
    },
    {
      key: '2',
      name: 'إجازة',
      age: '12-01-2020 08:30',
      address: '20-01-2020 02:00',
      leaveTime:'سنوية',
      period:'20:30',
      tag:['waiting'],
      netDawam:'مرفوضة من الإدارة',

    },
    {
      key: '3',
      name: 'مهمة',
      age: '12-01-2020 07:30',
      address: '12-01-2020 07:30',
      leaveTime:'توزيع سلال غذائية',
      period:'3:22',
      tag:['faild'],
      netDawam:'مرفوضة من الشؤون',
    },
    {
      key: '4',
      name: 'إجازة',
      age: '12-01-2020 07:30',
      address: '12-01-2020 07:30',
      leaveTime:'دراسية',
      tag:['success'],
      period:'12:30',
      netDawam:'بانتظار الأمين العام',
    },
  ];

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
export default class tasksTable extends React.Component{
    state = {
        filteredInfo: null,
        sortedInfo: null,
        isModalVisible:false,
        isVacation:true,
        isTask:false,
      };
    handleTypeChange=(e)=>{
     if(e.target.value=="task"){
         this.setState({
            isVacation:false,
            isTask:true,
         });
     }
     else{
         this.setState({
        isVacation:true,
        isTask:false });
     }
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
render(){
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [
      {
        title: 'النوع',
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
        title: 'من',
        dataIndex: 'age',
        key: 'age',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'إلى',
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
        title: 'التفاصيل',
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
        title: 'الحالة',
        key: 'tag',
        dataIndex: 'tag',
        render: tags => (
          <>
            {tags.map(tag => {
              if (tag == 'waiting') {
                return (
                <MinusCircleOutlined style={{color:'#FFCA2C',fontSize:'20px'}}/>
              );
              }
              else if (tag == 'faild') {
                return (
                <CloseCircleOutlined style={{color:'#BB2D3B',fontSize:'20px'}} />
              );
              }
              else{
                return (
                <CheckCircleOutlined style={{color:'#007236',fontSize:'20px'}}/>
              );
              }
            })}
          </>
        ),
        filters: [
          { text: 'معتمدة', value: 'success' },
          { text: 'في الانتظار', value: 'waiting' },
          { text: 'مرفوضة', value: 'faild' },
        ],
        filteredValue: filteredInfo.tag || null,
        onFilter: (value, record) => record.tag.includes(value),
        sorter: (a, b) => a.tag.length - b.tag.length,
        sortOrder: sortedInfo.columnKey === 'tag' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'ملاحظات',
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
      
    ];
return (
    <Card>
    <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginBottom:'20px'}}>
    <div style={{display:'flex',flexDirection:'row'}}>
    <span><Progress type="circle" percent={30} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>رصيد السنوية</div>
    <div> المتبقي : 30 يوم</div>
    </span>
    </div>
    <div style={{display:'flex',flexDirection:'row'}}>
    <span><Progress type="circle" percent={100} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>رصيد الدراسية</div>
    <div> المتبقي : 0 يوم</div>
    </span>
    </div>
    <div style={{display:'flex',flexDirection:'column'}}>
    <Button style={{float:'left',marginBottom:'30px'}} onClick={this.showModal} type='primary'><FormOutlined /> تقديم إجازة </Button>
    <Button><PrinterOutlined /> طباعة الجدول </Button>
    </div>
    </div>
    <Modal title="تقديم إجازة / مهمة" visible={this.state.isModalVisible} onOk={this.handleOk} >
    <Form>
    <Form.Item label="فترة الإجازة / المهمة :">
    <Space>
    <RangePicker
      showTime={{ format: 'HH:mm' }}
      format="YYYY-MM-DD HH:mm"
    />
  </Space>
    </Form.Item>
    <Form.Item>
    <Radio.Group defaultValue="vacation" buttonStyle="solid" onChange={this.handleTypeChange}>
      <Radio.Button value="vacation">إجازة</Radio.Button>
      <Radio.Button value="task">مهمة</Radio.Button>
    </Radio.Group>
    </Form.Item>
    <Form.Item hidden={!this.state.isVacation} label="نوع الإجازة">
    <Select
    showSearch
    style={{ width: 200 }}
    placeholder="ابحث لاختيار إجازة"
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    filterSort={(optionA, optionB) =>
      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
    }
  >
    <Option value="1">سنوية</Option>
    <Option value="2">مرضية</Option>
    <Option value="3">دراسية</Option>
    <Option value="4">طارئة</Option>
    <Option value="5">حج</Option>
    <Option value="6">عمرة</Option>
    <Option value="7">زواج</Option>
    <Option value="8">وضع</Option>
    <Option value="9">بدون أجر</Option>
  </Select>
    </Form.Item>
    <Form.Item hidden={!this.state.isTask} label="تفاصيل المهمة">
    <TextArea row={3}></TextArea>
    </Form.Item>
    </Form>
    </Modal>
    <Table columns={columns}  dataSource={data} onChange={this.handleChange} />
    </Card>
);
    }
 }