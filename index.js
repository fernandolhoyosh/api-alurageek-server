const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Middleware para servir archivos estáticos
/* app.use(express.static(path.join(__dirname, 'public')));


const readDB = () => {
  const data = fs.readFileSync(path.join(__dirname, 'public', 'db.json'));
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(path.join(__dirname, 'public', 'db.json'), JSON.stringify(data, null, 2));
}; */

const dbPath = path.join('/tmp', __dirname, 'tmp', 'db.json');

const readDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ productos: [] }, null, 2));
  }
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Crear un producto
app.post('/productos', (req, res) => {
  const { nombre, precio, imagen } = req.body;
  const nuevoProducto = { id: uuidv4(), nombre, precio, imagen };
  const db = readDB();
  db.productos.push(nuevoProducto);
  writeDB(db);
  res.status(201).json(nuevoProducto);
});

// Obtener todos los productos
app.get('/productos', (req, res) => {
    res.header('Access-Control-Allow-Origin','*');
    const db = readDB();
    res.status(200).json(db.productos);
});

// Eliminar un producto
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const productosActualizados = db.productos.filter(producto => producto.id !== id);
  if (productosActualizados.length === db.productos.length) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  db.productos = productosActualizados;
  writeDB(db);
  res.status(200).json({ message: 'Producto eliminado' });
});

// Filtrar productos
app.get('/productos/filtrar', (req, res) => {
  const { query } = req.query;
  const db = readDB();
  const productosFiltrados = db.productos.filter(producto => 
    producto.nombre.includes(query) || producto.precio.includes(query) || producto.imagen.includes(query)
  );
  res.json(productosFiltrados);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
