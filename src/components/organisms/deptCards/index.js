/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Env} from '../../../styles';
import { Card, Avatar,Layout,Row,Col ,Typography,Progress,Dropdown,Rate,Menu,Skeleton} from 'antd';
import './style.css'
import { EditOutlined, TagsOutlined, ClusterOutlined ,MoreOutlined} from '@ant-design/icons';
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
    const [today,setToday]=useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {       
      setLoad(true);
      axios.get(Env.HOST_SERVER_NAME+'categories-cards/'+today)
      .then(response => {
        setData(response.data);
        console.log(response.data);
        setLoad(false);
      }).catch(function (error) {
        console.log(error);
      });
     },[]);
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
    const listData = [];
    for (let i = 0; i < 16; i++) {
      listData.push(<Col style={{padding:'10px',display:load?'':'none'}}  span={6}>
      <Skeleton loading={load}  avatar active={load}></Skeleton>
      </Col>);
    }
return(
<Layout>
<Row gutter={[ {xs: 10, sm: 16, md: 24, lg: 32 },{xs: 10, sm: 16, md: 24, lg: 32 }]} style={{padding:20}}>
{listData}
{data.map(category=>{
 return <Col xs={24} sm={12} md={12} lg={8} xl={6} className="gutter-row" span={6} style={{padding:'10px'}}  span={8}>
<Card className='content' style={{alignItems:'center',borderRadius:'10px'}}>
  <Dropdown  overlay={menu} trigger={['click']} > 
   <a style={{float:'left',fontSize:'20px'}} className="ant-dropdown-link" onClick={e => e.preventDefault()}>
     <MoreOutlined style={{color:'#7E7D7C'}}  key="ellipsis" />
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
  <div style={{fontWeight:'bolder',fontSize:'24px'}}>{category.tot_users}</div>
  </span>
  <span style={{marginTop:'10px'}}>
  <div style={{color:'#7E7D7C'}}>الحاضرون</div>
  <div style={{fontWeight:'bolder',fontSize:'24px'}}>{category.att_users}</div>
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
<Progress type="circle" percent={category.att_percent} width={50} />
</div>
<Rate style={{textAlign: 'center',margin:'10px 0 5px'}} disabled allowHalf defaultValue={2.5} />
</div>
  </Card>
</Col>
})}
  </Row>
</Layout>
);

}