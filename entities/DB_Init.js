import mysql from "mysql2/promise";
import env from "dotenv";
import db from "../dbConfig.js";

import Notite from "./Notite.js";
import Materii from "./Materii.js";
import Taguri from "./Taguri.js";
import Utilizatori from "./Utilizatori.js";

env.config();

async function Create_DB() {
  try {
    const connection = await mysql.createConnection({
      host: "127.0.0.1",
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    });
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\``
    );
    await connection.end();
    console.log("Baza de date a fost creata.");
  } catch (err) {
    console.error("Eroare la Creare DB:", err);
    throw err;
  }
}

function FK_Config() {
  Utilizatori.hasMany(Notite, { as: "Notite", foreignKey: "UtilizatorId" });
  Notite.belongsTo(Utilizatori, { foreignKey: "userId" });

  Materii.hasMany(Notite, { as: "Notite", foreignKey: "MateriiId" });
  Notite.belongsTo(Materii, { as: "Materii", foreignKey: "MateriiId" });

  Notite.belongsToMany(Taguri, {
    through: "NotiteTaguri",
    as: "Tags",
    foreignKey: "notitaId",
    otherKey: "tagId",
  });
  Taguri.belongsToMany(Notite, {
    through: "NotiteTaguri",
    as: "Notite",
    foreignKey: "tagId",
    otherKey: "notitaId",
  });
}

async function DB_Init() {
  try {
    await Create_DB();

    FK_Config();

    await db.sync({ alter: true });
    await Utilizatori.findOrCreate({
      where: { email: 'admin@test.com' },
      defaults: { nume: 'Admin', parola: 'admin123' } 
    });
    await Utilizatori.findOrCreate({
      where: { email: 'user@test.com' },
      defaults: { nume: 'User', parola: 'user123' } 
    });

    console.log("Server pornit. ");
  } catch (err) {
    console.error("Eroare fatală la DB_Init:", err);
  }
}

export default DB_Init;
