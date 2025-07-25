// Name: Simple REST API with Express
// Description: This is a basic CRUD API using Express and an in-memory array as a dummy database.

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'))

// Name: Dummy Database
// Description: A simple in-memory array to store items temporarily.
let dummyDB = [];

/**
 * Name: Get All Items
 * Description: Retrieves all items from the dummy database.
 */
app.get('/getitems', (req, res) => {
  res.status(200).send(dummyDB);
});

/**
 * Name: Create Item
 * Description: Adds a new item to the dummy database. Requires `name` and `description` in the request body.
 */
app.post('/items', (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).send({ message: 'Name and description are required' });
  }
  const newItem = { id: dummyDB.length + 1, name, description };
  dummyDB.push(newItem);
  res.status(201).send(newItem);
});

/**-
 * Name: Update Item
 * Description: Updates an existing item by ID. Accepts new `name` and/or `description`.
 */
app.put('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const { name, description } = req.body;
  const index = dummyDB.findIndex(i => i.id === itemId);
  if (index !== -1) {
    if (name) dummyDB[index].name = name;
    if (description) dummyDB[index].description = description;
    res.status(200).send(dummyDB[index]);
  } else {
    res.status(404).send({ message: 'Item not found' });
  }
});

/**
 * Name: Get Item by ID--
 * Description: Retrieves a single item from the dummy database using its ID.
 */
app.get('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const item = dummyDB.find(i => i.id === itemId);
  if (item) {
    res.status(200).send(item);
  } else {
    res.status(404).send({ message: 'Item not found' });
  }
});

/**
 * Name: Delete Item
 * Description: Deletes an item from the dummy database by its ID.
 */
app.delete('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const index = dummyDB.findIndex(i => i.id === itemId);
  if (index !== -1) {
    dummyDB.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).send({ message: 'Item not found' });
  }
});

// Name: Start Server
// Description: Starts the Express server on the specified port.
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
