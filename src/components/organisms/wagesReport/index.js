/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';
import './style.css';
import { Typography ,Layout,Tabs,Table, Button,Modal, DatePicker, Select,Card ,Dropdown,Menu,Switch,Input} from 'antd';
import {SettingOutlined,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {FileExcelOutlined} from '@ant-design/icons';
import moment from 'moment';

import {Env} from './../../../styles';
const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
const {RangePicker}=DatePicker;

const exportToExcel=(type,fn,dl)=>{

  var elt = document.getElementById('att-report');
  if(elt){
   var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" ,cellStyles:true});
   return dl ?
   excel.write(wb, { bookType: type, bookSST: true, type: 'base64',cellStyles:true }):
   excel.writeFile(wb, fn || ('كشف الخصميات.' + (type || 'xlsx')),{ bookSST: true, type: 'base64',cellStyles:true });  
  }
}
export default function wagesReport(props){
      const [filteredInfo,setFilteredInfo]=useState({});
      const [sortedInfo,setSortedInfo]=useState({});
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [namesFilter,setNamesFilter]=useState([]);
      const [categoriesFilter,setCategoriesFilter]=useState([]);

      const [data,setData]=useState([]);
      const [currentMonth,setCurrentMonth]=useState(moment().format('MMMM'));   
      const [selectedRowKeys, setSelectedRowKeys] = useState([]);

      const [pdata, setPData] = useState([]);
 
      const [categories,setCategories]=useState([]);
      const [load,setLoad]=useState(true);
      const [count,setCount]=useState(0);

      const [start,setStart]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
      const [end,setEnd]=useState(moment(moment().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));  

      // eslint-disable-next-line react-hooks/rules-of-hooks
    let round=props.setting.filter((item)=> item.key == 'admin.round')[0]?.value*1;
     useEffect(() => {
       setLoad(true);
       
        axios.get(Env.HOST_SERVER_NAME+'wages-list/'+start+'/'+end)
        .then(response => {
          let names=[];
          let categories=[];
          response.data["lists"].forEach(element => {  
            if(!names.some(item => element.name == item.text))      
              names.push({text:element['name'],value:element['name']});
            if(!categories.some(item => element.category == item.text))      
              categories.push({text:element['category'],value:element['category']});        
        }); 
        setNamesFilter(names);
        setCategoriesFilter(categories);
        setCount(response.data.count[0].count);
        console.log(response.data.lists);
        setData(response.data.lists);
        setPData(response.data.lists);
        setCategories(response.data.categories);
        setLoad(false);
        }).catch(function (error) {
          console.log(error);
        });;

       }, [start,end]);

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
    const changeRange=(all,date)=>{
        //const id=cookies.user;
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
        title: 'المسمى الوظيفي',
        dataIndex: 'job',
        key: 'job',
        sorter: (a, b) => a.job - b.job,
        sortOrder: sortedInfo.columnKey === 'job' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'الاستحقاق',
        dataIndex: 'salary',
        key: 'salary',
        sorter: (a, b) => a.salary - b.salary,
        sortOrder: sortedInfo.columnKey === 'salary' && sortedInfo.order,
        ellipsis: true,
        render:(salary)=>new Intl.NumberFormat('en-EN').format(salary),
      },     
       {
        title: 'سُلف',
        dataIndex: 'debt',
        key: 'debt',
        sorter: (a, b) => a.debt - b.debt,
        sortOrder: sortedInfo.columnKey === 'debt' && sortedInfo.order,
        ellipsis: true,
        render:(d)=>new Intl.NumberFormat('en-EN').format(d),
      },
      {
        title: 'غياب',
        dataIndex: 'attendanceDays',
        sorter: (a, b) =>(Math.round(((count-a.attendanceDays)*(a.salary/30))+parseFloat(a.lateTimePrice))) - (Math.round(((count-b.attendanceDays)*(b.salary/30))+parseFloat(b.lateTimePrice))),
        sortOrder: sortedInfo.columnKey === 'attendanceDays' && sortedInfo.order,
        key: 'attendanceDays',
        ellipsis: true,
        render:(ab,rec,ind)=>new Intl.NumberFormat('en-EN').format(rec.fingerprint_type=='22'?Math.round(((count-ab)*(rec.salary/30))+parseFloat(rec.lateTimePrice)):0),
      },
      {
        title: 'تكافل',
        dataIndex: 'symbiosis',
        key: 'symbiosis',
        sorter: (a, b) => a.symbiosis - b.symbiosis,
        sortOrder: sortedInfo.columnKey === 'symbiosis' && sortedInfo.order,
        ellipsis: true,
        render:(sym)=>new Intl.NumberFormat('en-EN').format(sym),
      },
      {
        title: 'أقساط',
        dataIndex: 'long_debt',
        key: 'long_debt',
        sorter: (a, b) => a.long_debt - b.long_debt,
        sortOrder: sortedInfo.columnKey === 'long_debt' && sortedInfo.order,
        ellipsis: false,
        render:(ld)=>new Intl.NumberFormat('en-EN').format(ld),
      },
      {
        title: 'جزاءات',
        dataIndex: 'vdiscount',
        key: 'vdiscount',
        sorter: (a, b) => a.vdiscount - b.vdiscount,
        sortOrder: sortedInfo.columnKey === 'vdiscount' && sortedInfo.order,
        ellipsis: false,
        render:(vdiscount)=>new Intl.NumberFormat('en-EN').format(vdiscount),
      },
      {
        title: 'إجمالي الاستقطاع',
        sorter: (a, b) => (Math.round(a.debt)+Math.round(((count-a.attendanceDays)*(a.salary/30))+parseFloat(a.lateTimePrice))+Math.round(a.symbiosis)+Math.round(a.long_debt))-(Math.round(b.debt)+Math.round(((count-b.attendanceDays)*(b.salary/30))+parseFloat(b.lateTimePrice))+Math.round(b.symbiosis)+Math.round(b.long_debt)),
        key: 'totDiscount',
        sortOrder: sortedInfo.columnKey === 'totDiscount' && sortedInfo.order,
        ellipsis: false,
        render:(_,item,ind)=>new Intl.NumberFormat('en-EN').format(Math.round(item.debt)+Math.round(((count-item.attendanceDays)*(item.salary/30))+parseFloat(item.lateTimePrice))+Math.round(item.symbiosis)+Math.round(item.long_debt)),
      },
      {
        title: 'صافي الاستحقاق',
        ellipsis: false,
        key:'netWages',
        sorter: (a, b) =>(a.salary-(Math.round(a.debt)+Math.round(((count-a.attendanceDays)*(a.salary/30))+parseFloat(a.lateTimePrice))+Math.round(a.symbiosis)+Math.round(a.long_debt)))-(b.salary-(Math.round(b.debt)+Math.round(((count-b.attendanceDays)*(b.salary/30))+parseFloat(b.lateTimePrice))+Math.round(b.symbiosis)+Math.round(b.long_debt))),
        sortOrder: sortedInfo.columnKey === 'netWages' && sortedInfo.order,
        render:(_,item,ind)=>new Intl.NumberFormat('en-EN').format(item.salary-(Math.round(item.debt)+Math.round(((count-item.attendanceDays)*(item.salary/30))+parseFloat(item.lateTimePrice))+Math.round(item.symbiosis)+Math.round(item.long_debt))),
      },
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

    const buildMenu=()=>{
      var menuItems=[];
      var list=data;
    //  list.sort((a, b) => a.name.localeCompare(b.name));
      list.forEach(element => {

      menuItems.push(

      <Menu.Item onClick={e => e.preventDefault()}>
        {element.name}
      <Switch size="small" defaultChecked />
      <Input />
      </Menu.Item>
      
      );

     });
      return menuItems;
    }
    const menu = (
      <Menu>
        {buildMenu()}
      </Menu>
    );
    const preprintSetting=()=>{
    //  console.log(data);
      let list=data;
     // list.filter((item)=> item.user_id == 95)[0].stopped=1;
     

    }
    var index=0;
    var tsal=0;
    var tdebts=0;
    var tabs=0;
    var tsym=0;
    var tvio=0;
    var tldebts=0;
    var ttotD=0;
    var ttotal=0;
    var ttotr=0;
return (
    <Layout>
    <Card>
    <div style={{marginBottom:'10px'}}>
      <div className='discountHeader' style={{marginBottom:'10px'}}>
      <div style={{marginLeft:'10px'}}>
        <span>اختر شهرًا : </span>
        <DatePicker defaultValue={moment()} onChange={onChange} picker="month" />
      </div>
        <div className='discountRange' style={{marginBottom:'10px'}}><span>اختر فترة : </span>
          <RangePicker value={[moment(start,"YYYY-MM-DD"),moment(end,"YYYY-MM-DD")]} onCalendarChange={changeRange} />
        </div>
        <div className='discountBtn'>
          <Button style={{display:'block',margin:'0 10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
          <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
          <Dropdown overlay={menu} placement="bottomLeft" trigger='click'>
            <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){preprintSetting()}} type='primary'><SettingOutlined /></Button>       
          </Dropdown>
        </div>
      </div>
    </div>
    <Table loading={load} rowKey={(record) => record.user_id} pagination={false} style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onChange={handleChange} />
    </Card>
    <div id="att-report" style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderColor:'#000',borderBottomStyle: "solid",borderBottomWidth:"1px"}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",fontWeight:700,marginBottom: " 5px",margin: "0"}}>كشف الإعانات لشهر {currentMonth}</h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200",margin: "0"}}>للفترة من {start} إلى {end}</h2>
       </div>     
       <div style={{width: "20%"}}>

       </div>
    </header> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',fontSize: '14px',borderBottom:'1px solid black'}} >

    </div>
    <div >
        <table style={{fontSize: "11px",width: " 100%",textAlign: " center",marginTop: " 20px"}}>
            <thead>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "25px"}}>
                <th style={{fontWeight: "100"}} rowSpan="2">م</th>              
                     <th style={{fontWeight: "100"}} rowSpan="2">الاسم</th>
                     <th style={{fontWeight: "100",width:'60px'}} rowSpan="2">الوظيفة</th>
                     <th style={{fontWeight: "100"}} rowSpan="2">الاستحقاق</th>
                     <th style={{fontWeight: "100"}} colSpan="6">الاستقطاعات</th>
                     <th style={{fontWeight: "100"}} rowSpan="2" colSpan={"2"}> صافي<br/>الاستحقاق </th>
                     <th style={{fontWeight: "100"}} rowSpan="2">التوقيع</th>
                </tr>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "25px"}}>
                <th style={{fontWeight: "100"}}>سُلف</th>
                <th style={{fontWeight: "100"}}>غياب</th>
                <th style={{fontWeight: "100"}}>تكافل</th>
                <th style={{fontWeight: "100"}}>أقساط</th>
                <th style={{fontWeight: "100"}}>جزاءات</th>
                <th style={{fontWeight: "100",width:'20px'}}>إجمالي</th>
                </tr>
            </thead>
            <tbody>
             {
             categories.map(item=>{
              var catData=pdata.filter(record => record.category==item.name);
              
              var sal=0;
              var debts=0;
              var abs=0;
              var sym=0;
              var vio=0;
              var ldebts=0;
              var totD=0;
              var total=0;
              var totr=0;
            if(catData.length) 
              return (
            <>
              {
              catData.map(item=>{
                sal+=parseFloat(item.salary);
                debts+=(item.debt*1);
                
                var ab=item.fingerprint_type=='22'? Math.round( (((count*1-item.attendanceDays*1)*(parseInt(item.salary)/30)) + parseFloat(item.lateTimePrice) )/5 )*5:0;
                ab=ab<0?0:parseFloat(ab);
                
                abs+=parseFloat(ab);
                
                sym+=parseFloat(item.symbiosis);
                ldebts+=(item.long_debt*1);
                vio+=(item.vdiscount*1);
                var toD=Math.round(item.debt)+ab+Math.round(item.symbiosis)+Math.round(item.long_debt)+Math.round(item.vdiscount);
                totD+=toD;
                var tot=item.salary-toD;
                total+=tot;
                var tor=Math.round(tot/round)*round;
                totr+=tor;

                 tsal+=parseFloat(item.salary);
                 tdebts+=(item.debt*1);
                 tabs+=parseFloat(ab);
                 tsym+=parseFloat(item.symbiosis);
                 tvio+=item.vdiscount*1;
                 tldebts+=item.long_debt*1;
                 ttotD+=toD;
                 ttotal+=tot;
                 ttotr+=tor;

              return  (<tr style={{height: "30px",backgroundColor:++index %2!=0?'#e6e6e6':'#fff'}}>
                  <td>{index}</td>
                  <td style={{fontSize:'10px'}}>{item.name}</td>
                  <td style={{fontSize: "8px",width:'60px'}}>{item.job}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(item.salary)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(item.debt)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(ab)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(Math.round(parseFloat(item.symbiosis)))}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(item.long_debt)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(item.vdiscount)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(toD)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(tot)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(tor)}</td>
                  <td><pre>             </pre></td>
                </tr>);
             })
              }
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{item.name}</td>               
                <td>{new Intl.NumberFormat('en-EN').format(sal)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(debts)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(abs)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(sym)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(ldebts)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(vio)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(totD)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(total)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(totr)}</td>                                
                <td><pre>             </pre></td>
              </tr>
            </>            
              );
              })}
            <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",}}>
                <td colSpan={3}>{'الإجمالي العام'}</td>               
                <td>{new Intl.NumberFormat('en-EN').format(tsal)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tdebts)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tabs)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tsym)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tldebts)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tvio)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(ttotD)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(ttotal)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(ttotr)}</td>                                
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
