const db=require('../config/connection');
var collection=require('../config/collection');
const bcrypt=require('bcrypt');
const { ObjectId } = require('mongodb');
const Razorpay=require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_UdRoI11AqyPPmk',
    key_secret: 'W6W4d0z5wdAm2bgtFeO4jOja',
  });

module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.insertedId)
            })
        })
       
    },
    doLogin:(userData)=>{
     return new Promise(async(resolve,reject)=>{
        let loginStatus=false
        let response={}
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({emailid:userData.emailid})
        if(user){
            bcrypt.compare(userData.password,user.password).then((status)=>{
                if(status){
                    console.log("Login successfull")
                    response.user=user
                    response.status=true
                    resolve(response)
                }else{
                    console.log("login failed")
                    resolve({status:false})
                }
            })
        }else{
            console.log("User doesn't exist")
            resolve({status:false})
        }
     })
    },
    addToCart:(productID,userID)=>{
        let proObj={
            item:new ObjectId(productID),
            quantity:1
        }
     return new Promise(async(resolve,reject)=>{
        let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userID)})
        if(userCart){  
            let proExist=userCart.products.findIndex(product=> product.item==productID)
           // console.log(proExist);
if(proExist!=-1){
    db.get().collection(collection.CART_COLLECTION)
    .updateOne({user:new ObjectId(userID),'products.item':new ObjectId(productID),
    user:new ObjectId(userID)
},
    {
        $inc:{'products.$.quantity':1}
    }).then(()=>{
        resolve()
    })
}else{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({user:new ObjectId(userID)},
            {
                $push:{products:proObj}
            }).then((response)=>{
                resolve()
            })
        }
        }else{
            let cartObj={
                user:new ObjectId(userID),
                products:[proObj]
            }
            
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                resolve()
            })
        }
     })
    },
    getCartProducts:(userID)=>{
      return new Promise(async(resolve,reject)=>{
        let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
            $match:{user:new ObjectId(userID)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'products'
    
                }
            },
            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
                }
            }
            /* {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    let:{productList:'$products'},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $in:['$_id',"$$productList"]
                                }
                            }
                        }
                    ],
                    as:'cartItems'
                }
            } */
    ]).toArray()
   // console.log(cartItems[0].products);
    resolve(cartItems)
      })
    },
    getCartCount:(userID)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userID)})
            let count=0;
            if(cart){
               count=cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)
        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:new ObjectId(details.cart)},
                {
                    $pull:{products:{item:new ObjectId(details.product)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
            }
            else{
              db.get().collection(collection.CART_COLLECTION)
    .updateOne({_id:new ObjectId(details.cart),'products.item':new ObjectId(details.product)},
    {
        $inc:{'products.$.quantity':details.count}
    }
    ).then((response)=>{
        //console.log("This is response:",response)
        resolve({status:true})
    }) 
} 
        })
    },
    removeProduct:(details)=>{
        return new Promise((resolve,reject)=>{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:new ObjectId(details.cart)},
                {
                    $pull:{products:{item:new ObjectId(details.product)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            }) 
    
})
    },
    getTotalAmount:(userID)=>{
        return new Promise(async(resolve,reject)=>{
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                $match:{user:new ObjectId(userID)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'products'
        
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{$toInt:'$product.price'}]}}
                    }
                }
                
        ]).toArray()
        //console.log(total[0].total);
        resolve(total[0].total)
        })
    },
    placeOrder:(order,products,totalPrice)=>{
    return new Promise((resolve,reject)=>{
    //console.log(order,products,totalPrice)
    let status=order.payment_method==='COD'?'placed':'pending'
    let orderObj={
        deliveryDetails:{
            name:order.name,
            mobile:order.mobile,
            address:order.address,
            pincode:order.pincode

        },
        userId:new ObjectId(order.userId),
        paymentMethod:order.payment_method,
        totalAmount:totalPrice,
        products:products,
        status:status,
        date:new Date()
    }
    db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
        db.get().collection(collection.CART_COLLECTION).deleteOne
        ({user:new ObjectId(order.userId)})
        resolve(response.insertedId.toString())
    })
    }) 
    },
    getCartProductList:(userId)=>{
        //console.log(userId)
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})
            //console.log(cart)
            resolve(cart.products)
        })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
         let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:new ObjectId(userId)}).toArray()
         console.log(orders)
         resolve(orders)
        })
    },
    getOrderProducts:(orderId)=>{

        return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               {
                $match:{_id:new ObjectId(orderId)}
               },
               {
                $unwind:'$products'
               },
               {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
               },
               {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                },
               },
               {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
               }
            ]).toArray()
            console.log(orderItems)
            resolve(orderItems)
        })
    },
    generateRazerpay:(orderId,Total)=>{
        return new Promise((resolve,reject)=>{
            var options={
                amount:Total*100,
                currency:"INR",
                receipt:""+orderId
            };
            instance.orders.create(options,function(err,order){
                if(err){
                    console.log(err)
                }else{
                console.log("New Order:", order);
                resolve(order)
            }
            })
        })
    },
    verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
        const crypto=require('crypto');
        let hmac = createHmac('sha256', 'W6W4d0z5wdAm2bgtFeO4jOja');
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
        hmac=hmac.digest('hex')
        if(hmac==details['payment[razorpay_signature]']){
            resolve()
        }else{
            reject()
        }

    })
    },
    changePaymentStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:new ObjectId(orderId)},
        {
          $set:{status:'placed'}
        }
        ).then(()=>{
            resolve()
        })
    })
    }

   
};