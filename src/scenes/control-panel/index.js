import React from 'react';
import { Typography ,Layout,Breadcrumb} from 'antd';
import {
    UserOutlined,
    HomeOutlined, 
  } from '@ant-design/icons';
const { Content } = Layout;

const { Text } = Typography;
const ControlPanel = () => (
    <Layout className="site-layout">
    <Breadcrumb style={{margin:20}}>
    <Breadcrumb.Item href=""> <HomeOutlined /> </Breadcrumb.Item>
    <Breadcrumb.Item href=""> <UserOutlined /><span>خلدون السامعي</span></Breadcrumb.Item>
    <Breadcrumb.Item>الأحداث</Breadcrumb.Item>
  </Breadcrumb>
    <Content
    className="site-layout-background"
    style={{
      margin: '10px 16px',
      padding: 24,
    }}
  >
  </Content>
  </Layout>
);
export default ControlPanel;
