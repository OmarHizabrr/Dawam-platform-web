import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  notification,
  Row,
  Select,
  Space,
  Tabs,
  Typography,
  Upload,
} from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import React, { useEffect, useState } from "react";
import { Env } from "./../../../styles";
import "./style.css";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function GeneralSetting(props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [weekendDays, setWeekendDays] = useState(["الجمعة"]); // يوم الجمعة محدد افتراضياً

  const UploadProps = {
    showUploadList: {
      showRemoveIcon: true,
      showDownloadIcon: true,
      downloadIcon: "Download",
    },
  };

  const onFinish = (values) => {
    setLoading(true);
    var formData = new FormData();

    formData.append("logo", values["logo"]?.file?.originFileObj);
    formData.append("currency", values["currency"]);
    formData.append("round", values["round"]);
    formData.append("month_start", values["month_start"]);
    formData.append("month_end", values["month_end"]);
    formData.append("backend_link", values["backend_link"]);
    formData.append("general_manager", values["general_manager"]);
    formData.append("signs_footer", values["signs_footer"]);
    formData.append("bonus_price", values["bonus_price"]);
    formData.append("bonus_threshold", values["bonus_threshold"]);
    formData.append("vacations_tolerance", values["vacations_tolerance"]);
    formData.append("salary_allowances", values["salary_allowances"]);
    formData.append("weekend_days", JSON.stringify(weekendDays));

    FirebaseServices.updateGeneralSetting(formData)
      .then((res) => {
        setLoading(false);
        window.location.reload(false);
        openNotification("topRight", "تم تحديث الإعدادات بنجاح");
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        openNotification("topRight", "حدث خطأ في تحديث الإعدادات");
      });
  };

  // تعيين القيم الافتراضية
  useEffect(() => {
    form.setFieldsValue({
      currency: props.setting.filter((item) => item.key === "admin.currency")[0]
        ?.value,
      round: props.setting.filter((item) => item.key === "admin.round")[0]
        ?.value,
      month_start: props.setting.filter(
        (item) => item.key === "admin.month_start"
      )[0]?.value,
      month_end: props.setting.filter(
        (item) => item.key === "admin.month_end"
      )[0]?.value,
      backend_link: props.setting.filter(
        (item) => item.key === "admin.backend_link"
      )[0]?.value,
      general_manager: props.setting.filter(
        (item) => item.key === "admin.general_manager"
      )[0]?.value,
      signs_footer: props.setting.filter(
        (item) => item.key === "admin.signs_footer"
      )[0]?.value,
      bonus_price: props.setting.filter(
        (item) => item.key === "admin.bonus_price"
      )[0]?.value,
      bonus_threshold: props.setting.filter(
        (item) => item.key === "admin.bonus_threshold"
      )[0]?.value,
      vacations_tolerance: props.setting.filter(
        (item) => item.key === "admin.vacations_tolerance"
      )[0]?.value,
      salary_allowances:
        props.setting.filter(
          (item) => item.key === "admin.salary_allowances"
        )[0]?.value || "الإعانات",
    });

    // تحميل أيام الإجازات المحفوظة
    const savedWeekendDays = props.setting.filter(
      (item) => item.key === "admin.weekend_days"
    )[0]?.value;

    if (savedWeekendDays) {
      try {
        const parsedDays = JSON.parse(savedWeekendDays);
        setWeekendDays(parsedDays);
      } catch (error) {
        console.log("خطأ في تحليل أيام الإجازات:", error);
        setWeekendDays(["الجمعة"]); // القيمة الافتراضية
      }
    }
  }, [props.setting, form]);

  const openNotification = (placement, text) => {
    notification.success({
      message: text,
      placement,
      duration: 10,
    });
  };

  // أيام الأسبوع
  const weekDays = [
    { key: "السبت", label: "السبت" },
    { key: "الأحد", label: "الأحد" },
    { key: "الاثنين", label: "الاثنين" },
    { key: "الثلاثاء", label: "الثلاثاء" },
    { key: "الأربعاء", label: "الأربعاء" },
    { key: "الخميس", label: "الخميس" },
    { key: "الجمعة", label: "الجمعة" },
  ];

  // تحديد/إلغاء تحديد يوم معين
  const handleDayChange = (day, checked) => {
    if (checked) {
      setWeekendDays([...weekendDays, day]);
    } else {
      setWeekendDays(weekendDays.filter((d) => d !== day));
    }
  };

  // تحديد الكل
  const selectAllDays = () => {
    setWeekendDays(weekDays.map((day) => day.key));
  };

  // إلغاء تحديد الكل
  const deselectAllDays = () => {
    setWeekendDays([]);
  };
  return (
    <div
      className="general-settings-page"
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
        <div style={{ marginBottom: "16px" }}>
          <Title
            level={2}
            style={{ color: "var(--primary, #2563eb)", marginBottom: "6px" }}
          >
            <SettingOutlined style={{ marginLeft: "6px" }} />
            الإعدادات العامة
          </Title>
          <Text type="secondary" style={{ color: "var(--muted, #64748b)" }}>
            قم بتكوين الإعدادات الأساسية للنظام والمؤسسة
          </Text>
        </div>

        <Alert
          message="تنبيه"
          description="تأكد من صحة جميع البيانات قبل الحفظ. بعض الإعدادات قد تؤثر على عمل النظام."
          type="info"
          showIcon
          style={{ marginBottom: "16px" }}
        />

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          className="general-settings-form"
        >
          <Tabs defaultActiveKey="basic" size="default">
            <TabPane
              tab={
                <span>
                  <InfoCircleOutlined />
                  الإعدادات الأساسية
                </span>
              }
              key="basic"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="معلومات المؤسسة" style={{ height: "100%" }}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Form.Item
                        name="logo"
                        label="شعار المؤسسة"
                        tooltip="ارفع شعار المؤسسة الذي سيظهر في التقارير"
                      >
                        <Upload {...UploadProps} listType="picture-card">
                          <div>
                            <UploadOutlined
                              style={{
                                fontSize: "20px",
                                color: "var(--primary, #2563eb)",
                              }}
                            />
                            <div style={{ marginTop: 6, fontSize: "12px" }}>
                              رفع الشعار
                            </div>
                          </div>
                        </Upload>
                        {props.setting.filter(
                          (item) => item.key === "admin.logo"
                        )[0]?.value && (
                          <div style={{ marginTop: "6px" }}>
                            <img
                              style={{ width: "100px", borderRadius: "6px" }}
                              src={
                                Env.HOST_SERVER_STORAGE +
                                props.setting.filter(
                                  (item) => item.key === "admin.logo"
                                )[0]?.value
                              }
                              alt="الشعار الحالي"
                            />
                          </div>
                        )}
                      </Form.Item>

                      <Form.Item
                        name="general_manager"
                        label="مسمى المدير العام"
                        rules={[
                          {
                            required: true,
                            message: "يرجى إدخال مسمى المدير العام",
                          },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="مثال: مدير عام المؤسسة"
                        />
                      </Form.Item>

                      <Form.Item
                        name="backend_link"
                        label="رابط السيرفر"
                        rules={[
                          {
                            required: true,
                            message: "يرجى إدخال رابط السيرفر",
                          },
                        ]}
                      >
                        <Input
                          prefix={<SettingOutlined />}
                          placeholder="https://example.com"
                        />
                      </Form.Item>

                      <Form.Item
                        name="signs_footer"
                        label="توقيعات تذييل الصفحة"
                        tooltip="التوقيعات التي ستظهر في أسفل التقارير"
                      >
                        <TextArea
                          rows={4}
                          placeholder="مثال: شئون الموظفين: فلان الفلاني"
                        />
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="الإعدادات المالية" style={{ height: "100%" }}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Form.Item
                        name="currency"
                        label="العملة"
                        rules={[
                          { required: true, message: "يرجى إدخال العملة" },
                        ]}
                      >
                        <Input
                          prefix={<DollarOutlined />}
                          placeholder="مثال: ريال سعودي"
                        />
                      </Form.Item>

                      <Form.Item
                        name="round"
                        label="تقريب الأرقام لأقرب"
                        tooltip="سيتم تقريب جميع الأرقام المالية لهذا الرقم"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="مثال: 0.01"
                          step={0.01}
                          min={0}
                        />
                      </Form.Item>

                      <Form.Item
                        name="salary_allowances"
                        label="كشف مسمى الراتب"
                        tooltip="المسمى الذي سيظهر في كشوف الرواتب"
                        rules={[
                          { required: true, message: "يرجى إدخال مسمى الراتب" },
                        ]}
                      >
                        <Select placeholder="اختر مسمى الراتب">
                          <Option value="الإعانات">الإعانات</Option>
                          <Option value="الراتب">الراتب</Option>
                          <Option value="الأجر">الأجر</Option>
                          <Option value="المكافأة">المكافأة</Option>
                          <Option value="البدل">البدل</Option>
                        </Select>
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <CalendarOutlined />
                  إعدادات التقويم
                </span>
              }
              key="calendar"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="بداية ونهاية الشهر" style={{ height: "100%" }}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Form.Item
                        name="month_start"
                        label="بداية الشهر"
                        tooltip="اليوم الذي يبدأ فيه الشهر المالي"
                        rules={[
                          { required: true, message: "يرجى تحديد بداية الشهر" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={1}
                          max={31}
                          placeholder="مثال: 1"
                        />
                      </Form.Item>

                      <Form.Item
                        name="month_end"
                        label="نهاية الشهر"
                        tooltip="اليوم الذي ينتهي فيه الشهر المالي"
                        rules={[
                          { required: true, message: "يرجى تحديد نهاية الشهر" },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={1}
                          max={31}
                          placeholder="مثال: 31"
                        />
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="إعدادات الإجازات" style={{ height: "100%" }}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Form.Item
                        name="vacations_tolerance"
                        label="سماحية تقديم الإجازات بالأيام"
                        tooltip="عدد الأيام المسموح بها لتقديم طلب الإجازة مسبقاً"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          placeholder="مثال: 7 أيام"
                        />
                      </Form.Item>

                      <Form.Item
                        label="أيام الإجازات الأسبوعية"
                        tooltip="اختر أيام الأسبوع التي تعتبر إجازات افتراضية"
                      >
                        <div style={{ marginBottom: "8px" }}>
                          <Button
                            size="small"
                            onClick={selectAllDays}
                            style={{ marginLeft: "8px" }}
                          >
                            تحديد الكل
                          </Button>
                          <Button size="small" onClick={deselectAllDays}>
                            إلغاء تحديد الكل
                          </Button>
                        </div>
                        <div className="weekend-days-container">
                          {weekDays.map((day) => (
                            <Checkbox
                              key={day.key}
                              checked={weekendDays.includes(day.key)}
                              onChange={(e) =>
                                handleDayChange(day.key, e.target.checked)
                              }
                              className={`weekend-day-checkbox ${
                                weekendDays.includes(day.key) ? "checked" : ""
                              }`}
                            >
                              {day.label}
                            </Checkbox>
                          ))}
                        </div>
                        {weekendDays.length > 0 && (
                          <div className="weekend-summary">
                            الأيام المحددة: {weekendDays.join("، ")}
                          </div>
                        )}
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined />
                  إعدادات الوقت الإضافي
                </span>
              }
              key="overtime"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card
                    title="معاملات الوقت الإضافي"
                    style={{ height: "100%" }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Form.Item
                        name="bonus_price"
                        label="معامل الوقت الإضافي"
                        tooltip="المعامل المستخدم لحساب أجر الوقت الإضافي"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="مثال: 1.5"
                          step={0.1}
                          min={0}
                        />
                      </Form.Item>

                      <Form.Item
                        name="bonus_threshold"
                        label="أقل مدة للإضافي بالدقيقة"
                        tooltip="أقل مدة يجب أن يعملها الموظف لاحتساب الوقت الإضافي"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="مثال: 30 دقيقة"
                          min={0}
                        />
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>

          <Divider />

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              style={{
                minWidth: "120px",
                height: "40px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
