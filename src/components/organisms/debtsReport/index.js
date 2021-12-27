/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker, Space,Form,Table, Button,Modal,Card,Radio,Input,Select,Progress,type,Typography,Divider,Row,Col, Checkbox} from 'antd';
import {DeleteOutlined,PrinterOutlined,FormOutlined} from '@ant-design/icons';
import axios from 'axios';
import {Env} from './../../../styles';
const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
 
export default function debtsReport (){

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [isTextInput,setIsTextInput]=useState(false);
  const [selectedIndex,setSelectedIndex]=useState(null);
  const [amountValue,setAmountValue]=useState(null);
  const columns = [
  /* {
     render:()=>(
       <Checkbox></Checkbox>
     ),
     ellipsis:false,
   },*/
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
      ellipsis: false,
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
      ellipsis: false,
      render:(amount,record,index)=>{
        if(isTextInput && index==selectedIndex){
          return (<Input onChange={function(e){setAmountValue(e.target.value);console.log(amountValue);}} onPressEnter={function(){updateDebt(record.id,amountValue);}} defaultValue={amount}></Input>)
        }
        else{
          return (<Text onDoubleClick={function(){
            setAmountValue(amount);
            openEdit(index);
        }}>{amount}</Text>)
        }
        
      },
    },   
    {
      title: "",
      render: (vid, record, index) => (
        <Button
          onClick={function () {deleteDebt(record);}}
          style={{ backgroundColor: "#ff0000", borderColor: "#ff0000" }}
          type="primary"
          shape="round"
          icon={<DeleteOutlined />}
        ></Button>
      ),
    } 
  ];
      useEffect(() => {
        axios.get(Env.HOST_SERVER_NAME+'get-monthly-debts/')
          .then(response => {
            setData(response.data);
          });
      });
      const openEdit=(index)=>{
          setIsTextInput(true);
          setSelectedIndex(index);
      }
      const updateDebt=(id,newValue)=>{
        axios.get(Env.HOST_SERVER_NAME+'update-debts-amount/'+id+'/'+newValue)
          .then(response => {
            setIsTextInput(false);
            setSelectedIndex(null);
            setAmountValue(null);
          });
      }
  const    handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
          filteredInfo: filters,
          sortedInfo: sorter,
        });
      };
 
  const    addDebts = () => {
        axios.get(Env.HOST_SERVER_NAME+'add-debts/')
          .then(response => {
           //this.setState({data:response.data});
          });
      };
  const    deleteDebt = (record) => {
        axios.get(Env.HOST_SERVER_NAME+'delete-debt/'+record.id)
          .then(response => {
            alert('لقد قمت بحذف السلفة الخاصة بـ'+record.name);
          });
      };    

return (
    <Card>
    <div style={{marginBottom:'20px'}}>
    <div style={{float:'left',display:'flex',flexDirection:'row'}}>
    <Button style={{marginLeft:'20px'}} onClick={function(){ addDebts();}} type='primary'><FormOutlined /> سلفة جماعية </Button>
    <Button hidden={data.length==0} style={{backgroundColor:'#f00',borderColor:'#f00',color:'#fff',marginBottom:'20px'}}><DeleteOutlined /> حذف متعدد </Button>
    </div>
    </div>
    <Table columns={columns}  dataSource={data} onChange={function(){handleChange();}} />
    </Card>
);

 }