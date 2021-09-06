/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import axios from 'axios';
import {Env} from '../../../styles';
import { useCookies,CookiesProvider  } from 'react-cookie';
import './style.css';
import { DatePicker, Space,Form,Table, Button,Modal,Card,Radio,Input,Select,Progress,Tag,Typography } from 'antd';
import {CheckCircleOutlined,MinusCircleOutlined,CloseCircleOutlined,ExportOutlined,FormOutlined} from '@ant-design/icons';
const {Text}=Typography;

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;

const exportToExcel=(type,fn,dl)=>{

    var elt = document.getElementsByTagName('table')[0];
    if(elt){
     var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
     return dl ?
     excel.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
     excel.writeFile(wb, fn || ('الإجازات والمهام.' + (type || 'xlsx')));  
    }
} 
export default function tasksTable() {
  
  const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
  const [filteredInfo,setFilteredInfo]=useState({});
  const [sortedInfo,setSortedInfo]=useState({});
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [startVac,setStartVac]=useState("");
  const [type,setType]=useState(null);
  const [endVac,setEndVac]=useState("");
  const [notes,setNotes]=useState("");
  const [tstypes,setTstypes]=useState([]);
  const [data,setData]=useState([]);
  const user=cookies.user;
  useEffect(() => {
    axios.get(Env.HOST_SERVER_NAME+'get-tasks-types')
    .then(response => {
      setTstypes(response.data);
    });
    axios.get(Env.HOST_SERVER_NAME+'get-tasks/'+user.user_id)
    .then(response => {
      setData(response.data);
    });
  });

    const handleTypeChange=(e)=>{
      setType(e);
    }
    const  handleChange = (pagination, filters, sorter) => {
 
          setFilteredInfo(filters);
          setSortedInfo(sorter);

      };
    const  onRangeChange=(all,dates)=>{ 
        setStartVac(dates[0]);  
        setEndVac(dates[1]);        
      }
     const  showModal = () => {
          setIsModalVisible(true);
      };  
     const handleOk = () => {
        var values={
          "user_id": cookies.user.user_id,
          "startDate":startVac,
          "endDate":endVac,
          "type":type,
          "note":notes
        }
        axios.post(Env.HOST_SERVER_NAME+`add-task`,values)
          .then(function (response) {
            if(response.statusText=="OK"){
              alert('تم إرسال الإجازة بنجاح')
            } 
          })
       .catch(function (error) {
       console.log(error);
       });
          setIsModalVisible(false);
      
        
      }; 
    const  notesChange=(e)=>{
       setNotes(e.target.value);
        
      } 

      const columns = [
        {
          title: 'النوع',
          dataIndex: 'name',
          key: 'name',
          filters: [
            { text: 'Joe', value: 'Joe' },
            { text: 'Jim', value: 'Jim' },
          ],
          filteredValue: filteredInfo.name || null,
          onFilter: (value, record) => record.name.includes(value),
          sorter: (a, b) => a.name.length - b.name.length,
          sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'من',
          dataIndex: 'date_from',
          key: 'date_from',
          sorter: (a, b) => a.date_from - b.date_from,
          sortOrder: sortedInfo.columnKey === 'date_from' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'إلى',
          dataIndex: 'date_to',
          key: 'date_to',
          filters: [
            { text: 'London', value: 'London' },
            { text: 'New York', value: 'New York' },
          ],
          filteredValue: filteredInfo.date_to || null,
          onFilter: (value, record) => record.date_to.includes(value),
          sorter: (a, b) => a.date_to.length - b.date_to.length,
          sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
          ellipsis: true,
        },     
         {
          title: 'التفاصيل',
          dataIndex: 'description',
          key: 'description',
          filters: [
            { text: 'London', value: 'London' },
            { text: 'New York', value: 'New York' },
          ],
          filteredValue: filteredInfo.description || null,
          onFilter: (value, record) => record.description.includes(value),
          sorter: (a, b) => a.description.length - b.description.length,
          sortOrder: sortedInfo.columnKey === 'description' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'مدة المهمة/الإجازة',
          dataIndex: 'period',
          key: 'period',
          filters: [
            { text: 'London', value: 'London' },
            { text: 'New York', value: 'New York' },
          ],
          filteredValue: filteredInfo.period || null,
          onFilter: (value, record) => record.period.includes(value),
          sorter: (a, b) => a.period.length - b.period.length,
          sortOrder: sortedInfo.columnKey === 'period' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'الحالة',
          dataIndex: 'status',
          key: 'status',
          filters: [
            { text: 'معتمدة', value: 'معتمدة' },
            { text: 'في الانتظار', value: 'في الانتظار' },
            { text: 'مرفوضة', value: 'مرفوضة' },
          ],
          filteredValue: filteredInfo.status || null,
          onFilter: (value, record) => record.status.includes(value),
          sorter: (a, b) => a.status.length - b.status.length,
          sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
          ellipsis: true,
        },
  
      ];
      const handleCancel=()=>{
        setIsModalVisible(false);
      }
return (
    <Card>
    <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginBottom:'20px'}}>
    <div style={{display:'flex',flexDirection:'row'}}>
    <span><Progress type="circle" percent={30} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>رصيد السنوية</div>
    <div> المتبقي : 30 يوم</div>
    </span>
    </div>
    <div style={{display:'flex',flexDirection:'row'}}>
    <span><Progress type="circle" percent={100} width={80} style={{marginLeft:'5px',display:'inline-block'}} /></span>
    <span style={{display:'flex',flexDirection:'column',paddingTop:'10px',marginRight:'5px'}}>
    <div style={{marginBottom:'5px'}}>رصيد الدراسية</div>
    <div> المتبقي : 0 يوم</div>
    </span>
    </div>
    <div style={{display:'flex',flexDirection:'column'}}>
    <Button style={{float:'left',marginBottom:'30px'}} onClick={showModal} type='primary'><FormOutlined /> تقديم إجازة </Button>
    <Button onClick={function(){exportToExcel('xlsx')}}><ExportOutlined /> تصدير كملف اكسل </Button>
    </div>
    </div>
    <Modal title="تقديم إجازة / مهمة" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
    <Form>
    <Form.Item label="فترة الإجازة / المهمة :">
    <Space>
    <RangePicker
      showTime={{ format: 'HH:mm' }}
      format="YYYY-MM-DD HH:mm"
      onChange={onRangeChange}
    />
  </Space>
    </Form.Item>
    <Form.Item label="نوع الإجازة">
    <Select
    showSearch
    style={{ width: 200 }}
    onSelect={handleTypeChange}
    options={tstypes}
    placeholder="ابحث لاختيار إجازة"
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    filterSort={(optionA, optionB) =>
      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
    }
  >
  </Select>
    </Form.Item>
    <Form.Item label="تفاصيل ">
    <TextArea row={3} onChange={notesChange}></TextArea>
    </Form.Item>
    </Form>
    </Modal>
    <Table columns={columns}  dataSource={data} onChange={handleChange} />
    </Card>
);
 }
