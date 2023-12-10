/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker,Table, Button,Card,Input,Select,Typography,Form,Space, Modal,Spin,notification,InputNumber} from 'antd';
import {SwapOutlined,MinusCircleOutlined, PlusOutlined ,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import excel from 'xlsx';
import moment from 'moment';

import logoText from '../../../assets/images/logo-text.png';
import {Env} from './../../../styles';
const {Text}=Typography;

const { RangePicker } = DatePicker;
const {TextArea}=Input;
const {Option}=Select;
 
export default function TasksAccounts (props){

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [load,setLoad]=useState(true);
  const [loadReport,setLoadReport]=useState(false);
  const [tstypes,setTstypes]=useState([]);
  const [types,setTypes]=useState([]);
  const [namesFilter,setNamesFilter]=useState([]);
  const [currentYear,setCurrentYear]=useState(moment().format('YYYY'));

  const [isTextInput,setIsTextInput]=useState(false);
  const [statment,setStatment]=useState(null);
  const [amountValue,setAmountValue]=useState(null);
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [isDModalVisible,setIsDModalVisible]=useState(false);

  const [saving,setSaving]=useState(false);
  const [dsaving,setDSaving]=useState(false);

  const [tasksTypes,setTasksTypes]=useState([]);
  const [empNames,setEmpNames]=useState([]);
  const [selectedName,setSelectedName]=useState(null);
  const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
  const [end,setEnd]=useState(new Date().toISOString().slice(0, 10));
  const [loadUsers, setLoadUsers]=useState(false);
  const [update,setUpdate]=useState(false);
  const [categories,setCategories]=useState([]);
  const [pdata, setPData] = useState([]);
  const [categoriesFilter,setCategoriesFilter]=useState([]);
  const [annTasks, setAnnTasks] = useState([]);
  const [pannTasks, setPAnnTasks] = useState([]);

  const getVacDuration=(user_id,vid)=>{
    for(var i = 0; i < data.length; i++)
      if(data[i].user_id == user_id && data[i].vid == vid ) 
          return  parseInt(data[i].rest/60)+":"+data[i].rest%60;  
      return 0;
  }
  const getOrganizedVacations=()=>{
    if(data.length>0 && empNames.length>0 && tasksTypes.length>0){
    var vacData='[';
    empNames.map((user,index)=>{
     
    vacData+='{'+'"empName":"'+user.label+'","user_id":"'+user.value+'",';
    var vacDetails="";
    tasksTypes.map((task)=>{
      vacDetails+='"'+task.label+'":"'+getVacDuration(user.value,task.value)+'",';    
    });
    vacData+=vacDetails.substring(0, vacDetails.length - 1);
    vacData+='},';   
    });  
  
    return JSON.parse(vacData.substring(0, vacData.length - 1)+']');
  }
  else return [];
  }
  const showAccount=(user_id)=>{
    setIsModalVisible(true);
    axios.get(Env.HOST_SERVER_NAME+'get-tasks-statment/'+user_id)
    .then(response => {
      form.setFieldsValue({'tasks':response.data});

    }).catch(function (error) {
    console.log(error);            
    });
  }
  const getColumnsVac=()=>{
    if(tasksTypes.length>0){
    const ncolumns = [
      {
        title: 'اسم الموظف',
        dataIndex: 'empName',
        key: 'empName',
        sorter: (a, b) => a.empName.length - b.empName.length,
        sortOrder: sortedInfo.columnKey === 'empName' && sortedInfo.order,
        ellipsis: false,
        filters:namesFilter,
        filterSearch: true,
        filterMode:'tree',
        onFilter: (value, record) => record.empName.includes(value),
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
        title: 'الوظيفة',
        dataIndex: 'job',
        key: 'job',
        ellipsis: true,
      },   
    ];
   var col='[';
   tasksTypes.map((task)=>{
    col+='{"title":"'+task.label+'","dataIndex":"'+task.label+'","key":"'+task.label+'"},'; 
   });
   var nc=JSON.parse( col.substring(0, col.length - 1)+']');
   nc.map((col)=>{
     ncolumns.push(col);
   });
   ncolumns.push(   
    {
     title: 'الأحداث',
     dataIndex: 'user_id',
     key: 'user_id',
     ellipsis: true,
     render: (user_id, record, index) => (
      <Button
        onClick={function () {
          showAccount(user_id);
        }}
        type="primary"
        shape="round"
        icon={<FormOutlined />}
      ></Button>
      ),
   });
   return ncolumns;
  }
  else return [];
  }
  
  useEffect(() => {
    var emp;
    var tasks;
    var records;
      axios.get(Env.HOST_SERVER_NAME+'get-emp-names')
          .then(response => {
            setEmpNames(response.data);
            setTstypes(response.data);
            emp=response.data;
          }).catch(function (error) {
            console.log(error);
          });
          
          axios.get(Env.HOST_SERVER_NAME+'get-tasks-types-re')
            .then(response => {
                setTasksTypes(response.data);
                tasks=response.data;

            }).catch(function (error) {
            console.log(error);            
          });
          setLoad(true);
  if(end!='')
    axios.get(Env.HOST_SERVER_NAME+'get-rest-tasks/'+currentYear)
    .then(response => {

      if(response.data.tasks?.length > 0 && emp?.length>0 && tasks?.length>0){

        var vacData='[';
        emp.map((user,index)=>{
    
        vacData+='{'+'"empName":"'+user.label+'","user_id":"'+user.value+'","category":"'+response.data.tasks?.filter(record => record.user_id==user.value)[0]?.category+'","job":"'+response.data.tasks?.filter(record => record.user_id==user.value)[0]?.job+'",';
    
        var vacDetails="";
        tasks.map((task)=>{
          var dur=response.data.tasks?.filter(record => record.uid==user.value && record.vid==task.value);
          
          if(dur.length>0)
            dur= dur[0].rest<0?"-":"" +Math.abs(parseInt(dur[0].rest/60))+":"+Math.abs(dur[0].rest%60) ;
          else
            dur=0;

          vacDetails+='"'+task.label+'":"'+dur+'",';
        });
        

        vacData+=vacDetails.substring(0, vacDetails.length - 1);
        vacData+='},'; 
        });
        
       // console.log(vacData.substring(0, vacData.length - 1)+']');
       var json=JSON.parse(vacData.substring(0, vacData.length - 1)+']');
      
        records=json;

        setData(json);
        setPData(json);
      }

      let names=[];
      let categories=[];
      records.forEach(element => {  
        if(!names.some(item => element.name == item.text))      
          names.push({text:element['empName'],value:element['empName']});
        if(!categories.some(item => element.category == item.text))      
          categories.push({text:element['category'],value:element['category']});
        }); 
        names=names.sort((a, b) =>  a.text.localeCompare(b.text));
        setNamesFilter(names);
        categories=categories.sort((a, b) =>  a.text.localeCompare(b.text));
        setCategoriesFilter(categories);

      setCategories(response.data.categories);
      //setData(response.data.tasks);

 /*     let names=[];
      console.log(response.data);
      response.data["tasks"].forEach(element => {  
        if(!names.some(item => element.fullname == item.text)){      
          names.push({text:element['fullname'],value:element['fullname']});
        }       
    }); 
    names=names.sort((a, b) =>  a.text.localeCompare(b.text));
    setNamesFilter(names);
      setData(response.data['tasks']);
      setTypes(response.data['types']);

*/
      setTypes(response.data['types']);
      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });
    axios.get(Env.HOST_SERVER_NAME+'get-annualy-tasks-report/2/'+currentYear)
    .then(response => {
     
      setAnnTasks(response.data);
      setPAnnTasks(response.data);
    }).catch(function (error) {
      console.log(error);
    });
   },[start,end,update,currentYear]);
        
   const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  
    if(filters){       
      Object.keys(filters).forEach(key => {
        if(filters[key]!=null){
          setPData(data.filter(item => filters[key].includes(item[key])));
          setPAnnTasks(annTasks.filter(item => filters[key].includes(item[key])));
        }
        else
          setPData(data);
          setPAnnTasks(annTasks);           
      });               
    }
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
      
  const exportToExcel=(type,fn,dl)=>{

        var elt = document.getElementById('att-report');
        if(elt){
         var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" ,cellStyles:true});
         return dl ?
         excel.write(wb, { bookType: type, bookSST: true, type: 'base64',cellStyles:true }):
         excel.writeFile(wb, fn || ('كشف أرصدة الإجازات.' + (type || 'xlsx')),{ bookSST: true, type: 'base64',cellStyles:true });  
        }
      }
  const openNotification = (placement) => {
        notification.success({
          message: <span> تم إضافة الرصيد بنجاح </span>,
          placement,
          duration:10
        });
      };
    
  const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
      };

      const handleDCancel = () => {
        setIsDModalVisible(false);
        dform.resetFields();
      };
   const showUsersDebt=()=>{
        setLoadUsers(true);
        axios.get(Env.HOST_SERVER_NAME+'get-users-long-debts/')
            .then(response => {
              setLoadUsers(false);
              form.setFieldsValue({'tasks':response.data});          
            }).catch(function (error) {
              console.log(error);
              setLoadUsers(false);
            });
       };
  const [form] = Form.useForm();
  const [dform] = Form.useForm();

  const onFinish = () => {
        
        setSaving(true);        
        axios.post(Env.HOST_SERVER_NAME+'add-balance-tasks',form.getFieldsValue())
        .then(response => {
            setSaving(false);
            setIsModalVisible(false);
            form.resetFields();
            setUpdate(update+1);
           openNotification('bottomLeft',selectedName);
          }).catch(function (error) {
           alert('يوجد مشكلة في الاتصال بالسرفر!');
           setSaving(false);
          });
          
        };

        const onDFinish = () => {
        
          setDSaving(true);        
          axios.post(Env.HOST_SERVER_NAME+'discount-task-account',dform.getFieldsValue())
          .then(response => {
              setDSaving(false);
              setIsDModalVisible(false);
              dform.resetFields();
              setUpdate(update+1);
              notification.success({
                message: 'تم خصم الرصيد بنجاح ',
                placement:'bottomLeft',
                duration:10
              });
            }).catch(function (error) {
             alert('يوجد مشكلة في الاتصال بالسرفر!');
             setDSaving(false);
            });
            
          };
  function printAnnualyReport(){
          setLoadReport(true);
            var report=document.getElementById('ann-report');
            var mywindow = window.open('');
            setLoadReport(false);
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
  const onChange=(all,date)=>{
    setCurrentYear(date);
  }   
        var index=1;
        var aindex=1;
        var tttasksTypes=Array(tasksTypes.length).fill(0);
        var months = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو","يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
return (
    <Card>
      <Modal confirmLoading={saving} title="إضافة رصيد إجازة موظف" visible={isModalVisible} width={1300} onCancel={handleCancel} onOk={onFinish} >
      <Form form={form}>
      <Button loading={loadUsers} onClick={function(){ showUsersDebt();}} style={{marginRight:'20px',marginBottom: '24px'}} type='primary'>جلب الموظفين</Button>  
      <Form.List name="tasks">
        {(fields, { add, remove }) => {
          return <>
            {
            fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item name="id" hidden={true} style={{display:"none"}} >
                            <Input/>
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
                 name={[name, 'task_id']} label="نوع الإجازة" rules={[{ required: true, message: 'Missing area' }]}>
                  <Select style={{ width: 100 }} showSearch  optionFilterProp="children"
                         notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
                          filterOption={(input, option) =>
                           option.props.children?.indexOf(input) >= 0 ||
                           option.props.value?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                        filterSort={(optionA, optionB) =>
                           optionA.props?.children?.localeCompare(optionB.props.children)
                        }>
                        {tasksTypes.map(item => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                </Form.Item>
                <Form.Item 
                 {...restField} 
                 name={[name, 'type']} label="نوع الرصيد" rules={[{ required: true, message: 'Missing area' }]}>
                  <Select style={{ width: 100 }} showSearch  optionFilterProp="children"
                        options={types.filter(function(e){return e.parent==34;})}
                         notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
                          filterOption={(input, option) =>
                           option.props.children?.indexOf(input) >= 0 ||
                           option.props.value?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                        filterSort={(optionA, optionB) =>
                           optionA.props?.children?.localeCompare(optionB.props.children)
                        }
                        />
                </Form.Item>   
                <Form.Item
                  {...restField}
                  name={[name, 'amount']}
                  label={'الرصيد بالدقائق'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <InputNumber  placeholder="الرصيد بالدقائق" />
                </Form.Item> 

                <Form.Item
                  {...restField}
                  name={[name, 'note']}
                  label={'ملاحظات'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <TextArea  placeholder="ملاحظات" />
                </Form.Item>  

              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              إضافة رصيد
              </Button>
            </Form.Item>
          </>
        }}
      </Form.List> 
      </Form>
      </Modal>
      
      <Modal confirmLoading={dsaving} title="خصم رصيد إجازة" visible={isDModalVisible} onCancel={handleDCancel} onOk={onDFinish} >
      <Form form={dform}>
      <Form.Item 
                 name={ 'user_id'} label="اسم الموظف" rules={[{ required: true,  message: 'هذا الحقل مطلوب'  }]}>
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
                 name={'task_id'} label="نوع الإجازة" rules={[{ required: true, message: 'هذا الحقل مطلوب'  }]}>
                  <Select style={{ width: 100 }} showSearch  optionFilterProp="children"
                         notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
                          filterOption={(input, option) =>
                           option.props.children?.indexOf(input) >= 0 ||
                           option.props.value?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                        filterSort={(optionA, optionB) =>
                           optionA.props?.children?.localeCompare(optionB.props.children)
                        }>
                        {tasksTypes.map(item => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
      </Form.Item>
      <Form.Item name={'amount'} label={'مقدار الخصم'}  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]} >
          <InputNumber  placeholder="الرصيد بالدقائق" />
      </Form.Item> 
      <Form.Item name={'discount_date'} label={'تاريخ الخصم'}  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]} >
          <DatePicker />
      </Form.Item>
      <Form.Item name={'note'} label={'ملاحظات'} rules={[{ required: true, message: 'هذا الحقل مطلوب' }]} >
        <TextArea  placeholder="ملاحظات" />
      </Form.Item>
      </Form>
      </Modal>

      <div style={{marginBottom:'10px'}}>
      <div className='discountHeader' style={{marginBottom:'10px'}}>
        <div className='discountBtn'>
          <DatePicker value={moment(currentYear,'YYYY')} onChange={onChange} placeholder="اختر سنة" picker="year" />
          <Button style={{marginLeft:'5px',marginRight:'5px',border:'none',backgroundColor:'#FAA61A',color:'#fff'}} onClick={function(){  setIsDModalVisible(true);}} ><FormOutlined />  خصم رصيد </Button>

          <Button style={{marginLeft:'5px',marginRight:'5px',border:'none',backgroundColor:'#FAA61A',color:'#fff'}} onClick={function(){  setIsModalVisible(true);}} ><FormOutlined /> إضافة رصيد</Button>
          <Button style={{display:'block',margin:'0 10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
          <Button loading={loadReport} style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6",marginLeft:'10px'}} onClick={function(){printAnnualyReport()}} type='primary'><PrinterOutlined /> تقرير السنوية</Button>
          <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
        </div>
      </div>
    </div>   
    <Table loading={load} columns={getColumnsVac()} scroll={{x: '1000px' }} dataSource={data} onChange={handleChange} />
    <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <table style={{fontSize: "11px",width: " 100%",textAlign: " center"}}>
    <thead>
    <tr style={{border:'none'}}>
    <th colSpan={13}>  
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>كشف أرصدة الإجازات </h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200",margin: "0"}}>للفترة من {start} إلى {end}</h2>
       </div>     
       <div style={{width: "20%"}}>

       </div>
    </header> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',fontSize: '14px',borderBottom:'1px solid black'}} >

    </div>
    </th>
    </tr>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "25px"}}>
                     <th style={{fontWeight: "100"}} rowSpan="2">م</th>
                     <th style={{fontWeight: "100"}} rowSpan="2">اسم الموظف</th>
                     <th style={{fontWeight: "100"}} rowSpan="2">الوظيفة</th>

                     {tasksTypes.map(item=>(
                      <th style={{fontWeight: "100"}}>{item.label}</th>
                     ))}              
                     <th style={{fontWeight: "100"}} rowSpan="2">ملاحظات</th>
                </tr>
            </thead>
            <tbody>
             {
             
            categories.map(item=>{

              var catData=pdata?.filter(record => record.category==item.name);
             
              var ttasksTypes=Array(tasksTypes.length).fill(0);

          if(catData.length) 
            return (
            <>
            {
             catData.map(item=>{

              return(
              <tr style={{height: " 25px",backgroundColor:index %2==0?'#e6e6e6':'#fff'}}>
                <td>{index++}</td>
                <td>{item.empName}</td>
                <td>{item.job}</td>
                {tasksTypes.map((task,index)=>{

                  var taskAmount=item[task.label]?.replace(/(\d{1,2}:\d{2}):\d{2}/, "$1");
                  var taskSplit=taskAmount.split(":");
                 
                  var finalTask=taskAmount==0?0: parseInt(taskSplit[0]*60)+parseInt(taskSplit[1]);

                  ttasksTypes[index]=ttasksTypes[index]+parseInt(finalTask);
                  tttasksTypes[index]=tttasksTypes[index]+parseInt(finalTask);

                return  <td>{taskAmount}</td>;

                })}               
                <td><pre>             </pre></td>
              </tr>);
            }
            )
             }
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{item.name}</td>               
                {tasksTypes.map((task,index)=>{

                return  <td>{parseInt(ttasksTypes[index]/60)+":"+ttasksTypes[index]%60}</td>;

                })}               
                <td><pre>             </pre></td>
              </tr>
             </>
             );

             })}
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{'الإجمالي العام'}</td>               
                {tasksTypes.map((task,index)=>{

                  return  <td>{parseInt(tttasksTypes[index]/60)+":"+tttasksTypes[index]%60}</td>;

                  })}               
                  <td><pre>             </pre></td>
              </tr>
  
            </tbody>
            <tfoot>
      <tr>
        <th colSpan={16}>
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
     <div style={{marginTop: " 20px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #0972B6",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
     </div>
 </div> 
    </div>
    <div id="ann-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <table style={{fontSize: "11px",width: " 100%",textAlign: " center"}}>
    <thead>
    <tr style={{border:'none'}}>
    <th colSpan={21}>  
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>كشف السنوية لعام {currentYear}م</h1>
       </div>     
       <div style={{width: "20%"}}>

       </div>
    </header> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',fontSize: '14px',borderBottom:'1px solid black'}} >

    </div>
    </th>
    </tr>

    <tr style={{color:"#fff",backgroundColor: "#0972B6"}}>
      <th style={{fontWeight: "100"}} >م</th>
      <th style={{fontWeight: "100"}} >اسم الموظف</th>
      <th style={{fontWeight: "100"}} >الوظيفة</th>
      <th style={{fontWeight: "100",width:'50px'}} >مرحل من العام الماضي</th>
      <th style={{fontWeight: "100",width:'50px'}} >رصيد العام الحالي</th>
      <th style={{fontWeight: "100",width:'50px'}} >رصيد محول</th>
      <th style={{fontWeight: "100"}} >الافتتاحي</th>

      {
        months.map((m,ind)=>{
         return <th style={{fontWeight: "100",whiteSpace: 'nowrap',transform:'rotate(-90deg)',height:'50px',width:'20px'}}>{months[ind]}</th>;
        })
      }
      <th style={{fontWeight: "100"}} > الممنوح</th>
      <th style={{fontWeight: "100"}} > المتبقي</th>

    </tr>
    </thead>
    <tbody>
{pannTasks.map((item,i)=>{
var totalg=0;
var op=Math.round(item.prev)+Math.round(item.curr)+Math.round(item.trans);

return <tr style={{height: " 25px",backgroundColor:aindex %2==0?'#e6e6e6':'#fff'}}>
  <td style={{fontWeight: "100"}} >{aindex++}</td>
  <td style={{fontWeight: "100"}} >{item.name}</td>
  <td style={{fontWeight: "100",width:'100px'}} >{item.job}</td>
  <th style={{fontWeight: "100"}} >{parseInt(item.prev/60)+":"+Math.round(item.prev%60) }</th>
  <th style={{fontWeight: "100"}} >{parseInt( item.curr/60)+":"+ Math.round(item.curr%60) }</th>
  <th style={{fontWeight: "100"}} >{parseInt( item.trans/60)+":"+ Math.round(item.trans%60)}</th>
  <th style={{fontWeight: "100"}} >{parseInt(op/60)+":"+ op%60}</th>
  {
    months.map((m,ind)=>{
      var min=item['m'+(ind+1)]/60;
      totalg+=min;
     return <td style={{fontWeight: "100"}}>{ parseInt(min/60)+":"+min%60 }</td>;
    })
    
  }
  <td style={{fontWeight: "100"}}>{ Math.round((totalg/60/7)*100)/100 }</td>
  <th style={{fontWeight: "100"}} >{Math.round(((op-totalg)/60/7)*100)/100}</th>

</tr>;
})}
    </tbody>
    <tfoot>
      <tr>
        <th colSpan={21}>
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
      <div style={{marginTop: " 20px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #0972B6",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
      </div>
    </div>
  </div>
    </Card>
);

}