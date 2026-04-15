import {
  DownOutlined,
  EllipsisOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  PictureOutlined,
  PoweroffOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Dropdown,
  Form,
  Input,
  Layout,
  Menu,
  message,
  Modal,
  notification,
  Progress,
  Typography,
} from "antd";
import { FirebaseServices } from "../../firebase/FirebaseServices";
import { useEffect, useState } from "react";

import { useCookies } from "react-cookie";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { NavHashLink as NavLink } from "react-router-hash-link";

import logo from "../../assets/images/logo.png";
import NotificationCard from "./NotificationCard";

import { format, register } from "timeago.js";
import ar from "timeago.js/lib/lang/ar";
import { calculateDuration } from "../../utilites/durationCalculator";

import { CONTROL_PANEL_ROUTE, PROFILE_ROUTE } from "../../routes";
import { Env } from "../../styles";

import "./MainHeader.css";

register("ar", ar);

const { Header, Sider, Content } = Layout;
const { Link } = Typography;
const myAlerts = [];

export default function MainHeader() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isIModalVisible, setIsIModalVisible] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [profileImage, setProfileImage] = useState();
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [form] = Form.useForm();
  const location = useLocation();
  const history = useHistory();
  let { path, url } = useRouteMatch();

  const showModal = () => {
    setIsModalVisible(true);
  };
  const showIModal = () => {
    setIsIModalVisible(true);
    setProfileImage(null);
    setImagePreview(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        message.error("الرجاء اختيار ملف صورة صحيح");
        return;
      }

      // التحقق من حجم الملف (أقل من 2 ميجابايت)
      if (file.size > 2 * 1024 * 1024) {
        message.error("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
        return;
      }

      setProfileImage(file);

      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const openNotification = (placement, text) => {
    notification.success({
      message: text,
      placement,
      duration: 10,
    });
  };
  const handleOk = () => {
    setSaving(true);
    var formData = new FormData();
    formData.append("user_id", id.id);
    formData.append("password", form.getFieldValue("password"));
    console.log(formData);
    FirebaseServices.changePassword(formData)
      .then((res) => {
        openNotification(
          "bottomLeft",
          <span> {"تم تعديل كلمة  المروربنجاح"}</span>
        );
        setSaving(false);
        form.resetFields(["password", "confirm"]);
        setIsModalVisible(false);
      })
      .catch((err) => {
        console.log(err);
        setSaving(false);
      });
  };
  function addObjectToArray(object) {
    if (!myAlerts.some((item) => item.id === object.id)) {
      myAlerts.push(object);
      notifyUser(object);
    }
  }
  const handleIOk = () => {
    if (!profileImage) {
      message.error("الرجاء اختيار صورة أولاً");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    var formData = new FormData();
    formData.append("user_id", id.id);
    formData.append("image", profileImage);

    // محاكاة تقدم التحميل
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    FirebaseServices.updateProfile(formData)
      .then((res) => {
        clearInterval(progressInterval);
        setUploadProgress(100);

        setTimeout(() => {
          const user = cookies.user;
          user.avatar = res.data; // or however the service returns it
          setCookie("user", user);
          message.success("تم تحديث الصورة الشخصية بنجاح");
          document.location.reload();
          setIsUploading(false);
          setUploadProgress(0);
          setIsIModalVisible(false);
        }, 500);
      })
      .catch((err) => {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
        message.error("حدث خطأ أثناء رفع الصورة");
        console.log(err);
      });
  };
  const handleCancel = () => {
    form.resetFields(["password", "confirm"]);
    setIsModalVisible(false);
  };
  const handleICancel = () => {
    setIsIModalVisible(false);
    setProfileImage(null);
    setImagePreview(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const readAlerts = () => {
    setCount(null);
    var fData = new FormData();
    fData.append("alerts", data);
    FirebaseServices.readAlerts(data)
      .then((res) => {})
      .catch((err) => console.log(err));
  };
  const notifyUser = (alert) => {
    if (Notification.permission === "granted") {
      const notification = new Notification("نظام دوام", {
        body: alert.text,
        icon: logo,
      });
      if (notification.hasOwnProperty("show")) {
        notification.show();
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          const notification = new Notification("نظام دوام", {
            body: alert.text,
            icon: logo,
          });
          if (notification.hasOwnProperty("show")) {
            notification.show();
          }
        }
      });
    }
  };

  const handleRemoveCookie = () => {
    removeCookie("user");
    history.push("/");
    // إعادة تحميل الصفحة بعد الانتقال لضمان تحديث حالة التطبيق
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const id = cookies.user;
  useEffect(() => {
    if (id) {
      FirebaseServices.getUnreadAlertsCount(id.user_id)
        .then((data) => {
          setCount(data.unread_count);
          if ("setAppBadge" in navigator) {
            const badgeCount = Number(data.unread_count);
            if (!isNaN(badgeCount) && badgeCount > 0) {
              navigator.setAppBadge(badgeCount);
            } else if (navigator.clearAppBadge) {
              navigator.clearAppBadge();
            }
          }

          for (var i = 0; i < data.alerts.length; i++) {
            addObjectToArray(data.alerts[i]);
          }

          setData(data.alerts);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }, []);
  const controlPanel = () => {
    if (id && (id.control_panel === 1 || id.general_manager === 1)) {
      return (
        <Menu.Item
          className="controlLarge"
          key="2"
          onClick={() => history.push(CONTROL_PANEL_ROUTE)}
        >
          لوحة التحكم
        </Menu.Item>
      );
    }
  };
  const moreMenu = (
    <Menu>
      <Menu.Item key="3">
        <NavLink to={PROFILE_ROUTE}>الملف الشخصي</NavLink>
      </Menu.Item>
      {id && (id.control_panel === 1 || id.general_manager === 1) ? (
        <Menu.Item key="4" onClick={() => history.push(CONTROL_PANEL_ROUTE)}>
          لوحة التحكم
        </Menu.Item>
      ) : null}
    </Menu>
  );
  const alertsMenu = (
    <Menu
      style={{
        background: "linear-gradient(135deg, #f8f8ff 0%, #f0f4ff 100%)",
        padding: "12px 0",
        borderRadius: "12px",
        boxShadow: "0 8px 30px rgba(109, 94, 234, 0.15)",
        border: "1px solid rgba(139, 126, 230, 0.1)",
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      {data.map((alert, idx) => {
        // بيانات الإشعار نظيفة وجاهزة للعرض

        // جلب اسم المرسل
        const senderName =
          alert.sender_name || alert.sender?.username || "User";

        // تحسين تحويل التاريخ إلى "منذ كذا وكذا" بالعربية
        let relativeTime = "";
        if (alert.created_at) {
          try {
            const dateObj = new Date(alert.created_at.replace(" ", "T"));
            relativeTime = format(dateObj, "ar");

            // تحسين النص العربي
            relativeTime = relativeTime
              .replace("just now", "الآن")
              .replace("ago", "")
              .replace("in", "خلال")
              .trim();
          } catch (error) {
            console.warn("Error formatting date:", error);
            relativeTime = "منذ قليل";
          }
        }

        // تحسين معالجة صورة مرسل الإشعار
        let avatarUrl = "";
        if (alert.avatar && alert.avatar !== "") {
          if (!alert.avatar.startsWith("http")) {
            avatarUrl = Env.HOST_SERVER_STORAGE + alert.avatar;
          } else {
            avatarUrl = alert.avatar;
          }
        } else {
          // تحسين الصورة الافتراضية مع ألوان متنوعة
          const colors = [
            "8b7ee6",
            "6d5eea",
            "5a4fcf",
            "1890ff",
            "52c41a",
            "ff4d4f",
            "fa8c16",
          ];
          const colorIndex = senderName.charCodeAt(0) % colors.length;
          const backgroundColor = colors[colorIndex];

          avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            senderName
          )}&background=${backgroundColor}&color=fff&size=128&font-size=0.6&bold=true&format=svg`;
        }

        // تحديد ما إذا كان الإشعار جديداً (أقل من 5 دقائق)
        const isNewNotification =
          alert.created_at &&
          Date.now() - new Date(alert.created_at.replace(" ", "T")).getTime() <
            5 * 60 * 1000;

        // حساب المدة الزمنية والفترة للإشعارات التي تحتوي على تواريخ
        let durationData = null;
        let periodData = null;

        // فحص إذا كان الإشعار يحتوي على تواريخ (للإجازات والطلبات)
        if (alert.date_from && alert.date_to) {
          try {
            // حساب المدة الزمنية
            durationData = calculateDuration(alert.date_from, alert.date_to);

            // تنسيق الفترة الزمنية
            const fromDate = new Date(alert.date_from);
            const toDate = new Date(alert.date_to);

            const formatDate = (date) => {
              const day = String(date.getDate()).padStart(2, "0");
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const year = date.getFullYear();
              const hours = String(date.getHours()).padStart(2, "0");
              const minutes = String(date.getMinutes()).padStart(2, "0");
              return `${day}/${month}/${year} ${hours}:${minutes}`;
            };

            periodData = {
              from: formatDate(fromDate),
              to: formatDate(toDate),
            };
          } catch (error) {
            console.warn("Error calculating duration:", error);
          }
        }

        return (
          <Menu.Item
            key={idx}
            style={{
              padding: 2,
              background: "transparent",
            }}
          >
            <a href={alert.link} style={{ textDecoration: "none" }}>
              <NotificationCard
                title={senderName}
                time={relativeTime}
                message={alert.text}
                avatar={avatarUrl}
                isNew={isNewNotification}
                duration={durationData}
                period={periodData}
                isRejected={alert.text && alert.text.includes("رفض")}
              />
            </a>
          </Menu.Item>
        );
      })}

      <Menu.Divider
        style={{
          margin: "12px 0",
          borderColor: "rgba(139, 126, 230, 0.2)",
        }}
      />
      <Menu.Item
        key="all"
        style={{
          textAlign: "center",
          padding: "8px 16px",
          margin: "0 8px",
          borderRadius: "8px",
          transition: "all 0.3s ease",
        }}
        className="view-all-notifications"
      >
        <a
          href={"/profile/alerts"}
          style={{
            color: "#6d5eea",
            fontWeight: "600",
            textDecoration: "none",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>📋</span>
          عرض كل الإشعارات
        </a>
      </Menu.Item>
    </Menu>
  );
  const menu = (
    <Menu>
      <Menu.Item key="0" style={{ marginTop: "8px", textAlign: "center" }}>
        <a onClick={showIModal}>
          <UserOutlined style={{ marginLeft: "5px" }} />
          تعديل الصورة الشخصية
        </a>
      </Menu.Item>
      <Menu.Item key="0" style={{ marginTop: "8px", textAlign: "center" }}>
        <a onClick={showModal}>
          <LockOutlined style={{ marginLeft: "5px" }} />
          تعديل كلمة المرور
        </a>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" style={{ marginTop: "8px", textAlign: "center" }}>
        <Button
          style={{
            backgroundColor: "#f00",
            fontWeight: "500",
            borderColor: "#f00",
            color: "#fff",
          }}
          onClick={function () {
            handleRemoveCookie();
          }}
        >
          <PoweroffOutlined />
          تسجيل الخروج
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header theme="light" className="header">
      <Modal
        centered
        title={
          <div
            style={{ textAlign: "center", fontSize: "18px", fontWeight: "600" }}
          >
            <PictureOutlined style={{ marginLeft: "8px", color: "#1890ff" }} />
            تعديل الصورة الشخصية
          </div>
        }
        open={isIModalVisible}
        onOk={() => handleIOk()}
        onCancel={() => handleICancel()}
        okText="رفع الصورة"
        cancelText="إلغاء"
        okButtonProps={{
          disabled: !profileImage || isUploading,
          loading: isUploading,
          style: {
            backgroundColor: "#1890ff",
            borderColor: "#1890ff",
            borderRadius: "6px",
            height: "40px",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
        cancelButtonProps={{
          style: {
            borderRadius: "6px",
            height: "40px",
            fontSize: "14px",
          },
        }}
        width={500}
        styles={{ body: { padding: "24px" } }}
      >
        <div style={{ textAlign: "center" }}>
          {/* منطقة اختيار الصورة */}
          <div
            style={{
              border: "2px dashed #d9d9d9",
              borderRadius: "12px",
              padding: "32px 16px",
              textAlign: "center",
              backgroundColor: "#fafafa",
              marginBottom: "24px",
              transition: "all 0.3s ease",
              cursor: "pointer",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#1890ff";
              e.target.style.backgroundColor = "#f0f8ff";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#d9d9d9";
              e.target.style.backgroundColor = "#fafafa";
            }}
          >
            <input
              onChange={handleImageChange}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
              }}
              type="file"
              name="userImage"
              accept="image/*"
              id="profile-image-input"
            />
            <label htmlFor="profile-image-input" style={{ cursor: "pointer" }}>
              <UploadOutlined
                style={{
                  fontSize: "48px",
                  color: "#1890ff",
                  marginBottom: "16px",
                  display: "block",
                }}
              />
              <div
                style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}
              >
                انقر هنا لاختيار صورة شخصية
              </div>
              <div style={{ fontSize: "14px", color: "#999" }}>
                PNG, JPG, JPEG حتى 2 ميجابايت
              </div>
            </label>
          </div>

          {/* معاينة الصورة */}
          {imagePreview && (
            <div style={{ marginBottom: "24px" }}>
              <Divider style={{ margin: "16px 0" }}>
                <span style={{ color: "#1890ff", fontWeight: "500" }}>
                  معاينة الصورة
                </span>
              </Divider>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <img
                  src={imagePreview}
                  alt="معاينة الصورة"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #1890ff",
                    boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                  }}
                />
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                {profileImage?.name}
              </div>
            </div>
          )}

          {/* شريط التقدم */}
          {isUploading && (
            <div style={{ marginBottom: "16px" }}>
              <Divider style={{ margin: "16px 0" }}>
                <span style={{ color: "#52c41a", fontWeight: "500" }}>
                  جاري رفع الصورة
                </span>
              </Divider>
              <Progress
                percent={uploadProgress}
                status={uploadProgress === 100 ? "success" : "active"}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                style={{ marginBottom: "8px" }}
              />
              <div
                style={{ fontSize: "14px", color: "#666", textAlign: "center" }}
              >
                {uploadProgress}% مكتمل
              </div>
            </div>
          )}

          {/* معلومات إضافية */}
          <div
            style={{
              backgroundColor: "#f6f8fa",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e1e4e8",
            }}
          >
            <div
              style={{ fontSize: "14px", color: "#586069", textAlign: "right" }}
            >
              <div style={{ marginBottom: "8px" }}>
                <strong>نصائح للحصول على صورة جيدة:</strong>
              </div>
              <div>• اختر صورة رسمية وواضحة وذات جودة عالية</div>
              <div>• تأكد من أن وجهك واضح في الصورة</div>
              <div>• استخدم خلفية بسيطة وواضحة</div>
              <div>• تجنب الصور المظلمة أو المشوشة</div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        centered
        confirmLoading={isSaving}
        title="تعديل كلمةالمرور"
        visible={isModalVisible}
        onOk={() => {
          setSaving(true);
          handleOk();
        }}
        onCancel={() => handleCancel()}
        okButtonProps={{
          disabled: !isPasswordValid,
        }}
      >
        <Form form={form}>
          <Form.Item
            name="password"
            label="كلمة  المرورالجديدة"
            rules={[
              {
                required: true,
                message: "أدخل كلمةالمرور!",
              },
              {
                min: 6,
                message: "كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام!",
              },
            ]}
            hasFeedback
          >
            <Input
              placeholder="كلمة  المرورالجديدة"
              onChange={(e) =>
                setIsPasswordValid(e.target.value && e.target.value.length >= 6)
              }
            />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="تأكيد كلمةالمرور"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "أدخل تأكيد كلمة  المرور!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("تأكيد كلمة  المرورغير متطابقة مع كلمةالمرور!")
                  );
                },
              }),
            ]}
          >
            <Input
              placeholder="تأكيد كلمةالمرور"
              style={{ marginTop: "10px" }}
            />
          </Form.Item>
        </Form>
      </Modal>
      <div className="logo" />

      <Menu
        style={{ display: "block" }}
        className="mainHeader"
        theme="light"
        mode="horizontal"
        defaultSelectedKeys={["1"]}
      >
        <Menu.Item className="profileLarge" key="1">
          <NavLink to={PROFILE_ROUTE}>الملف الشخصي</NavLink>
        </Menu.Item>

        {id &&
        (id.control_panel == 1 ||
          id.control_panel === 1 ||
          id.general_manager === 1) ? (
          <Menu.Item
            className="controlLarge"
            key="2"
            onClick={() => history.push(CONTROL_PANEL_ROUTE)}
          >
            لوحة التحكم
          </Menu.Item>
        ) : (
          <></>
        )}

        <div style={{ display: "inline-block", float: "left" }}>
          <span className="userAvatar">
            <Avatar
              size={40}
              src={id ? Env.HOST_SERVER_STORAGE + id.avatar : ""}
            />
            <Dropdown overlay={menu} trigger={["click"]}>
              <a
                style={{ marginRight: "10px" }}
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                <span className="avatarName">{id ? id.user_name : ""} </span>
                <DownOutlined />
              </a>
            </Dropdown>
          </span>
          <span style={{ display: "inline-block" }}>
            <Dropdown
              overlay={alertsMenu}
              onClick={function () {
                readAlerts();
              }}
              trigger={["click"]}
              placement="bottomRight"
              overlayClassName="notifications-dropdown"
            >
              <a href="#">
                <Badge className="noti-icon" count={count}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-bell"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
                  </svg>
                </Badge>
              </a>
            </Dropdown>
            <Dropdown
              className="moreSmall"
              overlay={moreMenu}
              trigger={["click"]}
            >
              <a onClick={(e) => e.preventDefault()}>
                <EllipsisOutlined />
              </a>
            </Dropdown>
          </span>
        </div>
      </Menu>
    </Header>
  );
}
