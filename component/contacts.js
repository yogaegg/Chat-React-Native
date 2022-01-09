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
    render(){
        const { modalVisible} = this.state;
        return(
            <ScrollView>
                {Array.from(this.props.chat).map((contact)=>{
                    return(
                        <View>
                            <Modal>

                            </Modal>
                            <Pressable
                                onPress={()=>this.props.chatPopUp(contact.id)}>
                                <Text key={contact.id} style={globalStyles.chatList} 
                                onPress={()=>{
                                    this.props.chatPopUp(contact.id);
                                    // console.log('selected:', this.props.id)
                                    }
                                    }>{contact.userName}</Text>
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

