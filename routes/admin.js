var express = require('express');
var router = express.Router();
const product_helpers = require('../helpers/product_helpers');


router.get('/login',(req,res)=>{
  if(req.session.admin){
    res.redirect('/')
  }else{
  res.render('admin/login',{"loginErr":req.session.adminloginErr});
  req.session.adminloginErr=false;
  }
})
router.get('/logout', (req,res)=>{
  req.session.admin=null
  res.redirect('/')
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  product_helpers.getAllProducts().then((products)=>{
    res.render('admin/view_products',{admin:true,products});
  })
  
});
router.get('/add_product',function(req,res){
  res.render('admin/add_product');
});
router.post('/add_product',function(req,res){
  console.log(req.body);
  console.log(req.files.image);

  product_helpers.addProduct(req.body,(insertedId)=>{
    let image=req.files.image;
    console.log(insertedId)
    image.mv('./public/product_images/'+insertedId+'.jpg',(err,done)=>{
      if(!err){
        console.log("File uploaded successfully");
        res.render('admin/add_product');
       
      }else{
        console.log("File upload failed "+err);
      }
      });  
      
});    
    
});

router.get('/delete_product/:id',(req,res)=>{
  let productID=req.params.id
  console.log(productID);
  product_helpers.deleteProduct(productID).then((response)=>{
    res.redirect('/admin/'); 
  })
  
})
router.get('/edit_product/:id',async (req,res)=>{
  let product=await product_helpers.getProductDetails(req.params.id)
  console.log(product)

  res.render('admin/edit_product',{product})
})
router.post('/edit_product/:id',async (req,res)=>{
 
 product_helpers.updateProduct(req.params.id,req.body).then(()=>{
  let insertedId=req.params.id;
  res.redirect('/admin')
  if(req.files.image){
    //var insertedId=req.params.id
    let image=req.files.image;
    image.mv('./public/product_images/'+insertedId+'.jpg',(err,done)=>{
      });

  }
 })
 
  
})

module.exports = router;
