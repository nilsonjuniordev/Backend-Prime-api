import express from "express";
import multer from "multer";
import fs from "fs"; 
import userRoutes from "./routes/users.js";
import cors from "cors";
import nodemailer from 'nodemailer';

import jwt from "jsonwebtoken";

import { db } from "./db.js";
import { promises as fsPromises } from "fs";
import path from "path";
import moment from 'moment';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());


// Endpoint para deletar todos os caminhos associados ao campo uploadsPath
app.delete("/uploads/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    console.log("DELETE Rota Acessada");
    console.log("UserID:", userId);

    if (!userId) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    // Atualiza o banco de dados com uploadsPath como NULL
    const updateUserUploadPath = "UPDATE user SET uploadsPath = NULL WHERE iduser = ?";
    await db.query(updateUserUploadPath, [userId]);

    // Retorne uma resposta de sucesso
    res.status(200).json({ success: "Caminhos das imagens removidos com sucesso" });
    console.log("Caminhos das imagens removidos com sucesso");
  } catch (error) {
    console.error("Erro ao remover caminhos das imagens:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});


  // endpoint visualizar upload de arquivos...
app.get('/uploads/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Consulta o banco de dados para obter o caminho do diretório
    const user = await getUserById(userId);

    if (!user || !user.uploadsPath) {
      return res.status(404).json({ error: 'Nenhuma imagem encontrada para o usuário' });
    }

    const userUploadsDir = path.join(__dirname, user.uploadsPath);

  
  } catch (error) {
    console.error('Erro ao obter imagens do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.use('/uploads', express.static('uploads'));


// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.headers.userid;

    if (!userId) {
      return cb(new Error('UserId não fornecido'));
    }

    const userUploadsDir = `uploads/${userId}`;

    // Cria o diretório se não existir
    if (!fs.existsSync(userUploadsDir)) {
      fs.mkdirSync(userUploadsDir, { recursive: true });
    }

    cb(null, userUploadsDir);
  },
  filename: function (req, file, cb) {
    const userId = req.headers.userid;

    if (!userId) {
      return cb(new Error('UserId não fornecido'));
    }

    // Formata a data e hora com moment.js
    const formattedTimestamp = moment().format('YYYYMMDD_HHmmss');

    // Obtém a extensão do arquivo
    const extension = path.extname(file.originalname);

    // Cria um identificador único
    const uniqueIdentifier = Math.random().toString(36).substring(2, 7); // Gerador de identificador único

    // Cria o novo nome do arquivo com o identificador único
    const newFilename = `${userId}_${formattedTimestamp}_${uniqueIdentifier}${extension}`;

    cb(null, newFilename);
  }
});

// Configure o middleware de upload do multer
const upload = multer({ storage: storage });

// Rota de upload
app.post('/uploads', upload.array('files', 10), async (req, res) => {
  try {
    const userId = req.body.userId;
    const files = req.files;

    if (!userId) {
      return res.status(400).json({ error: 'UserId não fornecido' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Arquivos não enviados' });
    }

    console.log(`Arquivos recebidos para o usuário ${userId}`);

    // Verifica se files está definido antes de chamar map
    const uploadPaths = files ? files.map(file => file.path) : [];

    console.log('userId:', userId);
    console.log('uploadPaths:', uploadPaths);

    const formattedUploadPaths = uploadPaths.map(path => path.replace(/\\/g, '/')).join(', ');
    const updateUserUploadPath = `UPDATE user SET uploadsPath = IFNULL(CONCAT_WS(', ', uploadsPath, ?), ?) WHERE iduser = ?`;
    await db.query(updateUserUploadPath, [formattedUploadPaths, formattedUploadPaths, userId]);

    res.status(200).json({ success: 'Arquivos recebidos com sucesso' });
  } catch (error) {
    console.error('Erro durante o processamento dos uploads:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});





// Configure o middleware de upload do multer para o campo uploadsPathAso
const uploadAso = multer({ 
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const userId = req.headers.userid;

      if (!userId) {
        return cb(new Error('UserId não fornecido'));
      }

      const userUploadsDir = `uploads/aso/${userId}`;

      // Cria o diretório se não existir
      if (!fs.existsSync(userUploadsDir)) {
        fs.mkdirSync(userUploadsDir, { recursive: true });
      }

      cb(null, userUploadsDir);
    },
    filename: function (req, file, cb) {
      const userId = req.headers.userid;

      if (!userId) {
        return cb(new Error('UserId não fornecido'));
      }

      // Formata a data e hora com moment.js
      const formattedTimestamp = moment().format('YYYYMMDD_HHmmss');

      // Obtém a extensão do arquivo
      const extension = path.extname(file.originalname);

      // Cria um identificador único
      const uniqueIdentifier = Math.random().toString(36).substring(2, 7); // Gerador de identificador único

      // Cria o novo nome do arquivo com o identificador único
      const newFilename = `${userId}_${formattedTimestamp}_${uniqueIdentifier}${extension}`;

      cb(null, newFilename);
    }
  }) 
});

// Rota de upload para uploadsPathAso
app.post('/uploads/aso', uploadAso.array('files', 10), async (req, res) => {
  try {
    const userId = req.body.userId;
    const files = req.files;

    if (!userId) {
      return res.status(400).json({ error: 'UserId não fornecido' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Arquivos não enviados' });
    }

    console.log(`Arquivos recebidos para o usuário ${userId}`);

    // Verifica se files está definido antes de chamar map
    const uploadPaths = files ? files.map(file => file.path) : [];

    console.log('userId:', userId);
    console.log('uploadPathsAso:', uploadPaths);

    const formattedUploadPaths = uploadPaths.map(path => path.replace(/\\/g, '/')).join(', ');
    const updateUserUploadPathAso = `UPDATE user SET uploadsPathAso = IFNULL(CONCAT_WS(', ', uploadsPathAso, ?), ?) WHERE iduser = ?`;
    await db.query(updateUserUploadPathAso, [formattedUploadPaths, formattedUploadPaths, userId]);

    res.status(200).json({ success: 'Arquivos recebidos com sucesso' });
  } catch (error) {
    console.error('Erro durante o processamento dos uploads:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});





// Função para obter usuário pelo nome e CPF
async function getUserByNomeAndCPF(nome, cpf) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM user WHERE nome = ? AND cpf = ?";
    console.log("Valores da consulta:", nome, cpf);
    db.query(sql, [nome, cpf], (err, result) => {
      if (err) {
        console.error("Erro na consulta SQL:", err);
        reject(err);
      } else {
        console.log("Resultado da consulta:", result);
        resolve(result[0]);
      }
    });
  });
}

app.post("/login", async (req, res) => {
  const { nome, cpf } = req.body;

  try {
    // Verifica se o usuário existe no banco de dados
    const user = await getUserByNomeAndCPF(nome, cpf);

    if (!user) {
      console.log("Usuário não autenticado");
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Gera um token JWT para o usuário autenticado
    const token = jwt.sign(
      { userId: user.iduser, nome: user.nome, cpf: user.cpf },
      process.env.JWT_SECRET || "seu_segredo",
      { expiresIn: "24h" }
    );

    console.log("Token gerado com sucesso:", token);

    // Retornar o token e o userId na resposta
    res.status(200).json({ token, userId: user.iduser });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});


// Função para obter usuário pelo nome e CNPJ
async function getUserByNomeAndCNPJ(nome, pass) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM user WHERE nome = ? AND pass = ?";
    db.query(sql, [nome, pass], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]); // Retorna o primeiro usuário encontrado
      }
    });
  });
}

// Rota para fazer login com nome e CNPJ
app.post("/logincnpj", async (req, res) => {
  const { nome, pass } = req.body;

  try {
    // Verifica se o usuário existe no banco de dados
    const user = await getUserByNomeAndCNPJ(nome, pass);

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Gera um token JWT específico para o usuário autenticado
    const token = generateRhToken(user.iduser); // Utiliza o ID do usuário para gerar o token específico

    // Retorna o token na resposta
    res.status(200).json({ token, userId: user.iduser });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});




// Cadastrado de novos usuarios + token
const createUser = async (userData) => {
  // Obtém a data atual no fuso horário local formatada como YYYY-MM-DD HH:mm:ss
  const currentDateTime = moment().local().format('YYYY-MM-DD HH:mm:ss');

  // Adiciona a data e hora formatadas ao objeto userData
  userData.data = currentDateTime;

  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO user SET ?";
    db.query(sql, userData, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const userId = result.insertId;
        const newUser = { iduser: userId, ...userData };
        resolve(newUser);
      }
    });
  });
};

app.post("/Register", async (req, res) => {
  const userData = req.body;

  try {
    // Inserir novo usuário no banco de dados e atualizar uploadsPath
    const newUser = await createUser(userData);

    // Gera um token JWT para o usuário cadastrado
    const token = jwt.sign(
      { userId: newUser.iduser, nome: newUser.nome },
      process.env.JWT_SECRET || "seu_segredo",
      { expiresIn: "24h" }
    );

    console.log("Token gerado com sucesso:", token);

    // Inclui o ID do usuário na resposta JSON
    res.status(201).json({ token, message: "Usuário cadastrado com sucesso!", userId: newUser.iduser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar usuário." });
  }
});

// Função para gerar token específico para cadastro de empresas
const generateRhToken = (userId) => {
  return jwt.sign(
    { userId, registerRh: true },
    process.env.JWT_SECRET || "seu_segredo",
    { expiresIn: "24h" }
  );
};

// Rota para registrar empresas

app.post("/RegisterRh", async (req, res) => {
  const userData = req.body;

  try {
    // Insere o usuário no banco de dados e obtém o novo ID gerado automaticamente
    const newUser = await createUser(userData);
    const userId = newUser.iduser; // Obtém o ID único do usuário

    // Monta o id_cnpj usando o nome da empresa e o ID do usuário
    const idCnpj = `${userData.nome.replace(/\s/g, '')}-${userId}`;

    // Gera um token JWT específico para este cadastro de empresa
    const token = generateRhToken(userId);

    // Inclui o ID da empresa e o token na resposta JSON
    res.status(201).json({ token, message: "Empresa cadastrada com sucesso!", userId, id_cnpj: idCnpj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar empresa." });
  }
});




// Rota para obter detalhes de um usuário

// Função para obter usuário pelo ID
async function getUserById(userId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM user WHERE iduser = ?";
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error("Erro na consulta SQL:", err);
        reject(err);
      } else {
        console.log("Resultado da consulta:", result);

        // Verifique se o usuário foi encontrado
        if (result.length === 0) {
          resolve(null); // Retorna nulo se o usuário não for encontrado
        } else {
          resolve(result[0]); // Retorna os detalhes do usuário
        }
      }
    });
  });
}

app.get('/:iduser', async (req, res) => {
  try {
    const userId = req.params.iduser;

    //lógica para obter todos os detalhes do usuário com base no ID (use o seu banco de dados)
    const user = await getUserById(userId);

    // Verifique se o usuário foi encontrado
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Envie a resposta ao cliente com todos os detalhes do usuário
    res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao obter detalhes do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Backend (Node.js) - Exemplo de rota para contar novos cadastros com filtros de data
app.get("/newRegistrations", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Consulta SQL para contar novos cadastros baseados na data com filtros
    let query = "SELECT COUNT(*) AS count FROM user WHERE 1=1";
    const params = [];

    if (startDate) {
      query += " AND data >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND data <= ?";
      params.push(endDate);
    }

    const result = await db.query(query, params);

    // Retorna o número de novos cadastros
    const count = result[0].count;
    res.status(200).json({ count });
  } catch (error) {
    console.error("Erro ao contar novos cadastros:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});


// Rota atualizar dados
app.put("/", (req, res) => {
  res.status(404).send("Recurso não encontrado");
});


// Rota para outros endpoints
app.use("/", userRoutes);
app.use(express.urlencoded({ extended: true })); // Adiciona este middleware



// Rota para envio de e-mail
app.post('/mail', async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    // Configurações do serviço de e-mail (substitua com suas credenciais)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'primetxtrh@gmail.com', // Seu e-mail
        pass: 'gilp mkgs cmwe umzf' // Sua senha do e-mail
      }
    });

    // Opções do e-mail
    const mailOptions = {
      from: 'primetxtrh@gmail.com', // Seu e-mail
      to, // Destinatário do e-mail (pode ser um array para vários destinatários)
      subject, // Assunto do e-mail
      text // Corpo do e-mail
    };

    // Envio do e-mail
    await transporter.sendMail(mailOptions);

    // Resposta ao cliente
    res.status(200).json({ message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ error: 'Erro ao enviar e-mail. Verifique o console para mais detalhes.' });
  }
});



const PORT = 8800;
app.listen(PORT, () => {
  console.log(`Servidor está escutando na porta ${PORT}`);
});
