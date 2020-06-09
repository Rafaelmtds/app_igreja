const database = require("../../../helpers/db/database");


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
        console.log(id_livro);

        let resultado = null;
        try {
            resultado = await database.delete('Delete from livro where id = ?', id_livro);
        } catch (error) {
            console.log(error);            
        }

        if (resultado>0) {
            return res.status(204).send();
        } else {
            return res.status(400).json({ erro: "Erro ao Remover Livro" });
        }
      

    },
    async mostrarLivros(req,res){
        let livros = null;
        try {
            livros = await database.select("Select * from livro inner join usuario on livro.id_usuario = usuario.id");
        } catch (error) {
            console.log(error);
        }
        const lista_livros = livros.map((livro) =>{
            let item ={
                titulo: livro.titulo,
                autor: livro.autor,
                ano: livro.ano,
                categoria: livro.categoria,
                quantidade_pag: livro.quantidade_pag,
                descricao: livro.descricao,
                dono: livro.nome
            }
            return item
        });              
        if (livros.length > 0) {
            return res.status(200).json({lista_livros})
        } else {
            return res.status(204).json({menssagem:"Sem livros disponiveis"})
        }
    }

}