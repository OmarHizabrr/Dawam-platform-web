import {createBottomTabNavigator} from 'react-navigation-tabs';

import HomeScreen from './../scenes/home';
import AboutScreen from './../scenes/about';

const Tab = createBottomTabNavigator();


export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator headerMode="none">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
