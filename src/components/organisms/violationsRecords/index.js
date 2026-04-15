/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker,Table, Button,Card,Input,Select,Typography,Form, Popconfirm,Space,Spin,notification} from 'antd';
import {DeleteOutlined,MinusCircleOutlined, PlusOutlined ,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
// import axios from 'axios';
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import excel from 'xlsx';
import dayjs from 'dayjs';
import {useLocation} from 'react-router-dom';

import {Env, PrintFonts} from './../../../styles';
import Modal from 'antd/lib/modal/Modal';
const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
 
export default function ViolationsRecords (props){

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [load,setLoad]=useState(true);
  const location = useLocation();

  const [isTextInput,setIsTextInput]=useState(false);
  const [selectedIndex,setSelectedIndex]=useState(null);
  const [amountValue,setAmountValue]=useState(null);
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [tstypes,setTstypes]=useState([]);
  const [saving,setSaving]=useState(false);
  const [selectedName,setSelectedName]=useState(null);
  const [selectedUser,setSelectedUser]=useState(null);
  const [viosTypes,setViosTypes]=useState([]);
  const [start,setStart]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting?.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
  const [end,setEnd]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting?.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));  
  const [currentMonth,setCurrentMonth]=useState(dayjs().format('MMMM'));   
 const [type,setType]=useState(null);
 const [confirmLoading, setConfirmLoading] = useState(false);
 const [visible, setVisible] = React.useState(false);
 const [update,setUpdate]=useState(null);
const openNotification2 = (placement,text) => {
        notification.success({
          message:text ,
          placement,
          duration:10,
        });
      }
 const showPopconfirm = (id) => {
  setVisible(true);
  setSelectedIndex(id);
};

const handlePOk = (record) => {
  setConfirmLoading(true);
  FirebaseServices.deleteViolation(record.id)
  .then(response => {
    setVisible(false);
    setConfirmLoading(false);
    
    openNotification2('bottomLeft',<span> {'تم حذف المخالفة بنجاح.' }</span>);

    setUpdate(update+1);
   }).catch(function (error) {
    setVisible(false);
    setConfirmLoading(false);
    console.log(error);
  });
};
const processVio=(record)=>{
  form.setFieldsValue({vio_id:record.id,user_id:record.uid,vio_type:record.vio_id,vio_date:dayjs(record.vio_date),discount:record.money_discount,note:record.note});
  setIsModalVisible(true);
}
  const columns = [
    {
      title: 'اسم الموظف',
      dataIndex: 'fullname',
      key: 'fullname',
      filters: [
        { text: 'Joe', value: 'Joe' },
        { text: 'Jim', value: 'Jim' },
      ],
      filteredValue: filteredInfo.fullname || null,
      onFilter: (value, record) => record.fullname.includes(value),
      sorter: (a, b) => a.fullname.length - b.fullname.length,
      sortOrder: sortedInfo.columnKey === 'fullname' && sortedInfo.order,
      ellipsis: false,
    },   

    {
      title: 'نوع المخالفة',
      dataIndex: 'vio_name',
      key: 'vio_name',
      sorter: (a, b) => a.vio_name.length - b.vio_name.length,
      sortOrder: sortedInfo.columnKey === 'vio_name' && sortedInfo.order,
      ellipsis: false,
    },   
    {
      title: 'تاريخ المخالفة',
      dataIndex: 'vio_date',
      key: 'vio_date',
      sorter: (a, b) => a.vio_date.length - b.vio_date.length,
      sortOrder: sortedInfo.columnKey === 'vio_date' && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: 'مبلغ المخالفة',
      dataIndex: 'money_discount',
      key: 'money_discount',
      sorter: (a, b) => a.money_discount.length - b.money_discount.length,
      sortOrder: sortedInfo.columnKey === 'money_discount' && sortedInfo.order,
      ellipsis: false,
    },      
    {
      title: 'سبب المخالفة',
      dataIndex: 'note',
      key: 'note',
      sorter: (a, b) => a.note.length - b.note.length,
      sortOrder: sortedInfo.columnKey === 'note' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'حالة المخالفة',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.length - b.status.length,
      sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
      ellipsis: false,
      render:(status,record,index)=>status=="1"?"معتمدة":"في الانتظار",
    },
    {
      title: "مراجعة الطلب",
      dataIndex: "id",
      key: "id",
      render: (id, record, index) => (
        <>
        <Button
          onClick={function () {
            setSelectedUser(record);
            printReport();
          }}
          style={{ backgroundColor: "#0972B6", borderColor: "#0972B6",marginLeft:'5px' }}
          type="primary"
          shape="round"
          icon={<PrinterOutlined />}
        >
        </Button>

     { props.type=="Admin" && <Button
          onClick={function () {
            processVio(record);
          }}
          style={{ backgroundColor: "rgb(250, 166, 26)", borderColor: "rgb(250, 166, 26)" ,marginLeft:'5px'}}
          type="primary"
          shape="round"
          icon={<FormOutlined/>}
          >
        </Button>
    }
        <Popconfirm
          key={record.id}
          title={'هل أنت متأكد من حذف المخالفة ؟ '}
          visible={visible && selectedIndex==record.id}
          onConfirm={function(){handlePOk(record);}}
          okButtonProps={{ loading: confirmLoading }}
          onCancel={()=>setVisible(false)}
        >
            <Button
              disabled={location.pathname=="/profile/dept-violations" && (type==3)}
              onClick={function () {showPopconfirm(record.id);}}
              className={'delete-btn'}
              style={{ backgroundColor: "#fff", borderColor: "#ff0000",color:"#f00" }}
              type="primary"
              shape="round"
              icon={<DeleteOutlined />}
            ></Button>
            </Popconfirm>
          </>
      ),
    },   
  ];
    useEffect(() => {
       
        FirebaseServices.getUserType(props.user?.id)
        .then(data => {
          setType(data);
        }).catch(function (error) {
          console.log(error);
        });
          FirebaseServices.getEmpNames()
          .then(data => {
            if(props.type=="Admin")
              setTstypes(data);
            else
              setTstypes(data.filter(record => record.category==props.user.category.id));

          }).catch(function (error) {
            console.log(error);
          });
          FirebaseServices.getViolationsTypes()
            .then(data => {
                setViosTypes(data);
            }).catch(function (error) {
            console.log(error);            
          });
    FirebaseServices.getAllViolations(start, end)
    .then(data => {

      if(location.pathname=="/profile/dept-violations"){
        var dt=data.filter(record => record.uid==props.user.user_id);

        if(type!=3){
          dt=data.filter(record => record.category==props.user.category.name);
        }
        setData(dt);
      }
      else{
        setData(data);
      }
      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });

   },[start,end,update]); 
      const handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
          filteredInfo: filters,
          sortedInfo: sorter,
        });
      };
      const printReport=()=>{
        var report=document.getElementById('task-report');
        //var report=document.body;
       var mywindow = window.open('');
        mywindow.document.write("<html><head><title></title> <style>" +
          PrintFonts.getPrintFontsCSS() +
          "body{font-size:12px;margin:0} " +
          "</style>");
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
          message: <span> 'تم إضافة المخالفات/الإنذارات الخاصة بـ ' <span style={{fontWeight:'bold'}}>{user_name} </span> ' بنجاح.' </span>,
          placement,
          duration:10
        });
      };
      const addTasks = () => {
          setIsModalVisible(true);
      };  
      const handleCancel = () => {
        setIsModalVisible(false);
      }; 
      const [form] = Form.useForm();
      
      const onFinish = values => {
        setSaving(true); 
        values['done_by']=props.user.id;
        
        FirebaseServices.addViolation(values)
        .then(response => {
          setIsModalVisible(false);
           setSaving(false);
           openNotification('bottomLeft',selectedName);
           setUpdate(update+1);

          }).catch(function (error) {
           alert('يوجد مشكلة في الاتصال بالسرفر!');
          });
          
        };
      
      const handleFormChange = (selected,options) => {
          setSelectedName(options.label);
          form.setFieldsValue({ vios: [] });
        };
      const changeRange=(all,date)=>{
          setStart(date[0]);
          setEnd(date[1]);       
        }
        const onChange=(all,data)=>{
          setCurrentMonth(all.format('MMMM'));
      
          var startDay=props.setting?.filter((item)=> item.key == "admin.month_start")[0]?.value;
          var endDay=props.setting?.filter((item)=> item.key == "admin.month_end")[0]?.value;
      
          setStart(dayjs(data+"-"+startDay, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));
          setEnd(dayjs(data+"-"+endDay, 'YYYY-MM-DD').format('YYYY-MM-DD'));
      
          }
return (
    <Card>
    <div className='discountHeader' style={{marginBottom:'20px'}}>

      <div className='discountBtn' style={{display:'flex',flex:1,flexDirection:'row',justifyContent:'flex-end'}}>     
      <div className='discountRange' >
      <div style={{marginLeft:'10px'}}>
        <span>اختر شهرًا : </span>
        <DatePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760}  defaultValue={dayjs()} onChange={onChange} picker="month" />
      </div>
        {window.innerWidth <= 760?<></>:<div style={{marginLeft:'10px'}}><span>اختر فترة : </span>
            <RangePicker needConfirm={true}  inputReadOnly={window.innerWidth <= 760} value={[dayjs(start,"YYYY-MM-DD"),dayjs(end,"YYYY-MM-DD")]} onChange={changeRange} />
        </div>}
        <div className='addbtn'>
        { 
        type && (props.type=="Admin" ||  type!=3)? 
        <Button style={{marginLeft:'5px'}} onClick={function(){form.resetFields(['vio_id','user_id','vio_type','vio_date','discount','note']);addTasks();}} type='primary'><FormOutlined />إضافة مخالفة </Button>
        :<></>
        
        }
        </div>
      </div>

  </div>   
    </div>
    <Modal centered footer={[]} style={{direction:'rtl'}}  title="إضافة مخالفات موظف" visible={isModalVisible} onCancel={handleCancel}>
    <Form  form={form} name="dynamic_form_nest_item"  autoComplete="on" onFinish={function(record){onFinish(record);}}>
      <Form.Item name="vio_id" hidden>
          <Input defaultValue={0}></Input>
      </Form.Item>
      <Form.Item name="user_id" label="اسم الموظف" rules={[{ required: true, message: 'Missing area' }]}>
        <Select 
          options={tstypes} 
          onChange={handleFormChange} 
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
                    <Form.Item                     
                      label="نوع المخالفة"
                      name={'vio_type'}
                      rules={[{ required: true, message: 'ادخل نوع المخالفة' }]}
                    >
                      <Select style={{ width: 130 }} showSearch  optionFilterProp="children"
                         notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
                          filterOption={(input, option) =>
                           option.props.children?.indexOf(input) >= 0 ||
                           option.props.value?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                        filterSort={(optionA, optionB) =>
                           optionA.props?.children?.localeCompare(optionB.props.children)
                        }>
                        {viosTypes.map(item => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                <Form.Item      
                  label="التاريخ"
                  name={'vio_date'}
                  rules={[{ required: true, message: 'لم تقم بإدخال تاريخ المخالفة!' }]}
                >
                   <DatePicker needConfirm={false} 
                      format="YYYY-MM-DD"
                    />
                </Form.Item>
                <Form.Item
           
                  label="المبلغ"
                  name={'discount'}
                >
                   <Input defaultValue={0}/>
                </Form.Item>
                <Form.Item
                  label="سبب المخالفة"
                  name={'note'}
                >
                   <TextArea/>
                </Form.Item>
       { props.type=="Admin" &&   <Form.Item label="حالة المخالفة" name={'status'}>
              <Select>
                <Select.Option value={0}>رفض</Select.Option>
                <Select.Option value={1}>اعتماد</Select.Option>
              </Select>
           </Form.Item>  }           
      <Form.Item  style={{float:'left'}}>
      <Button style={{marginLeft:'10px'}} onClick={handleCancel}>
          إلغاء
        </Button>
        <Button loading={saving} type="primary" htmlType="submit">        
          حفظ
        </Button>
      </Form.Item>
    </Form>

    </Modal>    
    <Table loading={load} columns={columns} scroll={{x: '1000px' }} dataSource={data} onChange={function(){handleChange();}} />
    <div id="task-report"  style={{display:'none'}}>
    <div  style={{direction: "rtl",fontSize: "12px",fontFamily: "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",margin: "0",padding:'10px',border:'3px solid black'}}>
    <header style={{display: "flex",flexDirection: "row",}}>
       <div style={{width: "20%"}}>
           <img loading="eager" style={{width: "250px"}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "60%",display: "flex",flexDirection: "row",justifyContent: "center"}}>
       </div>     
       <div style={{width: "20%",paddingTop:'20px'}}>
       <div  >التاريخ:  {selectedUser?.vio_date}</div>

       </div>
    </header> 
    <div style={{marginBottom:'10px',fontSize: "11px",textAlign: "center",width: "100%",display: "flex",flexDirection: "row",justifyContent: "center"}}>
           <span style={{fontSize: "20px",fontWeight:900,border:'2px solid black',padding:'4px 50px'}}>{selectedUser?.vio_name} {selectedUser?.money_discount>0?"بمبلغ "+selectedUser?.money_discount+"":""}</span>
    </div> 
    <div  style={{display: 'flex',flexDirection: 'row',textAlign: 'center',padding: '10px 0',fontSize: '14px',borderBottom:'1px solid black',borderTop:'1px solid black'}} >
         <div style={{width: " 40%"}}>الأخ:  {selectedUser?.fullname}</div>
         <div style={{width: " 20%"}}>الوظيفة:  {selectedUser?.job}</div>
         <div style={{width: " 40%"}}>الإدارة:  {selectedUser?.category}</div>
    </div>
    <div style={{paddingTop:'20px',fontSize:'16px'}}>
    بناء على إخطار <b>{selectedUser?.done_by=="3"? "مدير إدارة "+selectedUser?.category:"مدير الشؤون الإدارية" }</b> واستنادا إلى لائحة المخالفات 
<br/>وبسبب : <b>{selectedUser?.note}</b> <br/> وحرصا على مصلحتكم ومصلحة العمل فقد تقرر اتخاذ هذا الإجراء ضدكم  آملين أن تكونوا على مستوى المسؤولية وأن تتقيدوا بالأنظمة واللوائح وحتى لا نضطر آسفين إلى اتخاذ إجراءات أشد تجاهكم.

    </div>
    <div style={{padding:'0px 50px',marginTop:'30px'}}>

    </div>
    <div style={{display: "flex",flexDirection: "row",marginTop: "20px",textAlign: "center"}}>
       <div style={{width: "50%",fontWeight: "900"}}>المختص</div>
       <div style={{width: "50%",fontWeight: "900"}}>مدير الشؤون</div>
     </div> 
     <div style={{padding:'10px 0',marginTop:'40px',fontSize:'16px',borderTop:'1px dashed black'}}>
    <div><b>إقرار وتعهد : </b> </div>
أقر أنا <b>{selectedUser?.fullname}</b> بالمخالفة المنسوبة إل والواردة في الإجراء وأبدي اعتذاري وأتعهد بالالتزام بكافة تعليمات ولوائح وأنظمة العمل. 

<div style={{margin:'20px 0',fontWeight:'900',width:'200px',float:'left'}}>التاريخ: </div>
<div style={{marginTop:'20px',fontWeight:'900',width:'200px',float:'left'}}>التوقيع: </div>

      </div> 
     <div style={{marginTop: " 40px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #0972B6",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | {new Date().toLocaleString('en-IT')} </div>
     </div>
 </div> 
 </div>
    </Card>
);

 }
