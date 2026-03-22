import Notite from "../entities/Notite.js";
import Materii from "../entities/Materii.js";
import Utilizatori from "../entities/Utilizatori.js";

// creeaza o notita
async function createNotita(data) {
  return await Notite.create({
    NotiteTitlu: data.titlu,
    NotiteContinutMarkdown: data.continut,
    MateriiId: data.materieId,
    UtilizatorId: data.utilizatorId,
  });
}

// returneaza toate notitele cu materii și utilizatori
async function getNotite() {
  return await Notite.findAll({
    include: [Materii, Utilizatori],
  });
}

// returneaza o notita dupa ID
async function getNotitaById(id) {
  return await Notite.findByPk(id, {
    include: [Materii, Utilizatori],
  });
}

export { createNotita, getNotite, getNotitaById };
