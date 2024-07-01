const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    //Pueden ser multiples ordenes
    orderItems:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required:true
    }],
    shippingAddress1:{
        type:String,
        required:true
    },
    shippingAddress2:{
        type:String,
    },
    city:{
        type:String,
    },
    zip:{
        type:String,
    },
    country:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        required:true,
        default: 0,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered:{
        type:Date,
        default: Date.now
    },
    totalPrice:{
        type:Number,
        required:true,
        default: 0
    }
})

orderSchema.virtual('id').get(function (){
    return this._id.toHexString();
})

orderSchema.set('toJSON', {
    virtuals:true
})

exports.Order = mongoose.model('Order',orderSchema);