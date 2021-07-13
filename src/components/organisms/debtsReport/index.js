import React from 'react';
import './style.css';
import { DatePicker, Space,Form,Table, Button,Modal,Card,Radio,Input,Select,Progress,type,Typography } from 'antd';
import {CheckCircleOutlined,MinusCircleOutlined,CloseCircleOutlined,PrinterOutlined,FormOutlined} from '@ant-design/icons';
import axios from 'axios';
import {Env} from './../../../styles';
const {Text}=Typography;
const data = [
    {
      key: '1',
      name: 'مهمة',
      age: '12-01-2020 07:30',
      debt_date: '12-01-2020 02:00',
      category:'نزول تصوير ميداني',
      amount:'08:30',
      type:['success'],
      monthly_discount:'معتمدة',
    },
    {
      key: '2',
      name: 'إجازة',
      age: '12-01-2020 08:30',
      debt_date: '20-01-2020 02:00',
      category:'سنوية',
      amount:'20:30',
      type:['waiting'],
      monthly_discount:'مرفوضة من الإدارة',

    },
    {
      key: '3',
      name: 'مهمة',
      age: '12-01-2020 07:30',
      debt_date: '12-01-2020 07:30',
      category:'توزيع سلال غذائية',
      amount:'3:22',
      type:['faild'],
      monthly_discount:'مرفوضة من الشؤون',
    },
    {
      key: '4',
      name: 'إجازة',
      age: '12-01-2020 07:30',
      debt_date: '12-01-2020 07:30',
      category:'دراسية',
      type:['success'],
      amount:'12:30',
      monthly_discount:'بانتظار الأمين العام',
    },
  ];

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
export default class debtsReport extends React.Component{
    state = {
        filteredInfo: null,
        sortedInfo: null,
        isModalVisible:false,
        isVacation:true,
        isTask:false,
        data:[]
      };
       
      componentDidMount(){
        axios.get(Env.HOST_SERVER_NAME+'get-debts/')
          .then(response => {
            this.setState({data:response.data});
          });
      }
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
      handleCancel = () => {
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
        title: 'اسم الموظف',
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
        title: 'تاريخ التقديم',
        dataIndex: 'debt_date',
        key: 'debt_date',
        sorter: (a, b) => a.debt_date.length - b.debt_date.length,
        sortOrder: sortedInfo.columnKey === 'debt_date' && sortedInfo.order,
        ellipsis: true,
      },     
       {
        title: 'الإدارة',
        dataIndex: 'category',
        key: 'category',
        filters: [
          { text: 'London', value: 'London' },
          { text: 'New York', value: 'New York' },
        ],
        filteredValue: filteredInfo.category || null,
        onFilter: (value, record) => record.category.includes(value),
        sorter: (a, b) => a.category.length - b.category.length,
        sortOrder: sortedInfo.columnKey === 'category' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'مبلغ السلفة',
        dataIndex: 'amount',
        key: 'amount',
        sorter: (a, b) => a.amount.length - b.amount.length,
        sortOrder: sortedInfo.columnKey === 'amount' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'نوع السلفة',
        key: 'type',
        dataIndex: 'type',
        filters: [
          { text: 'نصف شهرية', value: 'نصف شهرية' },
          { text: 'قرض', value: 'قرض' },
        ],
        filteredValue: filteredInfo.type || null,
        onFilter: (value, record) => record.type.includes(value),
        sorter: (a, b) => a.type.length - b.type.length,
        sortOrder: sortedInfo.columnKey === 'type' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'مقدار الخصم الشهري',
        dataIndex: 'monthly_discount',
        key: 'monthly_discount',
        sorter: (a, b) => a.monthly_discount.length - b.monthly_discount.length,
        sortOrder: sortedInfo.columnKey === 'monthly_discount' && sortedInfo.order,
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
    <Button style={{float:'left',marginBottom:'30px'}} onClick={this.showModal} type='primary'><FormOutlined /> سلفة جماعية </Button>
    <Button><PrinterOutlined /> طباعة التقرير </Button>
    </div>
    </div>
    <Modal title="إنشاء سلفة جماعية" visible={this.state.isModalVisible} onOk={this.handleOk} onCancel={this.handleCancel}>
     
    </Modal>
    <Table columns={columns}  dataSource={this.state.data} onChange={this.handleChange} />
    </Card>
);
    }
 }