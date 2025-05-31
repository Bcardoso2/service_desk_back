const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
dotenv.config()
const cors = require('cors') // Descomente esta linha
const connectDB = require('./config/db')
const {errorHandler} = require('./middleware/errorMiddleware');
const path = 'path'; // Corrigido: path = require('path');
const PORT = process.env.PORT || 5000

// connect to db
connectDB()

const app = express()

// --- Configuração do CORS ---
// Lista de origens permitidas
const allowedOrigins = [];
if (process.env.FRONTEND_URL_DEV) {
  allowedOrigins.push(process.env.FRONTEND_URL_DEV);
}
if (process.env.FRONTEND_URL_PROD && process.env.FRONTEND_URL_PROD !== 'https://SEU_FRONTEND_DEPLOYED.com') { // Não adicione a placeholder
  allowedOrigins.push(process.env.FRONTEND_URL_PROD);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (ex: mobile apps, Postman) OU se a origem estiver na lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  },
  credentials: true, // Se você precisar enviar cookies ou cabeçalhos de autorização
};

app.use(cors(corsOptions)); // Use as opções configuradas
// --------------------------

app.use(express.json())
app.use(express.urlencoded({extended: false}))

// Routes
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/tickets', require('./routes/ticketRoutes'))

// --- Servir Frontend em Produção ---
// Esta seção é para quando você faz o build do seu frontend e o coloca para ser servido pelo mesmo servidor Express.
// Se o seu frontend (Vite) está configurado para chamar 'https://service-desk-back.onrender.com/api'
// mesmo em produção, então esta seção de servir arquivos estáticos pode não ser relevante
// para a comunicação API, mas é útil se você quiser servir o frontend a partir deste backend.
if (process.env.NODE_ENV === 'production'){
  // Configurar a pasta estática - Certifique-se que o caminho para 'client/build' está correto
  // Se o seu frontend está numa pasta 'frontend' e o build é 'dist', seria algo como:
  // app.use(express.static(path.join(__dirname, '../frontend/dist')))
  // app.get('*', (req,res)=>res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html')));

  // Assumindo que seu frontend está em uma pasta 'client' no mesmo nível da pasta 'server'
  // e o build é feito para 'client/build'
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build'); // Ajuste este caminho se necessário
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => res.sendFile(path.resolve(clientBuildPath, 'index.html')));
} else {
  app.get('/', (req,res)=>{
    res.status(200).json({message : 'Bem-vindo à API da Central de Suporte'}) // Retornar status 200
  })
}

app.use(errorHandler)

app.listen(PORT, ()=> console.log(`Servidor backend a correr na porta: ${PORT}`.cyan.underline))
