const http = require('http');
const {MongoClient} = require('mongodb');
const cors = require('cors');
const express = require('express');
const app = express();
app.use(cors());
const port = 8001;
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
client.connect();
const database = client.db('server');
const server_friends = database.collection('server_friends');
const server_messages = database.collection('server_messages');
server_friends.deleteMany({});
server_messages.deleteMany({});
server_friends.insertOne({userID:'6836456',friends:[
{id: '3576546',userName:'Monster',display:true,latestViewTimestamp:0,lastReceivedTimestamp:0}
,{id: '3436356',userName:'Eggie',display:true,latestViewTimeStamp:0,lastReceivedTimestamp:0}]});
server_friends.insertMany([{userID:'3576546',friends:[
    {id: '6836456',userName:'Oolong',display:false,latestViewTimestamp:0,lastReceivedTimestamp:0}]},{userID:'3436356',friends:[
    {id: '6836456',userName:'Oolong',display:false,latestViewTimestamp:0,lastReceivedTimestamp:0}]}]).then();
// server_messages.insertMany([{
//     sourceID: "3436356",
//     targetID: "6836456",
//     messages: [
//       {
//         sourceTimeStamp: "1",
//         targetTimeStamp: "1",
//         data: "hello",
//         reversed: false
//       },
//       {
//         sourceTimeStamp: "1",
//         targetTimeStamp: "1",
//         data: "how you doing",
//         reversed: false
//       }
//     ]
//   },
//   {
//     sourceID: "3576546",
//     targetID: "6836456",
//     messages: [
//       {
//         sourceTimeStamp: "2",
//         targetTimeStamp: "2",
//         data: "Oolong",
//         reversed: false
//       },
//       {
//         sourceTimeStamp: "1",
//         targetTimeStamp: "1",
//         data: "come here!",
//         reversed: false
//       }
//     ]
//   }]).then(data => console.log(data))
// server_messages.find({}).toArray().then(data => console.log(data));
// server_friends.find({}).toArray().then(data => console.log(data));
// const content = new Map();
// content.set('3436356',[]);
// content.set('3576546',[]);
// const relations = new Map();
// relations.set('3436356',new Set(['6836456']));
// relations.set('6836456',new Set(['3436356']));
// console.log(relations.get('3436356').has('3576546'))
app.use(
    express.urlencoded({extended: true})
)
app.use(express.json())

app.post('/sendMsg',function(req,res){
    try{
        var receiver = req.body.receiverID;
        var sender = req.body.userID;
        // console.log(req.body,receiver);
        server_friends.aggregate([
            {$match: {userID: receiver}},
            {$project: {
                userID: 1,
                friends: {
                  $filter: {
                    input: "$friends",
                    as: "friends",
                    cond: {$eq: ["$$friends.id",sender]}}}}}]).toArray().then((data) => {
                        console.log('is friend checked',data)
                        if (data.length>0){
                            var sourceID = Math.min(sender,receiver).toString();
                            var targetID = Math.max(sender,receiver).toString();
                            server_messages.updateOne({
                                $or: [{sourceID: sender},{sourceID: receiver}]},{
                                $set: {
                                  sourceID: sourceID,
                                  targetID: targetID},
                                $push: {
                                  messages: req.body.message}},{
                                upsert: true})
                            server_messages.find({}).toArray().then((data)=>console.log('updated server_msg:',data));
                            res.send(req.body.message.sourceTimeStamp);
                            console.log('sending sendMsg response:',req.body.message.sourceTimeStamp)
                        }
                        else{
                            res.send('You can only send messages to friends');
                        }
                    });      
        // console.log('message received',req.body);
    } catch (error){
        console.error(error);
    }
})

app.post('/getMsg',async function(req,res){
    try{
        var requester = req.body.userID;
        var latestTimeStamp = req.body.lastReceivedTimestamps
        // console.log(requester,latestTimeStamp);
        var promiseArr = []
        for (var index in latestTimeStamp){
            // console.log(index,latestTimeStamp[index].id,latestTimeStamp[index].lastReceivedTimestamp,typeof(latestTimeStamp[index].lastReceivedTimestamp));
            var srcID = Math.min(requester,latestTimeStamp[index].id).toString()
            var tgtID = Math.max(requester,latestTimeStamp[index].id).toString()
            // console.log(typeof(srcID),tgtID)
            promiseArr.push(server_messages.aggregate([{
                "$match": {
                $and: [{sourceID: srcID},{targetID: tgtID}]}},{
                "$project": {
                    sourceID: 1,
                    targetID: 1,
                    messages: {
                    "$filter": {
                        "input": "$messages",
                        "as": "messages",
                        "cond": {
                        $gt: ["$$messages.sourceTimeStamp",
                            latestTimeStamp[index].lastReceivedTimestamp.toString()]}}}}}]).toArray())          
            // promises[index].toArray().then(data=>console.log("single query result:",data))
            // console.log(promiseArr)
        }
        Promise.all(promiseArr).then(values => {
            // console.log(values,values.length)
            var response = []
            values.forEach((val)=>{
                // console.log(val[0])
                if (val[0]&&val[0].messages.length>0){
                    response.push(val)
                }
            })
            if (response.length>0){
                console.log('sending getMsg response:',response)
                res.json(response)
            }
            
            // var response = []
            // values.forEach(val=>{
            //     response.push(val[0])
            // })
            // res.json(response)
        })
            
            
        
    }catch (error){
            console.error(error);
    }
})
    //         // if (ele.messages.length!= 0){
    //             // res.json(ele)
    //             // console.log('replying...')}
    //         // else{
    //         //     console.log('nothing to reply')}
    //     // })

app.listen(port, function(error){
    if (error){
        console.log('Something wrong',error)
    } else{
        console.log('Server is listening on port'+port)        
    }
})