import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Button, Spin, Empty, Input } from 'antd';
import { ShopOutlined, PlusOutlined, SearchOutlined, LoginOutlined } from '@ant-design/icons';
import { FirebaseServices } from '../../firebase/FirebaseServices';
import './style.css';

const { Title, Text } = Typography;

const AccountsList = ({ onSelect, onCreateNew }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await FirebaseServices.getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(acc => 
    acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.number?.toString().includes(searchTerm)
  );

  if (loading) return <div className="loader-container"><Spin size="large" /></div>;

  return (
    <div className="accounts-list-container">
      <div className="list-header">
        <Title level={2} className="gradient-text">اختر المؤسسة للمتابعة</Title>
        <Text type="secondary">حدد المؤسسة التي ترغب في تسجيل الدخول إليها أو أنشئ واحدة جديدة</Text>
        
        <div className="action-bar">
          <Input 
            prefix={<SearchOutlined />} 
            placeholder="بحث عن مؤسسة..." 
            className="search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={onCreateNew}
            className="create-btn"
          >
            إضافة مؤسسة
          </Button>
        </div>
      </div>

      {filteredAccounts.length === 0 ? (
        <Empty description="لا توجد مؤسسات حالياً" className="empty-state" />
      ) : (
        <Row gutter={[24, 24]} className="accounts-grid">
          {filteredAccounts.map(account => (
            <Col xs={24} sm={12} md={8} lg={6} key={account.id}>
              <Card 
                hoverable 
                className="account-card"
                onClick={() => onSelect(account.id)}
              >
                <div className="account-icon">
                  <ShopOutlined />
                </div>
                <Title level={4} className="account-name">{account.name}</Title>
                <Text type="secondary" className="account-number">رقم المؤسسة: {account.number}</Text>
                <div className="card-footer">
                  <Button type="link" icon={<LoginOutlined />}>دخول</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AccountsList;
