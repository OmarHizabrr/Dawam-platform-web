/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import logoText from '../../../assets/images/logo-text.png';
import './style.css';
import { Typography ,Layout,Tabs,Form, Upload,Button, DatePicker, Row,Col,Select,Card, notification,Input, InputNumber } from 'antd';
import {SwapOutlined,FormOutlined,UploadOutlined,PrinterOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {FileExcelOutlined} from '@ant-design/icons';
import {Env} from './../../../styles';
const { Content } = Layout;
const { Text,Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; 
const {RangePicker}=DatePicker;
const { TextArea } = Input;


export default function GeneralSetting(props){
    const [form] = Form.useForm();
    const [load,setLoad]=useState(false);

    const  UploadProps = {
        showUploadList: {
          showRemoveIcon: true,
          showDownloadIcon: true,
          downloadIcon: 'Download',
        },
      };
    const onFinish=(values)=>{
        setLoad(true);
        var formData=new FormData();
         
         formData.append('logo',values['logo']?.file.originFileObj);
         formData.append('currency',values['currency']);
         formData.append('round',values['round']);
         formData.append('month_start',values['month_start']);
         formData.append('month_end',values['month_end']);
         formData.append('backend_link',values['backend_link']);
         formData.append('general_manager',values['general_manager']);
         formData.append('signs_footer',values['signs_footer']);
         formData.append('bonus_price',values['bonus_price']);
         formData.append('bonus_threshold',values['bonus_threshold']);
         formData.append('vacations_tolerance',values['vacations_tolerance']);

       axios.post(Env.HOST_SERVER_NAME+'general-setting',formData)
        .then(res=>{
            setLoad(false);
            window.location.reload(false);
            openNotification('bottomLeft','تم تحديث الاعدادات بنجاح');
        }).catch(err=>{
            console.log(err);
            setLoad(false);
        });
      }
      form.setFieldsValue({
      'currency':props.setting.filter((item)=> item.key == 'admin.currency')[0]?.value,
      'round':props.setting.filter((item)=> item.key == 'admin.round')[0]?.value,
      'month_start':props.setting.filter((item)=> item.key == 'admin.month_start')[0]?.value,
      'month_end':props.setting.filter((item)=> item.key == 'admin.month_end')[0]?.value,
      'backend_link':props.setting.filter((item)=> item.key == 'admin.backend_link')[0]?.value,
      'general_manager':props.setting.filter((item)=> item.key == 'admin.general_manager')[0]?.value,
      'signs_footer':props.setting.filter((item)=> item.key == 'admin.signs_footer')[0]?.value,
      'bonus_price':props.setting.filter((item)=> item.key == 'admin.bonus_price')[0]?.value,
      'bonus_threshold':props.setting.filter((item)=> item.key == 'admin.bonus_threshold')[0]?.value,
      'vacations_tolerance':props.setting.filter((item)=> item.key == 'admin.vacations_tolerance')[0]?.value

    });
    const openNotification = (placement,text) => {
      notification.success({
        message:text ,
        placement,
        duration:10,
      });
    }
return (
    <Layout>
    <Card>
      <Text style={{fontSize:'20px',marginBottom:'40px'}}>الإعدادات العامة</Text> 
      <Row style={{marginTop:'50px'}}>
        <Form className='gSettingForm'  form={form} onFinish={onFinish} style={{width:'100%'}}>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} span={24} style={{padding:'20px'}}>
            <Form.Item name={'logo'} label={'شعار المؤسسة'}>
                <Upload   listType="text" props={UploadProps} >
                  <Button type='primary'><UploadOutlined/> رفع الملف</Button>  
                  <img style={{marginRight:'10px',width:'130px'}} src={Env.HOST_SERVER_STORAGE+props.setting.filter((item)=> item.key == 'admin.logo')[0]?.value}/>
                </Upload>
            </Form.Item>
            <Form.Item name={'backend_link'} label={'رابط السرفر'}>
                <Input/>
            </Form.Item>
            <Form.Item name={'currency'} label={'العملة'}>
                <Input />
            </Form.Item>
            <Form.Item name={'round'} label={'تقريب الأرقام لأقرب'}>
                <InputNumber />
            </Form.Item> 
            <Form.Item name={'month_start'} label={'بداية الشهر'}>
                <InputNumber min={1} max={31} />
            </Form.Item> 
            <Form.Item name={'month_end'} label={'نهاية الشهر'}>
                <InputNumber  min={1} max={31} />
            </Form.Item>
            <Form.Item name={'general_manager'} label={'مسمى المدير العام'}>
                <Input/>
            </Form.Item>  
            <Form.Item name={'bonus_price'} label={'معامل الوقت الإضافي'}>
              <Input/>
            </Form.Item>
            <Form.Item name={'bonus_threshold'} label={'أقل مدة للإضافي بالدقيقة'}>
              <Input/>
            </Form.Item>
            <Form.Item name={'vacations_tolerance'} label={'سماحية تقديم الإجازات بالأيام'}>
              <Input/>
            </Form.Item>
            <Form.Item name={'signs_footer'} label={'توقيعات تذييل الصفحة'}>
              <TextArea placeholder='مثلاً... شئون الموظفين: فلان الفلاني' rows={4}   />
            </Form.Item> 

            </Col>
          </Row>
          <div style={{width:'100%'}}>
            <Button loading={load} htmlType="submit" type='primary' style={{float:'left'}}>حفظ</Button>
          </div>
        </Form>
      </Row>     
    </Card>
    </Layout>
);
    
 }
