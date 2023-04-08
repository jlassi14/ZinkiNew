/* eslint-disable prettier/prettier */
const router = require('express').Router();
const express = require('express');
const UserController = require('../Controllers/UserController');

router.get('/txt-list', UserController.getAllTxt);

module.exports = router;
