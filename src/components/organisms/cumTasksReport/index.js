/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker,Table, Button,Card,Input,Select,Typography,Form, Space,Spin,notification} from 'antd';
import {DeleteOutlined,MinusCircleOutlined, PlusOutlined ,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';
import {Env} from './../../../styles';
import Modal from 'antd/lib/modal/Modal';
import moment from 'moment';

const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
 
export default function CumTasksReport (props){

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
  const [start,setStart]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
  const [end,setEnd]=useState(moment().format('YYYY-MM-DD'));  
  const [currentMonth,setCurrentMonth]=useState(moment().format('MMMM'));  
  const [categories,setCategories]=useState([]);
  const [pdata, setPData] = useState([]);

  const [namesFilter,setNamesFilter]=useState([]);
  const [categoriesFilter,setCategoriesFilter]=useState([]);
 
  const getVacDuration=(user_id,vac_name)=>{

    for(var i = 0; i < data.length; i++)
      if(data[i].uid == user_id && data[i].vac_name == vac_name ) return data[i].vac_duration;  
      return 0;
  }

  const getOrganizedVacations=()=>{

    if(data.length>0 && empNames.length>0 && tasksTypes.length>0){

    var vacData='[';
    empNames.map((user,index)=>{

    vacData+='{'+'"empName":"'+user.label+'","user_id":"'+user.value+'","category":"'+data?.filter(record => record.uid==user.value)[0]?.category+'","job":"'+data?.filter(record => record.uid==user.value)[0]?.job+'",';

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
            emp=response.data;
            setEmpNames(response.data);
          }).catch(function (error) {
            console.log(error);
          });
          
          axios.get(Env.HOST_SERVER_NAME+'get-tasks-types-re')
            .then(response => {
                tasks=response.data;
                setTasksTypes(response.data);
            }).catch(function (error) {
            console.log(error);            
          });
          setLoad(true);

    if(end!='')
    axios.get(Env.HOST_SERVER_NAME+'get-cum-tasks/'+start+'/'+end)
    .then(response => {
      
      if(response.data.tasks?.length > 0 && emp?.length>0 && tasks?.length>0){

        var vacData='[';
        emp.map((user,index)=>{
    
        vacData+='{'+'"empName":"'+user.label+'","user_id":"'+user.value+'","category":"'+response.data.tasks?.filter(record => record.uid==user.value)[0]?.category+'","job":"'+response.data.tasks?.filter(record => record.uid==user.value)[0]?.job+'",';
    
        var vacDetails="";
        tasks.map((task)=>{
         
          var dur=response.data.tasks?.filter(record => record.uid==user.value && record.vac_name==task.label);
          if(dur.length>0)
            dur=dur[0].vac_duration;
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
        setNamesFilter(names);
        setCategoriesFilter(categories);

      setCategories(response.data.categories);
      //setData(response.data.tasks);

      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });
   },[start,end]);
   
// console.log(getColumnsVac());
      
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

  const printReport=()=>{
        var report=document.getElementById('att-report');
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
        var elt = document.getElementsByClassName('print-table')[0];
        if(elt){
         var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
         return dl ?
         excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
         excel.writeFile(wb, fn || ('كشف إ دوام ليوم '+"."+(type || 'xlsx')));  
        }
      }
  const openNotification = (placement,user_name) => {
        notification.success({
          message: <span> 'تم إضافة الإجازات/المهام الخاصة بـ ' <span style={{fontWeight:'bold'}}>{user_name} </span> ' بنجاح.' </span>,
          placement,
          duration:10,
        });
      };
  const addTasks = () => {
          setIsModalVisible(true);
      };
  const deleteDebt = (record) => {
       /* axios.get(Env.HOST_SERVER_NAME+'delete-task/'+record.id)
          .then(response => {
            alert('لقد قمت بحذف الإجازة الخاصة بـ'+record.name);
          }).catch(function (error) {
            console.log(error);
          });*/
      };    
      const handleCancel = () => {
        setIsModalVisible(false);
      };

  
        const [form] = Form.useForm();
      
        const onFinish = values => {
        setSaving(true);        
        axios.post(Env.HOST_SERVER_NAME+'add-accepted-tasks',values)
        .then(response => {
        setSaving(false);
           openNotification('bottomLeft',selectedName);
          }).catch(function (error) {
           alert('يوجد مشكلة في الاتصال بالسرفر!');
          });
          
        };
      
        const handleFormChange = (selected,options) => {
          setSelectedName(options.label);
          form.setFieldsValue({ tasks: [] });
        };
        const changeRange=(all,date)=>{
          setStart(date[0]);
          setEnd(date[1]); 
        }
        const onChange=(all,data)=>{
          setCurrentMonth(all.format('MMMM'));
      
          var startDay=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value;
          var endDay=props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value;
      
          setStart(moment(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
          setEnd(moment(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));
      
          }

      function getMinutesTime(amPmString) {

            if(amPmString){
              var d = amPmString.split(':'); 
              var m=(parseInt(d[0])*60) + parseInt(d[1]);
              return m; 
            }
            else return 0;

          }

        var index=1;
        var tttasksTypes=Array(tasksTypes.length).fill(0);

return (
    <Card>
      <div style={{marginBottom:'10px'}}>
      <div className='discountHeader' style={{marginBottom:'10px'}}>
      <div style={{marginLeft:'10px'}}>
        <span>اختر شهرًا : </span>
        <DatePicker  defaultValue={moment()} onChange={onChange} picker="month" />
      </div> 
        <div className='discountRange' style={{marginBottom:'10px'}}><span>اختر فترة : </span>
          <RangePicker value={[moment(start,"YYYY-MM-DD"),moment(end,"YYYY-MM-DD")]} onCalendarChange={changeRange} />
        </div>
        <div className='discountBtn'>
          <Button style={{display:'block',margin:'0 10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
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
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>كشف الإجازات لشهر {currentMonth}</h1>
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
        <th colSpan={13}>
          <div style={{display: "flex",flexDirection: "row",marginTop: "20px",textAlign: "center"}}>
            <div style={{width: "50%",fontWeight: "900"}}>شؤون الموظفين</div>
            <div style={{width: "50%",fontWeight: "900"}}>مدير الشؤون الإدارية</div>
            <div style={{width: "50%",fontWeight: "900"}}>المحاسب</div>
            <div style={{width: "50%",fontWeight: "900"}}>المسؤول المالي</div>
          </div>
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