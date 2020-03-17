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
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        const errorMsg = errors.array().map(error => error.msg);
        res.status(400).json({
            errors: errorMsg
        });
     } else {
         const user = req.body;
         if(user.password){
             user.password = bcryptjs.hashSync(user.password);
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
res.json(courses);



router.get('/courses/:id' , asyncHandler(async (req, res) => {
// let course;
const course = await Course.findByPk(req.params.id, {
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
        },

    },
],
});

    
  res.status(200).json(course);
}
)
)}))

// post course for new course
router.post('/courses', userAuth, asyncHandler(async(req,res)=> {
    try{
        const course = await Course.create(req.body);
        res.status(400).json({
           message: "your course has been created"
        });
        res.status(201).location('/courses/' + course.id).end();
    } catch(error){
        if(error.name === 'SequelizeValidationError')
        { const errors = error.errors.map (err=>err.message);
            res.status(400).json({errors});
        } else {
            throw error;
        }
    }
}));


//updates courses 



router.put('/courses/:id', userAuth, [
    check('title')
        .exists()
         .withMessage('title is required :)'),
    check('description')
        .exists()
         .withMessage('a course description is required :)'),
     check('userId')
        .exists()
        .withMessage('a userId is required :) ')

] , asyncHandler(async (req,res,next)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const errorMessages= errors.array().map(error => error.msg);
        res.status(400).json({errors: errorMessages});
    } else {
        const AuthorizedUser = req.currentUser;
        const course = await Course.findByPk(req.params.id);
        if(AuthorizedUser.id === course.userId){
            await course.update(req.body);
            res.status(204).end();
        }else {
            res.status(403).json({message: " whoops you cant make changes to someone else's courses :( "})
        }
    }
}));



/// delete a course 
router.delete('/courses/:id', userAuth, asyncHandler(async(req,res,next) => {
    const user = req.currentUser;
    const course = await Course.findByPk(req.params.id);
    if(course){
        if(user.id === course.userId){
            await course.destroy();
            res.status(204).end();

        } else {
            res.status(403).json({
                message: " hey friend, you can't delete someone elses course."
            });
        }
        }else {
            next();
        
    }
}));
module.exports= router;