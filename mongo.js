const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>');
  process.exit(1);
}

const url = `mongodb+srv://yoni:${process.env.PASSWORD}@firsttestcluster.uv5un.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const noteSchema = new mongoose.Schema({
  name: String,
  number: String
});

noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
    }
});

const Note = mongoose.model('Note', noteSchema);

if (process.argv[1] && !process.argv[2])
{
    console.log(`
    ----
    type help after the password to see what you can do
    ----
    `);
    mongoose.connection.close();
}

if (process.argv[2] === 'add')
{
    if (process.argv[3] && process.argv[4])
    {
        // if (Note.find({name: process.argv[3]}))
        // {
        //     console.log(`
        //     ----
        //     contact already exists.
        //     updated number.
        //     ----
        //     `);
        // }
        // else if (Note.find({number: process.argv[4]}))
        // {
        //     console.log(`
        //     ----
        //     number already exists.
        //     updated name.
        //     ----
        //     `);
        // }
        // else
        // {
            const note = new Note({
                name: process.argv[3],
                number: process.argv[4]
            });
  
            note.save().then(result => {
                console.log('contact saved!');
                mongoose.connection.close();
            });
        // }
    }
    else 
    {
        console.log(`
        ----
        after 'add' write the name of the contact and then the number
        ----
        `);
        mongoose.connection.close();
    }
}

if (process.argv[2] === 'find')
{
    if (process.argv[3])
    {
        Note.find({name: process.argv[3]}).then(result => {
            if (result[0])
            {
                result.forEach(contact => {
                console.log(contact.toJSON());
                });
            }
            else 
            {
                console.log("Didn't find such records");
            }
        mongoose.connection.close();
        })
        .catch(error => {console.log(" An error " + error)});
    }

    else
    {
        console.log(`
        ----
        enter a name you want to find
        ----
        `);
        mongoose.connection.close();
    }
}

if (process.argv[2] === 'display')
{
    Note.find({}).then(result => {
        result.forEach(contact => {
        console.log(contact.toJSON())
        });
    mongoose.connection.close();
    });
}

if (process.argv[2] === 'help')
{
    console.log(`
    type 'display' to see all of the records
    ----
    type 'find' and then a name to see all of thier records
    ----
    type 'add' and then a name to add them to the records
    `);
    mongoose.connection.close();
}