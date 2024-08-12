const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const secretKey = 'seuSegredoSuperSecreto';


app.post('/api/auth/login', (req, res) => {
  const credentials = req.body;
  const userData = doLogin(credentials);

  if (userData) {
    const token = jwt.sign({ id: userData.id, perfil: userData.perfil }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});


function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Falha ao autenticar o token' });
    }

    req.userId = decoded.id;
    req.userPerfil = decoded.perfil;
    next();
  });
}


app.get('/api/users', verifyToken, (req, res) => {
  if (req.userPerfil !== 'admin') {
    res.status(403).json({ message: 'Acesso negado' });
  } else {
    res.status(200).json({ data: users });
  }
});


app.get('/api/contracts/:empresa/:inicio', verifyToken, (req, res) => {
  if (req.userPerfil !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  const empresa = req.params.empresa;
  const dtInicio = req.params.inicio;

  const result = getContracts(empresa, dtInicio);
  if (result) {
    res.status(200).json({ data: result });
  } else {
    res.status(404).json({ data: 'Dados Não encontrados' });
  }
});


function doLogin(credentials) {
  return users.find(item => credentials.username === item.username && credentials.password === item.password);
}


const users = [
  { "username": "user", "password": "123456", "id": 123, "email": "user@dominio.com", "perfil": "user" },
  { "username": "admin", "password": "123456789", "id": 124, "email": "admin@dominio.com", "perfil": "admin" },
  { "username": "colab", "password": "123", "id": 125, "email": "colab@dominio.com", "perfil": "user" }
];


function getContracts(empresa, inicio) {
  const repository = new Repository();
  
  const query = `SELECT * FROM contracts WHERE empresa = ? AND data_inicio = ?`;
  const result = repository.execute(query, [empresa, inicio]);

  return result;
}


class Repository {
  execute(query, params) {
   
    return [];
  }
}


app.get('/api/me', verifyToken, (req, res) => {
    const user = users.find(item => item.id === req.userId);
    if (user) {
      res.status(200).json({ data: user });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  });
  
