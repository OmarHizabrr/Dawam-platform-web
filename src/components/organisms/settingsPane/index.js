import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import AttendanceSetting from "./../attendanceSetting";
import Backup from "./../BackupPane";
import GeneralSetting from "./../GeneralSetting";
import WorkTypesTable from "./../workTypesTable";
import "./style.css";
export default function SettingsPane(props) {
  let { path } = useRouteMatch();

  return (
    <div style={{ padding: "20px" }}>
      <Switch>
        <Route path={`${path}`} exact>
          <GeneralSetting setting={props.setting} />
        </Route>
        <Route path={`${path}/attendance`}>
          <AttendanceSetting setting={props.setting} />
        </Route>
        <Route path={`${path}/work-types`}>
          <WorkTypesTable setting={props.setting} />
        </Route>
        <Route path={`${path}/backup`}>
          <Backup />
        </Route>
        <Route path="*">
          <GeneralSetting setting={props.setting} />
        </Route>
      </Switch>
    </div>
  );
}
