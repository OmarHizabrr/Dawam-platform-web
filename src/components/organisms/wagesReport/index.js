/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";

import {
  ExportOutlined,
  PrinterOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tabs,
  Typography,
} from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import excel from "xlsx";
import "./style.css";

import { Env, PrintFonts } from "./../../../styles";
const { Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const exportToExcel = (type, fn, dl) => {
  var elt = document.getElementById("att-report");
  if (elt) {
    var wb = excel.utils.table_to_book(elt, {
      sheet: "sheet1",
      cellStyles: true,
    });
    return dl
      ? excel.write(wb, {
        bookType: type,
        bookSST: true,
        type: "base64",
        cellStyles: true,
      })
      : excel.writeFile(wb, fn || "كشف الخصميات." + (type || "xlsx"), {
        bookSST: true,
        type: "base64",
        cellStyles: true,
      });
  }
};

export default function wagesReport(props) {
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [namesFilter, setNamesFilter] = useState([]);
  const [categoriesFilter, setCategoriesFilter] = useState([]);
  const [tstypes, setTstypes] = useState([]);
  const [loadUsers, setLoadUsers] = useState(false);
  const [isVisibleModal, setIsVisibleModal] = useState(false);

  const [data, setData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM"));
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loadForm, setLoadForm] = useState(false);

  const [pdata, setPData] = useState([]);

  const [categories, setCategories] = useState([]);
  const [load, setLoad] = useState(true);
  const [count, setCount] = useState(0);
  const [count17, setCount17] = useState(0);
  const [fridaysData, setFridaysData] = useState([]);
  const [requiredCount, setRequiredCount] = useState(0);

  const normalizeText = (value) =>
    (value ?? "").toString().trim().toLowerCase();
  const matchesFilterValue = (recordValue, filterValue) =>
    normalizeText(recordValue) === normalizeText(filterValue);



  const calcAbsenceCost = (record) => {
    // Determine the number of weekend days per week from settings
    const weekendDaysSetting = props.setting.filter(
      (item) => item.key === "admin.weekend_days"
    )[0]?.value;

    let daysCount = 0;

    // Use exact working days count from backend
    // Priority: Per-user requiredDays from record, then global count
    const backendWorkingDays = Number(record?.requiredDays) > 0 ? Number(record?.requiredDays) : count;

    if (backendWorkingDays > 0) {
      daysCount = backendWorkingDays;
    } else {
      // Fallback: Calculate manually if backend count is missing (0)
      const startDate = dayjs(start);
      const endDate = dayjs(end);
      if (startDate.isValid() && endDate.isValid()) {
        const totalCalendarDays = endDate.diff(startDate, 'day') + 1;

        let weekendDaysCountPerWeek = 1;
        try {
          if (weekendDaysSetting) weekendDaysCountPerWeek = JSON.parse(weekendDaysSetting).length;
        } catch (e) { }

        // Approximate weekends deduction if fridaysData is empty
        const weeks = fridaysData.filter(f => f.user_id == record.user_id)?.[0]?.weeks || Math.floor(totalCalendarDays / 7);
        daysCount = totalCalendarDays - (weeks * weekendDaysCountPerWeek);
      }
    }

    const salary = Number(record?.salary) || 0;
    const attendanceDays = Number(record?.attendanceDays) || 0;
    const vacationDays = Number(record?.vacationDays) || 0;

    if (!salary) return 0;

    // Strict Working Days subtraction - Matching Attendance Table Logic (No Vacation Deduction from Count)
    const absentDays = Math.max(
      daysCount - attendanceDays,
      0
    );

    // Use exact daily salary from backend logic if available, otherwise fallback
    const dailySalary = Number(record?.dsalary) > 0 ? Number(record?.dsalary) : (salary / 30);

    if (record?.name && record.name.includes("عمر محمود")) {
      console.log(`[DEBUG OMAR] Days: ${daysCount} | Att: ${attendanceDays} | Vac: ${vacationDays} | Absent: ${absentDays} | Rate: ${dailySalary} | LatePrice: ${record?.lateTimePrice}`);
    }

    return absentDays * dailySalary;
  };

  const calcTotalDeductions = (record) => {
    if (record?.fingerprint_type != "22" || record?.stopped) return 0;
    const debt = Number(record?.debt) || 0;
    const symbiosis = Number(record?.symbiosis) || 0;
    const longDebt = Number(record?.long_debt) || 0;
    const vdiscount = Number(record?.vdiscount) || 0;
    const deductions = Number(record?.deductions) || 0;
    // Correct Logic:
    // Total = AbsenceCost (Calculated from Dates) + ManualDiscounts (From DB, includes processed Late Fines)
    // We do NOT add lateTimePrice because it would double-count if the admin already processed it into the DB.
    // If ManualDiscounts is 30, and Absence (now fixed via Date Auto-Seed) is 13119, Sum serves 13149.
    // Correct Logic:
    // Total = AbsenceCost (Calculated from Dates) + ManualDiscounts (From DB, includes processed Late Fines)
    // We do NOT add lateTimePrice because it would double-count if the admin already processed it into the DB.
    // If ManualDiscounts is 30, and Absence (now fixed via Date Auto-Seed) is 13119, Sum serves 13149.
    const manualDiscounts = Number(record?.manualDiscounts) || 0;
    // const lateTimePrice = Number(record?.lateTimePrice) || 0;
    const absenceCost = calcAbsenceCost(record);
    let totalAbsence = absenceCost + manualDiscounts;

    // Apply proper rounding
    if (dround) {
      totalAbsence = Math.round(totalAbsence / dround) * dround;
    } else {
      totalAbsence = Math.round(totalAbsence);
    }

    return (
      Math.round(debt) +
      totalAbsence +
      Math.round(symbiosis) +
      Math.round(longDebt) +
      Math.round(vdiscount) +
      deductions
    );
  };

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
  const [form] = Form.useForm();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  let roundSetting = props.setting.filter((item) => item.key == "admin.round")[0]?.value;
  let round = roundSetting ? Number(roundSetting) : 1;
  if (!round || round <= 0) round = 1;

  let droundSetting = props.setting.filter((item) => item.key == "admin.discounts_round")[0]?.value;
  let dround = droundSetting ? Number(droundSetting) : 0;

  // Sync dates with settings when they load
  useEffect(() => {
    if (!props.setting || !props.setting.length) return;

    const startSetting = props.setting.find(item => item.key == "admin.month_start");
    const endSetting = props.setting.find(item => item.key == "admin.month_end");

    if (startSetting && endSetting) {
      const monthStart = startSetting.value;
      const monthEnd = endSetting.value;

      const newStart = dayjs(
        dayjs().format("YYYY-MM") + "-" + monthStart,
        "YYYY-MM-DD"
      )
        .subtract(1, "months")
        .format("YYYY-MM-DD");

      const newEnd = dayjs(
        dayjs().format("YYYY-MM") + "-" + monthEnd,
        "YYYY-MM-DD"
      ).format("YYYY-MM-DD");

      setStart(newStart);
      setEnd(newEnd);
    }
  }, [props.setting]);

  useEffect(() => {
    setLoad(true);

    FirebaseServices.getWagesList(start, end)
      .then((data) => {
        let names = [];
        let categories = [];
        let ts = [];
        data["lists"].forEach((element) => {
          if (!names.some((item) => element.name == item.text)) {
            names.push({ text: element["name"], value: element["name"] });
            ts.push({ label: element["name"], value: element["user_id"] });
          }
          if (!categories.some((item) => element.category == item.text))
            categories.push({
              text: element["category"],
              value: element["category"],
            });
        });
        setNamesFilter(names);
        setCategoriesFilter(categories);

        setTstypes(ts);
        console.log("Raw API Count:", data.count);
        setCount(parseInt(data.count?.[0]?.count || 0));
        setCount17(data.count17[0].count);
        setFridaysData(data.fridaysData);
        setRequiredCount(
          parseInt(data.requiredCount?.[0]?.count || 0)
        );



        setData(data.lists);
        setPData(data.lists);

        setCategories(data.categories);
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

  const onChange = (all, data) => {
    console.log(dayjs.months());
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

  const columns = [
    {
      title: "الاسم",
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
              placeholder="البحث في الأسماء"
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
              <Button
                size="small"
                onClick={handleClear}
                style={{ marginRight: 8 }}
              >
                مسح
              </Button>
              <Button type="primary" size="small" onClick={handleConfirm}>
                تأكيد
              </Button>
            </div>
          </div>
        );
      },
      onFilter: (value, record) => matchesFilterValue(record.name, value),
      filteredValue: filteredInfo.name || null,
    },
    {
      title: "الإدارة",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: sortedInfo.columnKey === "category" && sortedInfo.order,
      filters: categoriesFilter,
      filterMode: "tree",
      onFilter: (value, record) => {
        const result = matchesFilterValue(record.category, value);
        return result;
      },
      filteredValue: filteredInfo.category || null,
    },
    {
      title: "المسمى الوظيفي",
      dataIndex: "job",
      key: "job",
      sorter: (a, b) => a.job - b.job,
      sortOrder: sortedInfo.columnKey === "job" && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: "الاستحقاق",
      dataIndex: "salary",
      key: "salary",
      sorter: (a, b) => a.salary - b.salary,
      sortOrder: sortedInfo.columnKey === "salary" && sortedInfo.order,
      ellipsis: true,
      render: (salary) => new Intl.NumberFormat("en-EN").format(salary),
    },
    {
      title: "سُلف",
      dataIndex: "debt",
      key: "debt",
      sorter: (a, b) => a.debt - b.debt,
      sortOrder: sortedInfo.columnKey === "debt" && sortedInfo.order,
      ellipsis: true,
      render: (d) => new Intl.NumberFormat("en-EN").format(d),
    },
    {
      title: "غياب",
      dataIndex: "attendanceDays",
      sorter: (a, b) =>
        Math.round(calcAbsenceCost(a)) - Math.round(calcAbsenceCost(b)),
      sortOrder: sortedInfo.columnKey === "attendanceDays" && sortedInfo.order,
      key: "attendanceDays",
      ellipsis: true,
      render: (ab, rec, ind) => {
        // Logic matches Attendance Table: Calculated Absence + Manual Discounts (includes late fines processed)
        let totalAbsence = calcAbsenceCost(rec) + (Number(rec.manualDiscounts) || 0);

        // Apply rounding if dround is set
        if (dround) {
          totalAbsence = Math.round(totalAbsence / dround) * dround;
        } else {
          totalAbsence = Math.round(totalAbsence);
        }

        return new Intl.NumberFormat("en-EN").format(totalAbsence);
      },
    },
    {
      title: "تكافل",
      dataIndex: "symbiosis",
      key: "symbiosis",
      sorter: (a, b) => a.symbiosis - b.symbiosis,
      sortOrder: sortedInfo.columnKey === "symbiosis" && sortedInfo.order,
      ellipsis: true,
      render: (sym) => new Intl.NumberFormat("en-EN").format(sym),
    },
    {
      title: "أقساط",
      dataIndex: "long_debt",
      key: "long_debt",
      sorter: (a, b) => a.long_debt - b.long_debt,
      sortOrder: sortedInfo.columnKey === "long_debt" && sortedInfo.order,
      ellipsis: false,
      render: (ld) => new Intl.NumberFormat("en-EN").format(ld),
    },
    {
      title: "جزاءات",
      dataIndex: "vdiscount",
      key: "vdiscount",
      sorter: (a, b) => a.vdiscount - b.vdiscount,
      sortOrder: sortedInfo.columnKey === "vdiscount" && sortedInfo.order,
      ellipsis: false,
      render: (vdiscount) => new Intl.NumberFormat("en-EN").format(vdiscount),
    },
    {
      title: "إجمالي الاستقطاع",
      sorter: (a, b) =>
        calcTotalDeductions(a) - calcTotalDeductions(b),
      key: "totDiscount",
      sortOrder: sortedInfo.columnKey === "totDiscount" && sortedInfo.order,
      ellipsis: false,
      render: (_, item, ind) =>
        new Intl.NumberFormat("en-EN").format(calcTotalDeductions(item)),
    },
    {
      title: "صافي الاستحقاق",
      ellipsis: false,
      key: "netWages",
      sorter: (a, b) =>
        (Number(a?.salary) || 0) - calcTotalDeductions(a) -
        ((Number(b?.salary) || 0) - calcTotalDeductions(b)),
      sortOrder: sortedInfo.columnKey === "netWages" && sortedInfo.order,
      render: (_, item, ind) =>
        new Intl.NumberFormat("en-EN").format(
          (Number(item?.salary) || 0) - calcTotalDeductions(item)
        ),
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

    // mywindow.document.close();
    mywindow.onload = function () {
      // wait until all resources loaded
      mywindow.focus(); // necessary for IE >= 10
      mywindow.print(); // change window to mywindow
      mywindow.close(); // change window to mywindow
    };
  };

  const showUsersDebt = () => {
    setLoadUsers(true);
    console.log(pdata);
    form.setFieldsValue({ users: pdata });
    setIsVisibleModal(true);
    setLoadUsers(false);
  };

  const buildMenu = () => {
    var menuItems = [];
    var list = data;
    //  list.sort((a, b) => a.name.localeCompare(b.name));
    list.forEach((element) => {
      menuItems.push(
        <Menu.Item onClick={(e) => e.preventDefault()}>
          {element.name}
          <Switch style={{ margin: "0 5px" }} size="small" defaultChecked />
          <Input style={{ width: "150px" }} />
        </Menu.Item>
      );
    });
    return menuItems;
  };

  const menu = <Menu>{buildMenu()}</Menu>;

  const preprintSetting = () => {
    //  console.log(data);
    setIsVisibleModal(true);

    // list.filter((item)=> item.user_id == 95)[0].stopped=1;
  };

  const settingBefore = () => {
    setPData(form.getFieldsValue().users);
    setIsVisibleModal(false);
  };

  var index = 0;
  var tsal = 0;
  var tallow = 0;
  var tsalallow = 0;
  var tdebts = 0;
  var tabs = 0;
  var tsym = 0;
  var tvio = 0;
  var tded = 0;
  var tldebts = 0;
  var ttotD = 0;
  var ttotal = 0;
  var ttotr = 0;

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
                  backgroundColor: "#0972B6",
                  borderColor: "#0972B6",
                  marginLeft: "10px",
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
                <SettingOutlined />
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
                                name={[name, "stopped"]}
                                label={`توقيف ${props.setting.filter(
                                  (item) =>
                                    item.key === "admin.salary_allowances"
                                )[0]?.value || "الإعانة"
                                  }`}
                                rules={[
                                  {
                                    required: true,
                                    message: "هذا الحقل مطلوب",
                                  },
                                ]}
                              >
                                <Switch />
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
          rowKey={(record) => record.user_id}
          pagination={false}
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
                <th colSpan={16}>
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
                        كشف{" "}
                        {props.setting.filter(
                          (item) => item.key === "admin.salary_allowances"
                        )[0]?.value || "الإعانات"}{" "}
                        لشهر {currentMonth}
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
                      marginBottom: "20px",
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
                  height: "25px",
                }}
              >
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  م
                </th>
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  الاسم
                </th>
                <th style={{ fontWeight: "100", width: "50px" }} rowSpan="2">
                  الوظيفة
                </th>

                <th style={{ fontWeight: "100", fontSize: "8px" }} colSpan="3">
                  الاستحقاق
                </th>

                <th style={{ fontWeight: "100" }} colSpan="6">
                  الاستقطاعات
                </th>
                <th style={{ fontWeight: "100" }} rowSpan="2" colSpan={"2"}>
                  {" "}
                  صافي
                  <br />
                  الاستحقاق{" "}
                </th>
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  التوقيع
                </th>
              </tr>
              <tr
                style={{
                  color: "#fff",
                  backgroundColor: "#0972B6",
                  height: "25px",
                }}
              >
                <th style={{ fontWeight: "100", fontSize: "8px" }}>
                  {props.setting.filter(
                    (item) => item.key === "admin.salary_allowances"
                  )[0]?.value || "الإعانة"}
                </th>
                <th style={{ fontWeight: "100", fontSize: "8px" }}>البدلات</th>
                <th style={{ fontWeight: "100", fontSize: "8px" }}>إجمالي</th>
                <th style={{ fontWeight: "100" }}>سُلف</th>
                <th style={{ fontWeight: "100" }}>غياب</th>
                <th style={{ fontWeight: "100" }}>تكافل</th>
                <th style={{ fontWeight: "100" }}>أقساط</th>
                <th style={{ fontWeight: "100" }}>جزاءات</th>
                {/*<th style={{fontWeight: "100"}}>اشتراكات</th>
                 */}
                <th style={{ fontWeight: "100", width: "20px" }}>إجمالي</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item) => {
                var catData = pdata.filter(
                  (record) => record.category == item.name
                );

                var sal = 0;
                var allow = 0;
                var salallow = 0;
                var debts = 0;
                var abs = 0;
                var sym = 0;
                var vio = 0;
                var ded = 0;
                var ldebts = 0;
                var totD = 0;
                var total = 0;
                var totr = 0;
                if (catData.length)
                  return (
                    <>
                      {catData.map((item) => {
                        const salary = item.status == 16 ? Number(item.salary) : Number(item.salary) * Number(count17);
                        const allownces = Number(item.allownces) || 0;

                        sal += item.stopped ? 0 : salary;
                        allow += item.stopped ? 0 : allownces;
                        salallow += item.stopped ? 0 : (salary + allownces);

                        debts += item.stopped ? 0 : Number(item.debt) || 0;

                        // New logic: Group Absence + Late + Manual
                        let absenceCost = 0;
                        if (!item.stopped && item.fingerprint_type == "22") {
                          // CHANGE: Removed manualDiscounts from Absence Column to match Screen
                          let rawAbs = calcAbsenceCost(item) + (Number(item.manualDiscounts) || 0);
                          if (dround) {
                            absenceCost = Math.round(rawAbs / dround) * dround;
                          } else {
                            absenceCost = Math.round(rawAbs);
                          }
                        }

                        abs += Number(absenceCost) || 0;

                        sym += item.stopped ? 0 : Number(item.symbiosis) || 0;
                        ldebts += item.stopped ? 0 : Number(item.long_debt) || 0;
                        vio += item.stopped ? 0 : Number(item.vdiscount) || 0;
                        ded += item.stopped ? 0 : Number(item.deductions) || 0;

                        // Total Deductions uses the grouped absenceCost
                        const debtVal = Number(item.debt) || 0;
                        const symbiosisVal = Number(item.symbiosis) || 0;
                        const longDebtVal = Number(item.long_debt) || 0;
                        const vdiscountVal = Number(item.vdiscount) || 0;
                        const deductionsVal = Number(item.deductions) || 0;
                        // const manualDiscountsVal = Number(item.manualDiscounts) || 0;

                        // Add manualDiscountsVal to Total Deductions -> ALREADY IN ABSENCECOST NOW
                        const toD = item.stopped ? 0 : Math.round(debtVal) + absenceCost + Math.round(symbiosisVal) + Math.round(longDebtVal) + Math.round(vdiscountVal) + deductionsVal;

                        totD += Number(toD) || 0;

                        var tot = item.stopped
                          ? 0
                          : (salary + allownces) - toD;

                        total += Number(tot) || 0;

                        var tor = item.stopped
                          ? 0
                          : Math.round(tot / round) * round;
                        totr += Number(tor) || 0;

                        tsal += item.stopped ? 0 : salary;
                        tallow += item.stopped ? 0 : allownces;
                        tsalallow = tsal + tallow;
                        tdebts += item.stopped ? 0 : debtVal;
                        tabs += Number(absenceCost) || 0;
                        tsym += item.stopped ? 0 : symbiosisVal;
                        tvio += item.stopped ? 0 : vdiscountVal;
                        tded += item.stopped ? 0 : deductionsVal;
                        tldebts += item.stopped ? 0 : longDebtVal;
                        ttotD += Number(toD) || 0;
                        ttotal += Number(tot) || 0;
                        ttotr += Number(tor) || 0;

                        return (
                          <tr
                            style={{
                              height: "30px",
                              backgroundColor:
                                ++index % 2 != 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            <td>{index}</td>
                            <td style={{ fontSize: "8px", minWidth: "80px" }}>
                              {item.name}
                            </td>
                            <td style={{ fontSize: "7px", width: "30px" }}>
                              {item.job}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.stopped
                                  ? 0
                                  : item.status == 16
                                    ? item.salary
                                    : item.salary * count17
                              )}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.stopped ? 0 : item.allownces
                              )}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.stopped
                                  ? 0
                                  : parseFloat(
                                    item.status == 16
                                      ? item.salary
                                      : item.salary * count17
                                  ) + parseFloat(item.allownces)
                              )}
                            </td>

                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.stopped ? 0 : item.debt
                              )}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.stopped ? 0 : absenceCost
                              )}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.stopped
                                  ? 0
                                  : Math.round(parseFloat(item.symbiosis))
                              )}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.stopped ? 0 : item.long_debt
                              )}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.stopped ? 0 : item.vdiscount
                              )}
                            </td>
                            {/*<td>{new Intl.NumberFormat('en-EN').format(item.stopped?0:item.deductions)}</td>
                             */}
                            <td>
                              {new Intl.NumberFormat("en-EN").format(Math.round(toD))}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(Math.round(tot))}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(Math.round(tor))}
                            </td>
                            <td>{item.note ? item.note : "             "}</td>
                          </tr>
                        );
                      })}
                      <tr
                        style={{
                          height: " 30px",
                          color: "#fff",
                          backgroundColor: "#0972B6",
                          fontSize: "8px!important",
                        }}
                      >
                        <td colSpan={3}>{item.name}</td>
                        <td>{new Intl.NumberFormat("en-EN").format(Math.round(sal))}</td>
                        <td>{new Intl.NumberFormat("en-EN").format(Math.round(allow))}</td>
                        <td>
                          {new Intl.NumberFormat("en-EN").format(Math.round(salallow))}
                        </td>

                        <td>{new Intl.NumberFormat("en-EN").format(Math.round(debts))}</td>
                        <td>{new Intl.NumberFormat("en-EN").format(Math.round(abs))}</td>
                        <td>{new Intl.NumberFormat("en-EN").format(Math.round(sym))}</td>
                        <td>{new Intl.NumberFormat("en-EN").format(Math.round(ldebts))}</td>
                        <td>{new Intl.NumberFormat("en-EN").format(Math.round(vio))}</td>
                        {/*<td>{new Intl.NumberFormat('en-EN').format(Math.round(ded))}</td>
                         */}
                        <td>{new Intl.NumberFormat("en-EN").format(Math.round(totD))}</td>
                        <td>{new Intl.NumberFormat("en-EN").format(Math.round(total))}</td>
                        <td>{new Intl.NumberFormat("en-EN").format(Math.round(totr))}</td>
                        <td>
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
                <td>{new Intl.NumberFormat("en-EN").format(tsal)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(tallow)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(tsalallow)}</td>

                <td>{new Intl.NumberFormat("en-EN").format(tdebts)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(tabs)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(tsym)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(tldebts)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(tvio)}</td>
                {/*<td>{new Intl.NumberFormat('en-EN').format(tded)}</td>
                 */}
                <td>{new Intl.NumberFormat("en-EN").format(ttotD)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(ttotal)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(ttotr)}</td>
                <td>
                  <pre>{"             "}</pre>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={16}>
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
              marginTop: "50px",
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
