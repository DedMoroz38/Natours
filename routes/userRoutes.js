const express = require('express');
const {getAllUsers, createUser, getUser, updateUser, deletUser} = require('../controllers/userController');
const authController = require("../controllers/authController.js");
const userController = require("../controllers/userController.js");



const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.get("/me", userController.getMe, userController.getUser);

router.patch(
"/updatePassword",    
    authController.updatePassword
);
router.patch("/updateMe", userController.uploadUserPhoto, userController.resizeUserPhoto, updateUser
);

router.delete(
    "/:id",
    deletUser
);

router.route('/')
    .get(getAllUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)

module.exports = router;