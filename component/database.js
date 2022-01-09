import AsyncStorageLib from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Datastore from 'react-native-local-mongodb';
export function initDatabase(key)
{

    var Datastore = require('react-native-local-mongodb')
    // // ,db = {};
    ,db= new Datastore({filename:key, storage: AsyncStorage,autoload: true});
    // db.messages = new Datastore({filename:'messages', storage: AsyncStorage,autoload:true});
    // db.loadDatabase(function(err) {
    //     if (err){console.log('load err',err)}
    //     });
    // db.messages.loadDatabase();
    return db;
}