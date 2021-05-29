import React from 'react';

import { Typography,Layout} from 'antd';

const { Text } = Typography;

export default class Login extends React.Component{
    constructor(props){
        super(props);
     }
    render(){
        return(
        <Layout>
          <Text>login</Text>
        </Layout>
        );
    };
}

