const database = require("../../../helpers/db/database");
const dotenv =  require('dotenv').config({ path: './config.env' });
const nodemailer = require('nodemailer');
const { select } = require("../../../helpers/db/database");
// //Configuração para envio de Notificação
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth:{
        user:process.env.USER,
        pass:process.env.PASS,
    },
});
            

module.exports = {

    async adicionarLivro(req,res){
        const {titulo,descricao,ano,quantidade_pag,autor,categoria} = req.body;
        const id_usuario = req.headers.authorization;
        //Checar se existe um livro com o mesmo nome e ano de um mesmo usuario

        let livro_existente = null;
        try {
            livro_existente =  await database.select(
                "Select * from livro where titulo = ? ",titulo);    

              console.log(livro_existente);
                 

              if ((livro_existente[0].titulo == titulo) && livro_existente[0].autor == autor) {
                return res.status(400).json({ erro: "Este livro ja Existe" });
              }
  
        } catch (error) {
            res.send(error);
        }

        const livro = {
            id_usuario: id_usuario,
            titulo: titulo,
            descricao : descricao,
            ano: ano,
            quantidade_pag : quantidade_pag,
            autor: autor,
            categoria: categoria,
        }
        let resultado = null;
        try {
           resultado = await database.insert("Insert into livro set ?", livro);

        } catch (error) {
            console.log(error);
            return res.status(400).json({ erro: "Erro na Aplicação" });
            
        }

        if (resultado != null) {
            return res.status(200).send("Livro Adicionado com Sucesso");
          }
          return res.status(400).json({ erro: "Erro na Aplicação" });
    },
    async editarLivro(req,res){
        const {titulo,descricao,ano,quantidade_pag,autor,categoria} = req.body;
        const id_usuario = req.headers.authorization;
        
        
        let livro = null;
        try {
            livro = await database.select(
              "Select * from usuario where id = ? ",
              id_usuario
            );       

            const livro_editado = {
                titulo: titulo  || livro[0].titulo,
                descricao : descricao  || livro[0].descricao,
                ano: ano  || livro[0].ano,
                quantidade_pag : quantidade_pag  || livro[0].quantidade_pag,
                autor: autor  || livro[0].autor,
                categoria: categoria  || livro[0].categoria,
            }
      
      
      
           await database.update(`update livro set titulo = ?,descricao = ?, ano = ?, quantidade_pag = ?, autor = ?, categoria = ? where id_usuario = ?`,
            [livro_editado.titulo, livro_editado.descricao, livro_editado.ano, livro_editado.quantidade_pag, livro_editado.autor, livro_editado.categoria , id_usuario] );
            
            return res.status(204).send();
      
          } catch (error) {
            console.log(error);
            return res.status(400).send();
          }

    },
    async removerLivro(req,res){
        const { id_livro } = req.params;
        const id_dono = req.headers.authorization;


        let resultado = undefined;
        try {
            let livro = await database.select('Select * from livro where id = ?', id_livro);

            if (livro[0].id_usuario != id_dono) {
                return res.status(400).json({ erro: "Você não tem autprização para efeturar esta ação" });
            }

            resultado = await database.delete('Delete from livro where id = ?', id_livro);


            if (resultado>0) {
                return res.status(204).send();
            } else {
                return res.status(400).json({ erro: "Erro ao Remover Livro" });
            }
          
        } catch (error) {
            console.log(error);            
        }

   

    },
    async listarTodosLivros(req,res){   
        let livros = null;
        try {
            livros = await database.select("Select titulo, descricao, ano, quantidade_pag, autor, categoria, nome  from livro inner join usuario on livro.id_usuario = usuario.id");
        } catch (error) {
            console.log(error);
        }
            
        if (livros.length > 0) {
            return res.status(200).json({livros})
        } else {
            return res.status(204).json({menssagem:"Sem livros disponiveis"})
        }
    },
    async livrosUsuario(req,res){
        const { id_usuario} = req.params;
        let lista_livros = null;
        try {
            lista_livros = await database.select("Select titulo,autor,ano,categoria,quantidade_pag,descricao,nome from livro inner join usuario on livro.id_usuario = usuario.id where id_usuario = ?", id_usuario);
            console.log(lista_livros);
        } catch (error) {
            console.log(error);
            
        }
        if (lista_livros.length > 0) {
            return res.status(200).json({lista_livros})
        } else {
            return res.status(204).json({menssagem:"Sem livros disponiveis"})
        }
    },
    async pedirEmprestado(req,res){
        const {id_livro, titulo,id_dono} = req.body;
        const id_requerente = req.headers.authorization;

        let pedido ={
            data : new Date().toJSON().slice(0, 19).replace('T', ' '),
            id_requerente : id_requerente,
            id_dono : id_dono,
            status : "Em analise",
            id_livro : id_livro
        }

        try {
          let  usuarios = await database.select('Select * from usuario  inner join telefone on usuario.id = telefone.id_usuario where usuario.id= ? or usuario.id = ?',[id_dono,id_requerente] );
             
            //Checar se o livro ja esta emprestado ou em analise
            let confirmacao = await database.select('Select * from pedido where id_livro = ?', id_livro);
            
            if(confirmacao.length > 0){
                return res.status(400).json({menssagem: "O livro não esta disponivel"})
                
            }

            let emprestimo = await database.insert('Insert into pedido set ?',pedido );
            let historico = await database.insert('Insert into historico set ?',pedido );
           

            let envio = await transporter.sendMail({
                from:`${usuarios[1].nome} <${usuarios[1].email}>`,
                to: `${usuarios[0].email}`,
                subject: `Pedido de Emprestimo do livro: ${titulo}, para o usuario: ${usuarios[1].nome}`,
                text:`Olá gostaria de saber poderia pedir seu livro: ${titulo} emprestado?
                Contato : ${usuarios[1].numero}`,
            })
            console.log(envio);

            return res.status(200).json({menssagem: "O pedido foi enviado e esta em análise"})
        } catch (error) {
            console.log(error);
            
            

        } 
        
    },
    async emprestarLivro(req,res){
        const { id_livro } = req.params;
        const {titulo} = req.body;
        const id_dono = req.headers.authorization;

        try {
            let emprestimo = await database.select('Select * from pedido where id_livro = ?', id_livro);
            
            const historico = emprestimo.map((pedido) =>{
                let requisicao ={
                 data: new Date().toJSON().slice(0, 19).replace('T', ' '),
                 id_requerente : pedido.id_requerente,
                 id_dono : pedido.id_dono,
                 id_livro: id_livro,
                 status: "Aprovado"
                }
                return requisicao
            });          


            if(emprestimo[0].id_dono != id_dono){
                return res.status(401).json({menssagem: "Voce não tem permissão para efetuar esta ação"});
            }

            let  usuarios = await database.select('Select * from usuario  inner join telefone on usuario.id = telefone.id_usuario where usuario.id= ? or usuario.id = ?',[emprestimo[0].id_dono,emprestimo[0].id_requerente] );

            
            await database.update('Update pedido set status = ? where id_livro = ? ',["Aprovado", id_livro] );
            await database.insert('Insert into historico set ?',historico );


            let envio = await transporter.sendMail({
                from:`${usuarios[0].nome} <${usuarios[0].email}>`,
                to: `${usuarios[0].email}`,
                subject: `Aprovação do pedido de emprestimo`,
                text:`O dono do livro ${titulo} permitiu o emprestimo, entre em contato com o mesmo para marcar um local de entrega.
                Recomendamos que seja em um local público.`,
            })

            return res.status(200).json({menssagem: "Livro autorizado para emprestimo, entre em contato com o usuario"})
        } catch (error) {
            console.log(error);
        } 
        
    },
    async devolverLivro(req,res){
        const { id_livro } = req.params;
        const {titulo} = req.body;
        const id_requerente = req.headers.authorization;

        try {
            let emprestimo = await database.select('Select * from pedido where id_livro = ?', id_livro);


            if(emprestimo[0].id_requerente != id_requerente){
                return res.status(401).json({menssagem: "Voce não tem permissão para efetuar esta ação"});
            }

            let  usuarios = await database.select('Select * from usuario  inner join telefone on usuario.id = telefone.id_usuario where usuario.id= ? or usuario.id = ?',[emprestimo[0].id_dono,emprestimo[0].id_requerente] );

            let data = new Date().toJSON().slice(0, 19).replace('T', ' ')
            await database.update('Update pedido set status = ?, data = ? where id_livro = ? ',["Devolvido - em analise",data, id_livro] );

            let envio = await transporter.sendMail({
                from:`${usuarios[0].nome} <${usuarios[0].email}>`,
                to: `${usuarios[0].email}`,
                subject: `Devolução de livro`,
                text:`O livro ${titulo}, foi devolvido pelo usuário? ${usuarios[1].nome}, confirme na aplicação esta devolução`,
            })

            return res.status(200).json({menssagem: "Sua colicitação de devolução foi realizada com sucesso"})
        } catch (error) {
            console.log(error);
        } 
        
    },
    async confirmarDevolucao(req,res){
        const { id_livro } = req.params;
        const id_dono = req.headers.authorization;

        try {
            let emprestimo = await database.select('Select * from pedido where id_livro = ?', id_livro);
            console.log(emprestimo[0]);
            
            if(emprestimo[0].id_dono != id_dono){
                return res.status(401).json({menssagem: "Voce não tem permissão para efetuar esta ação"});
            }
            const historico = emprestimo.map((pedido) =>{
                let requisicao ={
                 data: new Date().toJSON().slice(0, 19).replace('T', ' '),
                 id_requerente : pedido.id_requerente,
                 id_dono : pedido.id_dono,
                 id_livro: id_livro,
                 status: "Devolvido"
                }
                return requisicao
            });  


            await database.delete('delete from pedido where id = ?',emprestimo[0].id );
            await database.insert('Insert into historico set ?',historico );


            return res.status(200).json({menssagem: "Confirmação realizada com sucesso"})
        } catch (error) {
            console.log(error);
            
            

        } 
        
    },


}