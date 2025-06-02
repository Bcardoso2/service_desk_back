const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // O seu userModel já deve ter o campo 'sector'

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  // Adicionado 'sector' à desestruturação do req.body
  const { name, email, password, sector } = req.body;

  // Validação: incluído 'sector'
  if (!name || !email || !password || !sector) {
    res.status(400);
    throw new Error('Por favor, preencha todos os campos, incluindo o setor.');
  }

  // Find if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Utilizador já existe.');
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);

  // Create user: incluído 'sector'
  const user = await User.create({
    name,
    email,
    password: hashedPass,
    sector, // Salvar o setor do utilizador
    // isAdmin continuará a ter o default: false, conforme o schema
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin, // Incluir isAdmin na resposta
      sector: user.sector,   // Incluir sector na resposta
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Dados de utilizador inválidos.');
  }
});

// @desc    Login a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin, // Incluir isAdmin na resposta
      sector: user.sector,   // Incluir sector na resposta
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Credenciais inválidas.');
  }
});

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user é populado pelo middleware 'protect' e já deve conter todos os campos do utilizador,
  // incluindo isAdmin e sector, após as modificações no userModel.
  const user = {
    id: req.user._id, // Mantido como id para consistência com o generateToken, mas _id é o campo real
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin, // Incluir isAdmin na resposta
    sector: req.user.sector,   // Incluir sector na resposta
  };
  res.status(200).json(user);
});


// Generate Token Function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
