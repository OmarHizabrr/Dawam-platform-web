/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker,Table, Button,Card,Input,Select,Typography,Form, Space,Spin,notification} from 'antd';
import {DeleteOutlined,MinusCircleOutlined, PlusOutlined ,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';
import {Env} from '../../../styles';
import Modal from 'antd/lib/modal/Modal';
import dayjs from 'dayjs';

const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
 
export default function bonusReport (props){

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [load,setLoad]=useState(true);


  const [isModalVisible,setIsModalVisible]=useState(false);
  const [saving,setSaving]=useState(false);
  const [dedTypes,setDedTypes]=useState([]);
  const [empNames,setEmpNames]=useState([]);
  const [selectedName,setSelectedName]=useState(null);
  const [start,setStart]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
  const [end,setEnd]=useState(dayjs().format('YYYY-MM-DD'));  
  const [currentMonth,setCurrentMonth]=useState(dayjs().format('MMMM'));  
  const [categories,setCategories]=useState([]);
  const [pdata, setPData] = useState([]);

  const [namesFilter,setNamesFilter]=useState([]);
  const [categoriesFilter,setCategoriesFilter]=useState([]);
 
  const getVacDuration=(user_id,vac_name)=>{

    for(var i = 0; i < data.length; i++)
      if(data[i].uid == user_id && data[i].vac_name == vac_name ) return data[i].vac_duration;  
      return 0;
  }

    const columns = [
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
      {
        title: 'الإعانة',
        dataIndex: 'salary',
        key: 'salary',
        ellipsis: true,
      },
      {
        title: 'إجمالي الإضافي',
        dataIndex: 'bonusTime',
        key: 'bonusTime',
        ellipsis: true,
      },   
    ];
 
  
  useEffect(() => {

      setLoad(true);

      axios.get(Env.HOST_SERVER_NAME+'get-emp-names')
          .then(response => {
            setEmpNames(response.data);
          }).catch(function (error) {
            console.log(error);
          });
          

    if(end!='')
    axios.get(Env.HOST_SERVER_NAME+'bonus-report/'+start+'/'+end)
    .then(response => {
        console.log(response)

        setData(response.data.records);
        setPData(response.data.records);
      

      let names=[];
      let categories=[];
      response.data.records?.forEach(element => {  
        if(!names.some(item => element.name == item.text))      
          names.push({text:element['empName'],value:element['empName']});
        if(!categories.some(item => element.category == item.text))      
          categories.push({text:element['category'],value:element['category']});
        }); 

        setCategories(response.data.categories);
        setNamesFilter(names);
        setCategoriesFilter(categories);

        setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });
   },[start,end]);
   
      
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
    function timeToSeconds(time) {
        const [hours, minutes, seconds] = time.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      function secondsToTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
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
  
        const [form] = Form.useForm();
      

        const changeRange=(all,date)=>{
          setStart(date[0]);
          setEnd(date[1]); 
        }
        const onChange=(all,data)=>{
          setCurrentMonth(all.format('MMMM'));
      
          var startDay=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value;
          var endDay=props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value;
      
          setStart(dayjs(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
          setEnd(dayjs(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));
      
          }

        var index=1;

        var ttoald=0;
        var ttsal=0;
        var ttbvalue=0;
        let round=props.setting.filter((item)=> item.key == 'admin.round')[0]?.value*1;
return (
    <Card>
      <div style={{marginBottom:'10px'}}>
      <div className='discountHeader' style={{marginBottom:'10px'}}>
      <div style={{marginLeft:'10px'}}>
        <span>اختر شهرًا : </span>
        <DatePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760}  defaultValue={dayjs()} onChange={onChange} picker="month" />
      </div> 
        <div className='discountRange' style={{marginBottom:'10px'}}><span>اختر فترة : </span>
          <RangePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760} value={[dayjs(start,"YYYY-MM-DD"),dayjs(end,"YYYY-MM-DD")]} onCalendarChange={changeRange} />
        </div>
        <div className='discountBtn'>
          <Button style={{display:'block',margin:'0 10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
          <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
        </div>
      </div>
    </div>   
    <Table loading={load} columns={columns} scroll={{x: '1000px' }} dataSource={data} onChange={handleChange} />
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
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>خلاصة الدوام الإضافي لشهر {currentMonth}</h1>
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
        <th style={{fontWeight: "100"}} >م</th>
        <th style={{fontWeight: "100"}} >اسم الموظف</th>
        <th style={{fontWeight: "100",width:'100px'}} >الوظيفة</th>
        <th style={{fontWeight: "100"}} >الراتب</th>
        <th style={{fontWeight: "100"}} > إجمالي الإضافي</th>
        <th style={{fontWeight: "100"}} > المبلغ المستحق</th>
        <th style={{fontWeight: "100"}} >ملاحظات</th>
    </tr>
    </thead>
        <tbody>
             {
             
        categories.map(item=>{
              
              var totald=0;
              var catData=pdata?.filter(record => record.category==item.name);
             var tsal=0;
             var tbvalue=0;
          if(catData.length) 
            return (
            <>
            {
             catData.map(item=>{
               totald+=timeToSeconds(item.bonusTime)*1;
               ttoald+=timeToSeconds(item.bonusTime)*1;
               tsal+=item.salary*1;
               ttsal+=item.salary*1;
               var bonus_value=Math.round((timeToSeconds(item.bonusTime)/60)*(item.salary/30/7/60)*props.setting.filter((item)=> item.key == 'admin.bonus_price')[0]?.value/round)*100;
               tbvalue+=bonus_value*1;
               ttbvalue+=bonus_value*1;
               return(
              <tr style={{height: " 25px",backgroundColor:index %2==0?'#e6e6e6':'#fff'}}>
                <td>{index++}</td>
                <td>{item.empName}</td>
                <td>{item.job}</td>
                <td>{new Intl.NumberFormat('en-EN').format(item.salary)}</td>
                <td>{item.bonusTime}</td>
                <td>{new Intl.NumberFormat('en-EN').format(bonus_value)}</td>

                <td><pre>             </pre></td>
              </tr>);
            }
            )
             }
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{item.name}</td>               
                <td>{new Intl.NumberFormat('en-EN').format(tsal)}</td>
                <td>{secondsToTime(totald)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tbvalue)}</td>               
                <td><pre>             </pre></td>
              </tr>
             </>
             );

             })}
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{'الإجمالي العام'}</td>               
                <td>{new Intl.NumberFormat('en-EN').format(ttsal)}</td>
                  <td>{secondsToTime(ttoald)}</td>    
                  <td>{new Intl.NumberFormat('en-EN').format(ttbvalue)}</td>               
           
                  <td><pre>             </pre></td>
              </tr>
  
            </tbody>
            <tfoot>
      <tr>
        <th colSpan={13}>
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