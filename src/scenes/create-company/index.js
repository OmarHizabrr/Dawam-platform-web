import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Layout, Row, Col } from 'antd';
import { ShopOutlined, NumberOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { FirebaseServices } from '../../firebase/FirebaseServices';
import './style.css';

const { Title, Text } = Typography;

const CreateCompany = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await FirebaseServices.addAccount(values);
      message.success('تم إنشاء المؤسسة بنجاح');
      form.resetFields();
      if (onBack) onBack();
    } catch (error) {
      console.error(error);
      message.error('فشل إنشاء المؤسسة. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-company-container">
      <Card className="glass-card shadow-lg" bordered={false}>
        <div className="form-header">
           <Button 
            type="text" 
            icon={<ArrowRightOutlined />} 
            onClick={onBack} 
            className="back-btn"
          />
          <Title level={2} className="gradient-text">إنشاء مؤسسة جديدة</Title>
          <Text type="secondary">أدخل بيانات المؤسسة للبدء في إدارة النظام</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="premium-form"
          requiredMark={false}
        >
          <Form.Item
            label="اسم المؤسسة"
            name="name"
            rules={[{ required: true, message: 'يرجى إدخال اسم المؤسسة' }]}
          >
            <Input 
              prefix={<ShopOutlined />} 
              placeholder="مثال: شركة النخبة للتقنية" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="رقم الشركة / المعرف"
            name="number"
            rules={[{ required: true, message: 'يرجى إدخال رقم الشركة' }]}
          >
            <Input 
              prefix={<NumberOutlined />} 
              placeholder="مثال: 1001" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="كلمة المرور"
            name="password"
            rules={[{ required: true, message: 'يرجى إدخال كلمة المرور' }]}
          >
            <Input 
              prefix={<LockOutlined />} 
              placeholder="كلمة مرور المؤسسة" 
              size="large"
              type="text" // Plain text as requested
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large"
              className="submit-btn"
            >
              إنشاء المؤسسة
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCompany;
