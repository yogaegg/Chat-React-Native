import { StatusBar } from 'expo-status-bar';
import React, {useState,useRef,useEffect,Component} from 'react';
import { StyleSheet, Text, View, Button, TextInput, Modal, Alert, Pressable } from 'react-native';
import { FlatList, ScrollView } from 'react-native';
// import { globalStyles } from './global';
import { DisplayingChat } from './component/displayingChat';
import { Contacts } from './component/contacts';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { initDatabase } from './component/database';
// import TabNavigator from './component/stack';
import {NavigationContainer} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

class App extends Component{
  constructor(props){
    super(props);
    this.state = {
      chat: '',
      msg: '',
      input:'',
      currChat:'',
      selfID:'6836456',
      db_friends:'',
      db_messages:'',
      Tab: createBottomTabNavigator(),
      modalVisible: false
    }  
  }

  
  async componentDidMount(){
    // const Tab = createBottomTabNavigator();
    this.setState({db_friends:await initDatabase(this.state.selfID+'_friendList')});
    this.setState({db_messages:await initDatabase(this.state.selfID+'_messages')});
    // useEffect(()=>{
    this.state.db_friends.remove({},{multi:true}, function (err,numRemoved) {console.log('friends removed',numRemoved)});
    this.state.db_messages.remove({},{multi:true}, function (err,numRemoved) {console.log('messages removed',numRemoved)});
    this.state.db_friends.insert(
      [{id: '3576546',userName:'Monster',display:true,latestViewTimestamp:0,lastReceivedTimestamp:0}
      ,{id: '3436356',userName:'Eggie',display:true,latestViewTimestamp:0,lastReceivedTimestamp:0}
      ,{id: '0000000',userName:'Chat Assistant',display:false,latestViewTimestamp:0,lastReceivedTimestamp:0}],function (err) {});
    this.state.db_messages.insert([{
    sourceID:'3436356',
    targetID:this.state.selfID,
    messages:[{
      sourceTimeStamp:'0',
      targetTimeStamp:'0',
      data:'hello',
      reversed:false},{
      sourceTimeStamp:'0',
      targetTimeStamp:'0',
      data:'i am eggie',
      reversed:false}]},{
    sourceID:'3576546',
    targetID:this.state.selfID,
    messages:[{
      sourceTimeStamp:'0',
      targetTimeStamp:'0',
      data:'hi',
      reversed:false},{
      sourceTimeStamp:'0',
      targetTimeStamp:'0',
      data:'Monster here!',
      reversed:false}]}],function(err) {});
    console.log("Chat is changed.")
    this.state.db_friends.find({},(error,docs)=>{
      // doc = docs;
      console.log('chat displaying:',Array.from(docs));
      this.setState({chat:Array.from(docs)})
      });
    // },[])
    // this.state.db_friends.find({display:true},(err,docs)=>{
    //   this.setState({chat:docs})
    // });
    // setInterval(this.getMsg, 10000)
    // setInterval(()=>{console.log("hit")}, 5000)
    // this.setState({chat:await this.state.db_friends.find({display:true})})
    // console.log(this.state)
  }
  
  sendMsg =()=>{
    console.log('send\'s current chat',this.state.currChat)
    var messageContent = this.state.input;
    var newMsg = {
      sourceTimeStamp:Date.now().toString(),
      targetTimeStamp:Date.now().toString(),
      data:messageContent,
      reversed:false};
    if (this.state.selfID>this.state.currChat){
      newMsg.reversed=true;
    }
    this.setState({msg:[...this.state.msg,newMsg]});
    this.setState({input:''});
    this.state.db_friends.update({id:this.state.currChat},{$set: {latestViewTimestamp:newMsg.sourceTimeStamp}},()=>{
      this.state.db_friends.find({id:this.state.currChat},(err,docs)=>{
        console.log('current chat latest view updated:',docs);
      })
    });
   
    this.state.db_messages.update({$or:[{sourceID:this.state.currChat},{targetID:this.state.currChat}]},{$push:{messages:newMsg}},()=>{
      this.state.db_messages.find({$or:[{sourceID:this.state.currChat},{targetID:this.state.currChat}]},(err,docs)=>{
        console.log('current chat latest messages:',docs);
      });
    });
    
    fetch('http://localhost:8001/sendMsg',{
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userID: this.state.selfID,
        receiverID: this.state.currChat,
        message:newMsg}),
    })//{}
    .then(response =>{
      if (response.status == 200){
        return response.text();       
      }
      else{
        sendMsg();
      }})
    .then(data =>{
      this.state.db_friends.update({id:this.state.currChat},{$set: {lastReceivedTimestamp:data}});
      console.log('success',data);
    })
    .catch((error)=>console.error('sendMsg error',error));
  }

  getMsg = ()=>{
    console.log('current chat:',this.state.currChat);
    this.state.db_friends.find({},{_id:0,id:1,lastReceivedTimestamp:1},(err,docs)=>{
      console.log('getMsg request: query lastRcv',docs)
      try{
        fetch('http://localhost:8001/getMsg',{
          method: 'POST',
          headers:{
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userID:this.state.selfID,
            lastReceivedTimestamps:docs
            }),
        }).then(response=>{
          if(response.status != 200){
            console.log('status',response.status);
            alert(response.statusText);
            // await new Promise(resolve => setTimeout(resolve, 5000));
            // getMsg();
          }
          else{
            return response.json();
          }     
        }).then(data=>{
          console.log('getMsg response:',data);
          var latest;
          data.forEach(doc=>{
            latest = '0';
            // console.log(doc[0]);
            this.state.db_messages.update({$and:
              [{sourceID:doc[0].sourceID},{targetID:doc[0].targetID}]},{
                $set:{sourceID:doc[0].sourceID,targetID:doc[0].targetID},
                $push:{messages:{$each:doc[0].messages}}
              },{upsert:true},()=>{
                this.state.db_messages.find({},(err,docs)=>{
                  console.log('getMsg update messages:',docs)
                })
              });
            doc[0].messages.forEach(ele=>{
              latest = Math.max(latest,ele.sourceTimeStamp).toString();
              // console.log(latest)
            })
            // console.log('latest timestamp:',latest)
            this.state.db_friends.update({$or:
              [{id:doc[0].sourceID},{id:doc[0].targetID}]},{
                $set:{lastReceivedTimestamp:latest}
              },()=>{
                this.state.db_friends.find({},function(err,docs){
                  console.log('getMsg update friends:',docs)
                })
              });
            console.log('here',doc[0].sourceID,doc[0].targetID,this.state.currChat)  
            if (doc[0].sourceID == this.state.currChat || doc[0].targetID == this.state.currChat){
              console.log([...this.state.msg,doc[0].messages])
              this.setState({msg:[...this.state.msg,...doc[0].messages]})
            }
          })
          })        
      } catch (error){
        console.error(error);
      }
    })
  }

  setCurrentChat=(id)=>{
    this.setState({currChat:id});
    this.state.db_messages.findOne({$or:[{sourceID:id},{targetID:id}]}, (err,docs)=>{
      console.log('messages',docs);
      if (docs != null){
        var msgs = docs.messages;
        this.setState({msg:msgs})
      }    
    })
  }
  
  chatPopUp=(visible)=>{
    this.setState({modalVisible:visible})
  }

  
  
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.sidebar}>
          {/* <View style={styles.sideHead}>
            <Button title='chat'/>
            <Button title='contacts'/>
          </View> */}
          {/* <ScrollView>
            {Array.from(this.state.chat).map((contact)=> {
              return (
                <UserEntry key={contact.id} id={contact.id} userName={contact.userName} setCurrentChat={this.setCurrentChat} />
              )
            })}
            {/* <Text style={globalStyles.chatList} onPress={()=>showChatContent()}>Eggie</Text> */}         
          {/* </ScrollView> */}
          {/* <DisplayingChat chat={this.state.chat} setCurrentChat={this.setCurrentChat}/>  */}
          <NavigationContainer>
            <this.state.Tab.Navigator>
              <this.state.Tab.Screen name='chat'>
              {props => <DisplayingChat {...props} chat={this.state.chat} setCurrentChat={this.setCurrentChat}/>}
              </this.state.Tab.Screen>
              <this.state.Tab.Screen name='contacts'>
                {props=> <Contacts {...props} chat={this.state.chat} chatPopUp={this.chatPopUp}/>}
              </this.state.Tab.Screen>
            </this.state.Tab.Navigator>    
          </NavigationContainer>
        </View>
        <View style={styles.chatbox}>
          <Text style={styles.head}> {this.state.currChat && this.state.chat && this.state.chat.filter(item=>item.id==this.state.currChat)[0].userName} </Text>
          {/* <Text>{tmp_msg.messages}</Text>         */}
          <FlatList
            data = {this.state.msg}
            keyExtractor={(item, index) => 'key'+index}
            renderItem={({item})=>{
              // console.log(typeof(item.id))
              // return(<Text>{item.id}</Text>)
              if (this.state.currChat && this.state.msg.length>0){
                if ((this.state.selfID>this.state.currChat && item.reversed) || (this.state.selfID<this.state.currChat && !item.reversed)){
                  return (<Text style={styles.msgSend}>{item.data}</Text>)}
                else {
                  return (<Text style={styles.msgGet} >{item.data}</Text>)}
                  }
              }}/>
          <View style={styles.send}>
            <TextInput 
            value={this.state.input}
            style={styles.input}
            placeholder='e.g. Hello World'
            onChangeText={(val)=>{this.setState({input:val});}}/>
            <Button title='SEND' onPress={()=>this.sendMsg()}/>
            {/* <Button title='Get' onPress={()=>getMsg()}/> */}
          </View>       
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebar: {
    flex:0.2,
    height:700,
    // width: 100,
    // paddingTop:40,
    backgroundColor: '#cce7e8',
    fontWeight:'bold',
  },
  sideHead: {
    flex:0.1,
    flexDirection:'row',
    backgroundColor:'bisque',
    justifyContent:'space-evenly'
  },
  // sideChatList: globalStyles.chatList,
  head: {
    paddingBottom: 30,
    textAlign: 'center',
    fontSize: 20,
    fontWeight:'500',
  },
  chatbox: {
    flex: 0.6,
    justifyContent: 'space-between',
    height:700,
    // width:500,
    backgroundColor: '#cce7e8',
    borderWidth:2,
    borderColor: '#21130d',   
  },
  msgSend: {
    textAlign: 'right',
    fontSize: 20,
    fontWeight:'500',
    borderWidth:2,
    borderColor:'#bbb',
    borderSytle: 'dashed',
    borderRadius: 10,
    // display: 'flex',
    alignSelf: 'flex-end',
  },
  msgGet: {
    textAlign: 'left',
    fontSize: 20,
    fontWeight:'500',
    borderWidth:2,
    borderColor:'#bbb',
    borderSytle: 'dashed',
    borderRadius: 10,
    // display: 'flex',
    alignSelf: 'flex-start',
  },
  TextInput: {
    width: 0.8,
    borderWidth:2,
    borderColor:'#111',
  },
  send: {
    flexDirection: 'row',
    alignContent:'space-between',
  },
});

export default App;