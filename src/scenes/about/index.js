import React from 'react';

import { Typography, Space } from 'antd';
import firebase from "../../utilites/firebase";

const { Text } = Typography;

export default class About extends React.Component{
    constructor(props){
        super(props);
        this.state = {
          eventsList: [],
        }
    }
componentDidMount(){
 const eventRef=firebase.database().ref('events/38/log').orderByChild("DateTimeRecord");
 eventRef.on('value', (snapshot) => {
    const events = snapshot.val();
    const todoList = [];
    for (let id in events) {
      var temp = new Object();
      temp["id"]=id;
      temp["date"]=new Date(events[id]["DateTimeRecord"]).toLocaleDateString();
      temp["time"]=new Date(events[id]["DateTimeRecord"]).toLocaleTimeString();
      todoList.push(temp);
    }
    this.setState({eventsList:todoList});
    
  });
}
    render(){
        return(
        <Text>{JSON.stringify(this.state.eventsList)}</Text>
        );
    };
}

