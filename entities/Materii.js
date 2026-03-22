import db from "../dbConfig.js";
import Sequelize from "sequelize";

const Materii = db.define("Materii", {
  MateriiId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  MateriiNume: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  MateriiAnStudiu: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

export default Materii;
