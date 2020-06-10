const database = require("../../../helpers/db/database");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");

module.exports = {
    
  async create(req, res) {
    const { nome, email, senha, nascimento,numero,tipo } = req.body;

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
    const salt               = bcrypt.genSaltSync(5);
    const senhaCriptografada = bcrypt.hashSync(senha, salt);

    //Gerar ID
    const id = crypto.randomBytes(4).toString("HEX");
    
    //Conecção com Banco
    const usuario = {
      id        : id,
      nome      : nome,
      email     : email,
      senha     : senhaCriptografada,
      nascimento: nascimento,
      autorizacao      : "user",
    };
    const telefone ={
      tipo :tipo,
      numero: numero,
      id_usuario: id,
    }
    let resultado = null;
    try {
      resultado = await database.insert("Insert into usuario set ?", usuario);
      await database.insert("Insert into telefone set ?", telefone);
    } catch (error) {
      console.log(error);
    }    

    if (resultado != null) {
      return res.status(200).send("Sua Conta foi Criada com Sucesso");
    }
    return res.status(400).json({ erro: "Erro na Aplicação" });
  },

  async login(req, res) {
    const { email, senha } = req.body;

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
    const { nome, email, nascimento,numero,tipo } = req.body;
    const id_usuario = req.headers.authorization;
    let usuario = null;
    try {
      usuario = await database.select(
        "Select * from usuario where id = ? ",
        id_usuario
      );        
        
      telefone_user = await database.select(
        "Select * from telefone where id_usuario = ? ",
        id_usuario
      );      
            
      let usuario_alterado = {
        nome      : nome || usuario[0].nome,
        email     : email || usuario[0].email,
        nascimento: nascimento || usuario[0].nascimento,
        numero: numero || telefone_user[0].numero,
        tipo: tipo || telefone_user[0].tipo,
      } 



     await database.update(`update usuario set nome = ?,email = ?, nascimento = ? where id = ?`, [usuario_alterado.nome, usuario_alterado.email , usuario_alterado.nascimento, id_usuario] );
     await database.update(`update telefone set numero = ?,tipo = ? where id_usuario = ?`, [usuario_alterado.numero, usuario_alterado.tipo, id_usuario] );      
      
      return res.status(204).send();

    } catch (error) {
      console.log(error);
      return res.status(400).send();
    }
  },
  async listarUsuarios(req,res){
    let usuarios = null;
    try {
      usuarios = await database.select("Select * from usuario  inner join telefone on usuario.id = telefone.id_usuario ");
    } catch (error) {//na próxima att adicionar a quantidade de livros nos usuarios
        console.log(error);
    }
    console.log(usuarios);
    

    const lista_usuarios = usuarios.map((usuario) =>{
        let user ={
          nome: usuario.nome,
          contato:usuario.numero,
          tipo: usuario.autorizacao
        }
        return user
    });              
    if (lista_usuarios.length > 0) {
        return res.status(200).json({lista_usuarios})
    } else {
        return res.status(204).json({menssagem:"Sem livros disponiveis"})
    }
  },
  async mostrarUsuario(req,res){
    
  }
};
