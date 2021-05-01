const express = require('express')
const app = express();
const port = process.env.PORT || 7500;
const mongo = require('mongodb');
const mongoClient = mongo.MongoClient;
const mongoUrl = 'mongodb+srv://aliyaan:@123@cluster0.ktoi9.mongodb.net/Edureka?retryWrites=true&w=majority';
const cors = require('cors');
const dbName = 'Edureka';
const chalk = require('chalk');
const morgan = require('morgan');
const fs = require('fs');
let database;
const bodyParser = require('body-parser');
const { parse } = require('node:path');
app.use(bodyParser.urlencoded({ extended : true }))
app.use(bodyParser.json())
app.use(cors());






app.use(morgan('tiny',{
    stream:fs.createWriteStream('mylogs.logs', {flags:'a'})
}))

// // to see the homepage i.e / or when first time you start the server
// app.get('/', (req,res) =>{
    
//         res.send("<div><a href='http://localhost:7500/location' target='_blank' > Location </a> <br> <br> <a href='http://localhost:7500/cuisine' target='_blank'> Cuisine </a> <br/><br/> <a href='http://localhost:7500/mealtype' target='_blank'> Mealtype </a> <br/><br/> <a href='http://localhost:7500/restaurant' target='_blank'> Restaurant </a>   </div>")
    
// })

// to see all the cities
app.get('/location', (req,res) =>{
    database.collection('city').find({}).toArray((err, result) =>{
        if(err) throw err;
        res.send(result) 
    })
})

// to see all the mealtypes
app.get('/mealtype', (req,res) =>{
    database.collection('mealtype').find({}).toArray((err, result) =>{
        if(err) throw err;
        res.send(result) 
    })
})

// to see all the restaurants
app.get('/restaurant', (req,res) =>{
   
    var query = {};
    // restaurant on basis of city and mealtype
   if (req.query.city && req.query.mealtype){
       query = {'city':req.query.city, 'type.mealtype':req.query.mealtype}
   }
    // restaurants on the basis of city.
   else if(req.query.city){
        query = {'city':req.query.city}
    }
    // restaurants on basis of mealtype
    else if (req.query.mealtype){
        query = {'type.mealtype':req.query.mealtype}
    }
    
   

    database.collection('restaurant').find(query).toArray((err, result) =>{
        if(err) throw err;
        res.send(result) 
    })
})


// to see all the orders
app.get('/orders', (req,res)=>{
    database.collection('orders').find({}).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// post API to place the order in a form
// check this post api in POST man
app.post('/placeorder', (req,res)=>{
    database.collection('orders').insertOne(req.body,(err,result) =>{
        if (err){
            console.log(err)
        }
        else{
            res.send('Data Added')
        }
    }

    )
})




//to see all the cuisines 
app.get('/cuisine', (req,res) =>{
    database.collection('cuisine').find({}).toArray((err, result) =>{
        if(err) throw err;
        res.send(result) 
    })
})

// listing API here the mealtype will be default and on basis of City and cuisine you get the restaurant


app.get('/restaurantlist/:mealtype', (req,res)=>{
        var query = {'type.mealtype':req.params.mealtype};
        var sort = {cost:-1};
        
        // restaurant on basis of city
        if(req.query.city && req.query.sort){
            query = {'type.mealtype':req.params.mealtype, 'city':req.query.city}
            sort = {'cost':Number(req.query.sort)}
        }
        // restaurant on basis of cuisine
        else if (req.query.cuisine && req.query.sort){
            query = {'type.mealtype':req.params.mealtype, 'Cuisine.cuisine':req.query.cuisine}
            sort = {'cost':Number(req.query.sort)}
        }
        // restaurant on basis of cost
        else if (req.query.lcost && req.query.hcost && req.query.sort){
            query = {'type.mealtype':req.params.mealtype, 'cost':{$gt:parseInt(req.query.lcost), $lt:parseInt(req.query.hcost)}}
            sort = {'cost':Number(req.query.sort)}
        }

        else if (req.query.city){
            query = {'type.mealtype':req.params.mealtype, 'city':req.query.city}
        }
        else if (req.query.cuisine){
            query = {'type.mealtype':req.params.mealtype, 'Cuisine.cuisine':req.query.cuisine}
        }
        else if (req.query.lcost && req.query.hcost){
            query = {'type.mealtype':req.params.mealtype, 'cost': {$gt:parseInt(req.query.lcost), $lt:parseInt(req.query.hcost)}}
        }
        
        
        database.collection('restaurant').find(query).toArray((err,result)=>{
            if(err) throw err
            res.send(result);
        })
   

    
    })

// only particular restaurant
app.get('/restaurantdetails/:id', (req,res)=>{
    var query = {};
    if(req.params.id){
        query = {'_id':req.params.id}
    }
    database.collection('restaurant').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})




// database connection
mongoClient.connect(mongoUrl, (err,data) =>{
    if(err){
        console.log(err)
    }
    else{
        database = data.db(dbName)
    }
    app.listen(port, (err) =>{
        if(err) throw err;
        console.log(chalk.blue(`Server is running at port ${port}`))
    })
})
