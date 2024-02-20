/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import dayjs from 'dayjs';
import { DatePicker,Popconfirm,Table, Button,Card,Input,Select,Typography,Form, Space,Spin,notification,Checkbox,Divider} from 'antd';
import {MenuUnfoldOutlined,MinusCircleOutlined, PlusOutlined,DeleteOutlined,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import excel from 'xlsx';

import {Env} from './../../../styles';
import Modal from 'antd/lib/modal/Modal';
const {Text}=Typography;

const { RangePicker } = DatePicker;
const {TextArea}=Input;
const {Option}=Select;
const CheckboxGroup = Checkbox.Group;

export default function TasksRecords (){

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [load,setLoad]=useState(true);

  const [checkedList, setCheckedList] = React.useState([]);
  const [checkedRList, setCheckedRList] = React.useState([]);
  const [edit,setEdit]=useState();
  const [indeterminate, setIndeterminate] = React.useState(true);
  const [checkAll, setCheckAll] = React.useState(false);

  const onChange = list => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < options.length);
    setCheckAll(list.length === options.length);
  };
const selectRecord=(e,record)=>{
 // const list=checkedRList;
  if(!checkedRList.includes(record.id)){
   // list.push(record.id);
    setCheckedRList(checkedRList.concat([record]));
  }
  else{
    setCheckedRList(checkedRList.filter(el=>el != record));
  }
  //console.log(checkedRList);
}
  const onCheckAllChange = e => {
    var selOptions=[];
    if(e.target.checked )
        options.map(item=>selOptions.push(item.value));
    
    setCheckedList(selOptions);   
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const updateTask=(record)=>{
    axios.put(Env.HOST_SERVER_NAME+'update-task/'+record.id+'/'+vacType+'/'+datefromValue+'/'+datetoValue)
    .then(response => {
      console.log(response);
      setVisible(false);
      setConfirmLoading(false);
      openNotification('bottomLeft',<span> 'تم تعديل الإجازات/المهام الخاصة بـ ' <span style={{fontWeight:'bold'}}>{record.fullname} </span> ' بنجاح.' </span>);
     setUpdate(true);
    }).catch(function (error) {
      console.log(error);
    });
  }
  const [selectedIndex,setSelectedIndex]=useState(null);
  const [datefromValue,setDatefromValue]=useState(null);
  const [datetoValue,setDatetoValue]=useState(null);
  const [vacType,setVacType]=useState(null);
  const [visible, setVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [isAModalVisible,setIsAModalVisible]=useState(false);
  const [tstypes,setTstypes]=useState([]);
  const [saving,setSaving]=useState(false);
  const [selectedName,setSelectedName]=useState(null);
  const [tasksTypes,setTasksTypes]=useState([]);
  const [taskType,setTaskType]=useState(null);
  const [des,setDes]=useState(null);
  const [drange,setDrange]=useState(null);
  const [update,setUpdate]=useState(false);
  const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
  const [end,setEnd]=useState(new Date().toISOString().slice(0, 10));
  const [namesFilter,setNamesFilter]=useState([]);
  const [categoriesFilter,setCategoriesFilter]=useState([]);
  const [vacationsFilter,setVacationsFilter]=useState([]);

  const columns = [
    {    
      title: 'تحديد',
      width:100,
      dataIndex: 'select',
      key: 'select',
      render:(id,record,_)=> <Checkbox onChange={function(e){selectRecord(e,record);}} value={record.id}></Checkbox> ,
    },
    {
      title: 'اسم الموظف',
      dataIndex: 'fullname',
      key: 'fullname',
      filters: namesFilter,
      filteredValue: filteredInfo.fullname || null,
      onFilter: (value, record) => record.fullname.includes(value),
      sorter: (a, b) => a.fullname.length - b.fullname.length,
      sortOrder: sortedInfo.columnKey === 'fullname' && sortedInfo.order,
      ellipsis: false,
    },   
     {
      title: 'الإدارة',
      dataIndex: 'category',
      key: 'category',
      filters: categoriesFilter,
      filteredValue: filteredInfo.category || null,
      onFilter: (value, record) => record.category.includes(value),
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: sortedInfo.columnKey === 'category' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'نوع الإجازة',
      width:150,
      dataIndex: 'vac_name',
      key: 'vac_name',
      filters: vacationsFilter,
      filteredValue: filteredInfo.vac_name || null,
      onFilter: (value, record) => record.vac_name.includes(value),
      sorter: (a, b) => a.vac_name.length - b.vac_name.length,
      sortOrder: sortedInfo.columnKey === 'vac_name' && sortedInfo.order,
      ellipsis: false,
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
         onChange={function(e){}} 
        defaultValue={record.vac_id}>
                        {tasksTypes.map(item => (
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
      title: 'الفترة من',
      dataIndex: 'date_from',
      key: 'date_from',
      sorter: (a, b) => a.date_from.length - b.date_from.length,
      sortOrder: sortedInfo.columnKey === 'date_from' && sortedInfo.order,
      ellipsis: false,
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
      title: 'الفترة إلى',
      dataIndex: 'date_to',
      key: 'date_to',
      sorter: (a, b) => a.date_to.length - b.date_to.length,
      sortOrder: sortedInfo.columnKey === 'date_to' && sortedInfo.order,
      ellipsis: false,
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
      title: 'إجمالي الوقت',
      dataIndex: 'netPeriod',
      key: 'netPeriod',
      ellipsis: true,
    }, 
    {
      title: 'التفاصيل',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },  
   {
      title: "",
      width:100,
      render: (vid, record, index) => (
    <Popconfirm
      key={record.id}
      title={'هل أنت متأكد من حذف إجازة '+record.fullname}
      visible={visible && selectedIndex==record.id}
      onConfirm={function(){handleOk(record);}}
      okButtonProps={{ loading: confirmLoading }}
      onCancel={handlePCancel}
    >
        <Button
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
  ];
  const showPopconfirm = (id) => {
    setVisible(true);
    setSelectedIndex(id);
  };
  const options = [];
    useEffect(() => {   
          axios.get(Env.HOST_SERVER_NAME+'get-emp-names')
          .then(response => {
            var names=[];
           setTstypes(response.data);
           response.data.forEach(element => {  
            names.push({text:element['label'],value:element['label']});       
          });
          setNamesFilter(names);
          }).catch(function (error) {
            console.log(error);
          });
          axios.get(Env.HOST_SERVER_NAME+'get-tasks-types')
            .then(response => {
                setTasksTypes(response.data);
            }).catch(function (error) {
            console.log(error);            
          });
    axios.get(Env.HOST_SERVER_NAME+'get-all-accepted-tasks/'+start+'/'+end)
    .then(response => {
      setData(response.data);
      let categories=[];
      let vacations=[];
      response.data.forEach(element => {  
          if(!categories.some(item => element.category == item.text))      
            categories.push({text:element['category'],value:element['category']});
            if(!vacations.some(item => element.vac_name == item.text))      
              vacations.push({text:element['vac_name'],value:element['vac_name']});         
      }); 
      setCategoriesFilter([...categoriesFilter,...categories]);
      setVacationsFilter([...vacationsFilter,...vacations]);     

      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });
   },[start,end,update]);
   const handleOk = (record) => {
    setConfirmLoading(true);
    deleteTask(record);
  };

  const handlePCancel = () => {
    setVisible(false);
  };
   const getNameOptions=()=>{
     for(var i=0;i<tstypes.length;i++)
        options.push({"label":tstypes[i].label,"value":'"'+tstypes[i].value+'"'});
    // tstypes.map(item=>options.push({"label":item.label,"value":item.value}));    
    return options;
   }
      
  const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
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
        mywindow.focus();
    
        mywindow.print();
        mywindow.close();   
        /* var printContents = document.getElementById("att-report").innerHTML;
        var originalContents = document.body.innerHTML;
    
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;*/ 
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
      const openNotification = (placement,text) => {
        notification.success({
          message:text ,
          placement,
          duration:10,
        });
      };
  const addTasks = () => {
          setIsModalVisible(true);
      };
      const addATasks = () => {
        console.log(options);
        setIsAModalVisible(true);
    };
  const deleteTask = (record) => {
       
       axios.delete(Env.HOST_SERVER_NAME+'delete-task/'+record.id)
          .then(response => {
            setVisible(false);
            setConfirmLoading(false);
            openNotification('bottomLeft',<span> 'تم حذف الإجازات/المهام الخاصة بـ ' <span style={{fontWeight:'bold'}}>{record.fullname} </span> ' بنجاح.' </span>);
           setUpdate(true);
          }).catch(function (error) {
            console.log(error);
          });
      };    
      const handleCancel = () => {
        setIsModalVisible(false);
      };

        const [form] = Form.useForm();
      
        const onFinish = values => {
        setSaving(true);    
        console.log(values);    
        axios.post(Env.HOST_SERVER_NAME+'add-accepted-tasks',values)
        .then(response => {
           setSaving(false);
           form.setFieldsValue({ tasks: [] });
           openNotification('bottomLeft',<span> 'تم إضافة الإجازات/المهام الخاصة بـ ' <span style={{fontWeight:'bold'}}>{selectedName} </span> ' بنجاح.' </span>);
          }).catch(function (error) {
           alert('يوجد مشكلة في الاتصال بالسرفر!');
           setSaving(false);
          });
          
        };
        const onAFinish = values => {
          console.log(values);
         // setSaving(true);    
          
          };
        const handleFormChange = (selected,options) => {
          setSelectedName(options.label);
          form.setFieldsValue({ tasks: [] });
        };
        const changeRange=(all,date)=>{
          setStart(date[0]);
          setEnd(date[1]);       
        }
        const checkPeriod=(all,date,key)=>{
          if(date[1]!=''){
            const minutes=(new Date(date[1])-new Date(date[0]))/60000;
            var alerta="";
            if(minutes<=420) alerta=(Math.floor(minutes/60)+" ساعة و "+(minutes%60))+" دقيقة ";
            else alerta=(Math.floor(minutes/1440)+1)+" يوم ";
            const cl='.range'+key;
           var elem=document.querySelector(cl+' '+'.ant-form-item-control-input-content');
           elem.innerHTML+='<div class="ant-form-item-explain ant-form-item-explain-error"><div role="alert">'+'مدة الإجازة: '+alerta+'</div></div>';
          }
        }
        const changeTask=(e)=>{
          setTaskType(e);
        }
        const changeTRange=(all,date)=>{        
          console.log(date);
          setDrange(date);
        }
        const changeDes=(e)=>{
          setDes(e.target.value);
          console.log(e.target.value);
        }
        const deleteAll=()=>{
          
         for(var i=0;i<checkedRList.length;i++){
            deleteTask(checkedRList[i]);
         }
         setCheckedRList([]);       
        }
        const submitTasks=()=>{
          setSaving(true);
          var values = {
            task_type: taskType,
            start: drange[0],
            end: drange[1],
            desc: des,
            users:checkedList,
          };
          axios.post(Env.HOST_SERVER_NAME + `all-tasks`,values)
          .then(function (response) {
           console.log(response);
           
           // if (response.statusText == "OK") {
              setSaving(false);
              setIsAModalVisible(false);
              openNotification('bottomLeft',<span> 'تم إضافة الإجازات/المهام الخاصة بـ ' <span style={{fontWeight:'bold'}}>{'مجموعة الموظفين'} </span> ' بنجاح.' </span>);
            

          })
          .catch(function (error) {
            setSaving(false);
            setIsAModalVisible(false);
            notification.error({
              message: <span>{'فشل ترحيل الإجازة الجماعية!'}</span>,
              placement:'bottomLeft',
              duration:10,
            });
            
          });

          
        }
return (
    <Card>
    <div className='discountHeader' >
      <div className='discountRange'  >
        <div style={{marginLeft:'10px'}}><span>اختر فترة : </span>
          <RangePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760}  onCalendarChange={changeRange} />
        </div>
      </div>
    <div className='discountBtn'>     
      <Button  onClick={function(){ addATasks();}} type='primary'><MenuUnfoldOutlined /> إجازة جماعية</Button>
      <Button style={{marginLeft:'5px',marginRight:'5px',border:'none',backgroundColor:'#FAA61A',color:'#fff'}} onClick={function(){ addTasks();}} ><FormOutlined /> إجازة موظف</Button>
      <Button style={{display:'block',marginLeft:'5px',marginBottom:'10px',backgroundColor:"#0972B6",borderColor:"#0972B6",border:'none'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
      <Button style={{display:'block',marginLeft:'5px',marginBottom:'10px',backgroundColor:"#f00",borderColor:"#f00",border:'none'}} onClick={function(){deleteAll()}} type='primary'><DeleteOutlined /></Button>
    </div>   
    </div>
    <Modal centered footer={[]} width={1000} style={{direction:'rtl'}}  title="إضافة إجازة جماعية" visible={isAModalVisible} onCancel={function(){setIsAModalVisible(false)}}>
    <Form  form={form} name="dynamic_form_nest_item"  autoComplete="on" >
              <div className='groupTasks'>
              <Form.Item>
                    <Form.Item
                      label="نوع الإجازة"
                      name={'task_type'}
                      rules={[{ required: true, message: 'ادخل نوع الإجازة' }]}
                    >
                      <Select style={{ width: 130 }} showSearch  optionFilterProp="children"
                         notFoundContent={<Spin style={{textAlign:'center'}}></Spin>}
                         onSelect={changeTask}
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
                </Form.Item>
                <Form.Item
                  className={'range1'}
                  label="الفترة"
                  name={'date_range'}
                  rules={[{ required: true, message: 'لم تقم بإدخال فترة الطلب!' }]}
                >
                 <RangePicker needConfirm={false} 
    inputReadOnly={window.innerWidth <= 760}
                      showTime={{ format: 'HH:mm' }}
                      onCalendarChange={function(all,date){checkPeriod(all,date,1)}}
                      onChange={function(all,date){changeTRange(all,date)}}
                      format="YYYY-MM-DD HH:mm"
                  />

                </Form.Item>
                <Form.Item
                  label="التفاصيل"
                  name={'description'}
                >
                 <TextArea onChange={changeDes} rows={1}></TextArea>
                </Form.Item>
              </div>
              <Checkbox value={checkAll} indeterminate={indeterminate} onChange={onCheckAllChange}  checked={checkAll}>
               تحديد الكل
             </Checkbox>
             <Divider/>
          <CheckboxGroup name={'users'} className='usersNames' options={getNameOptions()} value={checkedList} onChange={onChange} />

      <Form.Item  style={{float:'left'}}>
      <Button style={{marginLeft:'10px'}} onClick={function(){setIsAModalVisible(false)}}>
          إلغاء
        </Button>
        <Button loading={saving} type="primary" onClick={submitTasks}>        
          حفظ
        </Button>
      </Form.Item>
    </Form>
    </Modal>
    <Modal centered footer={[]} width={1000} style={{direction:'rtl'}}  title="إضافة إجازات موظف" visible={isModalVisible} onCancel={handleCancel}>
    <Form  form={form} name="dynamic_form_nest_item"  autoComplete="on" onFinish={function(record){onFinish(record);}}>
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
      <Form.List name="tasks">
        {(fields, { add, remove }) => (
          <>
            {fields.map(field => (
              <Space key={field.key} align="baseline">
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.user_id !== curValues.user_id || prevValues.tasks !== curValues.tasks
                  }
                >
                  {() => (
                    <Form.Item
                      {...field}
                      label="نوع الإجازة"
                      name={[field.name, 'task_type']}
                      rules={[{ required: true, message: 'ادخل نوع الإجازة' }]}
                    >
                      <Select disabled={!form.getFieldValue('user_id')} style={{ width: 130 }} showSearch  optionFilterProp="children"
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
                  )}
                </Form.Item>
                <Form.Item
                  className={'range'+field.key}
                  {...field}
                  label="الفترة"
                  name={[field.name, 'date_range']}
                  rules={[{ required: true, message: 'لم تقم بإدخال فترة الطلب!' }]}                 
                >
                 <RangePicker needConfirm={false} 
    inputReadOnly={window.innerWidth <= 760}
                      showTime={{ format: 'HH:mm' }}
                      onCalendarChange={function(all,date){checkPeriod(all,date,field.key)}}
                      format="YYYY-MM-DD HH:mm"
                    />

                </Form.Item>
                <Form.Item
                  {...field}
                  label="التفاصيل"
                  name={[field.name, 'description']}
                >
                 <TextArea rows={1}></TextArea>
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(field.name)} />
              </Space>
            ))}

            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة إجازة
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
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
    <Table loading={load} columns={columns} scroll={{x: '1000px' }} dataSource={data}  onChange={handleChange}/>
    </Card>
);

 }