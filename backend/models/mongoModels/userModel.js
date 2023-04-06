const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const { Schema } = mongoose;

const userSchema = new Schema({

    picture:
    {
        type: String,
        default:"default.png"
    },

    name:
    {
        type: String,
        true:true,
        required: [true, "Name is required"]
    },

    email:
    {
        type: String,
        unique: true,
        required: [true, "Email is required"]
    },

    password:
    {
        type: String,
        required: [true, "Password Number is required"]
    },
})
// userSchema.methods.matchPassword = async function(enteredPassword){
//     return await bcrypt.compare(enteredPassword,this.password)
// }

// userSchema.pre('save', async (next) => {
//     if (!this.isModefied) {
//         next()
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password= await bcrypt.hash(this.password,salt)
// })



const userModel = mongoose.model('user', userSchema);

module.exports = { userModel }
