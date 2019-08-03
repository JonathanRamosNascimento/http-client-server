const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./product');

var app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(
    'mongodb://localhost:27017/http_client',
    { useNewUrlParser: true }
);

var myLogger = function (req, res, next) {
    console.log(req.body);
    next();
}

app.use(myLogger);

app.get('/products', function (req, res) {
    Product.find().lean().exec(
        (err, prods) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send(prods);
            }
        }
    );
});

app.get('/productserr', function (req, res) {
    setTimeout(
        () => {
            res.status(500).send({
                msg: 'Error message from the server'
            });
        }, 2000);
});

app.get('/productsdelay', function (req, res) {
    setTimeout(() => {
        Product.find().lean().exec(
            (err, prods) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send(prods);
                }
            }
        );
    }, 2000)
});

app.get('/products_ids', function (req, res) {
    Product.find().lean().exec(
        (err, prods) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send(prods.map(p => p._id));
            }
        }
    );
});

app.get('/products/name/:id', function (req, res) {
    const id = req.params.id;
    Product.findById(id,
        (err, prod) => {
            if (err) {
                res.status(500).send(err);
            }
            else if(!prod) {
                res.status(404).send({});
            }
            else {
                res.status(200).send(prod.name);
            }
        }
    );
});

app.post('/products', function(req, res) {
    p = new Product({
        name: req.body.name,
        price: req.body.price,
        department: req.body.department,
    });
    p.save((err, prod) => {
        if(err){
            res.status(500).send(err);
        }else {
            res.status(200).send(prod);
        }
    })
});

app.listen(3000);