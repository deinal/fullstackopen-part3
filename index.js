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
    Person.find({}).then(persons => {
        res.end(`<p>Phonebook has info for ${persons.length} people <br> ${new Date()}</p>`)
    })
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body
    console.log(body)
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    Person.find({ name: body.name })
        .then(person => {
            console.log(person)
            if (person.length != 0) {
                console.log(person[0]._id)
                const newperson = {
                    name: body.name,
                    number: body.number,
                }
                Person.findByIdAndUpdate(person[0]._id, newperson, { new: true })
                    .then(updatedPerson => {
                        res.json(updatedPerson.toJSON())
                    })
                    .catch(error => next(error))
            } else {
                const person = new Person({
                    name: body.name,
                    number: body.number,
                })

                person.save().then(savedPerson => {
                    res.json(persons)
                })
            }
        })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
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
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})