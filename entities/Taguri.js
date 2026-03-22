import db from "../dbConfig.js";
import Sequelize from "sequelize";

const Taguri = db.define("Taguri", {
  TaguriId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  TaguriNume: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export default Taguri;
