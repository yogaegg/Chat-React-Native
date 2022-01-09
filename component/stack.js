import {NavigationContainer} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DisplayingChat } from './displayingChat';
import { Contacts } from './contacts';

const Tab = createBottomTabNavigator()

export default function TabNavigator(){
    return(
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen name='DisplayingChat' component={DisplayingChat}/>
                <Tab.Screen name='Contacts' component={Contacts}/>
            </Tab.Navigator>
        </NavigationContainer>
    );
};