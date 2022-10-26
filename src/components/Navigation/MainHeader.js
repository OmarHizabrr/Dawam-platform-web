/* eslint-disable react-hooks/rules-of-hooks */
import React,{useState,useEffect} from 'react';
import axios from 'axios';
import { Badge, Layout, Menu, Dropdown,Avatar,Button,Modal, Input,notification,Form } from 'antd';
import { Typography } from 'antd';
import {UserOutlined,DownOutlined,PoweroffOutlined,EyeInvisibleOutlined, EyeTwoTone ,LockOutlined,UploadOutlined,EllipsisOutlined}  from '@ant-design/icons';
import  { useHistory,Redirect,useRouteMatch} from 'react-router-dom'

import { NavHashLink as NavLink } from 'react-router-hash-link';
import { useCookies,CookiesProvider  } from 'react-cookie';
import './MainHeader.css';
import {Env} from './../../styles'
import {
  CONTROL_PANEL_ROUTE  ,
  PROFILE_ROUTE,
} from './../../routes';
import DropdownButton from 'antd/lib/dropdown/dropdown-button';
const { Header, Sider, Content } = Layout;
const { Link } = Typography;

export default function MainHeader() {
  const [count,setCount]=useState(0);
  const [data,setData]=useState([]);
  const [isModalVisible,setIsModalVisible]=useState(false);
  const [isIModalVisible,setIsIModalVisible]=useState(false);
  const [isSaving,setSaving]=useState(false);

  const [profileImage,setProfileImage]=useState();
  const [form] = Form.useForm();
  let history = useHistory();
  let { path, url } = useRouteMatch(); 

  const showModal = () => {
    setIsModalVisible(true);
  };
  const showIModal = () => {
    setIsIModalVisible(true);
  };
  const handleOk = () => {
    setSaving(true);
    var formData=new FormData();
    formData.append('user_id',id.id);
    formData.append('password',form.getFieldValue('password'));
    console.log(formData);
    axios.post(Env.HOST_SERVER_NAME+'password-change', formData).then(res => {
      if(res.status==200){
        notification.success({
          message:'تم تعديل كلمة السر بنجاح' ,
          placement:'bottomLeft',
          duration:0,
        });
        console.log(res);
        setSaving(false);
      }
      else{
      alert("فشل تعديل الصورة");
      setSaving(false);
      }
      form.resetFields(['password','confirm']);
      setIsModalVisible(false);
  }).catch(err =>{ console.log(err);
    setSaving(false);
  })  ;  
  };
  const handleIOk = () => {
    var formData=new FormData();
    formData.append('user_id',id.id);
    formData.append('image',profileImage);
    axios.post(Env.HOST_SERVER_NAME+'update-profile', formData).then(res => {
            console.log(res.data);
            if(res.status==200){
            const user=cookies.user;
            user.avatar=res.data;
            setCookie("user",user);
            document.location.reload();
            }
            else
            alert("فشل تعديل الصورة");
        }).catch(err => console.log(err))
        setIsIModalVisible(false);
      }
  const handleCancel = () => {
    form.resetFields(['password','confirm']);
    setIsModalVisible(false);
  };
  const handleICancel = () => {
    setIsIModalVisible(false);
  };

  const readAlerts = () => {
    setCount(null);
    var fData=new FormData();
    fData.append('alerts',data);
    axios.post(Env.HOST_SERVER_NAME+'read-alerts', data).then(res => {
    }).catch(err => console.log(err))
  };
  
  const handleRemoveCookie=()=>{
    removeCookie('user');
   return document.location.reload();
  }
  const [cookies, setCookie, removeCookie]=useCookies(["user"]);
  const id=cookies.user;
  useEffect(() => {
    if(id){
    axios.get(Env.HOST_SERVER_NAME+'unread-alerts/'+id.user_id)
    .then(response => {
     // console.log(response.data)
    setData(response.data.alerts);
    setCount(response.data.count[0]['count']);
    },[]).catch(function (error) {
      console.log(error);
    });
  }
   });
   const controlPanel=()=>{
    if(id && id.role_id==1){
    return(
      <Menu.Item  className='controlLarge'  key="2"><NavLink to={CONTROL_PANEL_ROUTE} >لوحة التحكم</NavLink></Menu.Item>
    );
    }
  }
   const moreMenu=(
    <Menu>
    <Menu.Item key="3"><NavLink to={PROFILE_ROUTE} >الملف الشخصي</NavLink></Menu.Item>
    {id && id.role_id==1 ?  <Menu.Item  key="4"><NavLink to={CONTROL_PANEL_ROUTE} >لوحة التحكم</NavLink></Menu.Item>:null}
    </Menu>
   );
   const alertsMenu =(
   <Menu>
   {data.map(item=>(
     <Menu.Item key="0">
       <a style={{whiteSpace: 'nowrap',width: '300px',overflow: 'hidden',textOverflow:'ellipsis'}} href={item.link}>{item.text}</a>
     </Menu.Item>  
   ))}
   <Menu.Divider />  
   <Menu.Item key="0" style={{textAlign:'center'}}>
   <a href= {`${url}/alerts`}>عرض كل الإشعارات</a>
     </Menu.Item>   
   </Menu>
    );
    const menu = (
      <Menu>
      <Menu.Item key="0" style={{marginTop:'8px', textAlign:'center'}}>
          <a onClick={showIModal}>
          <UserOutlined style={{marginLeft:'5px'}}/>
          تعديل الصورة الشخصية     
          </a>
        </Menu.Item>
        <Menu.Item key="0" style={{marginTop:'8px', textAlign:'center'}}>
          <a onClick={showModal}>
          <LockOutlined style={{marginLeft:'5px'}}/>
          تعديل كلمة السر     
          </a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="1" style={{marginTop:'8px', textAlign:'center'}}>
        <Button style={{backgroundColor:'#f00',fontWeight:'900',borderColor:'#f00',color:'#fff'}} onClick={function(){handleRemoveCookie();}}>
        <PoweroffOutlined />
            تسجيل الخروج
        </Button></Menu.Item>
      </Menu>
    );

  return ( 
  <Header theme="light" className="header">
  <Modal title="تعديل الصورة الشخصية" visible={isIModalVisible} onOk={()=>handleIOk()} onCancel={()=>handleICancel()}>
   اختر صورة شخصية:  
  
  <input onChange={(e)=>setProfileImage(e.target.files[0])} style={{marginRight:'10px'}} type="file" name="userImage" accept="image/*" />

  </Modal>
  <Modal confirmLoading={isSaving} title="تعديل كلمة السر" visible={isModalVisible} onOk={()=>{setSaving(true);handleOk();}} onCancel={()=>handleCancel()}>
  <Form form={form}>
  <Form.Item
        name="password"
        label="كلمة السر الجديدة"
        rules={[
          {
            required: true,
            message: 'أدخل كلمة السر!',
          },
        ]}
        hasFeedback
      >
  <Input.Password  placeholder="كلمة السر الجديدة" />
  </Form.Item>
  <Form.Item
        name="confirm"
        label="تأكيد كلمة السر"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: 'أدخل تأكيد كلمة السر !',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('تأكيد كلمة السر غير متطابقة مع كلمة السر!'));
            },
          }),
        ]}
      >
    <Input.Password
   
      placeholder="تأكيد كلمة السر"
      style={{marginTop:'10px'}}
      iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
    />
    </Form.Item>
    </Form>
  </Modal>
  <div className="logo" />
  
  <Menu className='mainHeader' theme="light" mode="horizontal" defaultSelectedKeys={['1']} >

      <Menu.Item className='profileLarge' key="1"><NavLink to={PROFILE_ROUTE} >الملف الشخصي</NavLink></Menu.Item>
      {controlPanel()}
    <div style={{float:'left'}}>
     <span className='userAvatar'>
       <Avatar size={40} src={id?Env.HOST_SERVER_STORAGE+id.avatar:""} />
       <Dropdown  overlay={menu} trigger={['click']}>
       <a style={{marginRight:'10px'}} className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
        <span className='avatarName'>{id?id.user_name:""} </span> 
         <DownOutlined />
        </a> 
       </Dropdown>
       </span>
       <span   style={{display:'inline-block'}}>
       <Dropdown overlay={alertsMenu} onClick={function(){readAlerts()}} trigger={['click']}>
       <a  href="#">
       <Badge className='noti-icon' count={count} >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
           <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
          </svg>
        </Badge>
        </a>
        </Dropdown>
        <Dropdown className='moreSmall' overlay={moreMenu} trigger={['click']}>
          <a onClick={e => e.preventDefault()}>       
             <EllipsisOutlined />   
          </a>
        </Dropdown>
        </span>
     </div>
    </Menu>
     
    
</Header>);
};


