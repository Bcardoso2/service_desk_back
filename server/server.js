const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
dotenv.config()
const cors = require('cors')
const connectDB = require('./config/db')
const {errorHandler} = require('./middleware/errorMiddleware');
const path = require('path'); // <<< CORREÇÃO APLICADA AQUI
const PORT = process.env.PORT || 5000

// connect to db
connectDB()

const app = express()

// --- Configuração do CORS ---
const allowedOrigins = [];
if (process.env.FRONTEND_URL_DEV) {
  allowedOrigins.push(process.env.FRONTEND_URL_DEV);
}
// Adicionar a URL de produção apenas se estiver definida e não for a placeholder
if (process.env.FRONTEND_URL_PROD && process.env.FRONTEND_URL_PROD !== 'https://SEU_FRONTEND_DEPLOYED.com') {
  allowedOrigins.push(process.env.FRONTEND_URL_PROD);
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.indexOf(origin) !== -1) {
      // Permite requisições sem 'origin' (Postman, mobile) OU se allowedOrigins estiver vazio (desenvolvimento flexível) OU se a origem estiver na lista
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
// --------------------------

app.use(express.json())
app.use(express.urlencoded({extended: false}))

// Routes
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/tickets', require('./routes/ticketRoutes'))

// --- Servir Frontend em Produção ---
if (process.env.NODE_ENV === 'production'){
  // Assumindo que seu frontend está numa pasta 'frontend' no mesmo nível da pasta 'server'
  // e o build do Vite é para 'frontend/dist'
  const clientBuildPath = path.join(__dirname, '..', 'frontend', 'dist'); // Caminho ajustado para Vite
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => res.sendFile(path.resolve(clientBuildPath, 'index.html')));
} else {
  app.get('/', (req,res)=>{
    res.status(200).json({message : 'Bem-vindo à API da Central de Suporte'})
  })
}

app.use(errorHandler)

app.listen(PORT, ()=> console.log(`Servidor backend a correr na porta: ${PORT}`.cyan.underline))
