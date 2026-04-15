import {
  CloudUploadOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  HistoryOutlined,
  SwapOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Layout,
  List,
  Modal,
  notification,
  Progress,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
  Upload,
} from "antd";
import React, { useState } from "react";
import "./style.css";

const { Content } = Layout;
const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function Backup(props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      name: "نسخة احتياطية كاملة - 2024/01/15",
      date: "2024-01-15 14:30:00",
      size: "2.5 MB",
      status: "completed",
      type: "full",
    },
    {
      id: 2,
      name: "نسخة احتياطية للبيانات - 2024/01/14",
      date: "2024-01-14 09:15:00",
      size: "1.8 MB",
      status: "completed",
      type: "data",
    },
    {
      id: 3,
      name: "نسخة احتياطية للمستخدمين - 2024/01/13",
      date: "2024-01-13 16:45:00",
      size: "0.5 MB",
      status: "completed",
      type: "users",
    },
  ]);

  const onFinish = (values) => {
    setLoading(true);
    // محاكاة عملية النسخ الاحتياطي
    simulateBackup();
  };

  const simulateBackup = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setBackupProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setLoading(false);
        openNotification("topRight", "تم إنشاء النسخة الاحتياطية بنجاح!");
      }
    }, 200);
  };

  const simulateRestore = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      setRestoreProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        openNotification("topRight", "تم استعادة البيانات بنجاح!");
      }
    }, 150);
  };

  const openNotification = (placement, text) => {
    notification.success({
      message: text,
      placement,
      duration: 10,
    });
  };

  const handleBackup = (type) => {
    setLoading(true);
    setBackupProgress(0);
    simulateBackup();
  };

  const handleRestore = (backupId) => {
    Modal.confirm({
      title: "تأكيد الاستعادة",
      content:
        "هل أنت متأكد من أنك تريد استعادة هذه النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.",
      okText: "نعم، استعادة",
      cancelText: "إلغاء",
      onOk: () => {
        setRestoreProgress(0);
        simulateRestore();
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "in_progress":
        return "processing";
      default:
        return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "full":
        return "blue";
      case "data":
        return "green";
      case "users":
        return "orange";
      default:
        return "default";
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "full":
        return "كاملة";
      case "data":
        return "البيانات";
      case "users":
        return "المستخدمين";
      default:
        return "غير محدد";
    }
  };

  return (
    <div
      className="backup-page"
      style={{
        padding: "20px",
        background: "var(--bg, #f8fafc)",
        minHeight: "100vh",
        color: "var(--text, #0f172a)",
      }}
    >
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "var(--shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.15))",
          border: "1px solid var(--input-border, #e2e8f0)",
          background: "var(--card-bg, #ffffff)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <Title
            level={2}
            style={{ color: "var(--primary, #2563eb)", marginBottom: "8px" }}
          >
            <DatabaseOutlined style={{ marginLeft: "8px" }} />
            النسخ الاحتياطي والاستعادة
          </Title>
          <Text type="secondary" style={{ color: "var(--muted, #64748b)" }}>
            قم بإنشاء نسخ احتياطية من بياناتك واستعادة البيانات عند الحاجة
          </Text>
        </div>

        <Alert
          message="مهم"
          description="يُنصح بإنشاء نسخة احتياطية قبل إجراء أي تغييرات مهمة على النظام. النسخ الاحتياطية تحمي بياناتك من الفقدان."
          type="info"
          showIcon
          style={{ marginBottom: "24px" }}
        />

        <Tabs defaultActiveKey="backup" size="large">
          <TabPane
            tab={
              <span>
                <CloudUploadOutlined />
                إنشاء نسخة احتياطية
              </span>
            }
            key="backup"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card
                  title="نسخة احتياطية كاملة"
                  style={{ height: "100%" }}
                  extra={<Tag color="blue">مستحسن</Tag>}
                >
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text strong>تشمل:</Text>
                      <ul style={{ marginTop: "8px", paddingRight: "20px" }}>
                        <li>جميع بيانات الموظفين</li>
                        <li>سجلات الحضور والانصراف</li>
                        <li>التقارير والإحصائيات</li>
                        <li>إعدادات النظام</li>
                        <li>بيانات المستخدمين</li>
                      </ul>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CloudUploadOutlined />}
                      loading={loading}
                      onClick={() => handleBackup("full")}
                      style={{ width: "100%" }}
                    >
                      إنشاء نسخة احتياطية كاملة
                    </Button>
                    {loading && (
                      <Progress
                        percent={backupProgress}
                        status="active"
                        strokeColor="#1890ff"
                      />
                    )}
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="نسخة احتياطية مخصصة" style={{ height: "100%" }}>
                  <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item
                      name="backupType"
                      label="نوع النسخة الاحتياطية"
                      rules={[
                        {
                          required: true,
                          message: "يرجى اختيار نوع النسخة الاحتياطية",
                        },
                      ]}
                    >
                      <Select placeholder="اختر نوع النسخة الاحتياطية">
                        <Option value="data">البيانات فقط</Option>
                        <Option value="users">المستخدمين فقط</Option>
                        <Option value="settings">الإعدادات فقط</Option>
                        <Option value="reports">التقارير فقط</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="dateRange" label="نطاق التاريخ">
                      <RangePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<CloudUploadOutlined />}
                        loading={loading}
                        style={{ width: "100%" }}
                      >
                        إنشاء نسخة احتياطية مخصصة
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                استعادة البيانات
              </span>
            }
            key="restore"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="النسخ الاحتياطية المتاحة">
                  <List
                    itemLayout="horizontal"
                    dataSource={backupHistory}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button
                            type="primary"
                            icon={<SwapOutlined />}
                            onClick={() => handleRestore(item.id)}
                          >
                            استعادة
                          </Button>,
                          <Button icon={<DownloadOutlined />}>تحميل</Button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text strong>{item.name}</Text>
                              <Tag color={getTypeColor(item.type)}>
                                {getTypeName(item.type)}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size="small">
                              <Text type="secondary">
                                <HistoryOutlined
                                  style={{ marginLeft: "4px" }}
                                />
                                {item.date}
                              </Text>
                              <Text type="secondary">الحجم: {item.size}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="استعادة من ملف">
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <Upload.Dragger
                      name="file"
                      multiple={false}
                      accept=".sql,.backup,.db"
                      beforeUpload={() => false}
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined
                          style={{ fontSize: "48px", color: "#1890ff" }}
                        />
                      </p>
                      <p className="ant-upload-text">
                        انقر أو اسحب ملف النسخة الاحتياطية هنا
                      </p>
                      <p className="ant-upload-hint">
                        يدعم الملفات: .sql, .backup, .db
                      </p>
                    </Upload.Dragger>

                    <Button
                      type="primary"
                      size="large"
                      icon={<SwapOutlined />}
                      style={{ width: "100%" }}
                    >
                      استعادة من الملف
                    </Button>

                    {restoreProgress > 0 && (
                      <Progress
                        percent={restoreProgress}
                        status="active"
                        strokeColor="#52c41a"
                      />
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
