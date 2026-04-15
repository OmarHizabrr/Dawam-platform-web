import {
  FileOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Checkbox,
  Col,
  Collapse,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  Upload,
} from "antd";
import React from "react";
import { HOST_SERVER_STORAGE } from "../../../styles/env";

const { Text } = Typography;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const { Option } = Select;

const EmployeeModal = ({
  isVisibleModal,
  onCancel,
  onFinish,
  modalLoad,
  userFormDisable,
  selectedUser,
  user,
  userform,
  types,
  categories,
  durations,
  attachments,
  UploadProps,
  callback,
}) => {
  return (
    <Modal
      centered
      okButtonProps={{ disabled: userFormDisable }}
      confirmLoading={modalLoad}
      className="emp-modal"
      width={1200}
      title="بيانات الموظف"
      open={isVisibleModal}
      onOk={function () {
        onFinish();
      }}
      onCancel={onCancel}
    >
      <Form form={userform} onFinish={onFinish} requiredMark={true}>
        <Row style={{ backgroundColor: "#F6F6F6" }}>
          <Col
            xs={24}
            sm={24}
            md={8}
            lg={8}
            xl={8}
            className="personal-data"
            span={8}
            style={{ padding: "20px" }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                padding: "10px 20px",
              }}
            >
              <Avatar
                size={{ xs: 60, sm: 60, md: 80, lg: 100, xl: 100, xxl: 100 }}
                src={
                  selectedUser
                    ? HOST_SERVER_STORAGE + selectedUser.avatar
                    : user
                      ? HOST_SERVER_STORAGE + user.avatar
                      : ""
                }
                style={{
                  display: "block",
                  margin: "10px 10px 20px",
                  alignSelf: "center",
                }}
              />
              <Text style={{ fontWeight: "700", marginBottom: "10px" }}>
                {"البيانات الشخصية"}
              </Text>
              <Form.Item name="id" hidden={true} style={{ display: "none" }}>
                <Input />
              </Form.Item>
              <Form.Item
                label="الاسم رباعيًا"
                name="name"
                rules={[{ required: true, message: '"الاسم رباعيًا مطلوب" ' }]}
              >
                <Input
                  disabled={userFormDisable}
                  style={{ height: "30px", borderRadius: "12px" }}
                />
              </Form.Item>
              <Form.Item
                name={"sex"}
                label="الجنس"
                rules={[{ required: true, message: "الجنس مطلوب" }]}
              >
                <Select
                  disabled={userFormDisable}
                  options={types.filter(function (e) {
                    return e.parent == 1;
                  })}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.props?.children?.localeCompare(
                      optionB.props.children
                    )
                  }
                  style={{ height: "30px", borderRadius: "12px" }}
                ></Select>
              </Form.Item>
              <Form.Item name={"birth_date"} label="تاريخ الميلاد">
                <DatePicker
                  needConfirm={false}
                  inputReadOnly={window.innerWidth <= 760}
                  disabled={userFormDisable}
                  format="YYYY-MM-DD"
                  style={{
                    width: "100%",
                    height: "30px",
                    borderRadius: "12px",
                  }}
                />
              </Form.Item>
              <Form.Item name={"birth_place"} label="مكان الميلاد">
                <Input
                  disabled={userFormDisable}
                  style={{
                    width: "100%",
                    height: "30px",
                    borderRadius: "12px",
                  }}
                />
              </Form.Item>
              <Form.Item name={"marital_status"} label="الحالة الاجتماعية">
                <Select
                  options={types.filter(function (e) {
                    return e.parent == 2;
                  })}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.props?.children?.localeCompare(
                      optionB.props.children
                    )
                  }
                  disabled={userFormDisable}
                  style={{ height: "30px", borderRadius: "12px" }}
                ></Select>
              </Form.Item>
              <Form.Item name={"children_no"} label="عدد الأولاد">
                <InputNumber
                  disabled={userFormDisable}
                  style={{
                    width: "100%",
                    height: "30px",
                    borderRadius: "12px",
                  }}
                />
              </Form.Item>
              <Form.Item label="رقم الهوية" name="id_no">
                <Input
                  disabled={userFormDisable}
                  style={{ height: "30px", borderRadius: "12px" }}
                />
              </Form.Item>
              <Form.Item name={"id_type"} label="نوع الهوية">
                <Select
                  options={types.filter(function (e) {
                    return e.parent == 3;
                  })}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.props?.children?.localeCompare(
                      optionB.props.children
                    )
                  }
                  disabled={userFormDisable}
                  style={{ height: "30px", borderRadius: "12px" }}
                ></Select>
              </Form.Item>
            </div>
          </Col>
          <Col
            xs={24}
            sm={24}
            md={16}
            lg={16}
            xl={16}
            span={16}
            style={{ padding: "20px 0px 20px 20px" }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                padding: "10px 20px",
              }}
            >
              <Collapse
                defaultActiveKey={["1", "2", "3", "4", "5", "6", "7", "8"]}
                onChange={callback}
              >
                <Panel
                  header="البيانات الوظيفة"
                  className="personal-data"
                  key="1"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12} span={12}>
                      <Form.Item
                        style={{ marginLeft: "5px", flex: 2 }}
                        label="الوظيفة"
                        name="job"
                        rules={[{ required: true, message: "الوظيفة مطلوبة" }]}
                      >
                        <Input
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{ marginLeft: "5px", flex: 3 }}
                        label="الإدارة"
                        name="category_id"
                        rules={[{ required: true, message: "الإدارة مطلوبة" }]}
                      >
                        <Select
                          disabled={userFormDisable}
                          options={categories}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.props?.children?.localeCompare(
                              optionB.props.children
                            )
                          }
                          style={{ height: "30px", borderRadius: "12px" }}
                        ></Select>
                      </Form.Item>
                      <Form.Item
                        style={{ marginLeft: "5px", flex: 2 }}
                        label="الدرجة"
                        name="level"
                        rules={[{ required: true, message: "الدرجة مطلوبة" }]}
                      >
                        <Select
                          disabled={userFormDisable}
                          options={types.filter(function (e) {
                            return e.parent == 23;
                          })}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.props?.children?.localeCompare(
                              optionB.props.children
                            )
                          }
                          style={{ height: "30px", borderRadius: "12px" }}
                        ></Select>
                      </Form.Item>
                      <Form.Item
                        style={{ flex: 1 }}
                        label="حالة التوظيف"
                        name="status"
                        rules={[
                          { required: true, message: "حالة التوظيف مطلوبة" },
                        ]}
                      >
                        <Select
                          options={types.filter(function (e) {
                            return e.parent == 5;
                          })}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.props?.children?.localeCompare(
                              optionB.props.children
                            )
                          }
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        ></Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={12} lg={12} xl={12} span={12}>
                      <Form.Item
                        style={{ flex: 1, marginLeft: "5px" }}
                        label="تاريخ الانضمام"
                        name="assignment_date"
                        rules={[
                          { required: true, message: "تاريخ الانضمام مطلوب" },
                        ]}
                      >
                        <DatePicker
                          needConfirm={false}
                          inputReadOnly={window.innerWidth <= 760}
                          style={{
                            width: "100%",
                            height: "30px",
                            borderRadius: "12px",
                          }}
                          disabled={userFormDisable}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{ flex: 1, marginLeft: "5px" }}
                        label="الإعانة"
                        name="salary"
                        rules={[{ required: true, message: "الإعانة مطلوبة" }]}
                      >
                        <Input
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{ flex: 1 }}
                        label="عملة الإعانة"
                        name="salary_currency"
                        rules={[
                          { required: true, message: "عملة الإعانة مطلوبة" },
                        ]}
                      >
                        <Select
                          options={types.filter(function (e) {
                            return e.parent == 4;
                          })}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.props?.children?.localeCompare(
                              optionB.props.children
                            )
                          }
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        ></Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
                <Panel header="البدلات" key="7">
                  <div>
                    <Form.Item
                      style={{ flex: 1, marginLeft: "5px" }}
                      label="بدل المواصلات"
                      name="transfer_value"
                    >
                      <Input
                        disabled={userFormDisable}
                        style={{ height: "30px", borderRadius: "12px" }}
                      />
                    </Form.Item>
                    <Form.List name="allownces">
                      {(fields, { add, remove }) => {
                        return (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space
                                key={key}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, "id"]}
                                  style={{ display: "none" }}
                                >
                                  <Input disabled={userFormDisable} />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  label={"نوع البدل"}
                                  name={[name, "allownce_type"]}
                                >
                                  <Input
                                    disabled={userFormDisable}
                                    placeholder="نوع البدل"
                                    style={{
                                      height: "30px",
                                      borderRadius: "12px",
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, "allownce_amount"]}
                                  label={"مبلغ البدل"}
                                >
                                  <InputNumber
                                    disabled={userFormDisable}
                                    placeholder="المبلغ"
                                    style={{
                                      height: "30px",
                                      borderRadius: "12px",
                                    }}
                                  />
                                </Form.Item>

                                <MinusCircleOutlined
                                  onClick={() => remove(name)}
                                />
                              </Space>
                            ))}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                إضافة بدل
                              </Button>
                            </Form.Item>
                          </>
                        );
                      }}
                    </Form.List>
                  </div>
                </Panel>
                <Panel header="الاستقطاعات" key="8">
                  <Form.Item
                    style={{ flex: 1, marginLeft: "5px" }}
                    label="مبلغ التكافل"
                    name="symbiosis"
                  >
                    <Input
                      disabled={userFormDisable}
                      style={{ height: "30px", borderRadius: "12px" }}
                    />
                  </Form.Item>
                  <Form.List name="deductions">
                    {(fields, { add, remove }) => {
                      return (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Space
                              key={key}
                              style={{ display: "flex", marginBottom: 8 }}
                              align="baseline"
                            >
                              <Form.Item
                                {...restField}
                                name={[name, "id"]}
                                style={{ display: "none" }}
                              >
                                <Input disabled={userFormDisable} />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                label={"نوع الاستقطاع"}
                                name={[name, "deduction_type"]}
                              >
                                <Select
                                  style={{
                                    minWidth: "100px",
                                    height: "30px",
                                    borderRadius: "12px",
                                  }}
                                  disabled={userFormDisable}
                                  options={types.filter(function (e) {
                                    return e.parent == 40;
                                  })}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option.props.children?.indexOf(input) >=
                                    0 ||
                                    option.props.label?.indexOf(input) >= 0
                                  }
                                  filterSort={(optionA, optionB) =>
                                    optionA.props?.children?.localeCompare(
                                      optionB.props.children
                                    )
                                  }
                                ></Select>
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "deduction_amount"]}
                                label={"مبلغ الاستقطاع"}
                              >
                                <InputNumber
                                  disabled={userFormDisable}
                                  placeholder="المبلغ"
                                  style={{
                                    height: "30px",
                                    borderRadius: "12px",
                                  }}
                                />
                              </Form.Item>

                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                              />
                            </Space>
                          ))}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<PlusOutlined />}
                            >
                              إضافة استقطاع
                            </Button>
                          </Form.Item>
                        </>
                      );
                    }}
                  </Form.List>
                </Panel>
                <Panel header="معلومات التواصل" key="2">
                  <div>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <Form.Item
                        style={{ flex: 1, marginLeft: "5px" }}
                        label="عنوان السكن"
                        name="address"
                      >
                        <Input
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{ flex: 1, marginLeft: "5px" }}
                        label="البريد الإلكتروني"
                        name="email"
                      >
                        <Input
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        />
                      </Form.Item>
                    </div>
                    <Form.List name="contacts">
                      {(fields, { add, remove }) => {
                        return (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space
                                key={key}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, "id"]}
                                  style={{ display: "none" }}
                                >
                                  <Input disabled={userFormDisable} />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  label={"نوع الرقم"}
                                  name={[name, "phone_type"]}
                                >
                                  <Input
                                    disabled={userFormDisable}
                                    placeholder="نوع الرقم"
                                    style={{
                                      height: "30px",
                                      borderRadius: "12px",
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, "phone_number"]}
                                  label={"رقم الهاتف"}
                                >
                                  <Input
                                    disabled={userFormDisable}
                                    placeholder="الرقم"
                                    style={{
                                      height: "30px",
                                      borderRadius: "12px",
                                    }}
                                  />
                                </Form.Item>

                                <MinusCircleOutlined
                                  onClick={() => remove(name)}
                                />
                              </Space>
                            ))}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                إضافة رقم هاتف
                              </Button>
                            </Form.Item>
                          </>
                        );
                      }}
                    </Form.List>
                  </div>
                </Panel>
                <Panel header="بيانات النظام والصلاحيات" key="3">
                  <div>
                    <Form.Item
                      style={{ flex: 3 }}
                      label="نوع الدوام"
                      name="durationtype_id"
                      rules={[{ required: true, message: "نوع الدوام مطلوب" }]}
                    >
                      <Select
                        disabled={userFormDisable}
                        options={durations}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        filterSort={(optionA, optionB) =>
                          (optionA?.label ?? "").localeCompare(optionB?.label ?? "")
                        }
                        style={{ height: "30px", borderRadius: "12px" }}
                      ></Select>
                    </Form.Item>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <Form.Item
                        style={{ flex: 1, marginLeft: "5px" }}
                        label="الرقم الوظيفي"
                        name="user_id"
                        rules={[
                          { required: true, message: "الرقم الوظيفي مطلوب" },
                        ]}
                      >
                        <Input
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{ flex: 1, marginLeft: "5px" }}
                        label="اسم المستخدم"
                        name="user_name"
                        rules={[
                          { required: true, message: "اسم المستخدم مطلوب" },
                        ]}
                      >
                        <Input
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{ flex: 1, marginLeft: "5px" }}
                        label="كلمة المرور"
                        name="password"
                        rules={[
                          { required: true, message: "كلمة المرور مطلوبة" },
                        ]}
                      >
                        <Input
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        />
                      </Form.Item>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <Form.Item
                        style={{ flex: 2, marginLeft: "5px" }}
                        label="حالة البصمة"
                        name="fingerprint_type"
                        rules={[
                          { required: true, message: "حالة البصمة مطلوبة" },
                        ]}
                      >
                        <Select
                          options={types.filter(function (e) {
                            return e.parent == 20;
                          })}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.props?.children?.localeCompare(
                              optionB.props.children
                            )
                          }
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        ></Select>
                      </Form.Item>
                      <Form.Item
                        style={{ flex: 2, marginLeft: "5px" }}
                        label="صلاحية المستخدم"
                        name="role_id"
                        rules={[
                          {
                            required: true,
                            message: "صلاحية المستخدم مطلوبة",
                          },
                        ]}
                      >
                        <Select
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.props?.children?.localeCompare(
                              optionB.props.children
                            )
                          }
                          disabled={userFormDisable}
                          style={{ height: "30px", borderRadius: "12px" }}
                        >
                          <Option value="2">مستخدم عادي</Option>
                          <Option value="1">مدير</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        style={{ flex: 1, marginLeft: "5px" }}
                        label="لوحة التحكم"
                        valuePropName="checked"
                        name="control_panel"
                      >
                        <Checkbox />
                      </Form.Item>
                      <Form.Item
                        style={{ flex: 1, marginLeft: "5px" }}
                        label="المدير العام"
                        valuePropName="checked"
                        name="general_manager"
                      >
                        <Checkbox />
                      </Form.Item>
                    </div>
                  </div>
                </Panel>
                <Panel header="المؤهلات العلمية" key="4">
                  <div>
                    <Form.List name="qualifications">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Space
                              key={key}
                              style={{ display: "flex", marginBottom: 8 }}
                              align="baseline"
                            >
                              <Form.Item
                                {...restField}
                                name={[name, "id"]}
                                style={{ display: "none" }}
                              >
                                <Input disabled={userFormDisable} />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                label={"اسم المؤهل "}
                                name={[name, "qual_name"]}
                              >
                                <Input
                                  disabled={userFormDisable}
                                  placeholder="اسم المؤهل "
                                  style={{
                                    height: "30px",
                                    borderRadius: "12px",
                                  }}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "qual_year"]}
                                label={"سنة الحصول عليه"}
                              >
                                <DatePicker
                                  needConfirm={false}
                                  inputReadOnly={window.innerWidth <= 760}
                                  disabled={userFormDisable}
                                  picker="year"
                                  style={{
                                    height: "30px",
                                    borderRadius: "12px",
                                  }}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "qual_source"]}
                                label={"جهة الحصول عليه"}
                              >
                                <Input
                                  disabled={userFormDisable}
                                  style={{
                                    height: "30px",
                                    borderRadius: "12px",
                                  }}
                                />
                              </Form.Item>
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                              />
                            </Space>
                          ))}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<PlusOutlined />}
                            >
                              إضافة مؤهل{" "}
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </div>
                </Panel>
                <Panel header="الوظائف السابقة" key="5">
                  <div>
                    <Form.List name="preworks">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Space
                              key={key}
                              style={{ display: "flex", marginBottom: 8 }}
                              align="baseline"
                            >
                              <Form.Item
                                {...restField}
                                name={[name, "id"]}
                                style={{ display: "none" }}
                              >
                                <Input disabled={userFormDisable} />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                label={"اسم الوظيفة "}
                                name={[name, "job_name"]}
                              >
                                <Input
                                  disabled={userFormDisable}
                                  placeholder="اسم الوظيفة "
                                  style={{
                                    height: "30px",
                                    borderRadius: "12px",
                                  }}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "work_period"]}
                                label={"فترة العمل"}
                              >
                                <RangePicker
                                  needConfirm={true}
                                  inputReadOnly={window.innerWidth <= 760}
                                  disabled={userFormDisable}
                                  picker="year"
                                  style={{
                                    height: "30px",
                                    borderRadius: "12px",
                                  }}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "work_place"]}
                                label={"الجهة"}
                              >
                                <Input
                                  disabled={userFormDisable}
                                  style={{
                                    height: "30px",
                                    borderRadius: "12px",
                                  }}
                                />
                              </Form.Item>
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                              />
                            </Space>
                          ))}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<PlusOutlined />}
                            >
                              إضافة وظيفة سابقة{" "}
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </div>
                </Panel>
                <Panel header="الملفات المرفقة" key="6">
                  <div>
                    <Form.List name="attachments">
                      {(fields, { add, remove }) => {
                        return (
                          <>
                            {fields.map(
                              ({ key, name, ...restField }, index) => {
                                return (
                                  <Space
                                    key={key}
                                    style={{
                                      display: "flex",
                                      marginBottom: 8,
                                    }}
                                    align="baseline"
                                  >
                                    <Form.Item
                                      {...restField}
                                      name={[name, "id"]}
                                      style={{ display: "none" }}
                                    >
                                      <Input disabled={userFormDisable} />
                                    </Form.Item>
                                    <Form.Item
                                      {...restField}
                                      label={"اسم المرفق "}
                                      name={[name, "attach_name"]}
                                    >
                                      <Input
                                        disabled={userFormDisable}
                                        placeholder="اسم المرفق "
                                        style={{
                                          height: "30px",
                                          borderRadius: "12px",
                                        }}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "attach_path"]}
                                      getValueFromEvent={({ file }) =>
                                        file.originFileObj
                                      }
                                      label={"الملف المرفق"}
                                    >
                                      <Upload
                                        listType="text"
                                        props={UploadProps}
                                      >
                                        <Button type="primary">
                                          <UploadOutlined /> رفع الملف
                                        </Button>
                                      </Upload>
                                    </Form.Item>
                                    <a
                                      target="_BLANK"
                                      href={
                                        attachments[index]
                                          ? HOST_SERVER_STORAGE +
                                          attachments[index]["attach_path"]
                                          : ""
                                      }
                                    >
                                      {" "}
                                      <FileOutlined
                                        hidden={!attachments[index]}
                                      />{" "}
                                      {attachments[index]
                                        ? attachments[index]["attach_name"]
                                        : ""}
                                    </a>
                                    <MinusCircleOutlined
                                      onClick={() => remove(name)}
                                    />
                                  </Space>
                                );
                              }
                            )}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                              >
                                إضافة مرفق{" "}
                              </Button>
                            </Form.Item>
                          </>
                        );
                      }}
                    </Form.List>
                  </div>
                </Panel>
              </Collapse>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EmployeeModal;
