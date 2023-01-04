/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Env} from '../../../styles';
import { Card, Select,Spin,Avatar,Layout,Row,Col ,Typography,Progress,Dropdown,Rate,Menu,Skeleton,Button,Form,Modal,notification, Input, InputNumber} from 'antd';
import './style.css'
import { PlusOutlined, TagsOutlined, ClusterOutlined ,MoreOutlined} from '@ant-design/icons';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    Link,
    useRouteMatch
  } from "react-router-dom";

const { Meta } = Card;
const { Text } = Typography;
export default function deptCards(props){ 
    let { path, url } = useRouteMatch(); 
    const [data,setData]=useState([]);
    const [load,setLoad]=useState(true);
    const [isVisibleModal,setIsVisibleModal]=useState(false);
    const [isDVisibleModal,setIsDVisibleModal]=useState(false);
    const [ddept,setDDept]=useState([]);

    const [userFormDisable,setUserFormDisable]=useState(true);
    const [today,setToday]=useState(new Date().toISOString().split('T')[0]);
    const [starList,setStarList]=useState([]); 
    const [start,setStart]=useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10));
    const [end,setEnd]=useState(new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0,10));
    const [modalLoad,setModalLoad]=useState(false);
    const [selectedDept,setSelectedDept]=useState(null);
    const [empNames,setEmpNames]=useState([]);
    const [catNames,setCatNames]=useState([]);
    const [update,setUpdate]=useState(0);

   
    const [userform] = Form.useForm();

    useEffect(() => {       
      setLoad(true);

      axios.get(Env.HOST_SERVER_NAME+'get-emp-names')
      .then(response => {
        setEmpNames(response.data);
      }).catch(function (error) {
        console.log(error);
      });

      axios.get(Env.HOST_SERVER_NAME+'get-cat-names')
      .then(response => {
        setCatNames(response.data);
      }).catch(function (error) {
        console.log(error);
      });

      axios.get(Env.HOST_SERVER_NAME+'categories-cards/'+today+'/'+start+'/'+end)
      .then(response => {
        setData(response.data['categories']);
        var stars=[];
        response.data['lists'].forEach(function(e){
          var avg=(((response.data.count[0].count-e.attendanceDays)*(e.salary/response.data.count[0].count))+parseInt(e.lateTimePrice || 0))/e.salary;
          stars.push({'user_id':e.user_id,'category_id':e.category_id,'star':Math.round((1-avg)*10)/2});
        });
        const reduced = stars.reduce(function(m, d){
          if(!m[d.category_id]){
            m[d.category_id] = {...d, count: 1};
            return m;
          }
          m[d.category_id].star += d.star;
          m[d.category_id].count += 1;
          return m;
       },{});

       const result = Object.keys(reduced).map(function(k){
        const item  = reduced[k];
        return {
            category_id: item.category_id,
            star: Math.round((item.star/item.count)),

        }
    });
        setStarList(result);

        setLoad(false);


      }).catch(function (error) {
        console.log(error);
      });

     },[start,end,update]);

  const deleteDept=()=>{

      setModalLoad(true);
      axios.delete(Env.HOST_SERVER_NAME+'departments/remove/'+ddept.id)
          .then(response => {
            setModalLoad(false);
            notification.success({
              message:'تمت العملية بنجاح' ,
              placement:'bottomLeft',
              duration:10,
            });
            setIsDVisibleModal(false);
            setUpdate(update+1);
          }).catch(function (error) {
            setModalLoad(false);
            notification.error({
              message:'فشلت العملية ' ,
              placement:'bottomLeft',
              duration:10,
            });
            console.log(error);
          });
    }
    const menu = (
      <Menu>
        <Menu.Item key="0">
          <a href="https://www.antgroup.com">1st menu item</a>
        </Menu.Item>
        <Menu.Item key="1">
          <a href="https://www.aliyun.com">2nd menu item</a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3">3rd menu item</Menu.Item>
      </Menu>
    );
    const openShowUser=(category)=>{
       setSelectedDept(category);
       userform.setFieldsValue(category);
       setIsVisibleModal(true);

    }
    const onFinish=()=>{
      const config = {
        headers: {
          'content-type': 'application/json',
        },
      };
      
      axios.post(Env.HOST_SERVER_NAME+'categories/add',userform.getFieldsValue()).then(res => {
        console.log(res.data);
        if(res.status==200){
          notification.success({
            message:'تمت العملية بنجاح' ,
            placement:'bottomLeft',
            duration:10,
          });
          userform.resetFields();
          setIsVisibleModal(false);
          setModalLoad(false);
          setUserFormDisable(true);
          setUpdate(update+1)   
        }
        else{
        alert("فشل إضافة إدارة");
        setModalLoad(false);
      }
    }).catch(err =>{ console.log(err);
      alert("فشل إضافة إدارة");
      setModalLoad(false);
    
    }); 
    }
    const listData = [];
    for (let i = 0; i < 16; i++) {
      listData.push(<Col style={{padding:'10px',display:load?'':'none'}}  span={6}>
      <Skeleton loading={load}  avatar active={load}></Skeleton>
      </Col>);
    }
return(
<Layout>
<Button
    className='addBtn'
    onClick={function(){userform.resetFields();setUserFormDisable(false);setIsVisibleModal(true);}}
     style={{zIndex:'1000',position:'fixed',bottom:'20px',width:'55px',height:'55px',left:'20px'}} shape="circle" icon={<PlusOutlined />} type="primary">
</Button>
<Modal okButtonProps={{ disabled:  userFormDisable  }} confirmLoading={modalLoad}  title="بيانات الإدارة" visible={isVisibleModal}  onOk={function(){setModalLoad(true);onFinish();}} onCancel={function(){setSelectedDept(null);userform.resetFields();setIsVisibleModal(false);}}>
  <Form form={userform} onFinish={onFinish}>
      <Form.Item
        name="id"
        hidden={true}
        style={{display:"none"}}
        >
          <Input disabled={userFormDisable} />
       </Form.Item>

      <Form.Item name='name' label='اسم الإدارة'>
        <Input disabled={userFormDisable}  />
      </Form.Item>

      <Form.Item name='order' label='ترتيب الإدارة'>
        <InputNumber disabled={userFormDisable} />
      </Form.Item>

      <Form.Item name='user_id' label='اسم المسؤول'>
      <Select 
      disabled={userFormDisable} 
          options={empNames} 
          //onChange={handleFormChange} 
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

      <Form.Item name='parent_id' label='الأب'>
      <Select 
      disabled={userFormDisable} 
          options={catNames} 
          //onChange={handleFormChange} 
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

  </Form>
</Modal>  
<Modal confirmLoading={modalLoad} title="حذف إدارة" open={isDVisibleModal} onOk={deleteDept} onCancel={()=>{setIsDVisibleModal(false)}}>
    <p>هل متأكد من حذف الإدارة {ddept.name} ؟</p>
  </Modal>
<Row gutter={[ {xs: 10, sm: 16, md: 24, lg: 32 },{xs: 10, sm: 16, md: 24, lg: 32 }]} style={{padding:20}}>
{listData}
{data.map(category=>{
 return <Col xs={24} sm={12} md={12} lg={8} xl={6} className="gutter-row" span={6} style={{padding:'10px'}} >
<Card className='content' style={{alignItems:'center',borderRadius:'10px'}}>
<Dropdown  
  overlay={<Menu>

        <Menu.Item key="1"  onClick={function(){userform.resetFields();setUserFormDisable(true);openShowUser(category);}}>عرض البيانات</Menu.Item>
        <Menu.Item key="2"  onClick={function(){userform.resetFields();setUserFormDisable(false);openShowUser(category);}}>تعديل البيانات</Menu.Item>    
        <Menu.Divider />
        <Menu.Item key="3"  onClick={function(){setIsDVisibleModal(true);setDDept(category)}}>حذف</Menu.Item>
        </Menu>} 
  trigger={['click']} > 
   <a style={{float:'left',fontSize:'20px'}} className="ant-dropdown-link" onClick={e => e.preventDefault()}>
     <MoreOutlined  key="ellipsis" />
    </a>
  </Dropdown>
<div  className='card-content' style={{display:'flex',flexDirection:'column'}}>
<div style={{display:'flex',flexDirection:'row',justifyContent:'space-evenly'}}>
<Avatar
    size={{ xs: 35, sm: 35, md: 45, lg: 60, xl: 60, xxl: 60 }}
    src={Env.HOST_SERVER_STORAGE+category.avatar}
    style={{display:'block',margin:'10px',alignSelf:'center'}}
    />
  <span style={{marginTop:'10px'}}>
  <div style={{color:'#7E7D7C'}}> الموظفون</div>
  <div style={{fontWeight:'bolder',fontSize:'24px'}}>{category.tot_users??0}</div>
  </span>
  <span style={{marginTop:'10px'}}>
  <div style={{color:'#7E7D7C'}}>الحاضرون</div>
  <div style={{fontWeight:'bolder',fontSize:'24px'}}>{category.att_users??0}</div>
  </span>
  <span style={{marginTop:'10px'}}>
  <div style={{color:'#7E7D7C'}}>الغائبون</div>
  <div style={{fontWeight:'bolder',fontSize:'24px'}}>{category.tot_users-category.att_users}</div>
  </span>
</div>
<div style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
<div>
<div style={{textAlign:'right',fontSize:'14px',margin:'5px 35px 0 7px'}}>{category.name} </div>
<div style={{color:'#7E7D7C',textAlign:'right',fontSize:'14px',marginRight:'35px'}}>{category.user_name} </div>
</div>
<Progress type="circle" percent={category.att_percent??0} width={50} />
</div>
<Rate style={{textAlign: 'center',marginBottom:'5px'}} disabled allowHalf value={starList?.filter(function (e) { return e.category_id == category.id; })[0]?.star} />
</div>
  </Card>
</Col>
})}
  </Row>
</Layout>
);

}