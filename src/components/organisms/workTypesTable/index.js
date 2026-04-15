import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Form,
    Input,
    Layout,
    Modal,
    notification,
    Popconfirm,
    Space,
    Table,
    Typography,
} from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import React, { useEffect, useState } from "react";
import { Env } from "./../../../styles";

const { Text, Title } = Typography;

export default function WorkTypesTable(props) {
    const [data, setData] = useState([]);
    const [load, setLoad] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [update, setUpdate] = useState(0);
    const [saving, setSaving] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    useEffect(() => {
        setLoad(true);
        FirebaseServices.getDurationTypes()
            .then((data) => {
                setData(data);
                setLoad(false);
            })
            .catch((error) => {
                console.error(error);
                setLoad(false);
                notification.error({
                    message: "خطأ في الاتصال",
                    description: "تعذر جلب بيانات أنواع الدوام",
                });
            });
    }, [update]);

    const onFinish = (values) => {
        setSaving(true);
        FirebaseServices.saveDurationType(values)
            .then((res) => {
                notification.success({
                    message: "تم حفظ النوع بنجاح",
                    placement: "bottomLeft",
                });
                form.resetFields();
                setIsModalVisible(false);
                setUpdate(update + 1);
            })
            .catch((err) => {
                console.error(err);
                notification.error({
                    message: "خطأ في الحفظ",
                    description: "تعذر حفظ بيانات نوع الدوام",
                });
            })
            .finally(() => {
                setSaving(false);
            });
    };

    const deleteType = (id) => {
        FirebaseServices.deleteDurationType(id)
            .then(() => {
                notification.success({
                    message: "تم حذف النوع",
                    placement: "bottomLeft",
                });
                setUpdate(update + 1);
            })
            .catch((err) => {
                console.error(err);
                notification.error({
                    message: "خطأ في الحذف",
                    description: "تعذر حذف نوع الدوام",
                });
            });
    };

    const filteredData = data.filter((item) =>
        item.label?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "اسم نوع الدوام",
            dataIndex: "label",
            key: "label",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "الرقم التعريفي",
            dataIndex: "value",
            key: "value",
            width: 120,
            align: "center",
        },
        {
            title: "الإجراءات",
            key: "actions",
            width: 150,
            align: "center",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ color: "#1890ff" }} />}
                        onClick={() => {
                            form.setFieldsValue({
                                id: record.value,
                                name: record.label,
                            });
                            setIsModalVisible(true);
                        }}
                    />
                    <Popconfirm
                        title="هل أنت متأكد من حذف هذا النوع؟"
                        onConfirm={() => deleteType(record.value)}
                        okText="نعم"
                        cancelText="لا"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Layout style={{ padding: "24px", background: "#f0f2f5" }}>
            <Card
                title={
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Title level={4} style={{ margin: 0 }}>
                            إدارة أنواع الدوام
                        </Title>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                form.resetFields();
                                setIsModalVisible(true);
                            }}
                        >
                            إضافة نوع جديد
                        </Button>
                    </div>
                }
                bordered={false}
                style={{ borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            >
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="البحث عن نوع دوام..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300, borderRadius: "20px" }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="value"
                    loading={load}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Card>

            <Modal
                title={form.getFieldValue("id") ? "تعديل نوع الدوام" : "إضافة نوع جديد"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="اسم النوع"
                        name="name"
                        rules={[{ required: true, message: "يرجى إدخال اسم نوع الدوام" }]}
                    >
                        <Input placeholder="مثال: دوام صباحي، دوام إضافي..." />
                    </Form.Item>
                    <Form.Item style={{ textAlign: "left", marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>إلغاء</Button>
                            <Button type="primary" htmlType="submit" loading={saving}>
                                حفظ
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
}
