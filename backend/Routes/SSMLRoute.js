/* eslint-disable prettier/prettier */
const router = require('express').Router();
const express = require('express');
const GenerateSSmlController = require('../Controllers/GenerateSSmlController');



router.post('/Quota',GenerateSSmlController.Quota);
//router.get('/audio',GenerateSSmlController.audio);

router.post('/test',GenerateSSmlController.TesteSsml);
router.get('/QuotaID/:id',GenerateSSmlController.getQuotaById);
router.post('/UpdateTags', GenerateSSmlController.UpdateTags);
module.exports = router;
