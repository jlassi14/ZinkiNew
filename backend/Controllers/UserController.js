/* eslint-disable prettier/prettier */
const { response } = require("express");
const express = require("express");
const txt = require("../models/TxtModel");

const router = express.Router();

exports.getAllTxt   = (req, res) => {
    // {status: 'Activate'}
      txt.find()
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving trainers."
        });
      });
    }

    
  


