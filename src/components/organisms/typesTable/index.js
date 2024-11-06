/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import axios from 'axios';
import './style.css';
import dayjs from 'dayjs';
import { useParams } from 'react-router';

import {Env} from '../../../styles';
import { useCookies,CookiesProvider  } from 'react-cookie';
import './style.css';
import { DatePicker, Space,Form,Table, Button,Modal,Card,Spin,Input,Select,Progress,Popconfirm,notification,Typography } from 'antd';
import {CheckCircleOutlined,MinusCircleOutlined,CloseCircleOutlined,ExportOutlined,FormOutlined,DeleteOutlined,PrinterOutlined} from '@ant-design/icons';
const {Text}=Typography;
const {Option}=Select;
const { RangePicker } = DatePicker;
const {TextArea}=Input;


const exportToExcel=(type,fn,dl)=>{

    var elt = document.getElementsByTagName('table')[0];
    if(elt){
     var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
     return dl ?
     excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
     excel.writeFile(wb, fn || ('الإجازات والمهام.' + (type || 'xlsx')));  
    }
} 
export default function TypesTable(props) {

  const { category } = useParams();
  const [selectedIndex,setSelectedIndex]=useState(null);
  const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
  const [filteredInfo,setFilteredInfo]=useState({});
  const [sortedInfo,setSortedInfo]=useState({});
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [isuModalVisible,setIsUModalVisible]=useState(false);

  const [startVac,setStartVac]=useState("");
  const [type,setType]=useState(null);
  const [userType,setUserType]=useState(null);

  const [endVac,setEndVac]=useState("");
  const [start,setStart]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_start")[0]?.value, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD'));     
  const [end,setEnd]=useState(dayjs(dayjs().format('YYYY-MM')+"-"+props.setting.filter((item)=> item.key == "admin.month_end")[0]?.value, 'YYYY-MM-DD').format('YYYY-MM-DD'));  
  const [currentMonth,setCurrentMonth]=useState(dayjs().format('MMMM'));   
 
  const [notes,setNotes]=useState("");
  const [tstypes,setTstypes]=useState([]);
  const [data,setData]=useState([]);
  const [vacations,setVacations]=useState([]);
  const [vacationsTypes,setVacationsTypes]=useState([]);
  const [vacationsAmount,setVacationsAmount]=useState([]);

  const [totalConsumedVacs,setTotalConsumedVacs]=useState([]);
  const [load,setLoad]=useState(true);
  const [loadt,setLoadt]=useState(true);
  const [saving,setSaving]=useState(false);
  const [usaving,setUSaving]=useState(false);

  const [visible, setVisible] = React.useState(false);
  const [uvisible, setUVisible] = React.useState(false);
  const [vacationsFilter,setVacationsFilter]=useState([]);

  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [datefromValue,setDatefromValue]=useState(null);
  const [datetoValue,setDatetoValue]=useState(null);
  const [vacType,setVacType]=useState(null);
  const [annuPerc,setAnnuPerc]=useState(null);
  const [annuDays,setAnnuDays]=useState(null);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [logload,setLogLoad]=useState(true);
  const [totalVac,setTotalVac]=useState("");
  const [requiredTasks,setRequiredTasks]=useState([]); 
  const [vacId,setVacId]=useState();
  const [edit,setEdit]=useState();
  const [update,setUpdate]=useState(null);
  const [form] = Form.useForm();
  const [uform] = Form.useForm();

  useEffect(() => {
    console.log(category);
    setLoad(true);
    axios.get(Env.HOST_SERVER_NAME+'get-types/tasks')
    .then(response => {
      setData(response.data);
      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });

  },[update]);


  const  showModal = () => {
        setIsModalVisible(true);
        setSelectedLogs(null);
      };  
  const handleOk = () => {
       var values={
          "user_id": props.user.user_id,
          "startDate":startVac,
          "endDate":endVac,
          "type":type,
          "note":notes
        }
        //console.log(values);
        axios.post(Env.HOST_SERVER_NAME+`add-task`,values)
          .then(function (response) { 
  
            openNotification('bottomLeft',<Text>{'تم إرسال الإجازة بنجاح'}</Text>);
            setSaving(false);
            setIsModalVisible(false);    
            setUpdate(update+1);
            form.resetFields(['date_range','task_type','notes']);
            setTotalVac("");
            setType(null);
            setNotes(null);
          })
       .catch(function (error) {
        console.log(error);
        notification.error({
          message:'فشل إرسال الإجازة!' ,
          placement:'bottomLeft',
          duration:10,
        });
        setSaving(false);
        setIsModalVisible(false);   
        setType(null);
        setNotes(null); 
       });
      
      }; 

const openNotification = (placement,text) => {
        notification.success({
          message:text ,
          placement,
          duration:10,
        });
      }
  const deleteTask = (record) => {
       
        axios.delete(Env.HOST_SERVER_NAME+'delete-task/'+record.id)
           .then(response => {
             setVisible(false);
             setConfirmLoading(false);
             openNotification('bottomLeft',<span> {'تم حذف الإجازات/المهام بنجاح.' }</span>);
             setUpdate(update+1);
            }).catch(function (error) {
             console.log(error);
           });
       }; 

  const updateTask=(record)=>{
        axios.put(Env.HOST_SERVER_NAME+'update-task/'+record.id+'/'+vacType+'/'+datefromValue+'/'+datetoValue)
        .then(response => {        
          setVisible(false);
          setConfirmLoading(false);
          
          openNotification('bottomLeft',<span>{ 'تم تعديل الإجازات/المهام بنجاح.' }</span>);
          setUpdate(update+1);
        }).catch(function (error) {
          console.log(error);
          setUpdate(1);
        });
    }
  const columns = [
        {
          title: 'النوع',
          dataIndex: 'name',
          key: 'name',
          filters: vacationsFilter,
          filteredValue: filteredInfo.name || null,
          onFilter: (value, record) => record.name.includes(value),
          sorter: (a, b) => a.name.length - b.name.length,
          sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
          ellipsis: true,
          render:(amount,record,index)=>{
            if(index==edit){
              return (
              <Select showSearch style={{width:120}}  optionFilterProp="children"
              notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}             
              onSelect={function(e){setVacType(e)}}
               filterOption={(input, option) =>
                option.props.children?.indexOf(input) >= 0 ||
                option.props.value?.indexOf(input) >= 0 ||
                 option.props.label?.indexOf(input) >= 0
               }
             filterSort={(optionA, optionB) =>
                optionA.props?.children?.localeCompare(optionB.props.children)
             } 
            // onChange={function(e){}} 
             onPressEnter={function(){updateTask(record);setEdit(null)}}
            defaultValue={record.vac_id}>
                            {tstypes.map(item => (
                              <Option key={item.value} value={item.value}>
                                {item.label}
                              </Option>
                            ))}
              </Select>)
            }
            else{
              return (<Text>{amount}</Text>)
            }      
          }
        },
        {
          title: 'من',
          dataIndex: 'date_from',
          key: 'date_from',
          sorter: (a, b) => a.date_from - b.date_from,
          sortOrder: sortedInfo.columnKey === 'date_from' && sortedInfo.order,
          ellipsis: true,
          render:(amount,record,index)=>{
            if(index==edit){
              return (<Input onChange={function(e){setDatefromValue(e.target.value)}} onPressEnter={function(){updateTask(record);setEdit(null);}} defaultValue={dayjs(amount,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')}></Input>)
            }
            else{
              return (<Text>{dayjs(amount,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')}</Text>)
            }      
          },
        },
        {
          title: 'إلى',
          dataIndex: 'date_to',
          key: 'date_to',

          sorter: (a, b) => a.date_to.length - b.date_to.length,
          sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
          ellipsis: true,
          render:(amount,record,index)=>{
            if(index==edit){
              return (<Input onChange={function(e){setDatetoValue(e.target.value)}} onPressEnter={function(){updateTask(record);setEdit(null)}} defaultValue={dayjs(amount,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')}></Input>)
            }
            else{
              return (<Text>{dayjs(amount,'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')}</Text>)
            }      
          }
        },     
        {
          title: 'مدة المهمة/الإجازة',
          dataIndex: 'period',
          key: 'period',
          sorter: (a, b) => a.period.length - b.period.length,
          sortOrder: sortedInfo.columnKey === 'period' && sortedInfo.order,
          ellipsis: true,
          render:(period,record,index)=>{
            if(record.days>0)
               return parseInt(record.days)+1;
               else
               return period;
          },
        },
        {
          title: "",
          width:100,
          render: (vid, record, index) => (
            <Button
              disabled={record.dept_manager!='في الانتظار' || record.gerenal_sec!='في الانتظار' || record.hr_manager!='في الانتظار'}
              onClick={function () {uform.setFieldsValue({notes:record.description,date_range:[dayjs(record.date_from,"YYYY-MM-DD HH:mm") , dayjs(record.date_to, "YYYY-MM-DD HH:mm")],task_type:record.vac_id});setVacId(record.id);setVacType(record.vac_id);setDatefromValue(record.date_from);setDatetoValue(record.date_to);setNotes(record.description);setSelectedLogs(null);setIsUModalVisible(true);}}
              className={'edit-btn'}
              style={{ backgroundColor: "#fff", borderColor: "#0972B6",color:"#0972B6" }}
              type="primary"
              shape="round"
              icon={<FormOutlined />}
            >
            </Button>
          ),
        } ,  
       {
          title: "",
          width:100,
          render: (vid, record, index) => (
        <Popconfirm
          key={record.id}
          title={'هل أنت متأكد من حذف الإجازة '}
          visible={visible && selectedIndex==record.id}
        //  onConfirm={function(){handlePOk(record);}}
          okButtonProps={{ loading: confirmLoading }}
         // onCancel={handlePCancel}
        >
            <Button
              disabled={record.dept_manager!='في الانتظار' || record.gerenal_sec!='في الانتظار' || record.hr_manager!='في الانتظار'}
              onClick={function () {showPopconfirm(record.id);}}
              className={'delete-btn'}
              style={{ backgroundColor: "#fff", borderColor: "#ff0000",color:"#f00" }}
              type="primary"
              shape="round"
              icon={<DeleteOutlined />}
            ></Button>
            </Popconfirm>
          ),
        }
  
      ].filter(item => !item.hidden);

 const handleCancel=()=>{
        setIsModalVisible(false);
        setType(null);
        setTotalVac("");
        setNotes(null);
        form.resetFields(['date_range','task_type','notes']); 
      }
 const showPopconfirm = (id) => {
        setVisible(true);
        setSelectedIndex(id);
      };
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
return (
    <Card>
    <div className='tasksHeader'>
  
      <div className='tasksOper'> 
        <div className='tasksBtn'>   
          <Button style={{marginBottom:'10px',marginLeft:'5px',backgroundColor:'#FAA61A',border:'none'}} onClick={showModal} type='primary'><FormOutlined /> تقديم إجازة </Button>
        </div>
      </div>
    </div>
<Modal centered title="تقديم إجازة / مهمة" confirmLoading={saving} visible={isModalVisible} onOk={function(){setSaving(true);handleOk()}} onCancel={function(){handleCancel()}}>
    <Form form={form} >
    <Form.Item className='rangee' name={'date_range'} label="فترة الإجازة / المهمة :">
    <Space>
    <RangePicker needConfirm={true} 
    inputReadOnly={window.innerWidth <= 760}
     showTime={{
        defaultValue: [dayjs(props.setting.filter((item)=> item.key == 'duration_start')[0]?.value, 'HH:mm'), dayjs(props.setting.filter((item)=> item.key == 'duration_end')[0]?.value, 'HH:mm')],
      }}
      format="YYYY-MM-DD HH:mm"  
    />
  </Space>
  <div style={{marginTop:'10px',fontWeight:600}}>مدة الإجازة: <Text type="danger">{totalVac}</Text></div> 
    </Form.Item>
    <Form.Item style={{marginTop:'10px'}} name={'task_type'} label="نوع الإجازة">
    <Select
    showSearch
    notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
    style={{ width: 200 }}
    options={tstypes}
    placeholder="نوع الإجازة"
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.props.children?.indexOf(input) >= 0 ||
      option.props.label?.indexOf(input) >= 0
    }
    filterSort={(optionA, optionB) =>
      optionA.props?.children?.localeCompare(optionB.props.children)
    }
  >
  </Select>
    </Form.Item>
    <Form.Item name={'notes'} label="تفاصيل ">
    <TextArea row={3}></TextArea>
    </Form.Item>
    </Form>
</Modal>
    <Table loading={load} columns={columns} scroll={{x: '1000px' }}  dataSource={data} />
    </Card>
);
 }

