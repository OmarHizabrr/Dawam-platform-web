/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import  { useState, useEffect } from 'react';

import excel from 'xlsx';
import './style.css';
import { Typography ,Layout,Tabs,Table, Button,Modal, DatePicker, Spin,Select,Card ,Space,Form,Dropdown,Menu,Switch,Input} from 'antd';
import {SettingOutlined,MinusCircleOutlined,PlusOutlined,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ar'

import {Env} from './../../../styles';
const { Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
const {RangePicker}=DatePicker;
const {TextArea}=Input;

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
      const [tstypes,setTstypes]=useState([]);
      const [loadUsers, setLoadUsers]=useState(false);
      const [isVisibleModal,setIsVisibleModal]=useState(false);

      const [data,setData]=useState([]);
      const [currentMonth,setCurrentMonth]=useState(dayjs().format('MMMM'));   
      const [selectedRowKeys, setSelectedRowKeys] = useState([]);
      const [loadForm, setLoadForm]=useState(false);

      const [pdata, setPData] = useState([]);
 
      const [categories,setCategories]=useState([]);
      const [load,setLoad]=useState(true);
      const [count,setCount]=useState(0);
      const [count17,setCount17]=useState(0);
      const [fridaysData,setFridaysData]=useState([]);
      const [requiredCount,setRequiredCount]=useState(0);

      const [start,setStart]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
      const [end,setEnd]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));  
      const [form] = Form.useForm();

      // eslint-disable-next-line react-hooks/rules-of-hooks
    let round=props.setting.filter((item)=> item.key == 'admin.round')[0]?.value*1;
    let dround=parseInt(props.setting.filter((item)=> item.key == 'admin.discounts_round')[0]?.value*1);

     useEffect(() => {
       setLoad(true);
       
        axios.get(Env.HOST_SERVER_NAME+'wages-list/'+start+'/'+end)
        .then(response => {
          let names=[];
          let categories=[];
          let ts=[];
          response.data["lists"].forEach(element => {  
            if(!names.some(item => element.name == item.text)){      
              names.push({text:element['name'],value:element['name']});
              ts.push({label:element['name'],value:element['user_id']});
            }
            if(!categories.some(item => element.category == item.text))      
              categories.push({text:element['category'],value:element['category']});        
        }); 
        setNamesFilter(names);
        setCategoriesFilter(categories);
      
        setTstypes(ts);
        setCount(parseInt(response.data.count[0].count));
        setCount17(response.data.count17[0].count);
        setFridaysData(response.data.fridaysData)
        setRequiredCount(parseInt(response.data.requiredCount[0].count))

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
      console.log(dayjs.months())
      setCurrentMonth(all.format('MMMM'));

      var startDay=props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value;
      var endDay=props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value;

      setStart(dayjs(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
      setEnd(dayjs(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));

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
        render:(_,item,ind)=>item.fingerprint_type=='22'?(new Intl.NumberFormat('en-EN').format(Math.round(item.debt)+Math.round(((count-item.attendanceDays)*(item.salary/30))+parseFloat(item.lateTimePrice))+Math.round(item.symbiosis)+Math.round(item.long_debt))):0,
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
    const showUsersDebt=()=>{
      setLoadUsers(true);
      console.log(pdata);
      form.setFieldsValue({'users':pdata});  
      setIsVisibleModal(true);
      setLoadUsers(false);
      
     }
    const buildMenu=()=>{
      var menuItems=[];
      var list=data;
    //  list.sort((a, b) => a.name.localeCompare(b.name));
      list.forEach(element => {

      menuItems.push(

      <Menu.Item  onClick={e => e.preventDefault()}>
        {element.name}
      <Switch style={{margin:'0 5px'}} size="small" defaultChecked />
      <Input style={{width:'150px'}}/>
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
      setIsVisibleModal(true);
      
     // list.filter((item)=> item.user_id == 95)[0].stopped=1;
    }
    const settingBefore=()=>{
      setPData(form.getFieldsValue().users);
      setIsVisibleModal(false);
    }
    var index=0;
    var tsal=0;
    var tallow=0;
    var tsalallow=0;
    var tdebts=0;
    var tabs=0;
    var tsym=0;
    var tvio=0;
    var tded=0;
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
        <DatePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760} defaultValue={dayjs()} onChange={onChange} picker="month" />
      </div>
        <div className='discountRange' style={{marginBottom:'10px'}}><span>اختر فترة : </span>
          <RangePicker needConfirm={true}  inputReadOnly={window.innerWidth <= 760} value={[dayjs(start,"YYYY-MM-DD"),dayjs(end,"YYYY-MM-DD")]} onChange={changeRange} />
        </div>
        <div className='discountBtn'>
          <Button style={{display:'block',margin:'0 10px'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
          <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6",marginLeft:'10px'}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
          <Button loading={loadUsers} style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){showUsersDebt()}} type='primary'><SettingOutlined /></Button>       
          <Modal centered confirmLoading={loadForm} width={900} title="إعدادات قبل الطباعة " visible={isVisibleModal}  onOk={function(){ settingBefore();}} onCancel={function(){setIsVisibleModal(false);}}>
      <Form form={form}>
      <Form.List name="users">
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
                  name={[name, 'stopped']}
                  label={'توقيف الإعانة'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <Switch   />
                </Form.Item> 
                <Form.Item
                  {...restField}
                  name={[name, 'note']}
                  label={'ملاحظات'}
                >
                  <TextArea style={{width:'150px'}}  placeholder="ملاحظات" />
                </Form.Item>               
              </Space>
            ))}
          </>
        }}
      </Form.List> 
      </Form>
    </Modal>  
        </div>
      </div>
    </div>
    <Table loading={load} rowKey={(record) => record.user_id} pagination={false} style={{textAlign:'center!important'}} columns={columns} scroll={{x: '1000px' }} onRow={(record, rowIndex) => {return{className:record.status};}} dataSource={data} onChange={handleChange} />
    </Card>
    <div id="att-report" style={{display:'none'}} >
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal",margin: "0"}}>
    <table style={{fontSize: "11px",width: " 100%",textAlign: " center"}}>
    <thead>
    <tr style={{border:'none'}}>
    <th colSpan={17}>  
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
    <div  style={{display: 'flex',marginBottom:'20px',flexDirection: 'row',textAlign: 'center',fontSize: '14px',borderBottom:'1px solid black'}} >

    </div>
    </th>
    </tr>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "25px"}}>
                <th style={{fontWeight: "100"}} rowSpan="2">م</th>              
                     <th style={{fontWeight: "100"}} rowSpan="2">الاسم</th>
                     <th style={{fontWeight: "100",width:'50px'}} rowSpan="2">الوظيفة</th>

                     <th style={{fontWeight: "100",fontSize:'8px'}} colSpan="3">الاستحقاق</th>
                   
                     <th style={{fontWeight: "100"}} colSpan="7">الاستقطاعات</th>
                     <th style={{fontWeight: "100"}} rowSpan="2" colSpan={"2"}> صافي<br/>الاستحقاق </th>
                     <th style={{fontWeight: "100"}} rowSpan="2">التوقيع</th>
                </tr>
                <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "25px"}}>
                <th style={{fontWeight: "100",fontSize:'8px'}} >الإعانة</th>
                <th style={{fontWeight: "100",fontSize:'8px'}}>البدلات</th>
                <th style={{fontWeight: "100",fontSize:'8px'}}>إجمالي</th>
                <th style={{fontWeight: "100"}}>سُلف</th>
                <th style={{fontWeight: "100"}}>غياب</th>
                <th style={{fontWeight: "100"}}>تكافل</th>
                <th style={{fontWeight: "100"}}>أقساط</th>
                <th style={{fontWeight: "100"}}>جزاءات</th>
                {<th style={{fontWeight: "100"}}>اشتراكات</th>
                }
                <th style={{fontWeight: "100",width:'20px'}}>إجمالي</th>
                </tr>
            </thead>
            <tbody>
             {
             categories.map(item=>{
              var catData=pdata.filter(record => record.category==item.name);
              
              var sal=0;
              var allow=0;
              var salallow=0;
              var debts=0;
              var abs=0;
              var sym=0;
              var vio=0;
              var ded=0;
              var ldebts=0;
              var totD=0;
              var total=0;
              var totr=0;
            if(catData.length) 
              return (
            <>
              {
              catData.map(item=>{
                sal+=parseFloat(item.status==16?item.salary:item.salary*count17);
                allow+=parseFloat(item.allownces);
                salallow+=parseFloat(item.status==16?item.salary:item.salary*count17)+parseFloat(item.allownces);
                debts+=(item.debt*1);

                var ab=item.fingerprint_type=='22'? Math.round(((Math.max(((item.status==16?requiredCount*1:count17*1)-(item.attendanceDays*1+parseInt(fridaysData?.filter(user => user.user_id == item.user_id)[0]?.weeks ?? 0))),0)*(item.status==16?parseInt(item.salary)/30:item.salary)) + parseFloat(item.lateTimePrice) )/dround )*dround:0;
                ab=ab<0?0:parseFloat(ab);
                
                abs+=parseFloat(ab);
                
                sym+=parseFloat(item.symbiosis);
                ldebts+=(item.long_debt*1);
                vio+=(item.vdiscount*1);
                ded+=(item.deductions*1);
                var toD=(item.deductions*1)+Math.round(item.debt)+ab+Math.round(item.symbiosis)+Math.round(item.long_debt)+Math.round(item.vdiscount);
                totD+=toD;
                var tot=item.stopped?0:(item.status==16?(parseFloat(item.salary)+parseFloat(item.allownces)-toD):(parseFloat(item.salary)*count17)-toD);
                total+=tot;
                var tor=item.stopped?0:Math.round(tot/round)*round;
                totr+=tor;

                 tsal+=parseFloat(item.status==16?item.salary:item.salary*count17);
                 tallow+=parseFloat(item.allownces);
                 tsalallow=tsal+tallow;
                 tdebts+=(item.debt*1);
                 tabs+=parseFloat(ab);
                 tsym+=parseFloat(item.symbiosis);
                 tvio+=item.vdiscount*1;
                 tded+=item.deductions*1;
                 tldebts+=item.long_debt*1;
                 ttotD+=toD;
                 ttotal+=tot;
                 ttotr+=tor;

              return  (<tr style={{height: "30px",backgroundColor:++index %2!=0?'#e6e6e6':'#fff'}}>
                  <td>{index}</td>
                  <td style={{fontSize:'8px',minWidth:'80px'}}>{item.name}</td>
                  <td style={{fontSize: "7px",width:'30px'}}>{item.job}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(item.status==16?item.salary:item.salary*count17)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(item.allownces)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(parseFloat(item.status==16?item.salary:item.salary*count17)+parseFloat(item.allownces))}</td>
                  
                  <td>{new Intl.NumberFormat('en-EN').format(item.debt)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(ab)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(Math.round(parseFloat(item.symbiosis)))}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(item.long_debt)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(item.vdiscount)}</td>
                  {<td>{new Intl.NumberFormat('en-EN').format(item.deductions)}</td>
              }
                  <td>{new Intl.NumberFormat('en-EN').format(toD)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(tot)}</td>
                  <td>{new Intl.NumberFormat('en-EN').format(tor)}</td>
                  <td >{item.note?item.note:'             '}</td>
                </tr>);
             })
              }
              <tr  style={{height: " 30px",color:"#fff",backgroundColor: "#0972B6",fontSize:'8px!important'}}>
                <td colSpan={3}>{item.name}</td>               
                <td>{new Intl.NumberFormat('en-EN').format(sal)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(allow)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(salallow)}</td>

                <td>{new Intl.NumberFormat('en-EN').format(debts)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(abs)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(sym)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(ldebts)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(vio)}</td>
                {<td>{new Intl.NumberFormat('en-EN').format(ded)}</td>
                }
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
                <td>{new Intl.NumberFormat('en-EN').format(tallow)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tsalallow)}</td>

                <td>{new Intl.NumberFormat('en-EN').format(tdebts)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tabs)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tsym)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tldebts)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(tvio)}</td>
                {<td>{new Intl.NumberFormat('en-EN').format(tded)}</td>
}
                <td>{new Intl.NumberFormat('en-EN').format(ttotD)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(ttotal)}</td>
                <td>{new Intl.NumberFormat('en-EN').format(ttotr)}</td>                                
                <td><pre>{'             '}</pre></td>
              </tr>
            </tbody>
    <tfoot>
      <tr>
        <th colSpan={17}>
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
