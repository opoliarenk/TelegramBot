const db = require("../db.connection");
const { DataTypes, NUMBER} =  require('sequelize');

module.exports = db.define(
    "user",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        chatId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        membersInFamily: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        membersNamesInFamily: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        childrenCount: {
            type: DataTypes.STRING,
            defaultValue: '0',
            allowNull: true,
        },
        specialNeeds: {
            type: DataTypes.STRING,
            defaultValue: 'ні',
            allowNull: true,
        },
        photoAccess: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        block: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        message: {
            type: DataTypes.TEXT,
            defaultValue: null,
        }
    });