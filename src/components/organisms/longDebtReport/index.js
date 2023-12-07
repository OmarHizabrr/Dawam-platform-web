/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker,Table,Popconfirm, Button,Modal,Card,Input,Select,Typography,notification,Form,Space,Spin,InputNumber} from 'antd';
import {PlusOutlined,PrinterOutlined,FormOutlined,LoadingOutlined,DeleteOutlined,MinusCircleOutlined} from '@ant-design/icons';
import moment from 'moment';

import axios from 'axios';
import {Env} from './../../../styles';
const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
 
export default function LongDebtReport (props){

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
  const [visible, setVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);

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
  const [start,setStart]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
  const [end,setEnd]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));  
  const [currentMonth,setCurrentMonth]=useState(moment().format('MMMM'));   
  const [categories,setCategories]=useState([]);
  const [pdata, setPData] = useState([]);
  const [namesFilter,setNamesFilter]=useState([]);
  const [categoriesFilter,setCategoriesFilter]=useState([]);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [update, setUpdate] = useState(0);
  const  deleteDebt = (record) => {
    axios.delete(Env.HOST_SERVER_NAME+'delete-long-debt/'+record.id)
      .then(response => {
        notification.success({
          message:'تمت العملية بنجاح' ,
          placement:'bottomLeft',
          duration:10,
        });
        setUpdate(update+1);
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
      ellipsis: true,
      filters:categoriesFilter,
      filterMode:'tree',        
      onFilter: (value, record) => record.category.includes(value),
    },
    {
      title: 'مبلغ القسط',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      sortOrder: sortedInfo.columnKey === 'amount' && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: 'التفاصيل',
      dataIndex: 'note',
      key: 'note',
      sorter: (a, b) => a.note - b.note,
      sortOrder: sortedInfo.columnKey === 'note' && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: "",
      dataIndex: "",
      key: "",
      render: (_, record, index) => (
        <>
        <Button
          onClick={function () {
            setIsModalVisible(true);
            updateForm.setFieldsValue({'id':record.id,'user_id':record.user_id,'amount':record.amount,'debt_date':moment(record.debt_date,'YYYY-MM-DD'),'note':record.note});
          }}
          type="primary"
          shape="round"
          icon={<FormOutlined />}
        ></Button>
    <Popconfirm
      key={record.id}
      title={'هل أنت متأكد من حذف القسط '}
      visible={visible && selectedIndex==record.id}
      onConfirm={function(){deleteDebt(record);}}
      okButtonProps={{loading:confirmLoading }}
      onCancel={function(){setVisible(false);}}
    ></Popconfirm>
        <Button
        style={{marginRight:'20px', backgroundColor: "#fff", borderColor: "#ff0000",color:"#f00" }}
        onClick={function () {setVisible(true);setSelectedIndex(record.id)}}

        type="primary"
        shape="round"
        icon={<DeleteOutlined />}
      ></Button>
      </>
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
   const addDebts = () => {
    setLoadForm(true);
    axios.post(Env.HOST_SERVER_NAME+'add-all-long-debts',form.getFieldsValue())
    .then(response => {
      setLoadForm(false);
      notification.success({
        message:'تمت العملية بنجاح' ,
        placement:'bottomLeft',
        duration:10,
      });
      setUpdate(update+1);
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
  const openNotification = (type,placement,key,dur,text) => {
    notification[type]({
      key:key,
      duration:dur,
      message:text ,
      placement,
    });
  };
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
  const onChange=(all,data)=>{
    setCurrentMonth(all.format('MMMM'));

    var startDay=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value;
    var endDay=props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value;

    setStart(moment(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
    setEnd(moment(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));

    }
  const changeRange=(all,date)=>{
      //const id=cookies.user;
      setStart(date[0]);
      setEnd(date[1]);       
    }
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
        axios.get(Env.HOST_SERVER_NAME+'get-long-debts/'+start+'/'+end)
          .then(response => {
            let names=[];
            let categories=[];
            response.data.debts.forEach(element => {  
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

      const processRequest = (selected) => {
        
        setSelected(selected);
        updateForm.setFieldsValue({'id':selected.id,'user_id':selected.user_id,'amount':selected.amount,'debt_date': moment(selected.debt_date,"YYYY-MM-DD") ,'note':selected.note});
        setIsModalVisible(true);
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
        openLoadingNotification('bottomLeft',<span> 'جاري إضافة القسط الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span> </span>);
        axios
          .post(Env.HOST_SERVER_NAME + 'add-long-debt', values)
          .then(function (response) {
            console.log(response);
            if (response.status == "201") {     
              setDuration(1);        
              openNotification('success','bottomLeft','loadingAdd',3000,<span> 'تم إضافة القسط الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span> ' بنجاح.' </span>);
            }
            else{
              openNotification('error','bottomLeft','loadingAdd',0,<span> 'فشل إضافة القسط الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span>  </span>);

            }
          })
          .catch(function (error) {
            console.log("Refused Request : "+error);
            setDuration(1);
            openNotification('error','bottomLeft','loadingAdd',0,<span> 'فشل إضافة القسط الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span>  </span>);
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
            if (response.status == "201") {     
              setDuration(1);        
              openNotification('success','bottomLeft','loadingAdd',3000,<span> تم تسديد القسط الخاص بـ  <span style={{fontWeight:'bold'}}>{empName} </span>  بنجاح. </span>);
            }
            else{
              openNotification('error','bottomLeft','loadingAdd',0,<span> 'فشل تسديد القسط الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span>  </span>);

            }
          })
          .catch(function (error) {
            console.log("Refused Request : "+error);
            setDuration(1);
            openNotification('error','bottomLeft','loadingAdd',0,<span> 'فشل تسديد القسط الخاص بـ ' <span style={{fontWeight:'bold'}}>{empName} </span>  </span>);
          });
        setIsPModalVisible(false);

      };
      const handleSelectChange=(e,option)=>{
        setEmpName(e);
        
      }
    const onDateChange=(date,dateString)=>{
       setDebtDate(dateString);
    }
    const onFinish=()=>{
      setButtonLoading(true);
      console.log(updateForm.getFieldsValue());
     axios.post(Env.HOST_SERVER_NAME+'update-long-debt',updateForm.getFieldsValue())
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

    var index=0;
    var tsal=0;
    var tam=0;

return (
    <Card>
    <Modal confirmLoading={loadForm} width={900} title="إضافة أقساط " visible={isVisibleModal}  onOk={function(){ addDebts();}} onCancel={function(){setIsVisibleModal(false);}}>
      <Form form={form}>
      <div>ادخل تاريخ القسط:</div>   
      <Form.Item style={{display:'inline-block'}}  name={'debt_date'}>
         <DatePicker placeholder="تاريخ التسديد" />  
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
                  label={'مبلغ القسط'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <InputNumber  placeholder="مبلغ القسط" />
                </Form.Item> 
                <Form.Item
                  {...restField}
                  name={[name, 'note']}
                  label={'التفاصيل'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <TextArea style={{width:'150px'}}  placeholder="التفاصيل" />
                </Form.Item>               
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة قسط فردي
              </Button>
            </Form.Item>
          </>
        }}
      </Form.List> 
      </Form>
    </Modal>  
    <Modal title="تعديل قسط" confirmLoading={buttonLoading} visible={isModalVisible} onOk={onFinish} onCancel={handleCancel}>
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
        <Form.Item label="مبلغ القسط" name="amount" >
        <Input onChange={function(e){setAmountValue(e.target.value);}}  style={{marginTop:'10px',width:300}} />
        </Form.Item>
        <Form.Item label="تاريخ التسديد" name="debt_date" >
           <DatePicker  onChange={onDateChange} /> 
          </Form.Item>
        <Form.Item label="التفاصيل" name="note" >
          <TextArea onChange={function(e){setMAmountValue(e.target.value);}}  style={{marginTop:'10px',width:300}} />
        </Form.Item>
        </Form>
    </Modal>
<div className='discountHeader' style={{marginBottom:'20px'}}>
<div className='discountBtn' style={{display:'flex',flex:1,flexDirection:'row',justifyContent:'flex-end'}}>     
<div className='discountRange' >
<div style={{marginLeft:'10px'}}>
  <span>اختر شهرًا : </span>
  <DatePicker  defaultValue={moment()} onChange={onChange} picker="month" />
</div>
  <div style={{marginLeft:'10px'}}><span>اختر فترة : </span>
      <RangePicker value={[moment(start,"YYYY-MM-DD"),moment(end,"YYYY-MM-DD")]} onCalendarChange={changeRange} />
  </div>
  <div className='addbtn'>
  <Button style={{backgroundColor:'#FAA61A',borderColor:'#FAA61A',color:'#fff',marginLeft:'20px'}} onClick={function(){ setIsVisibleModal(true);}} ><PlusOutlined /> إضافة قسط </Button>
  <Button style={{backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button> 
  </div>

</div>

</div>   
</div>
    <Table scroll={{x: '1000px' }}  loading={load} columns={columns}  dataSource={data} onChange={handleChange} />
    <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>كشف القروض لشهر {currentMonth}</h1>
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
                     <th style={{fontWeight: "100"}} >الإعانة</th>
                     <th style={{fontWeight: "100"}} >القرض</th>
                     <th style={{fontWeight: "100"}} >ملاحظات</th>
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
        </table>
    </div>
    <div style={{display: "flex",flexDirection: "row",marginTop: "20px",textAlign: "center"}}>
    {props.setting.filter((item)=> item.key == 'admin.signs_footer')[0]?.value.split('\n').map((sign)=>{
           var sign_position=sign.split(':')[0];
           var sign_name=sign.split(':')[1];

           return <div style={{width: "50%"}}>
               <div style={{fontWeight: "900"}}>{sign_position}</div>
               {sign_name!="" && <div style={{fontWeight: "500"}}>{sign_name}</div>}
            </div>
        })}
     </div>  
     <div style={{marginTop: " 20px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #0972B6",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
     </div>
 </div> 
 </div>
    </Card>
);

 }