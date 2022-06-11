const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required "]
    },
    login: {
        type: String,
        required: [true, "A user must have a login"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: "default.jpg"
    },    
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password!"],
        validate: {
            //Works only on Save and create
            validator: function(el) {
                return el === this.password;
            },
            massage: "Passwords are not the same!"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

usersSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    this.passwordConfirm = undefined;
    next();
});

usersSchema.pre('save', async function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

usersSchema.pre(/^find/, function(next){
    this.find({ active: {$ne: false}});
    next();
});

usersSchema.methods.checkPassword = async function(
    candidatePassowrd,
    userPassword
){
    return await bcrypt.compare(candidatePassowrd, userPassword);
}

usersSchema.methods.changedPassowrdAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = +(this.passwordChangedAt.getTime() / 1000);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}
usersSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest('hex');


    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;