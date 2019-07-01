const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

app.use(express.static('build'))

app.use(bodyParser.json())

app.use(cors())

morgan.token('person', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Arto Järvinen",
        "number": "040-123456",
        "id": 2
    },
    {
        "name": "Lea Kutvonen",
        "number": "040-123456",
        "id": 3
    },
    {
        "name": "Juha Tauriainen",
        "number": "09-334456",
        "id": 4
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people <br> ${new Date()}</p>`)
})

// const generateId = () => {
//     const maxId = persons.length > 0
//         ? Math.floor(Math.random() * 1000)
//         : 1
//     return maxId
// }

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }
    // exist = persons.some(p => p.name.toLowerCase().includes(body.name.toLowerCase()))
    // if (exist) {
    //     return res.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
        // id: generateId()
    })

    // persons = persons.concat(person)
    // res.json(person)

    person.save().then(savedPerson => {
        res.json(persons)
    })
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person.toJSON())
            } else {
                res.status(204).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return res.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})