const database = require("../../../helpers/db/database");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

module.exports = {
    
  async create(req, res) {
    const { nome, email, senha, nascimento } = req.body;

    //Checar se ja existe uma conta com esses dados
    try {
      let conta = await database.select(
        "Select * from usuario where email = ? ",
        email
      );

      if (conta.length != 0) {
        return res.status(400).json({ erro: "Email existente" });
      }
    } catch (error) {
      
    }

    //Encriptar Senha
    const salt = bcrypt.genSaltSync(5);
    const senhaCriptografada = bcrypt.hashSync(senha, salt);

    //Gerar ID
    const id = crypto.randomBytes(4).toString("HEX");

    //Conecção com Banco
    const usuario = {
      id_usuario: id,
      nome: nome,
      email: email,
      senha: senhaCriptografada,
      nascimento: nascimento,
      tipo: "user",
    };
    let resultado = null;
    try {
      resultado = await database.insert("Insert into usuario set ?", usuario);
    } catch (error) {
      console.log(error);
    }

    if (resultado != null) {
      return res.status(200).send("Sua Conta foi Criada com Sucesso");
    }
    return res.status(400).json({ erro: "Erro na Aplicação" });

    res.send(usuario);
  },

  async login(req, res) {
    const { email, senha } = req.body;   

    //Encriptar Senha
    const salt = bcrypt.genSaltSync(5);

    try {
      let resultado = await database.select(
        "Select * from usuario where email = ? ",
        email
      );
      
      if (resultado.length == 0) {
        return res.status(400).json({ erro: "Email ou Senha incorretos" });
      }
      //Checar se a senha confere
      if (bcrypt.compareSync(senha, resultado[0].senha))
        return res.status(204).send();
      else {
        return res.status(401).json({ erro: "Email ou Senha incorretos" });
      }
    } catch (error) {
      console.log(error);
    }
  },
  async editar(req, res) {
    const { nome, email, nascimento } = req.body;
    console.log(nome);
    const id_usuario = req.headers.authorization;
    console.log(id_usuario);

    let resultado = null;
    try {
      resultado = await database.select(
        "Select * from usuario where id_usuario = ? ",
        id_usuario
      );

      let usuario = {
        nome: nome || resultado[0].nome,
        email: email || resultado[0].email,
        nascimento: nascimento || resultado[0].nascimento,
      };
      console.log(usuario.nome);
      


      let usuarioAtualizado = await database.update(`update usuario set nome = ?,email = ?, nascimento = ? where id_usuario = ?`, [usuario.nome, usuario.email , usuario.nascimento, id_usuario] );
      res.send(usuarioAtualizado);

    } catch (error) {
      console.log(error);
    }
  },
};
