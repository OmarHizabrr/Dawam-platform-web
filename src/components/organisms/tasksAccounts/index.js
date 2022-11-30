/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker,Table, Button,Card,Input,Select,Typography,Form, Modal,Spin,notification,InputNumber} from 'antd';
import {DeleteOutlined,MinusCircleOutlined, PlusOutlined ,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import excel from 'xlsx';
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

  const [isTextInput,setIsTextInput]=useState(false);
  const [selectedIndex,setSelectedIndex]=useState(null);
  const [amountValue,setAmountValue]=useState(null);
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [saving,setSaving]=useState(false);
  const [tasksTypes,setTasksTypes]=useState([]);
  const [empNames,setEmpNames]=useState([]);
  const [selectedName,setSelectedName]=useState(null);
  const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
  const [end,setEnd]=useState(new Date().toISOString().slice(0, 10));
  

 
  const getVacDuration=(user_id,vac_name)=>{
    for(var i = 0; i < data.length; i++)
      if(data[i].user_id == user_id && data[i].vac_name == vac_name ) return data[i].rest.replace(/(\d{1,2}:\d{2}):\d{2}/, "$1");  
      return 0;
  }
  const getOrganizedVacations=()=>{
    if(data.length>0 && empNames.length>0 && tasksTypes.length>0){
    var vacData='[';
    empNames.map((user,index)=>{
     
    vacData+='{'+'"empName":"'+user.label+'","user_id":"'+user.value+'",';
    var vacDetails="";
    tasksTypes.map((task)=>{
      vacDetails+='"'+task.label+'":"'+getVacDuration(user.value,task.label)+'",';    
    });
    vacData+=vacDetails.substring(0, vacDetails.length - 1);
    vacData+='},';   
    });  
  
    return JSON.parse(vacData.substring(0, vacData.length - 1)+']');
  }
  else return [];
  }
  
  const getColumnsVac=()=>{
    if(tasksTypes.length>0){
    const ncolumns = [
      {
        title: 'اسم الموظف',
        dataIndex: 'empName',
        key: 'empName',
        sorter: (a, b) => a.empName.localeCompare(b.empName),
        sortOrder: sortedInfo.columnKey === 'empName' && sortedInfo.order,
        ellipsis: false,
      },   
       {
        title: 'الرقم الوظيفي',
        dataIndex: 'user_id',
        key: 'user_id',
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
   return ncolumns;
  }
  else return [];
  }
  

    useEffect(() => {
      axios.get(Env.HOST_SERVER_NAME+'get-emp-names')
          .then(response => {
            setEmpNames(response.data);
          }).catch(function (error) {
            console.log(error);
          });
          
          axios.get(Env.HOST_SERVER_NAME+'get-tasks-types-re')
            .then(response => {
                setTasksTypes(response.data);
            }).catch(function (error) {
            console.log(error);            
          });
          setLoad(true);
  if(end!='')
    axios.get(Env.HOST_SERVER_NAME+'get-rest-tasks/'+start+'/'+end)
    .then(response => {
      setData(response.data);
      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });
   },[start,end]);
        
  const  handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
          setSortedInfo(sorter);
          setFilteredInfo(filters);
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
      };

  const [form] = Form.useForm();
      
  const onFinish = () => {
        setSaving(true);        
        axios.post(Env.HOST_SERVER_NAME+'add-balance-tasks',form.getFieldsValue())
        .then(response => {
            setSaving(false);
            setIsModalVisible(false);
           openNotification('bottomLeft',selectedName);
          }).catch(function (error) {
           alert('يوجد مشكلة في الاتصال بالسرفر!');
           setSaving(false);
          });
          
        };
      
  var index=1;
return (
    <Card>
      <Modal confirmLoading={saving} title="إضافة رصيد إجازة موظف" visible={isModalVisible} onCancel={handleCancel} onOk={onFinish} >
        <Form form={form}>
        <Form.Item name="user_id" label="اسم الموظف" rules={[{ required: true, message: 'Missing area' }]}>
        <Select 
          options={empNames} 
          //onChange={handleFormChange} 
          showSearch 
          notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
          optionFilterProp="children"
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
        <Form.Item label="نوع الإجازة" name='task_id' rules={[{ required: true, message: 'ادخل نوع الإجازة' }]}>
            <Select  showSearch  optionFilterProp="children"
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
        <Form.Item label="المدة بالدقائق" name='amount' rules={[{ required: true, message: 'ادخل المدة' }]}>
            <InputNumber  />
        </Form.Item>
        <Form.Item label="ملاحظات" name='note' rules={[{ required: true, message: 'ادخل الملاحظات' }]}>
            <TextArea />
        </Form.Item>
        </Form>
      </Modal>
      <div style={{marginBottom:'10px'}}>
      <div className='discountHeader' style={{marginBottom:'10px'}}>
        <div className='discountBtn'>
          <Button style={{marginLeft:'5px',marginRight:'5px',border:'none',backgroundColor:'#FAA61A',color:'#fff'}} onClick={function(){  setIsModalVisible(true);}} ><FormOutlined /> </Button>
          <Button style={{display:'block',margin:'0 10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
          <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
        </div>
      </div>
    </div>   
    <Table loading={load} columns={getColumnsVac()} scroll={{x: '1000px' }} dataSource={getOrganizedVacations()} onChange={handleChange} />
    <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>كشف الإجازات</h1>
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
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "25px"}}>
                     <th style={{fontWeight: "100"}} rowSpan="2">م</th>
                     {getColumnsVac().map(item=>(
                      <th style={{fontWeight: "100"}}>{item.title}</th>
                     ))}              
                     <th style={{fontWeight: "100"}} rowSpan="2">ملاحظات</th>
                </tr>
            </thead>
            <tbody>
             {getOrganizedVacations().map(item=>(
              <tr style={{height: " 25px",backgroundColor:index %2==0?'#e6e6e6':'#fff'}}>
                <td>{index++}</td>
                <td>{item.empName}</td>
                <td>{item.user_id}</td>
                {tasksTypes.map(task=>{

                return  <td>{item[task.label]?.replace(/(\d{1,2}:\d{2}):\d{2}/, "$1")}</td>;

                })}               
                <td><pre>             </pre></td>
              </tr>
             ))}
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
    </Card>
);

 }