const express = require("express");
const cors = require("cors");
const database = require("./helpers/db/database");

const app = express();

app.use(cors());
//Mostra que as requisições do body serão em json
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    let resultado = await database.select("Select * from autor");
    res.send(resultado);
  } catch (error) {
      console.log(error);
      
  }
});

app.post("/post", async (req, res) => {
  try {
    let data ={
      nome: "Karl Marx",
      nascimento: "1818-05-05",
      genero: "M"
    }
    let resultado = await database.insert("Insert into autor set ?",data);
    res.send("ROLOU");
  } catch (error) {
      console.log(error);
      
  }
});


app.delete("/delete", async (req, res) => {
  const id = req.query.id;
  console.log(id);
  try {
    let resultado = await database.delete(`Delete from autor where id = ?`, [id] );
    res.send("ROLOU");
  } catch (error) {
      console.log(error);
      
  }
});

app.post("/att", async (req, res) => {
  const id = req.query.id;
  const {nome,nascimento} = req.body;
  console.log(nome);
  try {
    let resultado = await database.update(`update autor set nome = ?, nascimento = ? where id = ?`, [nome, nascimento, id] );
    res.send("ROLOU");
  } catch (error) {
      console.log(error);
      
  }
});


app.listen(process.env.PORT || 3333);
