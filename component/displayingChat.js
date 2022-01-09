import {Component} from 'react';
import {Text} from 'react-native';
import { ScrollView } from 'react-native';
import { globalStyles } from './global';
export class DisplayingChat extends Component{
    constructor(props){
        super(props);
        // this.state = {
        //     userName : props.userName,
        //     userId : props.userID
        // }       
    }
    render(){
        return(
            <ScrollView>
                {Array.from(this.props.chat).filter(item=>item.display == true).map((contact)=> {
                    return (
                        <Text key={contact.id} style={globalStyles.chatList} onPress={()=>{
                        this.props.setCurrentChat(contact.id);
                        // console.log('selected:', this.props.id)
                        }}>{contact.userName}</Text>
                    )
                })}
            </ScrollView>
            
        )
    }  
  }
 

  


