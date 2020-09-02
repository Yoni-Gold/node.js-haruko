
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
require('dotenv').config({path: './.env'});
const app = express();

app.use(express.static('./'));
app.use(express.json());
app.use(morgan('tiny'));

//app.use(express.static(path.join(__dirname, './build')));

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

////// mongoDB ////////

const url = `mongodb+srv://yoni:${process.env.PASSWORD}@firsttestcluster.uv5un.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`;

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

///////////////////////

  
app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1><p>welcome to my phone book</p><br><p></p>');
})

app.get('/info' , async (req, res) => {
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  const length = await Note.find({}).then(result => result.length);
  res.send(`<h2>this phone book has ${length} people in it </h2> <br> <span> ${new Date()} </span>`);
  mongoose.connection.close();
})
  
app.get('/api/persons', (req, res) => {
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  Note.find({}).then(result => {
    result.forEach(contact => {
    console.log(contact.toJSON());
    });
  mongoose.connection.close();
  res.send(result);
  });
})

app.get('/api/persons/:name', (req, res) => {
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  Note.find({name: req.params.name}).then(result => {
    if (result[0])
    {
      res.send(result[0].toJSON());
    }
    else 
    {
      res.status(404);
      res.send("<h1>Contact not found</h1><p>the contact name you entered does not exist</p>");
    }
  mongoose.connection.close();
  });
})

app.delete('/api/persons/:name', async (req, res) => {
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  let contact = await Note.find({name: req.params.name}).then(result => result[0]);
  console.log(req.params.name);
  console.log(contact)
  if (!contact)
  {
    res.send("<h1>Contact not found</h1><p>the contact name you entered does not exist</p>");
  }
  else
  {
    Note.findOneAndRemove({name: req.params.name}).then(result => {
      mongoose.connection.close();
      console.log("item removed");
      res.status(204);
      res.send("Item Removed");
    })
  }
    
})
  
app.post('/api/persons', async (req, res) => {
    const body = req.body
  
    if (!body.name || !body.number) {
      return res.status(400).json({ 
        error: 'name or number missing' 
      })
    }

    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

    let contact = await Note.find({name: body.name}).then(result => result[0]);
    console.log(contact);

    if (contact) {
      Note.findOneAndUpdate({name: body.name} , {number: body.number})
      .then(result => {console.log("number updated"); mongoose.connection.close()});
      return res.send(`
      ----
      contact already exists.
      updated number.
      ----
      `);
    }

    contact = await Note.find({number: body.number}).then(result => result[0]);
    console.log(contact);

    if (contact) {
      Note.findOneAndUpdate({number: body.number} , {name: body.name})
      .then(result => {console.log("name updated"); mongoose.connection.close()});
      return res.send(`
      ----
      number already exists.
      updated name.
      ----
      `);
    }

    const note = new Note({
      name: body.name,
      number: body.number
    });

    note.save().then(result => {
      console.log('contact saved!');
      mongoose.connection.close();
      return res.send("contact saved!");
    });
})


app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})