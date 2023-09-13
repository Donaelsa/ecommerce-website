function addToCart(productID){
    $.ajax({
      url:'/add_to_cart/'+productID,
      method:'get',
      success:(response)=>{
        if(response.status){
            let count=$('#cart_count').html()
            count=parseInt(count)+1
            $("#cart_count").html(count)
        }
        
      }
    })
  }