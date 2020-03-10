'use strict'
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
 const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

const User = require('./models').User;
const Course = require('./models').Course;
const app = express();

function asyncHandler(cb){
    return async (req,res,next) => {
     try {
         await cb (req,res,next)
    }catch(err){
        next(err);
    }}
}



// unit 9 workshop 

const userAuth = async (req, res, next ) => {
    let authErrorMsg = null;
    const authentication = auth(req);


      const users = await User.findAll();
console.log(users);

    if (authentication){
        const user = await  users.find(user => user.emailAddress === authentication.name);
        if(user){
            const authenticated = bcryptjs
            .compareSync(authentication.pass , user.password);

            if(authenticated){
                console.log(`login successful for ${user.emailAddress}`);
                req.currentUser = user;
                console.log("nope")
            } else {
                authErrorMsg =  `login is not  successful for ${user.emailAddress}`
            }
        }else {
            authErrorMsg = `username ${authentication.name} not found `;
        }
     } else {
        authErrorMsg = 'auth header not found'; 
        }
     if (authErrorMsg){
         console.warn(authErrorMsg);
         res.status(401).json({authErrorMsg: 'Unauthorized to access'})
     } else {
         next();
     }
};


router.get('/users', userAuth, asyncHandler(async (req, res) => {
    const AuthorizedUser = req.currentUser;
    console.log(AuthorizedUser)
    const user = await User.findByPk(AuthorizedUser.id, {
    attributes: {
        exclude: [
            'password',
            'createdAt',
            'updatedAt'
        ]
    }});
    console.log(user,"hello")
    if(user){
        res.status(200).json(user);
        } else {
            res.status(400).json({
                message: " not found "
            })
        }

}
) );


//post for user

router.post('/users', asyncHandler(async (req,res) => {
    const errors = validationResults(req);
    if(!errors.isEmpty())
    {
        const errorMsg = errors.array().map(error => error.msg);
        res.status(400).json({
            errors: errorMsg
        });
     } else {
         const user = req.body;
         if(user.password){
             user.password = bcrypt.hashSync(user.password);
         }
            await User.create(req.body);
            res.status(201).location('/').end();

         }
})
)

router.get('/courses' , asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        attribute: {
            exclude:[
                'password',
                'createdAt',
                'updatedAt'
            ]
        },
        include: [
            {
                model: User, 
                attributes: {
                    exclude: [
                        'password',
                        'createdAt',
                        'updatedAt'
                    ]
                }

            }
        ]
    });


router.get('/courses/:id' , asyncHandler(async (req, res) => {
let course;
course = await Course.findByPk(req.params.id, {
    attributes:{
exclude:[
    'createdAt',
    'updatedAt',
    
]
}, 
include: [
    {
        model: User, 
        attributes: {
            exclude: [
                'password',
                'createdAt',
                'updatedAt'
            ]
        }

    }

]
}
);

    
    res.json(courses);
}
)
)}
))

module.exports= router;