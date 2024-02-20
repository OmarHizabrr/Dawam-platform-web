/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker, Space,Form,Table, Button,Modal,Card,Spin,Input,Select,notification,type,Typography,Divider,Row,Col, Checkbox, InputNumber, Layout} from 'antd';
import {DeleteOutlined,MinusCircleOutlined,PlusOutlined,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import {Env} from './../../../styles';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';
import dayjs from 'dayjs';

const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
 
export default function DebtsReport (props){

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
  const [start,setStart]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
  const [end,setEnd]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));  
  const [currentMonth,setCurrentMonth]=useState(dayjs().format('MMMM'));   
  const [namesFilter,setNamesFilter]=useState([]);
  const [categoriesFilter,setCategoriesFilter]=useState([]);
  const [categories,setCategories]=useState([]);
  const [pdata, setPData] = useState([]);
  const [buttonLoading,setButtonLoading]=useState(false);
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [empName,setEmpName]=useState(null);
  const [update, setUpdate] = useState(0);
  const [mamountValue,setMAmountValue]=useState(null);

  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  const columns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      ellipsis: false,
      filters:namesFilter,
      filterSearch: true,
      filterMode:'tree',
      onFilter: (value, record) => record.name.includes(value),
    },
    {
      title: 'الإدارة',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: sortedInfo.columnKey === 'category' && sortedInfo.order,
      filters:categoriesFilter,
      filterMode:'tree',        
      onFilter: (value, record) => record.category.includes(value),
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
          return (<Input onChange={function(e){setAmountValue(e.target.value);}}  defaultValue={amount}></Input>)
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
          onClick={function () {
            setIsModalVisible(true);
            updateForm.setFieldsValue({'id':record.id,'user_id':record.user_id,'amount':record.amount,'debt_date':dayjs(record.debt_date,'YYYY-MM-DD'),'note':record.note});
          }}
          style={{ backgroundColor: "#fff", borderColor: "#0972B6",color:"#0972B6" }}
          type="primary"
          shape="round"
          icon={<FormOutlined />}
        ></Button>)
    },  
    {
      title: "",
      render: (vid, record, index) => (
        <>
        <Button
          onClick={function () {deleteDebt(record);}}
          style={{ backgroundColor: "#fff", borderColor: "#ff0000",color:"#f00" }}
          type="primary"
          shape="round"
          icon={<DeleteOutlined />}
        ></Button>
        </>

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
            let names=[];
          let categories=[];
          response.data["debts"].forEach(element => {  
            if(!names.some(item => element.name == item.text))      
              names.push({text:element['name'],value:element['name']});
            if(!categories.some(item => element.category == item.text))      
              categories.push({text:element['category'],value:element['category']});        
        }); 
        setNamesFilter(names);
        setCategoriesFilter(categories);

            setData(response.data.debts);
            setPData(response.data.debts);

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
      },[start,end,update]);
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

    if(filters){       
      Object.keys(filters).forEach(key => {
        if(filters[key]!=null){
          setPData(data.filter(item => filters[key].includes(item[key])));
        }
        else
          setPData(data);           
      });               
    }

      };
  const onChange=(all,data)=>{
        setCurrentMonth(all.format('MMMM'));
  
        var startDay=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value;
        var endDay=props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value;
  
        setStart(dayjs(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
        setEnd(dayjs(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));
  
  }
  const  addDebts = () => {
    setLoadForm(true);
    axios.post(Env.HOST_SERVER_NAME+'add-all-debts',form.getFieldsValue())
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
    const handleCancel = () => {
      setIsModalVisible(false);
    };
    const onFinish=()=>{
      setButtonLoading(true);
     axios.post(Env.HOST_SERVER_NAME+'update-debt',updateForm.getFieldsValue())
          .then(response => {
            console.log(response.data);
            notification.success({
              message:'تمت العملية بنجاح' ,
              placement:'bottomLeft',
              duration:10,
            });
            setUpdate(update+1);
            setButtonLoading(false);
            setIsModalVisible(false);
          }).catch(function (error) {
            console.log(error);
            notification.error({
              message:'فشلت العملية ' ,
              placement:'bottomLeft',
              duration:10,
            });
            setButtonLoading(false);
          });
    }

    const handleSelectChange=(e,option)=>{
      setEmpName(e);
    }
    var index=0;
    var tsal=0;
    var tam=0;
return (
  <Layout>
    <Card>
    <Modal centered confirmLoading={loadForm} width={700} title="إضافة سلفة " visible={isVisibleModal}  onOk={function(){ addDebts();}} onCancel={function(){setIsVisibleModal(false);}}>
      <Form form={form}>
      <div>ادخل تاريخ السلفة:</div>
      
      <Form.Item style={{display:'inline-block'}}  name={'debt_date'}>
         <DatePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760} placeholder="تاريخ السلفة" />  
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
               إضافة سلفة فردية
              </Button>
            </Form.Item>
          </>
        }}
      </Form.List> 
      </Form>
    </Modal>

    <Modal centered title="تعديل سلفة" confirmLoading={buttonLoading} visible={isModalVisible} onOk={onFinish} onCancel={handleCancel}>
      <Form form={updateForm}>
       <Form.Item
        name="id"
        hidden={true}
        style={{display:"none"}}
        >
          <Input />
       </Form.Item>
       <Form.Item label="اسم الموظف" name="user_id" >
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
        </Form.Item>
        <Form.Item label="مبلغ السلفة" name="amount" >
        <Input onChange={function(e){setAmountValue(e.target.value);}}  style={{marginTop:'10px',width:300}} />
        </Form.Item>
        <Form.Item label="تاريخ الصرف" name="debt_date" >
           <DatePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760}  onChange={onDateChange} /> 
          </Form.Item>

        </Form>
    </Modal>

    <div className='attOper'>
      <div style={{marginLeft:'10px'}}>
        <span>اختر شهرًا : </span>
        <DatePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760} defaultValue={dayjs()} onChange={onChange} picker="month" />
      </div>
      <div className='attOperRange' style={{marginBottom:'10px',marginLeft:'10px'}}><span>اختر فترة : </span>
          <RangePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760} value={[dayjs(start,"YYYY-MM-DD"),dayjs(end,"YYYY-MM-DD")]} style={{width: '200px'}} onCalendarChange={changeRange} />
      </div>    
      <div className='attOperBtn' style={{float: 'left'}}>
    <Button  style={{backgroundColor:'#FAA61A',borderColor:'#FAA61A',color:'#fff',marginLeft:'20px'}} onClick={function(){setIsVisibleModal(true);}} type='primary'><FormOutlined />  إضافة سلفة </Button>
    <Button hidden={data.length==0} style={{backgroundColor:'#f00',borderColor:'#f00',color:'#fff',marginBottom:'20px'}}><DeleteOutlined /> حذف متعدد </Button>
    <Button style={{margin:'0 10px',textAlign:'center',marginLeft:'5px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
    <Button style={{backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button> 
    </div>    
    </div>
      <Table loading={load} columns={columns}  dataSource={data} onChange={handleChange} />
    </Card>
    <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <table style={{fontSize: "11px",width: " 100%",textAlign: " center"}}>
    <thead>
    <tr style={{border:'none'}}>
    <th colSpan={6}> 
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>كشف السلف لشهر {currentMonth}</h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200",margin: "0"}}>للفترة من {start} إلى {end}</h2>
       </div>     
       <div style={{width: "20%"}}>

       </div>
    </header> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',fontSize: '14px',borderBottom:'1px solid black'}} >
    </div>
    </th>
    </tr>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                <th style={{fontWeight: "100"}} rowSpan="2">م</th>              
                     <th style={{fontWeight: "100"}} >الاسم</th>
                     <th style={{fontWeight: "100"}} >الوظيفة</th>
                     <th style={{fontWeight: "100"}} >الإعانة</th>
                     <th style={{fontWeight: "100"}} >السلفة</th>
                     <th style={{fontWeight: "100"}} >التوقيع</th>

                </tr>
            </thead>
            <tbody>  
            {
             categories.map(item=>{
              var catData=pdata.filter(record => record.category==item.name);
              var sal=0;
              var am=0;

              if(catData.length) 
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
            <tfoot>
      <tr>
        <th colSpan={6}>
          <div style={{display: "flex",flexDirection: "row",marginTop: "20px",textAlign: "center"}}>
{props.setting.filter((item)=> item.key == 'admin.signs_footer')[0]?.value.split('\n').map((sign)=>{
           var sign_position=sign.split(':')[0];
           var sign_name=sign.split(':')[1];

           return <div style={{width: "50%"}}>
               <div style={{fontWeight: "900"}}>{sign_position}</div>
               {sign_name!="" && <div style={{fontWeight: "500"}}>{sign_name}</div>}
            </div>
        })}          </div>
        </th>
      </tr>
    </tfoot>
    </table>
    
     <div style={{marginTop: "50px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #0972B6",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
     </div>
 </div> 
 </div>
    </Layout>
);

 }