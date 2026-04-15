/* eslint-disable react-hooks/rules-of-hooks */
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  notification,
  Progress,
  Rate,
  Row,
  Select,
  Skeleton,
  Spin,
  Typography,
} from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { Env } from "../../../styles";
import "./style.css";

const { Meta } = Card;
const { Text } = Typography;
const openNotification = (placement, text) => {
  notification.success({
    message: text,
    placement,
    duration: 10,
  });
};
export default function deptCards(props) {
  let { path, url } = useRouteMatch();
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [isDVisibleModal, setIsDVisibleModal] = useState(false);
  const [ddept, setDDept] = useState([]);

  const [userFormDisable, setUserFormDisable] = useState(true);
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);
  const [starList, setStarList] = useState([]);
  const [start, setStart] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10)
  );
  const [end, setEnd] = useState(
    new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .slice(0, 10)
  );
  const [modalLoad, setModalLoad] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [empNames, setEmpNames] = useState([]);
  const [catNames, setCatNames] = useState([]);
  const [update, setUpdate] = useState(0);

  const [userform] = Form.useForm();

  useEffect(() => {
    setLoad(true);

    FirebaseServices.getEmpNames()
      .then((data) => {
        setEmpNames(data);
      })
      .catch(function (error) {
        console.log(error);
      });

    FirebaseServices.getCatNames()
      .then((data) => {
        setCatNames(data);
      })
      .catch(function (error) {
        console.log(error);
      });

    FirebaseServices.getCategoriesCards(today, start, end)
      .then((dataBody) => {
        setData(dataBody["categories"] || []);
        var stars = [];
        if (dataBody["lists"]) {
          dataBody["lists"].forEach(function (e) {
            var avg = (e.salary && dataBody.count?.[0]?.count) ? 
              (((dataBody.count[0].count - e.attendanceDays) *
                (e.salary / dataBody.count[0].count) +
                parseInt(e.lateTimePrice || 0)) /
              e.salary) : 0;
            stars.push({
              user_id: e.user_id,
              category_id: e.category_id,
              star: Math.round((1 - avg) * 10) / 2,
            });
          });
        }
        const reduced = stars.reduce(function (m, d) {
          if (!m[d.category_id]) {
            m[d.category_id] = { ...d, count: 1 };
            return m;
          }
          m[d.category_id].star += d.star;
          m[d.category_id].count += 1;
          return m;
        }, {});

        const result = Object.keys(reduced).map(function (k) {
          const item = reduced[k];
          return {
            category_id: item.category_id,
            star: Math.round(item.star / item.count),
          };
        });
        setStarList(result);

        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [start, end, update]);

  const deleteDept = () => {
    setModalLoad(true);
    FirebaseServices.removeDepartment(ddept.id)
      .then((response) => {
        setModalLoad(false);
        openNotification("bottomLeft", <span> {"تمت العملية بنجاح"}</span>);
        setIsDVisibleModal(false);
        setUpdate(update + 1);
      })
      .catch(function (error) {
        setModalLoad(false);
        notification.error({
          message: "فشلت العملية ",
          placement: "bottomLeft",
          duration: 10,
        });
        console.log(error);
      });
  };
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
  const openShowUser = (category) => {
    setSelectedDept(category);
    userform.setFieldsValue(category);
    setIsVisibleModal(true);
  };
  const onFinish = () => {
    const config = {
      headers: {
        "content-type": "application/json",
      },
    };

    FirebaseServices.addCategory(userform.getFieldsValue())
      .then((res) => {
        console.log(res);
        if (res.status == 200 || res.success) {
          notification.success({
            message: "تمت العملية بنجاح",
            placement: "bottomLeft",
            duration: 10,
          });
          userform.resetFields();
          setIsVisibleModal(false);
          setModalLoad(false);
          setUserFormDisable(true);
          setUpdate(update + 1);
        } else {
          alert("فشل إضافة إدارة");
          setModalLoad(false);
        }
      })
      .catch((err) => {
        console.log(err);
        alert("فشل إضافة إدارة");
        setModalLoad(false);
      });
  };
  const listData = [];
  for (let i = 0; i < 16; i++) {
    listData.push(
      <Col style={{ padding: "10px", display: load ? "" : "none" }} span={6}>
        <Skeleton loading={load} avatar active={load}></Skeleton>
      </Col>
    );
  }
  return (
    <Layout>
      <Button
        className="addBtn"
        onClick={function () {
          userform.resetFields();
          setUserFormDisable(false);
          setIsVisibleModal(true);
        }}
        style={{
          zIndex: "1000",
          position: "fixed",
          bottom: "20px",
          width: "55px",
          height: "55px",
          left: "20px",
        }}
        shape="circle"
        icon={<PlusOutlined />}
        type="primary"
      ></Button>
      <Modal
        centered
        okButtonProps={{ disabled: userFormDisable }}
        confirmLoading={modalLoad}
        title="بيانات الإدارة"
        visible={isVisibleModal}
        onOk={function () {
          setModalLoad(true);
          onFinish();
        }}
        onCancel={function () {
          setSelectedDept(null);
          userform.resetFields();
          setIsVisibleModal(false);
        }}
      >
        <Form form={userform} onFinish={onFinish}>
          <Form.Item name="id" hidden={true} style={{ display: "none" }}>
            <Input disabled={userFormDisable} />
          </Form.Item>

          <Form.Item name="name" label="اسم الإدارة">
            <Input disabled={userFormDisable} />
          </Form.Item>

          <Form.Item name="order" label="ترتيب الإدارة">
            <InputNumber disabled={userFormDisable} />
          </Form.Item>

          <Form.Item name="user_id" label="اسم المسؤول">
            <Select
              disabled={userFormDisable}
              options={empNames}
              //onChange={handleFormChange}
              showSearch
              notFoundContent={<Spin style={{ textAlign: "center" }}></Spin>}
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

          <Form.Item name="parent_id" label="الأب">
            <Select
              disabled={userFormDisable}
              options={catNames}
              //onChange={handleFormChange}
              showSearch
              notFoundContent={<Spin style={{ textAlign: "center" }}></Spin>}
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
      <Modal
        centered
        confirmLoading={modalLoad}
        title="حذف إدارة"
        open={isDVisibleModal}
        onOk={deleteDept}
        onCancel={() => {
          setIsDVisibleModal(false);
        }}
      >
        <p>هل متأكد من حذف الإدارة {ddept.name} ؟</p>
      </Modal>
      <Row
        gutter={[
          { xs: 10, sm: 16, md: 24, lg: 32 },
          { xs: 10, sm: 16, md: 24, lg: 32 },
        ]}
        style={{ padding: 20 }}
      >
        {listData}
        {data.map((category) => {
          return (
            <Col
              xs={24}
              sm={12}
              md={12}
              lg={8}
              xl={6}
              className="gutter-row"
              span={6}
              style={{ padding: "10px" }}
            >
              <Card
                className="content"
                style={{ alignItems: "center", borderRadius: "10px" }}
              >
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key="1"
                        onClick={function () {
                          userform.resetFields();
                          setUserFormDisable(true);
                          openShowUser(category);
                        }}
                      >
                        عرض البيانات
                      </Menu.Item>
                      <Menu.Item
                        key="2"
                        onClick={function () {
                          userform.resetFields();
                          setUserFormDisable(false);
                          openShowUser(category);
                        }}
                      >
                        تعديل البيانات
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        key="3"
                        onClick={function () {
                          setIsDVisibleModal(true);
                          setDDept(category);
                        }}
                      >
                        حذف
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <a
                    style={{ float: "left", fontSize: "20px" }}
                    className="ant-dropdown-link"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreOutlined key="ellipsis" />
                  </a>
                </Dropdown>
                <div
                  className="card-content"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <Avatar
                      size={{ xs: 35, sm: 35, md: 45, lg: 60, xl: 60, xxl: 60 }}
                      src={Env.HOST_SERVER_STORAGE + category.avatar}
                      style={{
                        display: "block",
                        margin: "10px",
                        alignSelf: "center",
                      }}
                    />
                    <span style={{ marginTop: "10px" }}>
                      <div style={{ color: "#7E7D7C" }}> الموظفون</div>
                      <div style={{ fontWeight: "bolder", fontSize: "24px" }}>
                        {category.tot_users ?? 0}
                      </div>
                    </span>
                    <span style={{ marginTop: "10px" }}>
                      <div style={{ color: "#7E7D7C" }}>الحاضرون</div>
                      <div style={{ fontWeight: "bolder", fontSize: "24px" }}>
                        {category.att_users ?? 0}
                      </div>
                    </span>
                    <span style={{ marginTop: "10px" }}>
                      <div style={{ color: "#7E7D7C" }}>الغائبون</div>
                      <div style={{ fontWeight: "bolder", fontSize: "24px" }}>
                        {category.tot_users - category.att_users}
                      </div>
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          textAlign: "right",
                          fontSize: "14px",
                          margin: "5px 35px 0 7px",
                        }}
                      >
                        {category.name}{" "}
                      </div>
                      <div
                        style={{
                          color: "#7E7D7C",
                          textAlign: "right",
                          fontSize: "14px",
                          marginRight: "35px",
                        }}
                      >
                        {category.user_name}{" "}
                      </div>
                    </div>
                    <Progress
                      type="circle"
                      percent={category.att_percent ?? 0}
                      width={50}
                    />
                  </div>
                  <Rate
                    style={{ textAlign: "center", marginBottom: "5px" }}
                    disabled
                    allowHalf
                    value={
                      starList?.filter(function (e) {
                        return e.category_id == category.id;
                      })[0]?.star
                    }
                  />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Layout>
  );
}
