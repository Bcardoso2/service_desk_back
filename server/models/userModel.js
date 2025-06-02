const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add a email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  isAdmin: {
    type: Boolean,
    required:true,
    default: false
  },
  // NOVO CAMPO: SETOR DO UTILIZADOR
  sector: {
    type: String,
    required: [true, 'Por favor, atribua um setor ao utilizador'],
    // Esta lista DEVE SER A MESMA do seu ticketModel.js
    enum: [
        'Geral',
        'Suporte Técnico App',
        'Questões de Membrosia',
        'Agendamento de Aulas',
        'Manutenção de Equipamentos',
        'Financeiro'
    ]
  }
}, {
  timestamps : true
})

module.exports = mongoose.model('User', userSchema)
