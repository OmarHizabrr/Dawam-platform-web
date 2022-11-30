/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker,Table, Button,Modal,Card,Input,Select,Typography,notification,Form,Space,Spin,InputNumber} from 'antd';
import {PlusOutlined,FormOutlined,LoadingOutlined,MinusCircleOutlined} from '@ant-design/icons';

import axios from 'axios';
import {Env} from './../../../styles';
const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
 
export default function LongDebtReport (){

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
  const [isSModalVisible,setIsSModalVisible]=useState(false);
  const [loadForm, setLoadForm]=useState(false);
  const [loadUsers, setLoadUsers]=useState(false);
  const [isVisibleModal,setIsVisibleModal]=useState(false);

  const [isPModalVisible,setIsPModalVisible]=useState(false);
  const [isAModalVisible,setIsAModalVisible]=useState(false);
  const [tstypes,setTstypes]=useState([]);
  const [empName,setEmpName]=useState(null);
  const [debtDate,setDebtDate]=useState(null);
  const [pdebtDate,setPDebtDate]=useState(null);
  const [buttonLoading,setButtonLoading]=useState(false);
  const [selected, setSelected] = useState([]);
  const [duration, setDuration] = useState(10);
  const [load,setLoad]=useState(true);

  const [form] = Form.useForm();

  const  deleteDebt = (record) => {
    axios.delete(Env.HOST_SERVER_NAME+'delete-long-debt/'+record.id)
      .then(response => {
        alert('لقد قمت بحذف القرض الخاص بـ'+record.name);
      }).catch(function (error) {
        console.log(error);
      });
  };  
  const columns = [
    {
      title: 'اسم الموظف',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      ellipsis: false,
    },   
     {
      title: 'الإدارة',
      dataIndex: 'category',
      key: 'category',
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
  const showUsersDebt=()=>{
    setLoadUsers(true);
    axios.get(Env.HOST_SERVER_NAME+'get-users-long-debts/')
        .then(response => {
          setLoadUsers(false);
          form.setFieldsValue({'debts':response.data});          
        }).catch(function (error) {
          console.log(error);
          setLoadUsers(false);
        });
   };
   const  addDebts = () => {
    setLoadForm(true);
    axios.post(Env.HOST_SERVER_NAME+'add-all-long-debts',form.getFieldsValue())
    .then(response => {
      setLoadForm(false);
      notification.success({
        message:'تمت العملية بنجاح' ,
        placement:'bottomLeft',
        duration:10,
      });
      form.resetFields();
      setIsVisibleModal(false);      
    }).catch(function (error) {
      console.log(error);
      notification.error({
        message:'فشلت العملية ' ,
        placement:'bottomLeft',
        duration:10,
      });
      setLoadForm(false);
    });
  };
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
  const openNotification = (type,placement,key,dur,text) => {
    notification[type]({
      key:key,
      duration:dur,
      message:text ,
      placement,
    });
  };
  const openLoadingNotification = (placement,text) => {
    notification.open({
      key:'loadingAdd',
      placement:placement,
      duration:duration,
      message: text,
      icon: <LoadingOutlined  style={{ color: '#108ee9' }} />,
    });

  
    };
      useEffect(() => {
        axios.get(Env.HOST_SERVER_NAME+'get-long-debts')
          .then(response => {
            setData(response.data);
           setAData(response.data);
           setLoad(false);
          }).catch(function (error) {
            console.log(error);
          });
          axios.get(Env.HOST_SERVER_NAME+'get-emp-names')
          .then(response => {
            setTstypes(response.data);
          }).catch(function (error) {
            console.log(error);
          });
      },[]);

      const processRequest = (selected) => {
        setSelected(selected);
        setPAmountValue(selected.onHem-selected.forHem);
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
          }).catch(function (error) {
            console.log(error);
          });
      }
  const handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        setFilteredInfo(filters);
        setSortedInfo(sorter);
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
        openLoadingNotification('bottomLeft',<span> 'جاري إضافة القرض الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span> </span>);
        axios
          .post(Env.HOST_SERVER_NAME + 'add-long-debt', values)
          .then(function (response) {
            console.log(response);
            if (response.status == "201") {     
              setDuration(1);        
              openNotification('success','bottomLeft','loadingAdd',3000,<span> 'تم إضافة القرض الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span> ' بنجاح.' </span>);
            }
            else{
              openNotification('error','bottomLeft','loadingAdd',0,<span> 'فشل إضافة القرض الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span>  </span>);

            }
          })
          .catch(function (error) {
            console.log("Refused Request : "+error);
            setDuration(1);
            openNotification('error','bottomLeft','loadingAdd',0,<span> 'فشل إضافة القرض الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span>  </span>);
          });
          setIsModalVisible(false);
      };
    
      const handleCancel = () => {
        setIsModalVisible(false);
      };
      const handleSCancel = () => {
        setIsSModalVisible(false);
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
            console.log(response);
            if (response.status == "201") {     
              setDuration(1);        
              openNotification('success','bottomLeft','loadingAdd',3000,<span> تم تسديد القرض الخاص بـ  <span style={{fontWeight:'bold'}}>{empName} </span>  بنجاح. </span>);
            }
            else{
              openNotification('error','bottomLeft','loadingAdd',0,<span> 'فشل تسديد القرض الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span>  </span>);

            }
          })
          .catch(function (error) {
            console.log("Refused Request : "+error);
            setDuration(1);
            openNotification('error','bottomLeft','loadingAdd',0,<span> 'فشل تسديد القرض الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span>  </span>);
          });
        setIsPModalVisible(false);

      };
      const handleSelectChange=(e,option)=>{
        setEmpName(e);
        
      }
    const onDateChange=(date,dateString)=>{
       setDebtDate(dateString);
    }
return (
    <Card>
    <Modal confirmLoading={loadForm} width={900} title="إضافة قروض قصيرة" visible={isVisibleModal}  onOk={function(){ addDebts();}} onCancel={function(){setIsVisibleModal(false);}}>
      <Form form={form}>
      <div>ادخل تاريخ القرض:</div>   
      <Form.Item style={{display:'inline-block'}}  name={'debt_date'}>
         <DatePicker placeholder="تاريخ القرض" />  
      </Form.Item> 
      <Button loading={loadUsers} onClick={function(){ showUsersDebt();}} style={{marginRight:'20px'}} type='primary'>جلب الموظفين</Button>  
      <Form.List name="debts">
        {(fields, { add, remove }) => {
          return <>
            {
            fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'id']}
                  style={{display:'none'}}
                >
                  <Input   />
                </Form.Item>
                <Form.Item 
                 {...restField} 
                 name={[name, 'user_id']} label="اسم الموظف" rules={[{ required: true, message: 'Missing area' }]}>
                  <Select style={{ width: 250 }} showSearch  optionFilterProp="children"
                         notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
                          filterOption={(input, option) =>
                           option.props.children?.indexOf(input) >= 0 ||
                           option.props.value?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                        filterSort={(optionA, optionB) =>
                           optionA.props?.children?.localeCompare(optionB.props.children)
                        }>
                        {tstypes.map(item => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                  </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'debt_value']}
                  label={'مبلغ القرض'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <InputNumber  placeholder="مبلغ القرض" />
                </Form.Item> 
                <Form.Item
                  {...restField}
                  name={[name, 'note']}
                  label={'ملاحظات'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <TextArea style={{width:'150px'}}  placeholder="ملاحظات" />
                </Form.Item>               
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة قرض فردي
              </Button>
            </Form.Item>
          </>
        }}
      </Form.List> 

      </Form>
    </Modal>  
      <Modal title="إضافة قرض" loading={buttonLoading} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Select
          showSearch
          style={{ width: 300 }}
          onSelect={handleSelectChange}
          options={tstypes}
          placeholder="ابحث لاختيار موظف"
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
      <Button style={{backgroundColor:'#FAA61A',borderColor:'#FAA61A',color:'#fff',marginLeft:'20px'}} onClick={function(){ setIsModalVisible(true);}} ><PlusOutlined /> قرض جديد </Button>
      <Button style={{backgroundColor:'#FAA61A',borderColor:'#FAA61A',color:'#fff',marginLeft:'20px'}} onClick={function(){ setIsVisibleModal(true);}} ><PlusOutlined /> قرض قصير </Button>
      <Button style={{marginLeft:'20px'}} onClick={function(){ setIsAModalVisible(true);}} type='primary'><FormOutlined /> تسديد جماعي </Button>
    </div>
    <Table scroll={{x: '1000px' }}  loading={load} columns={columns}  dataSource={data} onChange={handleChange} />
    </Card>
);

 }