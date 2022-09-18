import React, { useState,useEffect } from 'react';
import ReactApexChart from "react-apexcharts";
import './style.css';
import {Env} from '../../styles';
import {useLocation} from 'react-router-dom';
import { useCookies,CookiesProvider  } from 'react-cookie';
import moment from 'moment';

import { Typography ,Layout,Breadcrumb,Card,Row,Col,Avatar,Badge,Modal,Tabs,Radio,Collapse,InputNumber,Form,Upload,Button,Rate,Input,Select,DatePicker,Space} from 'antd';
import {
    UserOutlined,
    ClusterOutlined,
    TagsOutlined,
    InsertRowAboveOutlined,
    CarOutlined,
    UnorderedListOutlined,
    ApartmentOutlined,
    LineChartOutlined,
    SnippetsOutlined,
    EditOutlined,
    PlusOutlined,UploadOutlined ,MoreOutlined,MinusCircleOutlined,FileOutlined
  } from '@ant-design/icons';
  import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
  } from "react-router-dom";
  import axios from 'axios';

import SummaryData from '../../components/organisms/summaryData';
import GeneralTable from '../../components/organisms/generalTable';
import TransferTable from '../../components/organisms/transferTable';
import AttendanceTable from '../../components/organisms/attendanceTable';
import TasksTable from '../../components/organisms/tasksTable';
import tasksRequests from '../../components/organisms/tasksRequests';
import alertsTable from '../../components/organisms/alertsTable';
import DeptsTable from '../../components/organisms/deptsTable';
import {
  Link,
  useRouteMatch
} from "react-router-dom";
import Cookies from 'universal-cookie';
const { Content } = Layout;
const { TabPane } = Tabs;
const { Text } = Typography;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;


export default function Profile(props){ 
  let { path, url } = useRouteMatch(); 
  const [cookies, setCookie, removeCookie]=useCookies(["userId"]);
  const [type,setType]=useState(null);
  const location = useLocation();
  const [isVisibleModal,setIsVisibleModal]=useState(false);
  const [load,setLoad]=useState(true);

  const [data,setData]=useState([]);

  const [categories,setCategories]=useState([]);
  const [durations,setDurations]=useState([]);
  const [types,setTypes]=useState([]);

  const [phones,setPhones]=useState([]);
  const [qualifications,setQualifications]=useState([]);
  const [preworks,setPreworks]=useState([]);
  const [attachments,setAttachments]=useState([]);
  const [userFormDisable,setUserFormDisable]=useState(true);
  const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 31)).toISOString().slice(0,10));
  const [end,setEnd]=useState(new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0,10));
  const [star,setStar]=useState(0); 
  const [spiderData,setSpiderData]=useState([]);

  const [modalLoad,setModalLoad]=useState(false);
  function callback(key) {
    // console.log(key);
   }
   const  UploadProps = {
    showUploadList: {
      showRemoveIcon: true,
      showDownloadIcon: true,
      downloadIcon: 'Download',
    },
  };
  //console.log(cookies.user);
  let  user=props.userData;
 // let  user=location.userData;
 if(location.userData != null) 
      user=location.userData;
const openShowUser=()=>{
        // console.log(Object.keys(user).map((key) => [Number(key), user[key]]));
        var user=data;
        var birth=user.birth_date;
        var assign=user.assignment_date;
         userform.setFieldsValue(user);
         userform.setFieldsValue({'birth_date':moment(birth, 'YYYY-MM-DD')});
         userform.setFieldsValue({'assignment_date':moment( assign, 'YYYY-MM-DD')});
         userform.setFieldsValue({'password':null});
         setIsVisibleModal(true);
       
         var conts=phones;
         conts=conts.filter(function (e) { return e.user_id == user.id; });
         userform.setFieldsValue({'contacts':conts});
       
         var quals=qualifications;
         quals=quals.filter(function (e) { return e.user_id == user.id; });
       
         quals.forEach(element => {
           element.qual_year=moment(element.qual_year, 'YYYY');
         });
         userform.setFieldsValue({'qualifications':quals});
         //setQualifications(quals);
       
         var pworks=preworks;
         pworks=pworks.filter(function (e) { return e.user_id == user.id; });
         pworks.forEach(element => {
           element.work_period=[moment(element.date_from, 'YYYY'),moment(element.date_to, 'YYYY')]
         });
         userform.setFieldsValue({'preworks':pworks});
         //setPreworks(pworks);
       
         //------------------------------------------
         var attachs=attachments;
         attachs=attachs.filter(function (e) { return e.user_id == user.id; });
         userform.setFieldsValue({'attachments':attachs});
         setPreworks(pworks); 
         //-----------------------------       
       }
  useEffect(() => {
    axios.get(Env.HOST_SERVER_NAME+'salary-info/'+user.user_id+'/'+start+'/'+end)
    .then(response => {   
 
      setStar(1-((parseFloat(response.data.lists[0].lateTimePrice || 0)+parseInt(Math.round(((response.data.count[0].count-(response.data.lists[0]['attendanceDays'] || 0))*( response.data.lists[0].salary/response.data.count[0].count)))))/(response.data.lists[0].salary )));
      setSpiderData([Math.round(response.data.att_count[0].att_count/response.data.att_count[0].count*100) || 0,Math.round(response.data.id_count[0].id_count/response.data.id_count[0].count*100) || 0,Math.round(response.data.leave_count[0].leave_count/response.data.leave_count[0].count*100) || 0,Math.round(response.data.lists[0].attendanceDays/response.data.count[0].count*100) || 0,Math.round(response.data.vac_count[0].late_vacs/response.data.vac_count[0].count*100) || 0]);

    }).catch(function (error) {
      console.log(error);
    });

    axios.get(Env.HOST_SERVER_NAME+'users-info/')
    .then(response => {
      setCategories(response.data['categroies']);
      setDurations(response.data['durations']);
      setTypes(response.data['types']);
    }).catch(function (error) {
      console.log(error);
    });
    axios.get(Env.HOST_SERVER_NAME+'user-data/'+user.id)
    .then(response => {
      setData(response.data['user']);
      setPhones(response.data['phones']);
      setQualifications(response.data['qualifications']);
      setPreworks(response.data['preworks']);
      setAttachments(response.data['attachments']);
      setLoad(false);
    }).catch(function (error) {
      console.log(error);
    });
    
    axios.get(Env.HOST_SERVER_NAME+'user-type/'+props.userData.id)
      .then(response => {
        setType(response.data);
      }).catch(function (error) {
        console.log(error);
      });
    

  },[]);
  const config = {
    options: {
      chart: {
        dropShadow: {
          enabled: true,
          blur: 1,
          left: 1,
          top: 1
        }
      },dataLabels: {
        enabled: true,
        background: {
          enabled: true,
          borderRadius:2,
        }
      },xaxis: {
        categories: ['الحضور المبكر', 'الانضباط', 'الانصراف', 'نسبة أيام الحضور', 'احترام النظام'],
        labels: {
          show: true,
          style: {
            colors: ["#808080"],
            fontSize: "11px",
            fontFamily: 'jannatR'
          }
        }
      },
      yaxis: {
        min:0,
        max:100,
        tickAmount:5,
      },
      colors: ["#0972B6", "#002612"],
      stroke: {
        width: 1
      },
      fill: {
        opacity: 0.5
      },
      markers: {
        size: 5
      }
    },
    series: [
      {
        name: "النسبة",
        data: spiderData,
      },
    ],
  };
  const [filter,setFilter]=useState(config.series); 
  const  handleSizeChange = e => {
     setFilter([{name:'أسامة جليل',data:[90,60,70,80]}]);
   }

const requestPane=()=>{
  if(type!=3){
  return(    <TabPane
    tab={
      <Link to={`${url}/tasks-requests`}>
      <span>
      <SnippetsOutlined />
     المراجعات 
      </span>
      </Link>
    }
    key="6"
  >
  </TabPane>);
  }
}
const showModal = () => {
  setIsVisibleModal(true);
};

const handleOk = () => {
  setIsVisibleModal(false);
};

const handleCancel = () => {
  setIsVisibleModal(false);
};
const onFinish=()=>{
}

const [userform] = Form.useForm();

return (
<Layout className="site-layout">
  <Card
    className="site-layout-card"
    style={{
      margin: '10px 16px',
      padding: 0,
      height:'auto',
    }}
  >
 <Row className='userProfile'>
 <Modal okButtonProps={{ disabled:  true  }} confirmLoading={modalLoad} centered={true} className='emp-modal' width={1200} title="بيانات الموظف" visible={isVisibleModal}  onOk={function(){setModalLoad(true);onFinish();}} onCancel={function(){userform.resetFields();setIsVisibleModal(false);}}>
 <Form   form={userform} onFinish={onFinish}>
      <Row style={{backgroundColor:'#F6F6F6'}}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8} className='personal-data' span={8} style={{padding:'20px'}}>
        <div style={{backgroundColor:'#fff',borderRadius:'10px',display:'flex',flexDirection:'column',padding:'10px 20px'}}>
        <Avatar
           size={{ xs: 60, sm: 60, md: 80, lg: 100, xl: 100, xxl: 100 }}
          src={user?Env.HOST_SERVER_STORAGE+user.avatar:""}
           style={{display:'block',margin:'10px 10px 20px',alignSelf:'center'}}
        />
        <Text style={{fontWeight:'700',marginBottom:'10px'}}>{'البيانات الشخصية'}</Text>
        <Form.Item
        name="id"
        hidden={true}
        style={{display:"none"}}
        >
          <Input/>
       </Form.Item>
       
        <Form.Item
        label="الاسم رباعيًا"
        name="name"
      
        >
          <Input disabled={userFormDisable} />
       </Form.Item>
       <Form.Item name={'sex'} label="الجنس">
        <Select 
        disabled={userFormDisable}
        options={types.filter(function(e){return e.parent==1;})}
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
       <Form.Item name={'birth_date'} label="تاريخ الميلاد">
        <DatePicker disabled={userFormDisable}  format="YYYY-MM-DD"  style={{width:'100%'}} />
      </Form.Item>
      <Form.Item name={'birth_place'} label="مكان الميلاد">
        <Input disabled={userFormDisable}    style={{width:'100%'}} />
      </Form.Item>
      <Form.Item name={'marital_status'} label="الحالة الاجتماعية">
        <Select 
        options={types.filter(function(e){return e.parent==2;})}
        optionFilterProp="children"
       filterOption={(input, option) =>
         option.props.children?.indexOf(input) >= 0 ||
         option.props.label?.indexOf(input) >= 0
       }
       filterSort={(optionA, optionB) =>
         optionA.props?.children?.localeCompare(optionB.props.children)
       }
        disabled={userFormDisable} >

        </Select>
      </Form.Item>
      <Form.Item name={'children_no'}  label="عدد الأولاد">
        <InputNumber disabled={userFormDisable} style={{width:'100%'}} />
      </Form.Item>
      <Form.Item
        label="رقم الهوية"
        name="id_no"
        >
          <Input disabled={userFormDisable} />
       </Form.Item>
       <Form.Item name={'id_type'} label="نوع الهوية">
        <Select 
        options={types.filter(function(e){return e.parent==3;})}
        optionFilterProp="children"
       filterOption={(input, option) =>
         option.props.children?.indexOf(input) >= 0 ||
         option.props.label?.indexOf(input) >= 0
       }
       filterSort={(optionA, optionB) =>
         optionA.props?.children?.localeCompare(optionB.props.children)
       }
        disabled={userFormDisable}>

        </Select>
      </Form.Item>
        </div>
        </Col>
        <Col xs={24} sm={24} md={16} lg={16} xl={16} span={16} style={{padding:'20px 0px 20px 20px'}}>
        <div style={{backgroundColor:'#fff',borderRadius:'10px',display:'flex',flexDirection:'column',padding:'10px 20px'}}>
        <Collapse defaultActiveKey={['1','2','3','4','5','6']} onChange={callback}>
          <Panel header="البيانات الوظيفة" key="1">
            <div>
              <div style={{display:'flex',flexDirection:'row'}}>
              <Form.Item style={{marginLeft:'5px',flex:2}} label="الوظيفة" name="job">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{marginLeft:'5px',flex:2}} label="الدرجة" name="level">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item  style={{marginLeft:'5px',flex:3}} label="الإدارة" name="category_id">
                <Select 
                disabled={userFormDisable}
                options={categories}
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
              </div>
              <div style={{display:'flex',flexDirection:'row'}}>
              <Form.Item style={{flex:3,marginLeft:'5px'}} label="تاريخ الانضمام" name="assignment_date">
                <DatePicker disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{flex:3}} label="نوع الدوام" name="durationtype_id">
                <Select
                 disabled={userFormDisable}
                 options={durations}
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
              <Form.Item style={{flex:2}} label="حالة التوظيف" name="status">
                <Select 
                options={types.filter(function(e){return e.parent==5;})}
                optionFilterProp="children"
               filterOption={(input, option) =>
                 option.props.children?.indexOf(input) >= 0 ||
                 option.props.label?.indexOf(input) >= 0
               }
               filterSort={(optionA, optionB) =>
                 optionA.props?.children?.localeCompare(optionB.props.children)
               }
                disabled={userFormDisable}>
                </Select>
              </Form.Item>
              </div>
              <div style={{display:'flex',flexDirection:'row'}}>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="الراتب" name="salary">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item  style={{flex:1}} label="عملة الراتب" name="salary_currency">
                <Select 
                options={types.filter(function(e){return e.parent==4;})}
                optionFilterProp="children"
               filterOption={(input, option) =>
                 option.props.children?.indexOf(input) >= 0 ||
                 option.props.label?.indexOf(input) >= 0
               }
               filterSort={(optionA, optionB) =>
                 optionA.props?.children?.localeCompare(optionB.props.children)
               }
                disabled={userFormDisable}>
                </Select>
              </Form.Item>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="بدل المواصلات" name="transfer_value">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="مبلغ التكافل" name="symbiosis">
                <Input disabled={userFormDisable} />
              </Form.Item>

              </div>
            </div>
          </Panel>
          <Panel header="معلومات التواصل" key="2">
           <div>
             <div style={{display:'flex',flexDirection:'row'}}>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="عنوان السكن" name="address">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="البريد الإلكتروني" name="email">
                <Input disabled={userFormDisable} />
              </Form.Item>
              </div>
              <Form.List name="contacts">
        {(fields, { add, remove }) => {
          //fields=[{"key":"1","name":"re"},{"key":"2","name":"re2"}];
          return <>
            {
            fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'id']}
                  style={{display:'none'}}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  label={'نوع الرقم'}
                  name={[name, 'phone_type']}
                  rules={[{ required: true, message: 'Missing first name' }]}
                >
                  <Input disabled={userFormDisable} placeholder="نوع الرقم" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'phone_number']}
                  label={'رقم الهاتف'}
                  rules={[{ required: true, message: 'Missing last name' }]}
                >
                  <Input disabled={userFormDisable} placeholder="الرقم" />
                </Form.Item>
                 
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة رقم هاتف
              </Button>
            </Form.Item>
          </>
        }}
      </Form.List>          
           </div>
          </Panel>
          <Panel header="بيانات النظام" key="3">
            <div>
              <div style={{display:'flex',flexDirection:'row'}}>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="الرقم الوظيفي" name="user_id">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="اسم المستخدم" name="user_name">
                <Input disabled={userFormDisable} />
              </Form.Item>
              <Form.Item style={{flex:1,marginLeft:'5px'}} label="كلمة المرور" name="password">
                <Input.Password disabled={userFormDisable} />
              </Form.Item>
              </div>
            </div>
          </Panel> 
          <Panel header="المؤهلات العلمية" key="4">
           <div>
            <Form.List name="qualifications">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'id']}
                  style={{display:'none'}}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>

                <Form.Item
                  {...restField}
                  label={'اسم المؤهل '}
                  name={[name, 'qual_name']}
                  rules={[{ required: true, message: 'اسم المؤهل مطلوب' }]}
                >
                  <Input disabled={userFormDisable} placeholder="اسم المؤهل " />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'qual_year']}
                  label={'سنة الحصول عليه'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <DatePicker disabled={userFormDisable} picker="year" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'qual_source']}
                  label={'جهة الحصول عليه'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة مؤهل              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>   
           </div>
          </Panel>
          <Panel header="الوظائف السابقة" key="5">
          <div>
            <Form.List name="preworks">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'id']}
                  style={{display:'none'}}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  label={'اسم الوظيفة '}
                  name={[name, 'job_name']}
                  rules={[{ required: true, message: 'اسم الوظيفة مطلوب' }]}
                >
                  <Input disabled={userFormDisable} placeholder="اسم الوظيفة " />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'work_period']}
                  label={'فترة العمل'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <RangePicker  disabled={userFormDisable} picker="year" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'work_place']}
                  label={'الجهة'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة وظيفة سابقة              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>   
           </div>
          </Panel>
          <Panel header="الملفات المرفقة" key="6">
          <div>
            <Form.List name="attachments">
        {(fields, { add, remove }) => {

       return  <>
            {
            
            fields.map(({ key, name, ...restField },index) => {
             
            return ( 
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'id']}
                  style={{display:'none'}}
                >
                  <Input disabled={userFormDisable}  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  label={'اسم المرفق '}
                  name={[name, 'attach_name']}
                  rules={[{ required: true, message: 'اسم المرفق مطلوب' }]}
                >
                  <Input disabled={userFormDisable} placeholder="اسم المرفق " />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'attach_path']}
                  //getValueFromEvent={getFile}
                  getValueFromEvent={({file}) => file.originFileObj}
                  label={'الملف المرفق'}
                  rules={[{ required: true, message: 'هذا الحقل مطلوب' }]}
                >
                <Upload 
                      listType="text"
                      props={UploadProps}
                >
                  <Button type='primary'><UploadOutlined/> رفع الملف</Button>  
                  </Upload>
                </Form.Item>
                 <a target='_BLANK' href={attachments[index]?Env.HOST_SERVER_STORAGE+attachments[index]['attach_path']:""}> <FileOutlined hidden={!attachments[index]} /> {attachments[index]? attachments[index]['attach_name']:""}</a>                
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>);
        })}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة مرفق              </Button>
            </Form.Item>
          </>;
        }}
      </Form.List>   
           </div>
          </Panel>
       </Collapse>
        </div>
        </Col>
      </Row>
      </Form>
    </Modal>
    <Col style={{ display: 'flex',flexDirection: 'column'}}  xs={24} sm={24} md={6} lg={6} xl={6}>
    <Avatar
    size={{ xs: 100, sm: 100, md: 130, lg: 150, xl: 150, xxl: 150 }}
    src={Env.HOST_SERVER_STORAGE+user.avatar}
    style={{display:'block',margin:'10px',alignSelf:'center'}}
    />
    <Text style={{textAlign:'center',fontSize:'20px',marginBottom:'10px'}}>{user.user_name} <Badge status="success"  /></Text>
    <div style={{textAlign:'center',marginBottom:'18px'}}><Badge count={ user.user_id }  overflowCount={99999} style={{ backgroundColor: '#DDDDDD',color:'#000' }} /></div>
    <div style={{textAlign:'center'}}><Button type='primary' onClick={()=>openShowUser()}>الملف الوظيفي {props.aboutProps}</Button></div>
    </Col>
    <Col className='userData' xs={24} sm={24} md={10} lg={10} xl={10}>
      <div className="taggedInfo"><Text><ClusterOutlined /> {user.category.name} </Text></div>
      <div className="taggedInfo"><Text><TagsOutlined />{user.job}</Text></div>
      <div className="taggedInfo" style={{marginTop:'10px'}}>
        <Rate disabled allowHalf value={Math.round(star*10)/2} />
      </div>
    </Col>
    <Col xs={24} sm={24} md={8} lg={8} xl={8} style={{textAlign:'center',marginBottom:'-50px'}}>
    <div class='spider'>
    <ReactApexChart
      options={config.options}
      series={config.series}
      type="radar"
      height="300"
      width="350"
      style={{padding:0}}
    />
    <div  style={{top:'-50px',position:'relative'}} onChange={()=>handleSizeChange()} >

    </div>
    </div>
    </Col>
  </Row>
  <Row className='profile-row'>
  <Tabs className='profile-tabs' style="padding-right:10px" tabPosition="bottom" defaultActiveKey="1" style={{width:'100%'}}>
    <TabPane
      
      tab={
        <Link to={url}  hidden={location.userData!=null?true:false}>
        <span>
        <LineChartOutlined />
           إحصائيات
        </span>
        </Link>
      }
      key="1"
    >
    </TabPane>
    <TabPane
      tab={
        <Link to={`${url}/general-table`} hidden={location.userData!=null?true:false}>
        <span>
        <UnorderedListOutlined />
      السجل العام
        </span>
        </Link>
      }
      key="2"
    >
    </TabPane>
    <TabPane
      tab={
        <Link to={`${url}/depts-table`} hidden={location.userData!=null?true:false}>
        <span>
        <ApartmentOutlined />
سجل الإدارات        
</span>
        </Link>
      }
      key="8"
    >
    </TabPane>
    <TabPane
      tab={
        <Link to={`${url}/attendance-table`} >
        <span>
          <InsertRowAboveOutlined />
        سجل حضوري 
        </span>
        </Link>
      }
      key="3"
    >
    </TabPane>
    <TabPane
      tab={
        <Link to={`${url}/transfer-table`}>
        <span>
        <CarOutlined />
       المواصلات
        </span>
        </Link>
      }
      key="4"
    >
    </TabPane>
    <TabPane
      tab={
        <Link to={`${url}/tasks-table`}>
        <span>
          <EditOutlined />
       الإجازات والمهام 
        </span>
        </Link>
      }
      key="5"
    >
    </TabPane>
{requestPane()}
    <TabPane
      tab={
        <Link to={`${url}/alerts`} hidden={location.userData!=null?true:false}>
        <span>
        <span class="anticon anticon-snippets">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
           <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
        </svg></span>
          التنبيهات 
        </span>
        </Link>
      }
      key="7"
    >
    </TabPane>
  </Tabs>  
  </Row>
  </Card>
  <Layout   style={{
      margin: '0px 16px',
      padding: 0,
      height:'auto',
    }}
  >  
        <Switch>
          <Route path={path} exact>
            <SummaryData userData={user}  star={star} />
          </Route>
          <Route path={`${path}/general-table`}>
            <GeneralTable setting={props.setting}/>
          </Route>
          <Route path={`${path}/depts-table`}>
            <DeptsTable setting={props.setting}/>
          </Route>
          <Route path={`${path}/attendance-table`} component={() => <AttendanceTable setting={props.setting} user={cookies.user} />} />
          <Route path={`${path}/transfer-table`} component={TransferTable} />
          <Route path={`${path}/tasks-table`} component={() => <TasksTable setting={props.setting} user={cookies.user} />} />
          <Route path={`${path}/tasks-requests`} component={tasksRequests} />
          <Route path={`${path}/alerts`} component={alertsTable} />
          <Redirect to="" />
        </Switch>
  </Layout>

  </Layout>
);
 };


