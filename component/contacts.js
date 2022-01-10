import { StatusBar } from 'expo-status-bar';
import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, ScrollView, TextInput, Modal, Alert, Pressable } from 'react-native';
import { globalStyles } from './global';

export class Contacts extends Component{
    constructor(props){
        super(props);
        this.state = {
            modalVisible: false
        }
    }

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }
    render(){
        const { modalVisible} = this.state;
        return(
            <ScrollView>
                {Array.from(this.props.chat).map((contact)=>{
                    return(
                        <View key={contact.id}>
                            <Modal
                                animationType='none'
                                transparent={true}
                                visible={modalVisible}
                                onRequestClose={()=>{
                                    Alert.alert("Modal has been closed.");
                                    this.setModalVisible(!modalVisible)
                                }}>
                                <View>
                                    <View>
                                        <Text>{contact.userName}</Text>
                                        <Pressable
                                            onPress={()=>this.setModalVisible(!modalVisible)}>
                                            <Text>Close</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </Modal>
                            <Pressable
                                onPress={()=>this.setModalVisible(!modalVisible)}>
                                <Text key={contact.id} style={globalStyles.chatList} 
                                // onPress={()=>{
                                //     this.props.chatPopUp(contact.id);
                                    // console.log('selected:', this.props.id)
                                    // }}
                                    >{contact.userName}</Text>
                            </Pressable>  
                        </View>
                        
                    )
                })}
            </ScrollView>
        );
    }
    
}

// const styles = StyleSheet.create({
//     container: {
//         flex: 1
//     },
// });

