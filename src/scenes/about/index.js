import React from 'react';

import { Typography, Space } from 'antd';

const { Text } = Typography;

export default class About extends React.Component{
    constructor(props){
        super(props);
        this.state = {
          eventsList: [],
        }
    }
componentDidMount(){

}
    render(){
        return(
        <Text>{JSON.stringify(this.state.eventsList)}</Text>
        );
    };
}

