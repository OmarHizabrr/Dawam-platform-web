/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker,Table, Button,Modal,Card,Input,Select,Typography,message} from 'antd';
import {PlusOutlined,FormOutlined} from '@ant-design/icons';

import axios from 'axios';
import {Env} from './../../../styles';
const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
 
export default function longDebtReport (){

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [afilteredInfo, setAFilteredInfo] = useState({});
  const [asortedInfo, setASortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [adata, setAData] = useState([]);
  const [isTextInput,setIsTextInput]=useState(false);
  const [selectedIndex,setSelectedIndex]=useState(null);
  const [amountValue,setAmountValue]=useState(null);
  const [mamountValue,setMAmountValue]=useState(null);
  const [pamountValue,setPAmountValue]=useState(null);
  const [pmamountValue,setPMAmountValue]=useState(null);
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [isPModalVisible,setIsPModalVisible]=useState(false);
  const [isAModalVisible,setIsAModalVisible]=useState(false);
  const [tstypes,setTstypes]=useState([]);
  const [empName,setEmpName]=useState(null);
  const [debtDate,setDebtDate]=useState(null);
  const [pdebtDate,setPDebtDate]=useState(null);
  const [selected, setSelected] = useState([]);
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
      title: 'مبلغ القرض',
      dataIndex: 'onHem',
      key: 'onHem',
      sorter: (a, b) => a.onHem - b.onHem,
      sortOrder: sortedInfo.columnKey === 'onHem' && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: 'المدفوع',
      dataIndex: 'forHem',
      key: 'forHem',
      sorter: (a, b) => a.forHem - b.forHem,
      sortOrder: sortedInfo.columnKey === 'forHem' && sortedInfo.order,
      ellipsis: false,
    },
     {
      title: 'المتبقي',
      dataIndex: 'forHem',
      key: 'forHem',
      sorter: (a, b) => a.forHem.length - b.forHem.length,
      sortOrder: sortedInfo.columnKey === 'forHem' && sortedInfo.order,
      ellipsis: false,
      render:(forHem,record,index)=>record.onHem-record.forHem,
    },   
    {
      title: "تسديد القرض",
      dataIndex: "",
      key: "",
      render: (_, record, index) => (
        <Button
          onClick={function () {
            processRequest(record);
          }}
          type="primary"
          shape="round"
          icon={<FormOutlined />}
        ></Button>
      ),
    }, 
  ];
  const acolumns = [
    {
      title: 'اسم الموظف',
      dataIndex: 'name',
      key: 'name',
      filters: [
        { text: 'Joe', value: 'Joe' },
        { text: 'Jim', value: 'Jim' },
      ],
      filteredValue: afilteredInfo.name || null,
      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: asortedInfo.columnKey === 'name' && asortedInfo.order,
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
      filteredValue: afilteredInfo.category || null,
      onFilter: (value, record) => record.category.includes(value),
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: asortedInfo.columnKey === 'category' && asortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'مبلغ القرض',
      dataIndex: 'onHem',
      key: 'onHem',
      sorter: (a, b) => a.onHem - b.onHem,
      sortOrder: sortedInfo.columnKey === 'onHem' && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: 'مبلغ السداد',
      dataIndex: 'onHem',
      key: 'onHem',
      sorter: (a, b) => a.onHem - b.onHem,
      sortOrder: sortedInfo.columnKey === 'onHem' && sortedInfo.order,
      ellipsis: false,
      render:(forHem,record,index)=>record.onHem-record.forHem,
    },
    {
      title: 'تاريخ السداد',
      dataIndex: '',
      key: '',
      ellipsis: false,
      render:()=>{
        var today=new Date();
        return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      },
    },
     {
      title: 'ملاحظات',
      dataIndex: '',
      key: '',
      ellipsis: false,
    },    
  ];
      useEffect(() => {
        axios.get(Env.HOST_SERVER_NAME+'get-long-debts/')
          .then(response => {
            setData(response.data);
            setAData(response.data);
          });
          axios.get(Env.HOST_SERVER_NAME+'get-emp-names')
          .then(response => {
            setTstypes(response.data);
          });
      },[]);

      const processRequest = (selected) => {
        setSelected(selected);
        setIsPModalVisible(true);
      };
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
  const handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
          afilteredInfo: filters,
          asortedInfo: sorter,
        });
      };
 
      const handleAChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
          filteredInfo: filters,
          sortedInfo: sorter,
        });
      };
      const handleOk = () => {
        var values = {
          user_id: empName,
          amount: amountValue,
          debt_date: debtDate,
          note:mamountValue ,
        };
        axios
          .post(Env.HOST_SERVER_NAME + `add-long-debt`, values)
          .then(function (response) {
            if (response.statusText == "OK") {
              message.success('تم إضافة القرض بنجاح');
            }
          })
          .catch(function (error) {
            console.log("Refused Request : "+error);
          });
        setIsModalVisible(false);

      };
    
      const handleCancel = () => {
        setIsModalVisible(false);
      };
      const handlePCancel = () => {
        setIsPModalVisible(false);
      };
      const handleACancel = () => {
        setIsAModalVisible(false);
      };
      const handleAOk = () => {
        setIsAModalVisible(false);
      };
      const handlePOk = () => {
        var values = {
          user_id:selected.user_id,
          amount: pamountValue,
          debt_date: pdebtDate,
          note:pmamountValue ,
        };
        axios
          .post(Env.HOST_SERVER_NAME + `pay-debt`, values)
          .then(function (response) {
            if (response.statusText == "OK") {
              message.success('تم التسديد بنجاح');
            }
          })
          .catch(function (error) {
            console.log("Refused Request : "+error);
          });
        setIsPModalVisible(false);

      };
      const handleSelectChange=(e)=>{
        setEmpName(e);
      }
    const onDateChange=(date,dateString)=>{
       setDebtDate(dateString);
    }
return (
    <Card>
      <Modal title="إضافة قرض" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Select
          showSearch
          style={{ width: 300 }}
          onSelect={handleSelectChange}
          options={tstypes}
          placeholder="ابحث لاختيار موظف"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.props.indexOf(input) >= 0
          }
        ></Select>
        <Input onChange={function(e){setAmountValue(e.target.value);}} placeholder="مبلغ القرض" style={{marginTop:'10px',width:300}} />
        <div style={{marginTop:'10px',width:300}}> <DatePicker placeholder="تاريخ الاقتراض" onChange={onDateChange} /> </div>
        <TextArea onChange={function(e){setMAmountValue(e.target.value);}} placeholder="ملاحظات" style={{marginTop:'10px',width:300}} />
      </Modal>
      <Modal title="تسديد قرض" visible={isPModalVisible} onOk={handlePOk} onCancel={handlePCancel}>
        <div style={{marginBottom:'10px'}}>الموظف: {selected?selected.name:""}</div>
        <div>الإدارة: {selected?selected.category:""}</div>
        <Input onChange={function(e){setPAmountValue(e.target.value);}} defaultValue={selected?selected.onHem-selected.forHem:""} placeholder="مبلغ السداد" style={{marginTop:'10px',width:300}} />
        <div style={{marginTop:'10px',width:300}}> <DatePicker placeholder="تاريخ السداد" onChange={function(date,dateString){setPDebtDate(dateString);}} /> </div>
        <TextArea onChange={function(e){setPMAmountValue(e.target.value);}} placeholder="ملاحظات" style={{marginTop:'10px',width:300}} />
      </Modal>
      <Modal width={1000} title=" تسديد قرض جماعي" visible={isAModalVisible} onOk={handleAOk} onCancel={handleACancel}>
          <Table columns={acolumns}  dataSource={adata} onChange={function(){handleAChange();}} />
      </Modal>
    <div style={{float:'left',marginBottom:'20px'}}>
    <Button style={{backgroundColor:'#007236',borderColor:'#007236',marginLeft:'20px'}} onClick={function(){ setIsModalVisible(true);}} type='primary'><PlusOutlined /> قرض جديد </Button>
    <Button style={{marginLeft:'20px'}} onClick={function(){ setIsAModalVisible(true);}} type='primary'><FormOutlined /> تسديد جماعي </Button>
    </div>
    <Table columns={columns}  dataSource={data} onChange={function(){handleChange();}} />
    </Card>
);

 }