'use strict'



const Sequelize = require('sequelize');
// defines the courses model with id, userId from users table, title, description, estimated time as a string nullable, materials needed, string 
module.exports = (sequelize) => {
    class Course extends Sequelize.Model{}
 Course.init({
   
    id:{
         type: Sequelize.INTEGER,
        primaryKey: true,
         autoIncrement: true,
         allowNull: false, 
}, 
title: { 
    type: Sequelize.STRING,
    allowNull: false, 
    validate:{
        notNull: {
            msg: " A title is required"
        },
        notEmpty: {
            msg:"A title is required",},
        },
     } ,
     description:{
         type: Sequelize.TEXT,
         allowNull: false,
         validate:{
             notNull: {
               msg: " Please include a description"
             },
         },
        },
     estimatedTime:{
         type: Sequelize.STRING,
         allowNull: true,
     },
     materialsNeeded:{
         type: Sequelize.STRING,
         allowNull:true
     },
  }, { sequelize});

    Course.associate = (models) => {
    models.Course.belongsTo(models.User, {
        foreignKey:{
            fieldName: "userId",
            allowNull: false
        }
    
    });
  };

return Course;
};