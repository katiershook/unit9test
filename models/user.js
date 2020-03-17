'use strict'
const Sequelize = require('sequelize');
// first name, last name, email, password  as STRING
module.exports = (sequelize) =>{
    class User extends Sequelize.Model{}
    User.init({
        id:{
            type: Sequelize.STRING,
            allowNull:false,
            primaryKey: true,
            autoIncrement: true,
           },
           firstName :{
            type: Sequelize.STRING,
               allowNull: false,
            validate:{
                notNull: {
                    msg: " a name is required"
                }}}, 
                lastName :{
                    type: Sequelize.STRING,
                    allowNull: false,
                 validate:{
                     notNull: {
                         msg: " a  last name is required"
                     }
                    }
},
                emailAddress:{
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate:{
                        notNull:{
                            msg: " your email is required"
                        }
                    }
                    },

                    password:{
                        type: Sequelize.STRING,
                        allowNull: false,
                        validate:{
                            notNull:{
                                msg:" a password is required"
                            },
                        },
                        },

                    }, {sequelize});
                

           User.associate= (models) => {
               models.User.hasMany(models.Course, {
                   foreignKey:{
                fieldName: 'userId',
                allowNull: false }
               })
           };
           return User;
        }
    