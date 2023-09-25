import express from 'express';
import Airtable from 'airtable';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;
// app.use(express.urlencoded({extended:true})) // to get form data
app.use(bodyParser.json())
dotenv.config();

const base = new Airtable({ apiKey: process.env.apiKey }).base(process.env.base_id);

//creating new records starts
app.post('/create', (req, res)=>{
const {Name, Notes}= req.body
console.log(req.body)
base('table').create([
   {
    fields:{
        Name:Name,
        Notes:Notes
    }
   }
], function(err, savedRecord){
    if(err){
        console.log(err)
        res.status(500).send({msg:"error while saving", err})
    }
    else
    res.status(200).send({msg:'saved',savedRecord})
})




})

//creating new records ends



// fetching the record starts
app.get('/records', (req, res) => {
    const fetchRecords = [];
    base('table').select({
        maxRecords: 3,
        view: 'Grid view'
    }).eachPage(function page(records, fetchNextPage) {
        records.forEach((record) => {
           
            let id=record.getId()               //to get the id of the record
            let name= record.get('Name')   //we can get the fieldName like this
            console.log({name, id})
            fetchRecords.push({name, id});
            
        });
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error while fetching records.');
        } else {
            res.status(200).json(fetchRecords); 
        }
    });
});

app.get('/', (req, res)=>{
    base.select({})
})

// fetching the record ends

// updating the record starts
app.patch('/update', (req, res) => {
    const { rec} = req.query;

    base('table').update([
        {
            "id": rec,
            "fields": {
                "Notes": "This note was updated through API"
            }
        }
    ], function (err, rec) {
        if (err) {
            res.status(500).send('Error while updating.');
            console.log(err);
        } else {
            res.status(200).send('Updated records.');
        }
    });
});
// updating the record ends

// deleting the record starts
app.delete('/delete', (req, res) => {
    const { rec } = req.query; // Make sure the parameter name matches your query

    base('table').destroy(rec, function(err, deletedRecord) {
        if (err) {
            console.log(err);
            res.status(500).send({ msg: 'Error while deleting', err });
        } else {
            res.status(200).send('Record deleted successfully');
        }
    });
});

// deleting the record ends

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
