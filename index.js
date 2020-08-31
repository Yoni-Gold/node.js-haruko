
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(morgan('tiny'));

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


let notes = [
    {
        id: 1,
        name: "leonardo",
        number: "054-6671519",
    },
    {
        id: 2,
        name: "raphael",
        number: "050-8889013",
    },
    {
        id: 3,
        name: "michaelangelo",
        number: "054-9175155",
    },
    {
        id: 4,
        name: "donatello",
        number: "052-1490343",
    }
  ]
  
app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>');
})

app.get('/info' , (req, res) => {
    res.send(`<h2>this phone book has ${notes.length} people in it </h2> <br> <span> ${new Date()} </span>`);
})
  
app.get('/api/persons', (req, res) => {
   res.json(notes);
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const note = notes.find(note => note.id === id);
    
    if (note) {
      response.json(note);
    } else {
      response.status(404).end();
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    notes = notes.filter(note => note.id !== id);
  
    response.status(204).end();
})

const generateId = () => {
    // const maxId = notes.length > 0
    //   ? Math.max(...notes.map(n => n.id))
    //   : 0
    // return maxId + 1

    return Math.floor(Math.random() * 100000);
}
  
app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number missing' 
      })
    }

    if (notes.map(v => v.name).includes(body.name)) {
        return response.status(400).json({ 
            error: 'name must be unique' 
          })
    }
  
    const note = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }
  
    notes = notes.concat(note)
  
    response.json(note)
})

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})