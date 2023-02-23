/* eslint-disable react-hooks/rules-of-hooks */
import React,{useState,useEffect} from 'react';
import './style.css';
import {Table,Layout,Button,Input,Spin,Divider,notification, Checkbox,Modal,Select,Form,Card,DatePicker} from 'antd';
import {FormOutlined} from '@ant-design/icons';

import Avatar from 'antd/lib/avatar/avatar';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import {Env} from './../../../styles';
const {RangePicker}=DatePicker;
const {TextArea}=Input;
const CheckboxGroup = Checkbox.Group;

export default function AlertsTable (props){
      const [data, setData] = useState([]);
      const [filteredInfo, setFilteredInfo] = useState([]);
      const [sortedInfo, setSortedInfo] = useState([])
      const [cookies, setCookie, removeCookie]=useCookies(["user"]);
      const [type,setType]=useState(null);
      const [isModalVisible,setIsModalVisible]=useState(false);
      const [saving,setSaving]=useState(false);
      const [tstypes,setTstypes]=useState([]);
      const [checkAll, setCheckAll] = React.useState(false);
      const [indeterminate, setIndeterminate] = React.useState(true);
      const [checkedList, setCheckedList] = React.useState([]);

      const id=cookies.user;
      const [load,setLoad]=useState(true);
      const [form] = Form.useForm();

      const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
      const [end,setEnd]=useState(new Date(new Date().setDate(new Date().getDate() +1 )).toISOString().slice(0,10));
    const  handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        setFilteredInfo(filters);
        setSortedInfo(sorter);
      };    
      useEffect(() => {
        axios.get(Env.HOST_SERVER_NAME+'user-type/'+props.user?.id)
        .then(response => {
         
          setType(response.data);
        }).catch(function (error) {
          console.log(error);
        });
        axios.get(Env.HOST_SERVER_NAME+'get-emp-names')
        .then(response => {
         
          if(props.user.role_id==1)
          setTstypes(response.data);
          else
          setTstypes(response.data.filter(record => record.category==props.user.category.id));

        }).catch(function (error) {
          console.log(error);
        });
        axios.get(Env.HOST_SERVER_NAME+'alerts/'+id.user_id+'/'+start+'/'+end)
          .then(response => {
            setData(response.data);
            setLoad(false);
          }).catch(function (error) {
            console.log(error);
          });
      },[start,end]);
      
      const columns = [
        {
          title: 'الإشعار',
          dataIndex: 'text',
          key: 'text',
          sorter: (a, b) => a.text.length - b.text.length,
          sortOrder: sortedInfo.columnKey === 'text' && sortedInfo.order,
          ellipsis: true,
        },
        {
          title: 'تاريخ الإشعار',
          dataIndex: 'created_at',
          key: 'created_at',
          sorter: (a, b) => a.created_at.length - b.created_at.length,
          sortOrder: sortedInfo.columnKey === 'created_at' && sortedInfo.order,
          ellipsis: true,
        }   
      ];
      const onCheckAllChange = e => {
        var selOptions=[];
        if(e.target.checked )
            options.map(item=>selOptions.push(item.value));
        
        setCheckedList(selOptions);   
        setIndeterminate(false);
        setCheckAll(e.target.checked);
      };
      const options = [];
      const changeRange=(all,date)=>{
        //const id=cookies.user;
        setLoad(true);
        setStart(date[0]);
        setEnd(date[1]);      
      }
      const getNameOptions=()=>{
        for(var i=0;i<tstypes.length;i++)
           options.push({"label":tstypes[i].label,"value":'"'+tstypes[i].value+'"'});
       return options;
      }
      const onFinish = values => {
        setSaving(true); 
        values.text=props.user.user_name+": "+values.text;
        values.users=checkedList;
        axios.post(Env.HOST_SERVER_NAME+'add-alert',values)
        .then(response => {
          console.log(response.data);
          setIsModalVisible(false);
           setSaving(false);
           notification.success({
            message: 'تم إرسال الإشعار بنجاح!',
            placement: 'bottomLeft',
            duration:10
          });
          }).catch(function (error) {
           alert('يوجد مشكلة في الاتصال بالسرفر!');
           setSaving(false);
          });
          
        };
      const onChange = list => {
          setCheckedList(list);
          setIndeterminate(!!list.length && list.length < options.length);
          setCheckAll(list.length === options.length);
        };
return(
  <Layout>
    <Modal footer={[]} width={1000} style={{direction:'rtl'}}  title="إضافة إشعار" visible={isModalVisible} onCancel={()=>{setIsModalVisible(false)}}>
    <Form  form={form} name="dynamic_form_nest_item"  autoComplete="on" onFinish={function(record){onFinish(record);}}>
    <Form.Item label="نص الإشعار" name={'text'} >
          <TextArea/>
      </Form.Item> 
      <Checkbox value={checkAll} indeterminate={indeterminate} onChange={onCheckAllChange}  checked={checkAll}>
               تحديد الكل
             </Checkbox>
             <Divider/>
          <CheckboxGroup name={'users'} className='usersNames' options={getNameOptions()} value={checkedList} onChange={onChange} />         
      <Form.Item  style={{float:'left'}}>
      <Button style={{marginLeft:'10px'}} onClick={()=>{setIsModalVisible(false)}}>
          إلغاء
        </Button>
        <Button loading={saving} type="primary" htmlType="submit">        
          حفظ
        </Button>
      </Form.Item>
    </Form>

    </Modal> 
  <Card>
  <div style={{float:'left',marginBottom:'20px'}}>
  <span>اختر فترة : </span>
  <RangePicker  onCalendarChange={changeRange} />
  { 
        type && (props.user.role_id==1 ||  type!=3)? 
        <Button style={{marginRight:'5px'}} onClick={function(){form.resetFields(['text']); setIsModalVisible(true);}} type='primary'><FormOutlined />إضافة إشعار </Button>
        :<></>       
}
  </div>
    <Table loading={load} columns={columns} dataSource={data} scroll={{x: '600px' }}  onChange={handleChange} />
    </Card>
    </Layout>
);
 }
