'use strict';

const router = require('express').Router();

const Users = require("../models").User;
const Session = require("../helpers/Session");
const ACL = require('../helpers/ACL');
const HttpError = require("../helpers/HttpError");
const form = require('express-form2');
  var field   = form.field;

router.post(
    ['/signup'],

    // Body validation
    form(
        field('password')
            .required()
            .minLength(8)
            .maxLength(40),

        field('name')
            .required(),

        field('surname')
            .required(),

        field('email')
            .required()
            .trim()
            .isEmail(),

        field('description')
            .trim()
    ),

    // Controller
    (req, res, next) => {

        if(!req.form.isValid) {
            return next(new HttpError(412, "Invalid input data", req.form.errors));
        }

        Users.prototype
            .checkEmail(req.form.email, 0)
            .then(() => {
                let user = new Users({
                        name: req.form.name,
                        surname: req.form.surname,
                        email: req.form.email,
                        password: req.form.password,
                        description: req.form.description
                    });

                user.
                    save()
                    .then(() => {
                        res.send();
                    })
                    .catch(next);
            })
            .catch(next);
    }
);

router.post(
    ['/signin'],

    // Body validation
    form(
        field('email')
            .required()
            .trim()
            .isEmail(),

        field('password')
            .required()
    ),

    // Controller
    (req, res, next) => {
        if (!req.form.isValid) {
            return next(new HttpError(412, "Invalid input data", req.form.errors));
        }

        let user;

        Users.prototype
            .auth(req.form.email, req.form.password)
            .then((usr) => {
                user = usr;
                return Session.create(usr.id);
            })
            .then((token) => {
                res.send({
                    token: token,
                    id: user.id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email
                });
            })
            .catch(next);
    }
);

router.post(
    ['/logout'],

    ACL(),

    // Controller
    (req, res, next) => {
        Session
            .kill(req.session)
            .then(() => {
                res.send({});
            })
            .catch(next);
    }
);

module.exports = router;
