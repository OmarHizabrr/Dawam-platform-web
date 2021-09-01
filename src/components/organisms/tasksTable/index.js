/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Env} from '../../../styles';
import { useCookies,CookiesProvider  } from 'react-cookie';
import './style.css';
import { DatePicker, Space,Form,Table, Button,Modal,Card,Radio,Input,Select,Progress,Tag,Typography } from 'antd';
import {CheckCircleOutlined,MinusCircleOutlined,CloseCircleOutlined,PrinterOutlined,FormOutlined} from '@ant-design/icons';
const {Text}=Typography;
const data = [
    {
      key: '1',
      name: 'مهمة',
      age: '12-01-2020 07:30',
      address: '12-01-2020 02:00',
      leaveTime:'نزول تصوير ميداني',
      period:'08:30',
      tag:['success'],
      netDawam:'معتمدة',
    },
    {
      key: '2',
      name: 'إجازة',
      age: '12-01-2020 08:30',
      address: '20-01-2020 02:00',
      leaveTime:'سنوية',
      period:'20:30',
      tag:['waiting'],
      netDawam:'مرفوضة من الإدارة',

    },
    {
      key: '3',
      name: 'مهمة',
      age: '12-01-2020 07:30',
      address: '12-01-2020 07:30',
      leaveTime:'توزيع سلال غذائية',
      period:'3:22',
      tag:['faild'],
      netDawam:'مرفوضة من الشؤون',
    },
    {
      key: '4',
      name: 'إجازة',
      age: '12-01-2020 07:30',
      address: '12-01-2020 07:30',
      leaveTime:'دراسية',
      tag:['success'],
      period:'12:30',
      netDawam:'بانتظار الأمين العام',
    },
  ];

  const { RangePicker } = DatePicker;
  const {TextArea}=Input;
  const {Option}=Select;
export default function tasksTable() {
  
  const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
  const [filteredInfo,setFilteredInfo]=useState({});
  const [sortedInfo,setSortedInfo]=useState({});
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [startVac,setStartVac]=useState("");
  const [type,setType]=useState(null);
  const [endVac,setEndVac]=useState("");
  const [notes,setNotes]=useState("");
  const [tstypes,setTstypes]=useState([{"id":"1","name":"task 1"},{"id":"2","name":"task 2"}]);
  useEffect(() => {
    axios.get(Env.HOST_SERVER_NAME+'get-tasks-types/')
    .then(response => {
      setTstypes(response.data);
    });
  
  });

      const download_csv=(csv, filename)=> {
        var csvFile;
        var downloadLink;
    
        // CSV FILE
        csvFile = new Blob([csv], {type: "text/csv"});
    
        // Download link
        downloadLink = document.createElement("a");
    
        // File name
        downloadLink.download = filename;
    
        // We have to create a link to the file
        downloadLink.href = window.URL.createObjectURL(csvFile);
    
        // Make sure that the link is not displayed
        downloadLink.style.display = "none";
    
        // Add the link to your DOM
        document.body.appendChild(downloadLink);
    
        // Lanzamos
        downloadLink.click();
    }
    
    const export_table_to_csv=()=> {
      // var html=document.querySelector("table").outerHTML;
      
      var csv = [];
      var rows = document.querySelectorAll("table tr");
      
        for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");
        
            for (var j = 0; j < cols.length; j++) 
                row.push(cols[j].innerText);
            
        csv.push(row.join(","));		
      }
    
        // Download CSV
        var csvFile;
        var downloadLink;
    
        // CSV FILE
        csvFile = new Blob([csv], {type: "text/csv"});
    
        // Download link
        downloadLink = document.createElement("a");
    
        // File name
        downloadLink.download = "table.csv";
    
        // We have to create a link to the file
        downloadLink.href = window.URL.createObjectURL(csvFile);
    
        // Make sure that the link is not displayed
        downloadLink.style.display = "none";
    
        // Add the link to your DOM
        document.body.appendChild(downloadLink);
    
        // Lanzamos
        downloadLink.click();
    }
    
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
          dataIndex: 'age',
          key: 'age',
          sorter: (a, b) => a.age - b.age,
          sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'إلى',
          dataIndex: 'address',
          key: 'address',
          filters: [
            { text: 'London', value: 'London' },
            { text: 'New York', value: 'New York' },
          ],
          filteredValue: filteredInfo.address || null,
          onFilter: (value, record) => record.address.includes(value),
          sorter: (a, b) => a.address.length - b.address.length,
          sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
          ellipsis: true,
        },     
         {
          title: 'التفاصيل',
          dataIndex: 'leaveTime',
          key: 'leaveTime',
          filters: [
            { text: 'London', value: 'London' },
            { text: 'New York', value: 'New York' },
          ],
          filteredValue: filteredInfo.leaveTime || null,
          onFilter: (value, record) => record.leaveTime.includes(value),
          sorter: (a, b) => a.leaveTime.length - b.leaveTime.length,
          sortOrder: sortedInfo.columnKey === 'leaveTime' && sortedInfo.order,
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
          key: 'tag',
          dataIndex: 'tag',
          render: tags => (
            <>
              {tags.map(tag => {
                if (tag == 'waiting') {
                  return (
                  <MinusCircleOutlined style={{color:'#FFCA2C',fontSize:'20px'}}/>
                );
                }
                else if (tag == 'faild') {
                  return (
                  <CloseCircleOutlined style={{color:'#BB2D3B',fontSize:'20px'}} />
                );
                }
                else{
                  return (
                  <CheckCircleOutlined style={{color:'#007236',fontSize:'20px'}}/>
                );
                }
              })}
            </>
          ),
          filters: [
            { text: 'معتمدة', value: 'success' },
            { text: 'في الانتظار', value: 'waiting' },
            { text: 'مرفوضة', value: 'faild' },
          ],
          filteredValue: filteredInfo.tag || null,
          onFilter: (value, record) => record.tag.includes(value),
          sorter: (a, b) => a.tag.length - b.tag.length,
          sortOrder: sortedInfo.columnKey === 'tag' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'ملاحظات',
          dataIndex: 'netDawam',
          key: 'netDawam',
          filters: [
            { text: 'London', value: 'London' },
            { text: 'New York', value: 'New York' },
          ],
          filteredValue: filteredInfo.netDawam || null,
          onFilter: (value, record) => record.netDawam.includes(value),
          sorter: (a, b) => a.netDawam.length - b.netDawam.length,
          sortOrder: sortedInfo.columnKey === 'netDawam' && sortedInfo.order,
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
    <Button onClick={export_table_to_csv}><PrinterOutlined /> طباعة الجدول </Button>
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