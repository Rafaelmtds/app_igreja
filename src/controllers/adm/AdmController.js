const database = require("../../../helpers/db/database");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");


module.exports = {

    async create(req, res) {
        const {
            nome,
            email,
            senha,
            nascimento,
            autorizacao
        } = req.body;

        //Checar se ja existe uma conta com esses dados
        try {
            let conta = await database.select(
                "Select * from usuario where email = ? ",
                email
            );

            if (conta.length != 0) {
                return res.status(400).json({
                    erro: "Email existente"
                });
            }
        } catch (error) {

        }
        if(autorizacao != "5830"){
            return res.status(401).json({ erro: "Ação nao Autorizada" });
        }

        //Encriptar Senha
        const salt = bcrypt.genSaltSync(5);
        const senhaCriptografada = bcrypt.hashSync(senha, salt);

        //Gerar ID
        const id = crypto.randomBytes(4).toString("HEX");

        //Conecção com Banco
        const usuario = {
            id: id,
            nome: nome,
            email: email,
            
            senha: senhaCriptografada,
            nascimento: nascimento,
            autorizacao: "adm",
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
        return res.status(400).json({
            erro: "Erro na Aplicação"
        });

        res.send(usuario);
    },

    async tornarADM(req, res) {
        const { email
        } = req.body;
        const id_adm = req.headers.authorization;

        //Checar de Id_adm é ADM
        try {
            let adm = await database.select(
                "Select * from usuario where id = ? ",
                id_adm
            );
            let usuario = await database.select("Select * from usuario where email = ? ",
            email
        );
            if(adm[0].tipo !="user"){
                let usuarioAtualizado = await database.update(`update usuario set tipo = ? where id = ?`,["adm", usuario[0].id] );

                return res.status(204).send();

            }else{
                return res.status(401).json({ erro: "Ação nao Autorizada" });
            }
        } catch (error) {
            console.log(error);

        }
    },
    async destituirADM(req,res){
        const { email
        } = req.body;
        const id_adm = req.headers.authorization;

        //Checar de Id_adm é ADM

        try {
            let adm = await database.select(
                "Select * from usuario where id = ? ",
                id_adm
            );
            let usuario = await database.select("Select * from usuario where email = ? ",
            email
        );
            if(adm[0].tipo !="user"){
                let usuarioAtualizado = await database.update(`update usuario set tipo = ? where id = ?`,["user", usuario[0].id] );

                return res.status(204).send();

            }else{
                return res.status(401).json({ erro: "Ação nao Autorizada" });
            }
        } catch (error) {
            console.log(error);

        }
    },
    async login(req, res) {
        const { email} = req.body;   
        const id_adm = req.headers.authorization;
    
        try {
          let resultado = await database.select(
            "Select * from usuario where id = ? ",
            id_adm
          );
          console.log(resultado);
          
          
          if(resultado[0].tipo !="user"){
            let usuarioAtualizado = await database.update(`update usuario set tipo = ? where id = ?`,["adm", resultado[0].id] );

            return res.status(204).send();

        }else{
        return res.status(401).json({ erro: "Ação nao Autorizada" });
        }
        } catch (error) {
          console.log(error);
        }
      },
    


}