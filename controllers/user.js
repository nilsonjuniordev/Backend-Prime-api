import { db } from "../db.js";
import bcrypt from 'bcryptjs';
export const getUsers = (_, res) => {
  const q = "SELECT * FROM user";

  db.query(q, (err, data) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json(data);
  });
};

export const addUser = async (req, res) => {
  const q = `INSERT INTO user (nome, email, fone, cnpj, cep, rua, complemento, numero, cidade, estado, pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    req.body.nome,
    req.body.email,
    req.body.fone,
    req.body.cpf,
    req.body.rg,
    req.body.cep,
    req.body.rua,
    req.body.complemento,
    req.body.numero,
    req.body.cidade,
    req.body.estado,
    req.body.civil,
    req.body.genero,
    req.body.dependentes,
    req.body.data_nascimento,
    req.body.pass
  ];

  // Verifica se todos os campos obrigatórios estão presentes
  if (values.some((value) => value === undefined || value === null)) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    // Criptografa a senha
    const hashedPass = await bcrypt.hash(req.body.pass, 10); // 10 é o número de rounds de hashing

    // Adicione a senha criptografada ao array de valores
    values.push(hashedPass);

    db.query(q, values, (err) => {
      if (err) {
        console.error("Error adding user:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      return res.status(201).json({ message: "Usuário criado com sucesso." });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUser = (req, res) => {
  const hasCpf = req.body.cpf !== undefined && req.body.cpf !== null;
  const hasCnpj = req.body.cnpj !== undefined && req.body.cnpj !== null;

  if (!hasCpf && !hasCnpj) {
    return res.status(400).json({ error: "É necessário fornecer CPF ou CNPJ" });
  }

  let q = "UPDATE user SET ";
  let values = [];
  let fieldsToUpdate = [];

  if (hasCpf) {
    fieldsToUpdate.push("`cpf` = ?");
    values.push(req.body.cpf);
  }

  if (hasCnpj) {
    fieldsToUpdate.push("`cnpj` = ?");
    values.push(req.body.cnpj);
  }

  fieldsToUpdate.push(
    "`nome` = ?, `email` = ?, `fone` = ?, `rg` = ?, `cep` = ?, `rua` = ?, `complemento` = ?, `numero` = ?, `cidade` = ?, `estado` = ?, `civil` = ?, `genero` = ?, `dependentes` = ?, `data_nascimento` = ?"
  );

  values.push(
    req.body.nome,
    req.body.email,
    req.body.fone,
    req.body.rg,
    req.body.cep,
    req.body.rua,
    req.body.complemento,
    req.body.numero,
    req.body.cidade,
    req.body.estado,
    req.body.civil,
    req.body.genero,
    req.body.dependentes,
    req.body.data_nascimento,
    req.params.id
  );

  q += fieldsToUpdate.join(", ") + " WHERE `iduser` = ?";

  db.query(q, values, (err) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json({ message: "Usuário atualizado com sucesso." });
  });
};


export const deleteUser = (req, res) => {
  const q = "DELETE FROM user WHERE `iduser` = ?";

  db.query(q, [req.params.id], (err) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json({ message: "Usuário deletado com sucesso." });
  });
};
