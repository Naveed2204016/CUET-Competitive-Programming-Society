const mongoose = require("mongoose");

const userSchema= new mongoose.Schema(
    {
        Username : {
            type : String,
            required : true,
            unique : true
        },

        ID : {
            type : String,
            required : true,
            unique : true
        },

        Email : {
            type : String,
            required : true,
            unique : true
        },

        CfHandle : {
            type : String,
            required : true
        },

        Password : {
            type : String,
            required : true
        },

        Role : {
            type : String,
            enum : ['admin','member'],
            default : 'member'
        }
    }
)

module.exports = userSchema;