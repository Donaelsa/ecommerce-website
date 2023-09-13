const { reject } = require('promise');
const db=require('../config/connection');
var collection=require('../config/collection');
const { Collection } = require('mongodb');
var ObjectId=require('mongodb').ObjectId
//const {ObjectId} = require('mongodb');
console.log(db);


    module.exports={
        addProduct(product,callback){
        try{
                db.get().collection('product').insertOne(product).then((data)=>{
                callback(data.insertedId)
                console.log(data);
            })
        }
        catch(error){
            console.log("Cannot insert data:"+error)
        }
        },
        getAllProducts:()=>{
         return new Promise(async(resolve,reject)=>{
            let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve (products)
         })
        },
        deleteProduct:(productID)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: new ObjectId(productID)}).then((response)=>{
                resolve(response)
            })
        })
        },
        getProductDetails:(productID)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new ObjectId(productID)}).then((product)=>{
                    resolve(product)
                })
            })
        },
        updateProduct:(productID,productDetails)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({_id:new ObjectId(productID)},
                {$set:{
                    name:productDetails.name,
                    description:productDetails.description,
                    category:productDetails.category,
                    price:productDetails.price}}).then((response)=>{
                        resolve()
                    })
            })
        }
    
    }
    
//module.exports.addProduct = addProduct;

