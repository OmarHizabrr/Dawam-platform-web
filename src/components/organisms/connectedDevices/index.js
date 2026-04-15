/* eslint-disable react-hooks/rules-of-hooks */
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import ZKLib from "node-zklib";
import React, { useEffect, useState } from "react";
import "./style.css";

import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
  Select,
  Space,
  Table,
} from "antd";
import { Env } from "../../../styles";
import "./style.css";
const { Option } = Select;

//const ZKLib = require('./zklib');

export default function ConnectedDevices(props) {
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = () => {
    setLoad(true);
    FirebaseServices.getConnectedDevices()
      .then((data) => {
        setData(data);
        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoad(false);
      });
  };

  const handleChange = (pagination, filters, sorter) => {
    if (filters) setFilteredInfo(filters);
    if (sorter) setSortedInfo(sorter);
  };

  const showModal = (device = null) => {
    if (device) {
      setIsEditMode(true);
      setEditingDevice(device);
      form.setFieldsValue({
        dev_name: device.dev_name,
        dev_ip: device.dev_ip,
        dev_port: device.dev_port,
        status: parseInt(device.status, 10), // تحويل إلى number
      });
    } else {
      setIsEditMode(false);
      setEditingDevice(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      setSaving(true);
      // تحويل status إلى number
      const formData = {
        ...values,
        status: parseInt(values.status, 10),
      };

      const action = isEditMode
        ? FirebaseServices.updateDevice(editingDevice.id, formData)
        : FirebaseServices.addDevice(formData);

      action
        .then(function (response) {
          notification.success({
            message: isEditMode
              ? "تم تعديل الجهاز بنجاح"
              : "تم إضافة الجهاز بنجاح",
            placement: "bottomLeft",
            duration: 3,
          });
          setSaving(false);
          setIsModalVisible(false);
          form.resetFields();
          fetchDevices();
        })
        .catch(function (error) {
          notification.error({
            message: "حدث خطأ أثناء العملية",
            placement: "bottomLeft",
            duration: 3,
          });
          setSaving(false);
          console.log(error);
        });
    });
  };

  const handleDelete = (device) => {
    FirebaseServices.deleteDevice(device.id)
      .then(function (response) {
        notification.success({
          message: "تم حذف الجهاز بنجاح",
          placement: "bottomLeft",
          duration: 3,
        });
        fetchDevices();
      })
      .catch(function (error) {
        notification.error({
          message: "حدث خطأ أثناء حذف الجهاز",
          placement: "bottomLeft",
          duration: 3,
        });
        console.log(error);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setIsEditMode(false);
    setEditingDevice(null);
  };

  const columns = [
    {
      title: "اسم الجهاز",
      dataIndex: "dev_name",
      key: "dev_name",
      ellipsis: true,
    },
    {
      title: "عنوان الآيبي IP",
      dataIndex: "dev_ip",
      key: "dev_ip",
      ellipsis: true,
    },
    {
      title: "رقم المنفذ port",
      dataIndex: "dev_port",
      key: "dev_port",
      ellipsis: true,
    },
    {
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      ellipsis: true,
      render: (status) => {
        // تحويل status إلى number للمقارنة
        const statusNum = parseInt(status, 10);
        return statusNum === 1 ? (
          <span style={{ color: "#52c41a", fontWeight: "bold" }}>✅ نشط</span>
        ) : (
          <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            ❌ غير نشط
          </span>
        );
      },
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          >
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا الجهاز؟"
            onConfirm={() => handleDelete(record)}
            okText="نعم"
            cancelText="لا"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  // const testConnection= async ()=>{

  //   let zkInstance = new ZKLib('192.168.0.201', 4370, 10000, 4000);
  //   try {
  //       // Create socket to machine
  //       await zkInstance.createSocket()
  //       // It's really useful to check the status of device
  //       console.log(await zkInstance.getInfo())
  //   } catch (e) {
  //       console.log(e)
  //       if (e.code === 'EADDRINUSE') {
  //       }
  //   }

  //   }
  const testConnection = async () => {
    const IP = "192.168.0.201";
    const PORT = 4370;
    const CONNECTION_TIMEOUT = 15000; // 15 ثانية مهلة للاتصال الأولي
    const DATA_TIMEOUT = 30000; // 30 ثانية مهلة لانتظار البيانات

    let zkInstance = new ZKLib(IP, PORT, CONNECTION_TIMEOUT, DATA_TIMEOUT);

    try {
      await zkInstance.createSocket();
      console.log("تم الاتصال بالجهاز بنجاح!");
      const info = await zkInstance.getInfo();
      console.log("معلومات الجهاز:", info);
    } catch (e) {
      console.log("فشل الاتصال:", e.message);
    } finally {
      await zkInstance.disconnect(); // تأكد من إغلاق الاتصال دائمًا
    }
  };

  return (
    <Card>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          style={{ marginBottom: "10px" }}
        >
          إضافة جهاز
        </Button>
        <div>
          <Button
            style={{
              display: "block",
              marginLeft: "5px",
              marginBottom: "10px",
            }}
            onClick={function () {
              testConnection();
            }}
            type="primary"
          >
            <ExportOutlined /> سحب البصمات
          </Button>
          <Button
            style={{
              display: "block",
              backgroundColor: "#0972B6",
              borderColor: "#0972B6",
            }}
            onClick={function () {}}
            type="primary"
          >
            <PrinterOutlined /> حذف البصمات
          </Button>
        </div>
      </div>

      <Modal
        centered
        title={isEditMode ? "تعديل جهاز" : "إضافة جهاز جديد"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="dev_name"
            label="اسم الجهاز"
            rules={[{ required: true, message: "يرجى إدخال اسم الجهاز" }]}
          >
            <Input placeholder="اسم الجهاز" />
          </Form.Item>
          <Form.Item
            name="dev_ip"
            label="عنوان الآيبي IP"
            rules={[
              { required: true, message: "يرجى إدخال عنوان الآيبي" },
              {
                pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
                message: "يرجى إدخال عنوان آيبي صحيح",
              },
            ]}
          >
            <Input placeholder="192.168.1.1" />
          </Form.Item>
          <Form.Item
            name="dev_port"
            label="رقم المنفذ Port"
            rules={[
              { required: true, message: "يرجى إدخال رقم المنفذ" },
              { pattern: /^\d+$/, message: "يرجى إدخال رقم صحيح" },
            ]}
          >
            <Input placeholder="4370" />
          </Form.Item>
          <Form.Item
            name="status"
            label="الحالة"
            rules={[{ required: true, message: "يرجى اختيار الحالة" }]}
          >
            <Select placeholder="اختر الحالة">
              <Option value={1}>نشط</Option>
              <Option value={0}>غير نشط</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        loading={load}
        columns={columns}
        dataSource={data}
        onChange={handleChange}
        rowKey="id"
      />
    </Card>
  );
}
