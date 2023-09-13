/*const MongoClient = require('mongodb').MongoClient;
const state={
  db:null
}
module.exports.connect=function(done){


const url = 'mongodb://0.0.0.0:27017/';


const dbName = 'shopping';


const client = new MongoClient(url);

client.connect(function(err,data) {
  if (err) {
    console.log('Error connecting to the database:', err);
    return(done)
  } 
    state.db = data.db(dbName);

});
done();
};
module.exports.get=function(){
    return state.db;
    }*/

   /* const MongoClient = require('mongodb').MongoClient
    //const client = new MongoClient('mongodb://0.0.0.0:27017/')
  const state={
      db:null};
    module.exports.connect=function(done){
        const url='mongodb://0.0.0.0:27017/';
        const dbname='shopping';
         const client=new MongoClient(url);
          client.connect(function(err) {
            if(err){
               return done(err);
              }
              else{
              state.db=client.db(dbname);             
              done();
              }
            
        });
      
    };
  
    module.exports.get=function(){
      return state.db;
      }*/
      
      const { MongoClient } = require('mongodb');
const state={
    db:null
};

    //const url='mongodb://localhost:27017/';
    const url='mongodb://0.0.0.0:27017/';
    
const client = new MongoClient(url);
module.exports.connect= async function(done){
    const dbname='shopping';
    await client.connect();
    console.log("Connected successfully");
    state.db=client.db(dbname);
    return done;

};
module.exports.get=function(){
return state.db;
}
       