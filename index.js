import express from 'express';
import methodOverride from 'method-override';
import { read, add, write } from './jsonFileStorage.js';

// Override POST requests with query param ?_method=PUT to be PUT requests

const app = express();

const PORT = 3004;

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));

// GET create sighting page
app.get('/sighting', (request, response) => {
  console.log('request sent to GET create sighting page');
  response.render('createsighting');
});

// POST new sighting details into data.json file
app.post('/sighting', (request, response) => {
  console.log('Added new sighting to data.json');
  add('data.json', 'sightings', request.body, (err) => {
    if (err) {
      response.status(500).send('Write to data.json error');
    }
  });
  response.render('sightingcreated');
});

// GET individual sighting page by index
app.get('/sighting/:index', (request, response) => {
  console.log('request sent to GET sighting page index:');
  console.log(request.params.index);
  read('data.json', (err, data) => {
    const sightingInfo = data.sightings[request.params.index];
    sightingInfo.index = request.params.index;
    response.render('viewsighting', { sightingInfo });
  });
});

// GET page that renders a list of sightings

app.get('/', (request, response) => {
  console.log('request sent to GET home page with list of sightings');
  read('data.json', (err, data) => {
    const sightingObj = data.sightings;
    response.render('home', { sightingObj });
  });
});

// GET page to edit sighting

app.get('/sighting/:index/edit', (request, response) => {
  console.log('request sent to GET page to edit sighting index');
  console.log(request.params.index);
  read('data.json', (err, jsonData) => {
    const { index } = request.params;
    const sighting = jsonData.sightings[index];
    sighting.index = index;
    response.render('editsighting', { sighting });
  });
});

// PUT function to edit sighting

app.put('/sighting/:index', (request, response) => {
  console.log('received request to edit sighting index');
  console.log(request.params.index);
  const { index } = request.params;
  read('data.json', (err, data) => {
    // replace the data in the object at the given index
    data.sightings[index] = request.body;
    write('data.json', data, (err) => {
      console.log('edit successful');
      response.render('sightingedited');
    });
  });
});

// DELETE function to delete sighting

app.delete('/sighting/:index', (request, response) => {
  console.log('received request to delete sighting index');
  console.log(request.params.index);
  const { index } = request.params;
  read('data.json', (err, data) => {
    // replace the data in the object at the given index
    data.sightings.splice(index, 1);
    write('data.json', data, (err) => {
      console.log('delete successful');
      response.render('sightingdeleted');
    });
  });
});

// GET page that renders a list of sighting shapes

app.get('/shapes', (request, response) => {
  console.log('request sent to GET page with list of sighting shapes');
  read('data.json', (err, data) => {
    const sightingObj = data.sightings;
    const shapeTally = {};
    for (let i = 0; i < sightingObj.length; i += 1) {
      const currentShape = sightingObj[i].shape;
      if (currentShape in shapeTally) {
        shapeTally[currentShape] += 1;
      } else {
        shapeTally[currentShape] = 1;
      }
    }
    console.log(shapeTally);
    response.render('sightingshapes', { shapeTally });
  });
});

// GET page that renders a list of sightings by shape

app.get('/shapes/:shape', (request, response) => {
  console.log('request sent to GET list of sightings with shape:');
  console.log(request.params.shape);
  const { shape } = request.params;
  read('data.json', (err, data) => {
    const sightingObj = data.sightings;
    const shapeSightings = {};
    shapeSightings.index = [];
    for (let i = 0; i < sightingObj.length; i += 1) {
      if (sightingObj[i].shape.toLowerCase() === shape) {
        shapeSightings.shape = shape;
        shapeSightings.index.push(i);
      }
    }
    response.render('listbyshape', { shapeSightings });
  });
});

app.listen(PORT);
