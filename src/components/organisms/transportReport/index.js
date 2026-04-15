/* eslint-disable react-hooks/rules-of-hooks */
import {
  ExportOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Layout,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Typography,
} from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import excel from "xlsx";
import { Env, PrintFonts } from "./../../../styles";
import "./style.css";

const { Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const { Option } = Select;
const { RangePicker } = DatePicker;
const exportToExcel = (type, fn, dl) => {
  var elt = document.getElementsByTagName("table")[0];
  if (elt) {
    var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl
      ? excel.write(wb, { bookType: type, bookSST: true, type: "base64" })
      : excel.writeFile(wb, fn || "كشف الخصميات." + (type || "xlsx"));
  }
};
export default function TransportReport(props) {
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [namesFilter, setNamesFilter] = useState([]);
  const [categoriesFilter, setCategoriesFilter] = useState([]);
  const [names, setNames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [loadUsers, setLoadUsers] = useState(false);
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [loadForm, setLoadForm] = useState(false);

  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);
  const [start, setStart] = useState(
    dayjs(
      dayjs().format("YYYY-MM") +
        "-" +
        props.setting.filter((item) => item.key == "admin.month_start")[0]
          ?.value,
      "YYYY-MM-DD"
    )
      .subtract(1, "months")
      .format("YYYY-MM-DD")
  );
  const [end, setEnd] = useState(
    dayjs(
      dayjs().format("YYYY-MM") +
        "-" +
        props.setting.filter((item) => item.key == "admin.month_end")[0]?.value,
      "YYYY-MM-DD"
    ).format("YYYY-MM-DD")
  );
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM"));
  const [pdata, setPData] = useState([]);
  const [form] = Form.useForm();
  const [tstypes, setTstypes] = useState([]);

  const normalizeText = (value) =>
    (value ?? "").toString().trim().toLowerCase();
  const matchesFilterValue = (recordValue, filterValue) =>
    normalizeText(recordValue) === normalizeText(filterValue);

  const showUsersDebt = () => {
    setLoadUsers(true);
    form.setFieldsValue({ users: pdata });
    setIsVisibleModal(true);
    setLoadUsers(false);
  };

  const settingBefore = () => {
    setPData(form.getFieldsValue().users);
    setIsVisibleModal(false);
  };

  // Custom filter dropdown component for names
  const NamesFilterDropdown = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => {
    const [searchText, setSearchText] = useState("");
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAll = () => {
      if (selectAll) {
        // Deselect all
        setSelectedKeys([]);
        setSelectAll(false);
      } else {
        // Select all
        const allValues = namesFilter
          .filter((name) => name.value !== "SELECT_ALL_NAMES")
          .map((name) => name.value);
        setSelectedKeys(allValues);
        setSelectAll(true);
      }
    };

    const handleConfirm = () => {
      confirm();
    };

    const handleClear = () => {
      clearFilters();
      setSelectedKeys([]);
      setSelectAll(false);
    };

    const filteredNames = namesFilter.filter(
      (name) =>
        name.value !== "SELECT_ALL_NAMES" &&
        name.text.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
      <div style={{ padding: 8 }}>
        <Input
          placeholder="البحث..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <div style={{ marginBottom: 8 }}>
          <Checkbox
            checked={selectAll}
            onChange={handleSelectAll}
            style={{ fontWeight: "bold" }}
          >
            تحديد الكل
          </Checkbox>
        </div>
        <div style={{ maxHeight: 200, overflow: "auto" }}>
          {filteredNames.map((name) => (
            <div key={name.value} style={{ marginBottom: 4 }}>
              <Checkbox
                checked={selectedKeys.includes(name.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKeys([...selectedKeys, name.value]);
                  } else {
                    setSelectedKeys(
                      selectedKeys.filter((key) => key !== name.value)
                    );
                  }
                  setSelectAll(false);
                }}
              >
                {name.text}
              </Checkbox>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Button size="small" onClick={handleClear} style={{ marginRight: 8 }}>
            مسح
          </Button>
          <Button type="primary" size="small" onClick={handleConfirm}>
            تأكيد
          </Button>
        </div>
      </div>
    );
  };

  // Custom filter dropdown component for categories
  const CategoriesFilterDropdown = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => {
    const [searchText, setSearchText] = useState("");
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAll = () => {
      if (selectAll) {
        // Deselect all
        setSelectedKeys([]);
        setSelectAll(false);
      } else {
        // Select all
        const allValues = categoriesFilter
          .filter((category) => category.value !== "SELECT_ALL_CATEGORIES")
          .map((category) => category.value);
        setSelectedKeys(allValues);
        setSelectAll(true);
      }
    };

    const handleConfirm = () => {
      confirm();
    };

    const handleClear = () => {
      clearFilters();
      setSelectedKeys([]);
      setSelectAll(false);
    };

    const filteredCategories = categoriesFilter.filter(
      (category) =>
        category.value !== "SELECT_ALL_CATEGORIES" &&
        category.text.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
      <div style={{ padding: 8 }}>
        <Input
          placeholder="البحث..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <div style={{ marginBottom: 8 }}>
          <Checkbox
            checked={selectAll}
            onChange={handleSelectAll}
            style={{ fontWeight: "bold" }}
          >
            تحديد الكل
          </Checkbox>
        </div>
        <div style={{ maxHeight: 200, overflow: "auto" }}>
          {filteredCategories.map((category) => (
            <div key={category.value} style={{ marginBottom: 4 }}>
              <Checkbox
                checked={selectedKeys.includes(category.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKeys([...selectedKeys, category.value]);
                  } else {
                    setSelectedKeys(
                      selectedKeys.filter((key) => key !== category.value)
                    );
                  }
                  setSelectAll(false);
                }}
              >
                {category.text}
              </Checkbox>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Button size="small" onClick={handleClear} style={{ marginRight: 8 }}>
            مسح
          </Button>
          <Button type="primary" size="small" onClick={handleConfirm}>
            تأكيد
          </Button>
        </div>
      </div>
    );
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setLoad(true);
    FirebaseServices.getTransportCumulative(start, end)
      .then((data) => {
        let names = [];
        let categories = [];
        let ts = [];
        data.records.forEach((element) => {
          if (!names.some((item) => element.name == item.text))
            names.push({ text: element["name"], value: element["name"] });
          ts.push({ label: element["name"], value: element["user_id"] });
          if (!categories.some((item) => element.category == item.text))
            categories.push({
              text: element["category"],
              value: element["category"],
            });
        });
        // Add "Select All" option to names filter
        const namesWithSelectAll = [
          { text: "تحديد الكل", value: "SELECT_ALL_NAMES" },
          ...names,
        ];

        // Add "Select All" option to categories filter
        const categoriesWithSelectAll = [
          { text: "تحديد الكل", value: "SELECT_ALL_CATEGORIES" },
          ...categories,
        ];

        setNamesFilter(namesWithSelectAll);
        setCategoriesFilter(categoriesWithSelectAll);
        setTstypes(ts);
        setPData(data.records);
        setData(data.records);
        setCategories(data.categories);
        setCount(data.count?.[0]?.count || 0);
        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [start, end]);

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);

    if (!filters || Object.keys(filters).length === 0) {
      setPData(data);
      return;
    }

    const hasActiveFilters = Object.values(filters).some(
      (value) => Array.isArray(value) && value.length > 0
    );

    if (!hasActiveFilters) {
      setPData(data);
      return;
    }

    const filteredData = data.filter((item) =>
      Object.entries(filters).every(([key, selectedValues]) => {
        if (!Array.isArray(selectedValues) || !selectedValues.length) {
          return true;
        }

        return selectedValues.some((filterValue) =>
          matchesFilterValue(item[key], filterValue)
        );
      })
    );

    setPData(filteredData);
  };
  const changeRange = (all, date) => {
    //const id=cookies.user;
    setStart(date[0]);
    setEnd(date[1]);
  };

  const columns = [
    {
      title: "اسم الموظف",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
      ellipsis: false,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <NamesFilterDropdown
          setSelectedKeys={setSelectedKeys}
          selectedKeys={selectedKeys}
          confirm={confirm}
          clearFilters={clearFilters}
        />
      ),
      onFilter: (value, record) => matchesFilterValue(record.name, value),
      filteredValue: filteredInfo.name || null,
    },
    {
      title: "الإدارة",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: sortedInfo.columnKey === "category" && sortedInfo.order,
      ellipsis: false,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <CategoriesFilterDropdown
          setSelectedKeys={setSelectedKeys}
          selectedKeys={selectedKeys}
          confirm={confirm}
          clearFilters={clearFilters}
        />
      ),
      onFilter: (value, record) => {
        const result = matchesFilterValue(record.category, value);
        return result;
      },
      filteredValue: filteredInfo.category || null,
    },
    {
      title: "المسى الوظيفي",
      dataIndex: "job",
      key: "job",
      sorter: (a, b) => a.job.localeCompare(b.job.length),
      sortOrder: sortedInfo.columnKey === "job" && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: "عدد الأيام",
      dataIndex: "transportCount",
      key: "transportCount",
      sorter: (a, b) => a.transportCount - b.transportCount,
      sortOrder: sortedInfo.columnKey === "transportCount" && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: "المستحق اليومي",
      dataIndex: "transfer_value",
      key: "transfer_value",
      sorter: (a, b) => a.transfer_value - b.transfer_value,
      sortOrder: sortedInfo.columnKey === "transfer_value" && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: "إجمالي المبلغ المستحق",
      dataIndex: "transportAmount",
      key: "transportAmount",
      sorter: (a, b) => a.transportAmount - b.transportAmount,
      sortOrder: sortedInfo.columnKey === "transportAmount" && sortedInfo.order,
      ellipsis: true,
    },
  ];
  const printReport = () => {
    var report = document.getElementById("att-report");
    //var report=document.body;
    var mywindow = window.open("");
    mywindow.document.write(
      "<html><head><title></title> <style>" +
        PrintFonts.getPrintFontsCSS() +
        "body{font-size:12px;margin:0} " +
        "</style>"
    );
    mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
    mywindow.document.write(report.innerHTML);
    mywindow.document.write("</body></html>");

    mywindow.document.close();
    mywindow.onload = function () {
      // wait until all resources loaded
      mywindow.focus(); // necessary for IE >= 10
      mywindow.print(); // change window to mywindow
      mywindow.close(); // change window to mywindow
    };
  };
  const onChange = (all, data) => {
    setCurrentMonth(all.format("MMMM"));

    var startDay = props.setting.filter(
      (item) => item.key == "admin.month_start"
    )[0]?.value;
    var endDay = props.setting.filter(
      (item) => item.key == "admin.month_end"
    )[0]?.value;

    setStart(
      dayjs(data + "-" + startDay, "YYYY-MM-DD")
        .subtract(1, "months")
        .format("YYYY-MM-DD")
    );
    setEnd(dayjs(data + "-" + endDay, "YYYY-MM-DD").format("YYYY-MM-DD"));
  };
  var index = 0;
  var ttvalue = 0;
  var ttamount = 0;
  var ttdiscount = 0;
  var ttcount = 0;
  var ttrcount = 0;

  return (
    <Layout>
      <Card>
        <div style={{ marginBottom: "10px" }}>
          <div className="discountHeader" style={{ marginBottom: "10px" }}>
            <div style={{ marginLeft: "10px" }}>
              <span>اختر شهرًا : </span>
              <DatePicker
                needConfirm={false}
                inputReadOnly={window.innerWidth <= 760}
                defaultValue={dayjs()}
                onChange={onChange}
                picker="month"
              />
            </div>
            <div className="discountRange" style={{ marginBottom: "10px" }}>
              <span>اختر فترة : </span>
              <RangePicker
                needConfirm={true}
                inputReadOnly={window.innerWidth <= 760}
                value={[dayjs(start, "YYYY-MM-DD"), dayjs(end, "YYYY-MM-DD")]}
                onChange={changeRange}
              />
            </div>
            <div className="discountBtn">
              <Button
                style={{ display: "block", margin: "0 10px" }}
                onClick={function () {
                  exportToExcel("xlsx");
                }}
                type="primary"
              >
                <ExportOutlined />
              </Button>
              <Button
                style={{
                  display: "block",
                  margin: "0 10px",
                  backgroundColor: "#0972B6",
                  borderColor: "#0972B6",
                }}
                onClick={function () {
                  printReport();
                }}
                type="primary"
              >
                <PrinterOutlined />
              </Button>
              <Button
                loading={loadUsers}
                style={{
                  display: "block",
                  backgroundColor: "#0972B6",
                  borderColor: "#0972B6",
                }}
                onClick={function () {
                  showUsersDebt();
                }}
                type="primary"
              >
                <PlusOutlined />
              </Button>
              <Modal
                centered
                confirmLoading={loadForm}
                width={900}
                title="إعدادات قبل الطباعة "
                visible={isVisibleModal}
                onOk={function () {
                  settingBefore();
                }}
                onCancel={function () {
                  setIsVisibleModal(false);
                }}
              >
                <Form form={form}>
                  <Form.List name="users">
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
                                <Input />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "user_id"]}
                                label="اسم الموظف"
                                rules={[
                                  { required: true, message: "Missing area" },
                                ]}
                              >
                                <Select
                                  style={{ width: 250 }}
                                  showSearch
                                  optionFilterProp="children"
                                  notFoundContent={
                                    <Spin
                                      style={{ textAlign: "center" }}
                                    ></Spin>
                                  }
                                  filterOption={(input, option) =>
                                    option.props.children?.indexOf(input) >=
                                      0 ||
                                    option.props.value?.indexOf(input) >= 0 ||
                                    option.props.label?.indexOf(input) >= 0
                                  }
                                  filterSort={(optionA, optionB) =>
                                    optionA.props?.children?.localeCompare(
                                      optionB.props.children
                                    )
                                  }
                                >
                                  {tstypes.map((item) => (
                                    <Option key={item.value} value={item.value}>
                                      {item.label}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "discount"]}
                                label={"مبلغ الاستقطاع"}
                                rules={[
                                  {
                                    required: true,
                                    message: "هذا الحقل مطلوب",
                                  },
                                ]}
                              >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "note"]}
                                label={"ملاحظات"}
                              >
                                <TextArea
                                  style={{ width: "150px" }}
                                  placeholder="ملاحظات"
                                />
                              </Form.Item>
                            </Space>
                          ))}
                        </>
                      );
                    }}
                  </Form.List>
                </Form>
              </Modal>
            </div>
          </div>
        </div>
        <Table
          loading={load}
          style={{ textAlign: "center!important" }}
          columns={columns}
          scroll={{ x: "1000px" }}
          onRow={(record, rowIndex) => {
            return { className: record.status };
          }}
          dataSource={pdata}
          onChange={handleChange}
        />
      </Card>
      <div id="att-report" style={{ display: "none" }}>
        <div
          style={{
            direction: "rtl",
            fontSize: "12px",
            fontFamily: "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            margin: "0",
          }}
        >
          <table
            style={{ fontSize: "11px", width: " 100%", textAlign: " center" }}
          >
            <thead>
              <tr style={{ border: "none" }}>
                <th colSpan={15}>
                  <header
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      borderColor: "#000",
                      borderBottomStyle: "solid",
                      borderBottomWidth: "1px",
                    }}
                  >
                    <div style={{ width: "20%" }}>
                      <img
                        loading="eager"
                        style={{ width: "250px" }}
                        src={
                          Env.HOST_SERVER_STORAGE +
                          props.setting.filter(
                            (item) => item.key == "admin.logo"
                          )[0]?.value
                        }
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        textAlign: "center",
                        width: "60%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "end",
                        paddingBottom: "10px",
                      }}
                    >
                      <h1
                        style={{
                          fontSize: " 18px",
                          fontWeight: 700,
                          marginBottom: " 5px",
                          margin: "0",
                        }}
                      >
                        كشف المواصلات لشهر {currentMonth}
                      </h1>
                      <h2
                        style={{
                          fontSize: " 14px",
                          fontWeight: " 200",
                          margin: "0",
                        }}
                      >
                        للفترة من {start} إلى {end}
                      </h2>
                    </div>
                    <div style={{ width: "20%" }}></div>
                  </header>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      textAlign: "center",
                      fontSize: "14px",
                      borderBottom: "1px solid black",
                    }}
                  ></div>
                </th>
              </tr>
              <tr
                style={{
                  color: "#fff",
                  backgroundColor: "#0972B6",
                  height: "30px",
                }}
              >
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  م
                </th>
                <th style={{ fontWeight: "100" }}>الاسم</th>
                <th style={{ fontWeight: "100", width: "100px" }}>الوظيفة</th>
                <th style={{ fontWeight: "100" }}>الأيام المطلوبة</th>
                <th style={{ fontWeight: "100" }}>الأيام الفعلية</th>
                <th style={{ fontWeight: "100" }}>المستحق اليومي</th>
                <th style={{ fontWeight: "100" }}>المبلغ المستحق</th>
                <th style={{ fontWeight: "100" }}>مبلغ الاستقطاع</th>
                <th style={{ fontWeight: "100" }}>صافي الاستحقاق</th>
                <th style={{ fontWeight: "100", width: "150px" }}>التوقيع</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item) => {
                var catData = pdata.filter(
                  (record) => record.category == item.name
                );
                var tcount = 0;
                var trcount = 0;
                var tvalue = 0;
                var tamount = 0;
                var tdiscount = 0;

                if (catData.length)
                  return (
                    <>
                      {catData.map((item) => {
                        tcount += item.transportCount * 1;
                        trcount += count * 1;
                        tvalue += item.transfer_value * 1;
                        tamount += item.transportAmount * 1;
                        tdiscount += item.discount ? item.discount * 1 : 0;
                        ttvalue += item.transfer_value * 1;
                        ttamount += item.transportAmount * 1;
                        ttdiscount += item.discount ? item.discount * 1 : 0;
                        ttcount += item.transportCount * 1;
                        ttrcount += count * 1;
                        return (
                          <tr
                            style={{
                              height: "40px",
                              borderWidth: "1px",
                              borderStyle: "solid",
                              backgroundColor:
                                ++index % 2 != 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            <td>{index}</td>
                            <td>{item.name}</td>
                            <td style={{ width: "60px" }}>{item.job}</td>
                            <td>{count}</td>
                            <td>{item.transportCount}</td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.transfer_value
                              )}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.transportAmount
                              )}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.discount ? item.discount * 1 : 0
                              )}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.discount
                                  ? item.transportAmount - item.discount * 1
                                  : item.transportAmount
                              )}
                            </td>
                            <td style={{ height: "50px" }}>
                              <pre> </pre>
                            </td>
                          </tr>
                        );
                      })}
                      <tr
                        style={{
                          height: " 30px",
                          color: "#fff",
                          backgroundColor: "#0972B6",
                        }}
                      >
                        <td colSpan={3}>{item.name}</td>
                        <td>{trcount}</td>
                        <td>{tcount}</td>
                        <td>{new Intl.NumberFormat("en-EN").format(tvalue)}</td>
                        <td>
                          {new Intl.NumberFormat("en-EN").format(tamount)}
                        </td>
                        <td>
                          {new Intl.NumberFormat("en-EN").format(tdiscount)}
                        </td>
                        <td>
                          {new Intl.NumberFormat("en-EN").format(
                            tamount - tdiscount
                          )}
                        </td>
                        <td style={{ height: "50px" }}>
                          <pre> </pre>
                        </td>
                      </tr>
                    </>
                  );
              })}
              <tr
                style={{
                  height: " 30px",
                  color: "#fff",
                  backgroundColor: "#0972B6",
                }}
              >
                <td colSpan={3}>{"الإجمالي العام"}</td>
                <td>{ttrcount}</td>
                <td>{ttcount}</td>
                <td>{new Intl.NumberFormat("en-EN").format(ttvalue)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(ttamount)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(ttdiscount)}</td>
                <td>
                  {new Intl.NumberFormat("en-EN").format(ttamount - ttdiscount)}
                </td>
                <td style={{ height: "50px" }}>
                  <pre> </pre>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={15}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginTop: "20px",
                      textAlign: "center",
                    }}
                  >
                    {props.setting
                      .filter((item) => item.key == "admin.signs_footer")[0]
                      ?.value.split("\n")
                      .map((sign) => {
                        var sign_position = sign.split(":")[0];
                        var sign_name = sign.split(":")[1];

                        return (
                          <div style={{ width: "50%" }}>
                            <div style={{ fontWeight: "900" }}>
                              {sign_position}
                            </div>
                            {sign_name != "" && (
                              <div style={{ fontWeight: "500" }}>
                                {sign_name}
                              </div>
                            )}
                          </div>
                        );
                      })}{" "}
                  </div>
                </th>
              </tr>
            </tfoot>
          </table>
          <div
            style={{
              marginTop: " 20px",
              width: "85%",
              backgroundColor: "#e6e6e61",
              padding: "5px 0",
              borderTopLeftRadius: " 5px",
              borderBottomLeftRadius: " 5px",
            }}
          >
            <div
              style={{
                backgroundColor: " #0972B6",
                width: " 95%",
                height: " 15px",
                borderTopLeftRadius: " 5px",
                borderBottomLeftRadius: " 5px",
                color: " #fff",
                paddingRight: " 20px",
              }}
            >
              نظام دوام | {new Date().toLocaleString("en-IT")}{" "}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
