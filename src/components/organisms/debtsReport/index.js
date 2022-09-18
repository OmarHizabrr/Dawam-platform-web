/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker, Space,Form,Table, Button,Modal,Card,Spin,Input,Select,notification,type,Typography,Divider,Row,Col, Checkbox, InputNumber, Layout} from 'antd';
import {DeleteOutlined,MinusCircleOutlined,PlusOutlined,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import {Env} from './../../../styles';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';

const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
 
export default function debtsReport (){

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [isTextInput,setIsTextInput]=useState(false);
  const [isVisibleModal,setIsVisibleModal]=useState(false);
  const [selectedIndex,setSelectedIndex]=useState(null);
  const [debtDate,setDebtDate]=useState(null);
  const [amountValue,setAmountValue]=useState(null);
  const [load,setLoad]=useState(true);
  const [tstypes,setTstypes]=useState([]);
  const [loadUsers, setLoadUsers]=useState(false);
  const [loadForm, setLoadForm]=useState(false);
  const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().slice(0,10));
  const [end,setEnd]=useState(new Date().toISOString().slice(0, 10)); 
  const [categories,setCategories]=useState([]);

  const [form] = Form.useForm();
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
      title: 'تاريخ السلفة',
      dataIndex: 'debt_date',
      key: 'debt_date',
      sorter: (a, b) => a.debt_date.length - b.debt_date.length,
      sortOrder: sortedInfo.columnKey === 'debt_date' && sortedInfo.order,
      ellipsis: false,
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
          return (<Input onChange={function(e){setAmountValue(e.target.value);}} onPressEnter={function(){updateDebt(record.id,amountValue);}} defaultValue={amount}></Input>)
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
  const printReport=()=>{
    var report=document.getElementById('att-report');
    //var report=document.body;
   var mywindow = window.open('');
    mywindow.document.write("<html><head><title></title> <style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500&display=swap'); body{font-family:Tajawal;font-size:12px;margin:0}  </style>");
    mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
    mywindow.document.write(report.innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close();
 mywindow.onload = function() { // wait until all resources loaded 
        mywindow.focus(); // necessary for IE >= 10
        mywindow.print();  // change window to mywindow
        mywindow.close();// change window to mywindow
    };   

  }
  const exportToExcel=(type,fn,dl)=>{

    var elt = document.getElementById('att-report');
    if(elt){
     var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
     return dl ?
     excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
     excel.writeFile(wb, fn || ('كشف السلف.' + (type || 'xlsx')));  
    }
  }
      useEffect(() => {
        axios.get(Env.HOST_SERVER_NAME+'get-monthly-debts'+'/'+start+'/'+end)
          .then(response => {
            setData(response.data.debts);
            setCategories(response.data.categories);
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
      },[start,end]);
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
        setFilteredInfo(filters);
        setSortedInfo(sorter);
      };
 
  const  addDebts = () => {
    setLoadForm(true);
    axios.post(Env.HOST_SERVER_NAME+'add-all-debts',form.getFieldsValue())
    .then(response => {
      setLoadForm(false);
      notification.success({
        message:'تمت العملية بنجاح' ,
        placement:'bottomLeft',
        duration:0,
      });
      form.resetFields();
      setIsVisibleModal(false);      
    }).catch(function (error) {
      console.log(error);
      notification.error({
        message:'فشلت العملية ' ,
        placement:'bottomLeft',
        duration:0,
      });
      setLoadForm(false);

    });
  };
  const   deleteDebt = (record) => {
        axios.get(Env.HOST_SERVER_NAME+'delete-debt/'+record.id)
          .then(response => {
            alert('لقد قمت بحذف السلفة الخاصة بـ'+record.name);
          }).catch(function (error) {
            console.log(error);
          });
      };    
      const onDateChange=(date,dateString)=>{
        //setDebtDate(dateString);
     }
     const showUsersDebt=()=>{
      setLoadUsers(true);
      axios.get(Env.HOST_SERVER_NAME+'get-users-debts/')
          .then(response => {
            setLoadUsers(false);
            form.setFieldsValue({'debts':response.data});          
          }).catch(function (error) {
            console.log(error);
            setLoadUsers(false);
          });
     }
     const changeRange=(all,date)=>{
      setStart(date[0]);
      setEnd(date[1]);       
    }
    var index=0;
    var tsal=0;
    var tam=0;
return (
  <Layout>
    <Card>
    <Modal confirmLoading={loadForm} width={700} title="إضافة سلفة جماعية" visible={isVisibleModal}  onOk={function(){ addDebts();}} onCancel={function(){setIsVisibleModal(false);}}>
      <Form form={form}>
      <div>ادخل تاريخ السلفة:</div>
      
      <Form.Item style={{display:'inline-block'}}  name={'debt_date'}>
         <DatePicker placeholder="تاريخ السلفة" />  
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
                  label={'مبلغ السلفة'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <InputNumber style={{width:'110px'}}  placeholder="مبلغ السلفة" />
                </Form.Item>
                 
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة سلفة
              </Button>
            </Form.Item>
          </>
        }}
      </Form.List> 
      </Form>
    </Modal>
    <div className='attOper'>
      <div className='attOperRange' style={{marginBottom:'10px',marginLeft:'10px'}}><span>اختر فترة : </span>
          <RangePicker style={{width: '200px'}} onCalendarChange={changeRange} />
      </div>    
      <div className='attOperBtn' style={{float: 'left'}}>
    <Button  style={{backgroundColor:'#FAA61A',borderColor:'#FAA61A',color:'#fff',marginLeft:'20px'}} onClick={function(){setIsVisibleModal(true);}} type='primary'><FormOutlined /> سلفة جماعية </Button>
    <Button hidden={data.length==0} style={{backgroundColor:'#f00',borderColor:'#f00',color:'#fff',marginBottom:'20px'}}><DeleteOutlined /> حذف متعدد </Button>
    <Button style={{margin:'0 10px',textAlign:'center',marginLeft:'5px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
    <Button style={{backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button> 
    </div>    
    </div>
      <Table loading={load} columns={columns}  dataSource={data} onChange={handleChange} />
    </Card>
    <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={logoText}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>كشف السلف</h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200",margin: "0"}}>للفترة من {start} إلى {end}</h2>
       </div>     
       <div style={{width: "20%"}}>

       </div>
    </header> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',fontSize: '14px',borderBottom:'1px solid black'}} >
    </div>
    <div >
        <table style={{fontSize: "12px",width: " 100%",textAlign: " center",marginTop: " 20px"}}>
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                <th style={{fontWeight: "100"}} rowSpan="2">م</th>              
                     <th style={{fontWeight: "100"}} >الاسم</th>
                     <th style={{fontWeight: "100"}} >الوظيفة</th>
                     <th style={{fontWeight: "100"}} >الراتب</th>
                     <th style={{fontWeight: "100"}} >السلفة</th>
                     <th style={{fontWeight: "100"}} >التوقيع</th>

                </tr>
            </thead>
            <tbody>  
            {
             categories.map(item=>{
              var catData=data.filter(record => record.category==item.name);
              var sal=0;
              var am=0;
              return (
            <>
              {
              catData.map(item=>{
                sal+=parseFloat(item.salary);
                am+=item.amount*1;
                tsal+=parseFloat(item.salary);
                tam+=item.amount*1;
              return  (<tr style={{height: "30px",backgroundColor:++index %2!=0?'#e6e6e6':'#fff'}}>
                  <td>{index}</td>
                  <td>{item.name}</td>
                  <td >{item.job}</td>
                 <td>{new Intl.NumberFormat('en-EN').format(item.salary)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(item.amount)}</td>
                  <td><pre>             </pre></td>
                </tr>);

             })
              }
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{item.name}</td>               
                <td>{new Intl.NumberFormat('en-EN').format(sal)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(am)}</td>                               
                <td><pre>             </pre></td>
              </tr>
            </>            
              );
              })}
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{'الإجمالي العام'}</td>               
                <td>{new Intl.NumberFormat('en-EN').format(tsal)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tam)}</td>                               
                <td><pre>             </pre></td>
              </tr>
            </tbody>
        </table>
    </div>
    <div style={{display: "flex",flexDirection: "row",marginTop: "20px",textAlign: "center"}}>
       <div style={{width: "50%",fontWeight: "900"}}>المختص</div>
       <div style={{width: "50%",fontWeight: "900"}}>مدير الشؤون</div>
     </div>  
     <div style={{marginTop: " 20px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #0972B6",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
     </div>
 </div> 
 </div>
    </Layout>
);

 }