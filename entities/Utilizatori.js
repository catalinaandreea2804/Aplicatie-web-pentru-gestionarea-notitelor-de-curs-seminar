import { DataTypes } from "sequelize";
import db from "../dbConfig.js";

const Utilizatori = db.define("Utilizatori", {
  UtilizatorId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  parola: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nume: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Utilizatori;
