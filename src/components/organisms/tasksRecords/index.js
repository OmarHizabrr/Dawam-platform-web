/* eslint-disable react-hooks/rules-of-hooks */
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  FormOutlined,
  MenuUnfoldOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Divider,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import excel from "xlsx";
import "./style.css";

import Modal from "antd/lib/modal/Modal";
import { Env, PrintFonts } from "./../../../styles";
const { Text } = Typography;

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

function TasksRecordsContent({ setting }) {
  // Get notification API from App context
  const { notification } = App.useApp();

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [pdata, setPData] = useState([]);
  const [load, setLoad] = useState(true);

  const [checkedList, setCheckedList] = React.useState([]);
  const [checkedRList, setCheckedRList] = React.useState([]);
  const [edit, setEdit] = useState();
  const [indeterminate, setIndeterminate] = React.useState(true);
  const [checkAll, setCheckAll] = React.useState(false);

  const onChange = (list) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < options.length);
    setCheckAll(list.length === options.length);
  };
  const selectRecord = (e, record) => {
    if (e.target.checked) {
      if (!checkedRList.some((r) => r.id === record.id)) {
        setCheckedRList([...checkedRList, record]);
      }
    } else {
      setCheckedRList(checkedRList.filter((el) => el.id !== record.id));
    }
  };
  const onCheckAllChange = (e) => {
    var selOptions = [];
    if (e.target.checked) options.map((item) => selOptions.push(item.value));

    setCheckedList(selOptions);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const updateTask = (record) => {
    FirebaseServices.updateTaskDetails(record.id, vacType, datefromValue, datetoValue)
      .then((response) => {
        console.log(response);
        setVisible(false);
        setConfirmLoading(false);
        openNotification(
          "bottomLeft",
          <span>
            {" "}
            'تم تعديل الإجازات/المهام الخاصة بـ '{" "}
            <span style={{ fontWeight: "bold" }}>{record.fullname} </span> '
            بنجاح.'{" "}
          </span>
        );
        setUpdate((prev) => (prev || 0) + 1);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      task_type: record.vac_id,
      date_range: [
        dayjs(record.date_from, "YYYY-MM-DD HH:mm:ss"),
        dayjs(record.date_to, "YYYY-MM-DD HH:mm:ss"),
      ],
      description: record.description,
    });
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingRecord(null);
    editForm.resetFields();
  };

  const onEditFinish = (values) => {
    if (!editingRecord) return;

    setSaving(true);
    const updateData = {
      task_type: values.task_type,
      date_from: values.date_range[0].format("YYYY-MM-DD HH:mm:ss"),
      date_to: values.date_range[1].format("YYYY-MM-DD HH:mm:ss"),
      description: values.description || "",
    };

    FirebaseServices.updateTaskWithData(editingRecord.id, updateData)
      .then((response) => {
        setSaving(false);
        setIsEditModalVisible(false);
        setEditingRecord(null);
        editForm.resetFields();
        openNotification(
          "bottomLeft",
          <span>
            {" "}
            'تم تعديل الإجازات/المهام الخاصة بـ '{" "}
            <span style={{ fontWeight: "bold" }}>{editingRecord.fullname} </span> '
            بنجاح.'{" "}
          </span>
        );
        setUpdate((prev) => (prev || 0) + 1);
      })
      .catch(function (error) {
        console.log(error);
        setSaving(false);
        openNotification(
          "bottomLeft",
          <span style={{ color: "#ff4d4f" }}>
            {"فشل تعديل الإجازة/المهمة!"}
          </span>
        );
      });
  };
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [datefromValue, setDatefromValue] = useState(null);
  const [datetoValue, setDatetoValue] = useState(null);
  const [vacType, setVacType] = useState(null);
  const [visible, setVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAModalVisible, setIsAModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm] = Form.useForm();
  const [tstypes, setTstypes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedName, setSelectedName] = useState(null);
  const [tasksTypes, setTasksTypes] = useState([]);
  const [taskType, setTaskType] = useState(null);
  const [des, setDes] = useState(null);
  const [drange, setDrange] = useState(null);
  const [update, setUpdate] = useState(0);
  const [start, setStart] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10)
  );
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));

  const onChangeMonth = (all, data) => {
    const startDay = setting?.filter(
      (item) => item.key == "admin.month_start"
    )?.[0]?.value;
    const endDay = setting?.filter(
      (item) => item.key == "admin.month_end"
    )?.[0]?.value;

    if (startDay && endDay) {
      setStart(
        dayjs(data + "-" + startDay, "YYYY-MM-DD")
          .subtract(1, "months")
          .format("YYYY-MM-DD")
      );
      setEnd(dayjs(data + "-" + endDay, "YYYY-MM-DD").format("YYYY-MM-DD"));
      setCurrentMonth(all.format("MMMM"));
    } else {
      // Fallback if settings are missing, though ideally they should exist
      const d = dayjs(data);
      setStart(d.startOf('month').format("YYYY-MM-DD"));
      setEnd(d.endOf('month').format("YYYY-MM-DD"));
      setCurrentMonth(all.format("MMMM"));
    }
  };

  const [namesFilter, setNamesFilter] = useState([]);
  const [categoriesFilter, setCategoriesFilter] = useState([]);
  const [vacationsFilter, setVacationsFilter] = useState([]);
  const normalizeText = (value) =>
    (value ?? "").toString().trim().toLowerCase();
  const matchesFilterValue = (recordValue, filterValue) =>
    normalizeText(recordValue) === normalizeText(filterValue);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM"));

  const toNumber = (v, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  // يحسب عدد ساعات اليوم من إعدادات النظام (duration_start, duration_end)
  const computeDayHours = () => {
    // Return 7 hours to match Annual Report logic and fix balance discrepancy
    return 7;
  };

  // يحسب عدد الأيام التقويمية بشكل شامل (من التاريخ إلى التاريخ) +1
  const computeCalendarDays = (dateFrom, dateTo) => {
    if (!dateFrom || !dateTo) return 0;
    // استخدم الجزء التاريخي فقط لتجنّب أي التباسات متعلقة بالوقت/التوقيت
    const fromDatePart = String(dateFrom).split(" ")[0];
    const toDatePart = String(dateTo).split(" ")[0];
    const fromParsed = dayjs(fromDatePart, "YYYY-MM-DD", true);
    const toParsed = dayjs(toDatePart, "YYYY-MM-DD", true);
    if (!fromParsed.isValid() || !toParsed.isValid()) return 0;
    const startDay = fromParsed.startOf("day");
    const endDay = toParsed.startOf("day");
    const diff = endDay.diff(startDay, "day");
    return diff >= 0 ? diff + 1 : 0;
  };

  // دالة مساعدة لحساب المدة من الأيام والساعات والدقائق
  const calculateDuration = (days, period) => {
    let totalDays = 0;
    let totalHours = 0;
    let totalMinutes = 0;

    // في حالة نفس اليوم وفترة أقل من ساعات الدوام: اعتبر الأيام = 0
    let effectiveDays = toNumber(days, 0);
    const dHoursForCalc = computeDayHours();
    if (effectiveDays === 1 && period && period !== "00:00") {
      const timeParts0 = period.split(":");
      if (timeParts0.length >= 2) {
        const ph = toNumber(timeParts0[0], 0);
        const pm = toNumber(timeParts0[1], 0);
        const pMinutes = ph * 60 + pm;
        if (pMinutes < dHoursForCalc * 60) {
          effectiveDays = 0;
        }
      }
    }

    // حساب الأيام
    if (effectiveDays > 0) {
      totalDays += effectiveDays;
    }

    // حساب الساعات والدقائق: من عمود period
    if (period && period !== "00:00") {
      const timeParts = period.split(":");
      if (timeParts.length >= 2) {
        const hours = toNumber(timeParts[0], 0);
        const minutes = toNumber(timeParts[1], 0);

        // تحويل ساعات الفترة إلى أيام يتم فقط إذا لم تكن هناك أيام تقويمية
        const dHours = computeDayHours();
        if (hours >= dHours && effectiveDays === 0) {
          const additionalDays = Math.floor(hours / dHours);
          totalDays += additionalDays;
          const remainingHours = hours % dHours;
          totalHours += remainingHours;
          totalMinutes += minutes;
        } else {
          // إذا كان هناك أيام تقويمية بالفعل، نتجاهل ساعات الفترة لتجنب مضاعفة الأيام في التجميعات
          if (effectiveDays === 0) {
            totalHours += hours;
            totalMinutes += minutes;
          }
        }
      }
    }

    // تحويل الدقائق الزائدة إلى ساعات
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    // تحويل الساعات الزائدة إلى أيام: فقط عندما لا توجد أيام تقويمية فعّالة
    {
      const dHours = computeDayHours();
      if (effectiveDays === 0 && totalHours >= dHours) {
        totalDays += Math.floor(totalHours / dHours);
        totalHours = totalHours % dHours;
      }
    }

    return { totalDays, totalHours, totalMinutes };
  };

  // دالة مساعدة لتنسيق المدة بالتنسيق DD:HH:MM
  const formatDuration = (days, period) => {
    const { totalDays, totalHours, totalMinutes } = calculateDuration(
      days,
      period
    );

    const formattedDays = String(totalDays).padStart(2, "0");
    const formattedHours = String(totalHours).padStart(2, "0");
    const formattedMinutes = String(totalMinutes).padStart(2, "0");

    return `${formattedDays}:${formattedHours}:${formattedMinutes}`;
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

  // Custom filter dropdown component for vacations
  const VacationsFilterDropdown = ({
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
        const allValues = vacationsFilter
          .filter((vacation) => vacation.value !== "SELECT_ALL_VACATIONS")
          .map((vacation) => vacation.value);
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

    const filteredVacations = vacationsFilter.filter(
      (vacation) =>
        vacation.value !== "SELECT_ALL_VACATIONS" &&
        vacation.text.toLowerCase().includes(searchText.toLowerCase())
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
          {filteredVacations.map((vacation) => (
            <div key={vacation.value} style={{ marginBottom: 4 }}>
              <Checkbox
                checked={selectedKeys.includes(vacation.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKeys([...selectedKeys, vacation.value]);
                  } else {
                    setSelectedKeys(
                      selectedKeys.filter((key) => key !== vacation.value)
                    );
                  }
                  setSelectAll(false);
                }}
              >
                {vacation.text}
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

  const columns = [
    {
      title: "تحديد",
      width: 100,
      dataIndex: "select",
      key: "select",
      render: (id, record, _) => (
        <Checkbox
          onChange={function (e) {
            selectRecord(e, record);
          }}
          checked={checkedRList.some((r) => r.id === record.id)}
        ></Checkbox>
      ),
    },
    {
      title: "اسم الموظف",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a, b) => a.fullname.length - b.fullname.length,
      sortOrder: sortedInfo.columnKey === "fullname" && sortedInfo.order,
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
      onFilter: (value, record) => {
        if (value === "SELECT_ALL_NAMES") {
          return true;
        }
        return matchesFilterValue(record.fullname, value);
      },
      filteredValue: filteredInfo.fullname || null,
    },
    {
      title: "الإدارة",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: sortedInfo.columnKey === "category" && sortedInfo.order,
      ellipsis: true,
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
        if (value === "SELECT_ALL_CATEGORIES") {
          return true;
        }
        return matchesFilterValue(record.category, value);
      },
      filteredValue: filteredInfo.category || null,
    },
    {
      title: "نوع الإجازة",
      width: 150,
      dataIndex: "vac_name",
      key: "vac_name",
      sorter: (a, b) => a.vac_name.length - b.vac_name.length,
      sortOrder: sortedInfo.columnKey === "vac_name" && sortedInfo.order,
      ellipsis: false,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <VacationsFilterDropdown
          setSelectedKeys={setSelectedKeys}
          selectedKeys={selectedKeys}
          confirm={confirm}
          clearFilters={clearFilters}
        />
      ),
      onFilter: (value, record) => {
        if (value === "SELECT_ALL_VACATIONS") {
          return true;
        }
        return matchesFilterValue(record.vac_name, value);
      },
      filteredValue: filteredInfo.vac_name || null,
      render: (amount, record, index) => {
        if (index === edit) {
          return (
            <Select
              showSearch
              style={{ width: 120 }}
              optionFilterProp="children"
              notFoundContent={<Spin style={{ textAlign: "center" }}></Spin>}
              onSelect={function (e) {
                setVacType(e);
              }}
              filterOption={(input, option) =>
                option.props.children?.indexOf(input) >= 0 ||
                option.props.value?.indexOf(input) >= 0 ||
                option.props.label?.indexOf(input) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.props?.children?.localeCompare(optionB.props.children)
              }
              onChange={function (e) { }}
              defaultValue={record.vac_id}
            >
              {tasksTypes.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          );
        } else {
          return <Text>{amount}</Text>;
        }
      },
    },
    {
      title: "الفترة من",
      dataIndex: "date_from",
      key: "date_from",
      sorter: (a, b) => a.date_from.length - b.date_from.length,
      sortOrder: sortedInfo.columnKey === "date_from" && sortedInfo.order,
      ellipsis: false,
      render: (amount, record, index) => {
        if (index === edit) {
          return (
            <Input
              onChange={function (e) {
                setDatefromValue(e.target.value);
              }}
              onPressEnter={function () {
                updateTask(record);
                setEdit(null);
              }}
              defaultValue={dayjs(amount, "YYYY-MM-DD HH:mm:ss").format(
                "YYYY-MM-DD HH:mm"
              )}
            ></Input>
          );
        } else {
          return (
            <Text>
              {dayjs(amount, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm")}
            </Text>
          );
        }
      },
    },
    {
      title: "الفترة إلى",
      dataIndex: "date_to",
      key: "date_to",
      sorter: (a, b) => a.date_to.length - b.date_to.length,
      sortOrder: sortedInfo.columnKey === "date_to" && sortedInfo.order,
      ellipsis: false,
      render: (amount, record, index) => {
        if (index === edit) {
          return (
            <Input
              onChange={function (e) {
                setDatetoValue(e.target.value);
              }}
              onPressEnter={function () {
                updateTask(record);
                setEdit(null);
              }}
              defaultValue={dayjs(amount, "YYYY-MM-DD HH:mm:ss").format(
                "YYYY-MM-DD HH:mm"
              )}
            ></Input>
          );
        } else {
          return (
            <Text>
              {dayjs(amount, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm")}
            </Text>
          );
        }
      },
    },
    {
      title: "إجمالي الوقت",
      dataIndex: "netPeriod",
      key: "netPeriod",
      ellipsis: true,
    },
    {
      title: "التفاصيل",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "الإجراءات",
      width: 150,
      render: (vid, record, index) => (
        <Space>
          <Button
            onClick={function () {
              handleEdit(record);
            }}
            type="primary"
            shape="round"
            icon={<EditOutlined />}
            style={{
              backgroundColor: "#1890ff",
              borderColor: "#1890ff",
            }}
          />
          <Popconfirm
            key={record.id}
            title={"هل أنت متأكد من حذف إجازة " + record.fullname}
            visible={visible && selectedIndex === record.id}
            onConfirm={function () {
              handleOk(record);
            }}
            okButtonProps={{ loading: confirmLoading }}
            onCancel={handlePCancel}
          >
            <Button
              onClick={function () {
                showPopconfirm(record.id);
              }}
              className={"delete-btn"}
              style={{
                backgroundColor: "#fff",
                borderColor: "#ff0000",
                color: "#f00",
              }}
              type="primary"
              shape="round"
              icon={<DeleteOutlined />}
            ></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const showPopconfirm = (id) => {
    setVisible(true);
    setSelectedIndex(id);
  };
  const options = [];
  useEffect(() => {
    // Get employee names for the form dropdown (not for filtering)
    FirebaseServices.getEmpNames()
      .then((data) => {
        setTstypes(data);
      })
      .catch(function (error) {
        console.log(error);
      });
    FirebaseServices.getTasksTypes()
      .then((data) => {
        setTasksTypes(data);
      })
      .catch(function (error) {
        console.log(error);
      });
    FirebaseServices.getAllAcceptedTasks(start, end)
      .then((data) => {
        setData(data);
        setPData(data);

        // Extract unique names from the actual data in the table
        let names = [];
        let categories = [];
        let vacations = [];

        data.forEach((element) => {
          // Add name if not already added
          if (!names.some((item) => element.fullname === item.text)) {
            names.push({
              text: element["fullname"],
              value: element["fullname"],
            });
          }

          // Add category if not already added
          if (!categories.some((item) => element.category === item.text)) {
            categories.push({
              text: element["category"],
              value: element["category"],
            });
          }

          // Add vacation type if not already added
          if (!vacations.some((item) => element.vac_name === item.text)) {
            vacations.push({
              text: element["vac_name"],
              value: element["vac_name"],
            });
          }
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

        // Add "Select All" option to vacations filter
        const vacationsWithSelectAll = [
          { text: "تحديد الكل", value: "SELECT_ALL_VACATIONS" },
          ...vacations,
        ];

        setNamesFilter(namesWithSelectAll);
        setCategoriesFilter(categoriesWithSelectAll);
        setVacationsFilter(vacationsWithSelectAll);

        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [start, end, update]);
  const handleOk = (record) => {
    setConfirmLoading(true);
    deleteTask(record);
  };

  const handlePCancel = () => {
    setVisible(false);
  };
  const getNameOptions = () => {
    for (var i = 0; i < tstypes.length; i++)
      options.push({
        label: tstypes[i].label,
        value: '"' + tstypes[i].value + '"',
      });
    // tstypes.map(item=>options.push({"label":item.label,"value":item.value}));
    return options;
  };

  const handleChange = (pagination, filters, sorter) => {
    console.log("Varias params from onChange", pagination, filters, sorter);
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

        if (key == 'fullname') return matchesFilterValue(item.fullname, selectedValues[0]); // Assumes single selection per filter logic from table if needed, but array check is safer
        // Generalized check
        return selectedValues.some((filterValue) =>
          matchesFilterValue(item[key], filterValue)
        );
      })
    );

    setPData(filteredData);
  };
  const printReport = () => {
    var report = document.getElementById("att-report");
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

    mywindow.onload = function () {
      // wait until all resources loaded
      mywindow.focus(); // necessary for IE >= 10
      mywindow.print(); // change window to mywindow
      mywindow.close(); // change window to mywindow
    };
  };
  const exportToExcel = (type, fn, dl) => {
    var elt = document.getElementsByClassName("print-table")[0];
    if (elt) {
      var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
      return dl
        ? excel.write(wb, { bookType: type, bookSST: true, type: "base64" })
        : excel.writeFile(
          wb,
          fn || "كشف إ دوام ليوم " + "." + (type || "xlsx")
        );
    }
  };

  const openNotification = (placement, text) => {
    notification.success({
      message: text,
      placement,
      duration: 10,
    });
  };
  const addTasks = () => {
    setIsModalVisible(true);
  };
  const addATasks = () => {
    console.log(options);
    setIsAModalVisible(true);
  };
  const deleteTask = (record) => {
    FirebaseServices.deleteTask(record.id)
      .then((response) => {
        setVisible(false);
        setConfirmLoading(false);
        openNotification(
          "bottomLeft",
          <span>
            {" "}
            'تم حذف الإجازات/المهام الخاصة بـ '{" "}
            <span style={{ fontWeight: "bold" }}>{record.fullname} </span> '
            بنجاح.'{" "}
          </span>
        );
        // Force refresh by incrementing update counter
        setUpdate((prev) => (prev || 0) + 1);
      })
      .catch(function (error) {
        console.log(error);
        setConfirmLoading(false);
        setVisible(false);
        openNotification(
          "bottomLeft",
          <span style={{ color: "#ff4d4f" }}>
            {"فشل حذف الإجازة/المهمة! يرجى المحاولة مرة أخرى."}
          </span>
        );
      });
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const [form] = Form.useForm();

  const onFinish = (values) => {
    setSaving(true);
    console.log(values);
    FirebaseServices.addAcceptedTasks(values)
      .then((response) => {
        setSaving(false);
        form.setFieldsValue({ tasks: [] });
        openNotification(
          "bottomLeft",
          <span>
            {" "}
            'تم إضافة الإجازات/المهام الخاصة بـ '{" "}
            <span style={{ fontWeight: "bold" }}>{selectedName} </span> '
            بنجاح.'{" "}
          </span>
        );
      })
      .catch(function (error) {
        alert("يوجد مشكلة في الاتصال بالسرفر!");
        setSaving(false);
      });
  };
  const onAFinish = (values) => {
    console.log(values);
    // setSaving(true);
  };
  const handleFormChange = (selected, options) => {
    setSelectedName(options.label);
    form.setFieldsValue({ tasks: [] });
  };
  const changeRange = (all, date) => {
    setStart(date[0]);
    setEnd(date[1]);
  };
  const checkPeriod = (all, date, key) => {
    if (date[1] !== "") {
      const minutes = (new Date(date[1]) - new Date(date[0])) / 60000;
      var alerta = "";
      if (minutes <= 420)
        alerta =
          Math.floor(minutes / 60) + " ساعة و " + (minutes % 60) + " دقيقة ";
      else alerta = Math.floor(minutes / 1440) + 1 + " يوم ";
      const cl = ".range" + key;
      var elem = document.querySelector(
        cl + " " + ".ant-form-item-control-input-content"
      );
      elem.innerHTML +=
        '<div class="ant-form-item-explain ant-form-item-explain-error"><div role="alert">' +
        "مدة الإجازة: " +
        alerta +
        "</div></div>";
    }
  };
  const changeTask = (e) => {
    setTaskType(e);
  };
  const changeTRange = (all, date) => {
    console.log(date);
    setDrange(date);
  };
  const changeDes = (e) => {
    setDes(e.target.value);
    console.log(e.target.value);
  };
  const deleteAll = async () => {
    if (checkedRList.length === 0) {
      openNotification(
        "bottomLeft",
        <span style={{ color: "#ff4d4f" }}>
          {"لم يتم تحديد أي سجلات للحذف!"}
        </span>
      );
      return;
    }

    const countToDelete = checkedRList.length;
    setConfirmLoading(true);
    try {
      // Delete all selected records sequentially
      for (var i = 0; i < checkedRList.length; i++) {
        await FirebaseServices.deleteTask(checkedRList[i].id);
      }

      setCheckedRList([]);
      setConfirmLoading(false);
      openNotification(
        "bottomLeft",
        <span>
          {" "}
          'تم حذف '{" "}
          <span style={{ fontWeight: "bold" }}>{countToDelete} </span> '
          إجازة/مهمة بنجاح.'{" "}
        </span>
      );
      // Force refresh by incrementing update counter
      setUpdate((prev) => (prev || 0) + 1);
    } catch (error) {
      console.log(error);
      setConfirmLoading(false);
      openNotification(
        "bottomLeft",
        <span style={{ color: "#ff4d4f" }}>
          {"فشل حذف بعض السجلات! يرجى المحاولة مرة أخرى."}
        </span>
      );
    }
  };
  const submitTasks = () => {
    setSaving(true);
    var values = {
      task_type: taskType,
      start: drange[0],
      end: drange[1],
      desc: des,
      users: checkedList,
    };
    FirebaseServices.submitAllTasks(values)
      .then(function (response) {
        console.log(response);

        // if (response.statusText == "OK") {
        setSaving(false);
        setIsAModalVisible(false);
        openNotification(
          "bottomLeft",
          <span>
            {" "}
            'تم إضافة الإجازات/المهام الخاصة بـ '{" "}
            <span style={{ fontWeight: "bold" }}>{"مجموعة الموظفين"} </span> '
            بنجاح.'{" "}
          </span>
        );
      })
      .catch(function (error) {
        setSaving(false);
        setIsAModalVisible(false);
        openNotification(
          "bottomLeft",
          <span style={{ color: "#ff4d4f" }}>{"فشل ترحيل الإجازة الجماعية!"}</span>
        );
      });
  };
  return (
    <Card>
      <div className="discountHeader">
        <div className="discountRange">
          <div style={{ marginLeft: "10px" }}>
            {window.innerWidth <= 760 ? (
              <span style={{ fontSize: "12px" }}>اختر شهرًا : </span>
            ) : (
              <span>اختر شهرًا : </span>
            )}
            <DatePicker
              needConfirm={false}
              inputReadOnly={window.innerWidth <= 760}
              defaultValue={dayjs()}
              onChange={onChangeMonth}
              picker="month"
            />
          </div>
          <div style={{ marginLeft: "10px" }}>
            <span>اختر فترة : </span>
            <RangePicker
              needConfirm={true}
              inputReadOnly={window.innerWidth <= 760}
              onChange={changeRange}
              value={[dayjs(start), dayjs(end)]}
              allowClear={false}
            />
          </div>
        </div>
        <div className="discountBtn">
          <Button
            onClick={function () {
              addATasks();
            }}
            type="primary"
          >
            <MenuUnfoldOutlined /> إجازة جماعية
          </Button>
          <Button
            style={{
              marginLeft: "5px",
              marginRight: "5px",
              border: "none",
              backgroundColor: "#FAA61A",
              color: "#fff",
            }}
            onClick={function () {
              addTasks();
            }}
          >
            <FormOutlined /> إجازة موظف
          </Button>
          <Button
            style={{
              display: "block",
              marginLeft: "5px",
              marginBottom: "10px",
              backgroundColor: "#0972B6",
              borderColor: "#0972B6",
              border: "none",
            }}
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
              marginLeft: "5px",
              marginBottom: "10px",
              backgroundColor: "#f00",
              borderColor: "#f00",
              border: "none",
            }}
            onClick={function () {
              deleteAll();
            }}
            type="primary"
          >
            <DeleteOutlined />
          </Button>
          <Button
            style={{
              display: "block",
              marginLeft: "5px",
              marginBottom: "10px",
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
        </div>
      </div>
      <Modal
        centered
        footer={[]}
        width={1000}
        style={{ direction: "rtl" }}
        title="إضافة إجازة جماعية"
        visible={isAModalVisible}
        onCancel={function () {
          setIsAModalVisible(false);
        }}
      >
        <Form form={form} name="dynamic_form_nest_item" autoComplete="on">
          <div className="groupTasks">
            <Form.Item>
              <Form.Item
                label="نوع الإجازة"
                name={"task_type"}
                rules={[{ required: true, message: "ادخل نوع الإجازة" }]}
              >
                <Select
                  style={{ width: 130 }}
                  showSearch
                  optionFilterProp="children"
                  notFoundContent={
                    <Spin style={{ textAlign: "center" }}></Spin>
                  }
                  onSelect={changeTask}
                  filterOption={(input, option) =>
                    option.props.children?.indexOf(input) >= 0 ||
                    option.props.value?.indexOf(input) >= 0 ||
                    option.props.label?.indexOf(input) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.props?.children?.localeCompare(
                      optionB.props.children
                    )
                  }
                >
                  {tasksTypes.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form.Item>
            <Form.Item
              className={"range1"}
              label="الفترة"
              name={"date_range"}
              rules={[{ required: true, message: "لم تقم بإدخال فترة الطلب!" }]}
            >
              <RangePicker
                needConfirm={true}
                inputReadOnly={window.innerWidth <= 760}
                showTime={{ format: "HH:mm" }}
                onChange={function (all, date) {
                  checkPeriod(all, date, 1);
                  changeTRange(all, date);
                }}
                format="YYYY-MM-DD HH:mm"
              />
            </Form.Item>
            <Form.Item label="التفاصيل" name={"description"}>
              <TextArea onChange={changeDes} rows={1}></TextArea>
            </Form.Item>
          </div>
          <Checkbox
            value={checkAll}
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkAll}
          >
            تحديد الكل
          </Checkbox>
          <Divider />
          <CheckboxGroup
            name={"users"}
            className="usersNames"
            options={getNameOptions()}
            value={checkedList}
            onChange={onChange}
          />

          <Form.Item style={{ float: "left" }}>
            <Button
              style={{ marginLeft: "10px" }}
              onClick={function () {
                setIsAModalVisible(false);
              }}
            >
              إلغاء
            </Button>
            <Button loading={saving} type="primary" onClick={submitTasks}>
              حفظ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        centered
        footer={[]}
        width={1000}
        style={{ direction: "rtl" }}
        title="إضافة إجازات موظف"
        visible={isModalVisible}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          name="dynamic_form_nest_item"
          autoComplete="on"
          onFinish={function (record) {
            onFinish(record);
          }}
        >
          <Form.Item
            name="user_id"
            label="اسم الموظف"
            rules={[{ required: true, message: "Missing area" }]}
          >
            <Select
              options={tstypes}
              onChange={handleFormChange}
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
          <Form.List name="tasks">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline">
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.user_id !== curValues.user_id ||
                        prevValues.tasks !== curValues.tasks
                      }
                    >
                      {() => (
                        <Form.Item
                          {...field}
                          label="نوع الإجازة"
                          name={[field.name, "task_type"]}
                          rules={[
                            { required: true, message: "ادخل نوع الإجازة" },
                          ]}
                        >
                          <Select
                            disabled={!form.getFieldValue("user_id")}
                            style={{ width: 130 }}
                            showSearch
                            optionFilterProp="children"
                            notFoundContent={
                              <Spin style={{ textAlign: "center" }}></Spin>
                            }
                            filterOption={(input, option) =>
                              option.props.children?.indexOf(input) >= 0 ||
                              option.props.value?.indexOf(input) >= 0 ||
                              option.props.label?.indexOf(input) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.props?.children?.localeCompare(
                                optionB.props.children
                              )
                            }
                          >
                            {tasksTypes.map((item) => (
                              <Option key={item.value} value={item.value}>
                                {item.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )}
                    </Form.Item>
                    <Form.Item
                      className={"range" + field.key}
                      {...field}
                      label="الفترة"
                      name={[field.name, "date_range"]}
                      rules={[
                        {
                          required: true,
                          message: "لم تقم بإدخال فترة الطلب!",
                        },
                      ]}
                    >
                      <RangePicker
                        needConfirm={true}
                        inputReadOnly={window.innerWidth <= 760}
                        showTime={{ format: "HH:mm" }}
                        onChange={function (all, date) {
                          checkPeriod(all, date, field.key);
                        }}
                        format="YYYY-MM-DD HH:mm"
                      />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label="التفاصيل"
                      name={[field.name, "description"]}
                    >
                      <TextArea rows={1}></TextArea>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    إضافة إجازة
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item style={{ float: "left" }}>
            <Button style={{ marginLeft: "10px" }} onClick={handleCancel}>
              إلغاء
            </Button>
            <Button loading={saving} type="primary" htmlType="submit">
              حفظ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        centered
        footer={[]}
        width={800}
        style={{ direction: "rtl" }}
        title="تعديل إجازة/مهمة"
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
      >
        <Form
          form={editForm}
          name="edit_task_form"
          autoComplete="on"
          onFinish={onEditFinish}
          layout="vertical"
        >
          <Form.Item
            label="نوع الإجازة"
            name="task_type"
            rules={[{ required: true, message: "ادخل نوع الإجازة" }]}
          >
            <Select
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="children"
              notFoundContent={<Spin style={{ textAlign: "center" }}></Spin>}
              filterOption={(input, option) =>
                option.props.children?.indexOf(input) >= 0 ||
                option.props.value?.indexOf(input) >= 0 ||
                option.props.label?.indexOf(input) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.props?.children?.localeCompare(optionB.props.children)
              }
            >
              {tasksTypes.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="الفترة"
            name="date_range"
            rules={[{ required: true, message: "لم تقم بإدخال فترة الطلب!" }]}
          >
            <RangePicker
              needConfirm={true}
              inputReadOnly={window.innerWidth <= 760}
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="التفاصيل" name="description">
            <TextArea rows={3}></TextArea>
          </Form.Item>
          <Form.Item style={{ float: "left" }}>
            <Button style={{ marginLeft: "10px" }} onClick={handleEditCancel}>
              إلغاء
            </Button>
            <Button loading={saving} type="primary" htmlType="submit">
              حفظ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table
        loading={load}
        columns={columns}
        scroll={{ x: "1000px" }}
        dataSource={data}
        onChange={handleChange}
      />

      <div id="att-report" style={{ display: "none" }}>
        <div
          style={{
            direction: "rtl",
            fontSize: "12px",
            fontFamily:
              "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            margin: "0",
          }}
        >
          <table
            style={{ fontSize: "11px", width: " 100%", textAlign: " center" }}
          >
            <thead>
              <tr style={{ border: "none" }}>
                <th colSpan={8}>
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
                          setting.filter(
                            (item) => item.key == "admin.logo"
                          )?.[0]?.value
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
                        كشف ترحيل الإجازات لشهر {currentMonth}
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
                <th style={{ fontWeight: "100" }}>م</th>
                <th style={{ fontWeight: "100" }}>الاسم</th>
                <th style={{ fontWeight: "100" }}>الإدارة</th>
                <th style={{ fontWeight: "100" }}>نوع الإجازة</th>
                <th style={{ fontWeight: "100" }}>من</th>
                <th style={{ fontWeight: "100" }}>إلى</th>
                <th style={{ fontWeight: "100" }}>إجمالي الوقت</th>
                <th style={{ fontWeight: "100" }}>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {(checkedRList.length > 0 ? checkedRList : pdata).map((item, index) => (
                <tr
                  key={index}
                  style={{
                    height: "30px",
                    backgroundColor: index % 2 != 0 ? "#e6e6e6" : "#fff",
                  }}
                >
                  <td>{index + 1}</td>
                  <td>{item.fullname}</td>
                  <td>{item.category}</td>
                  <td>{item.vac_name}</td>
                  <td>
                    {dayjs(item.date_from, "YYYY-MM-DD HH:mm:ss").format(
                      "YYYY-MM-DD HH:mm"
                    )}
                  </td>
                  <td>
                    {dayjs(item.date_to, "YYYY-MM-DD HH:mm:ss").format(
                      "YYYY-MM-DD HH:mm"
                    )}
                  </td>
                  <td>
                    {formatDuration(
                      computeCalendarDays(item.date_from, item.date_to),
                      item.netPeriod
                    )}
                  </td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={8}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginTop: "20px",
                      textAlign: "center",
                    }}
                  >
                    {setting
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
    </Card>
  );
}

export default function TasksRecords({ setting }) {
  return (
    <App>
      <TasksRecordsContent setting={setting} />
    </App>
  );
}
