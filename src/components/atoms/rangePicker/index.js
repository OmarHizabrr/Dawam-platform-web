import {  DatePicker } from 'antd';
import dayjs from 'dayjs';

export default function RangePicker(props){

    return (<>
        <DatePicker needConfirm={false}  inputReadOnly={window.innerWidth <= 760}  value={props.value[0]} picker="date" />
    </>);

}