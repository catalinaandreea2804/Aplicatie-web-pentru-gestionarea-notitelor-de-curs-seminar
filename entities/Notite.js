import db from "../dbConfig.js";
import Sequelize from "sequelize";

const Notite = db.define("Notite", {
  NotiteId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  NotiteTitlu: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  NotiteContinutMarkdown: {
    type: Sequelize.TEXT,
    allowNull: false,
  },

  NotiteAtasamentUrl: {
    type: Sequelize.STRING,
    allowNull: true,
  },

  NotiteSursaExterna: {
    type: Sequelize.STRING,
    allowNull: true,
  },

  NotiteDataCreare: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },

  MateriiId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
});

export default Notite;
