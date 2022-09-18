/* eslint-disable react-hooks/rules-of-hooks */
import React,{ useState, useEffect }  from 'react';
import './style.css';
import { DatePicker,Table, Button,Card,Input,Select,Typography,Form, Space,Spin,notification} from 'antd';
import {DeleteOutlined,MinusCircleOutlined, PlusOutlined ,FormOutlined,ExportOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import excel from 'xlsx';

import {Env} from './../../../styles';
import Modal from 'antd/lib/modal/Modal';
const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
 
export default function violationsRecords (){

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [load,setLoad]=useState(true);

  const [isTextInput,setIsTextInput]=useState(false);
  const [selectedIndex,setSelectedIndex]=useState(null);
  const [amountValue,setAmountValue]=useState(null);
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [tstypes,setTstypes]=useState([]);
  const [saving,setSaving]=useState(false);
  const [selectedName,setSelectedName]=useState(null);
  const [viosTypes,setViosTypes]=useState([]);
  const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
  const [end,setEnd]=useState(new Date().toISOString().slice(0, 10));
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
      title: 'الإدارة',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'London', value: 'London' },
        { text: 'New York', value: 'New York' },
      ],
      filteredValue: filteredInfo.category || null,
      onFilter: (value, record) => record.category.includes(value),
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: sortedInfo.columnKey === 'category' && sortedInfo.order,
      ellipsis: true,
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
      title: 'ملاحظات',
      dataIndex: 'note',
      key: 'note',
      sorter: (a, b) => a.note.length - b.note.length,
      sortOrder: sortedInfo.columnKey === 'note' && sortedInfo.order,
      ellipsis: false,
    },   
   /* {
      title: "",
      render: (vid, record, index) => (
        <Button
          onClick={function () {deleteDebt(record);}}
          style={{ backgroundColor: "#ff0000", borderColor: "#ff0000" }}
          type="primary"
          shape="round"
          icon={<DeleteOutlined />}
        ></Button>
      ),
    } */
  ];
    useEffect(() => {
     
          axios.get(Env.HOST_SERVER_NAME+'get-emp-names')
          .then(response => {
            setTstypes(response.data);
          }).catch(function (error) {
            console.log(error);
          });
          axios.get(Env.HOST_SERVER_NAME+'get-violations-types')
            .then(response => {
                setViosTypes(response.data);
            }).catch(function (error) {
            console.log(error);            
          });
    axios.get(Env.HOST_SERVER_NAME+'get-all-violations/'+start+'/'+end)
    .then(response => {
      setData(response.data);
      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });
   },[start,end]); 
      const handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        this.setState({
          filteredInfo: filters,
          sortedInfo: sorter,
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
      const openNotification = (placement,user_name) => {
        notification.success({
          message: <span> 'تم إضافة المخالفات/الإنذارات الخاصة بـ ' <span style={{fontWeight:'bold'}}>{user_name} </span> ' بنجاح.' </span>,
          placement,
        });
      };
      const addTasks = () => {
          setIsModalVisible(true);
      };
      const deleteDebt = (record) => {

      };    
      const handleCancel = () => {
        setIsModalVisible(false);
      }; 
      const [form] = Form.useForm();
      
      const onFinish = values => {
        setSaving(true); 
        console.log(values);  
        axios.post(Env.HOST_SERVER_NAME+'add-violations',values)
        .then(response => {
           setSaving(false);
           openNotification('bottomLeft',selectedName);
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
return (
    <Card>
    <div className='discountHeader' style={{marginBottom:'20px'}}>
      <div className='discountRange' >
        <div style={{marginLeft:'10px'}}><span>اختر فترة : </span>
            <RangePicker  onCalendarChange={changeRange} />
        </div>
      </div>
      <div className='discountBtn' style={{display:'flex',flex:1,flexDirection:'row',justifyContent:'flex-end'}}>     

        <Button style={{display:'block',marginLeft:'5px'}} onClick={function(){ addTasks();}} type='primary'><FormOutlined />إضافة مخالفة لموظف</Button>
        <Button style={{display:'block',marginLeft:'5px',marginBottom:'10px',backgroundColor:'#FAA61A',border:'none'}} onClick={function(){exportToExcel('xlsx')}} type='primary'><ExportOutlined /></Button>
        <Button style={{display:'block',backgroundColor:"#0972B6",borderColor:"#0972B6"}} onClick={function(){printReport()}} type='primary'><PrinterOutlined /></Button>
      </div>   
    </div>
    <Modal footer={[]} width={1000} style={{direction:'rtl'}}  title="إضافة مخالفات موظف" visible={isModalVisible} onCancel={handleCancel}>
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
      <Form.List name="vios">
        {(fields, { add, remove }) => (
          <>
            {fields.map(field => (
              <Space key={field.key} align="baseline">
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.user_id !== curValues.user_id || prevValues.vios !== curValues.vios
                  }
                >
                  {() => (
                    <Form.Item
                      {...field}
                      label="نوع المخالفة"
                      name={[field.name, 'vio_type']}
                      rules={[{ required: true, message: 'ادخل نوع المخالفة' }]}
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
                        {viosTypes.map(item => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </Form.Item>
                <Form.Item
                  {...field}
                  label="التاريخ"
                  name={[field.name, 'vio_date']}
                  rules={[{ required: true, message: 'لم تقم بإدخال تاريخ المخالفة!' }]}
                >
                   <DatePicker
                      format="YYYY-MM-DD"
                    />
                </Form.Item>
                <Form.Item
                  {...field}
                  label="المبلغ"
                  name={[field.name, 'discount']}
                >
                   <Input defaultValue={0}/>
                </Form.Item>
                <Form.Item
                  {...field}
                  label="ملاحظات"
                  name={[field.name, 'note']}
                >
                   <TextArea/>
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(field.name)} />
              </Space>
            ))}

            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة مخالفة/إنذار
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
    <Table loading={load} columns={columns} scroll={{x: '1000px' }} dataSource={data} onChange={function(){handleChange();}} />
    </Card>
);

 }