import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Notite from "../entities/Notite.js";
import Materii from "../entities/Materii.js";
import Taguri from "../entities/Taguri.js";

const router = express.Router();

const uploadDir = "./public/uploads/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

// GET MATERII
router.get("/materii", async (req, res) => {
  const materii = await Materii.findAll();
  res.json(materii);
});

// GET NOTITE USER
router.get("/notite", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId)
      return res.status(400).json({ message: "UtilizatorId lipseste" });

    const notite = await Notite.findAll({
      where: { UtilizatorId: userId },
      include: [
        { model: Materii, as: "Materii" },
        { model: Taguri, as: "Tags" },
      ],
      order: [["NotiteDataCreare", "DESC"]],
    });
    res.json(notite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Eroare server" });
  }
});

// POST CREARE NOTITA
router.post("/notite", upload.single("fisier"), async (req, res) => {
  try {
    const { titlu, continut, MateriiId, userId, sursa, taguri } = req.body;

    const notita = await Notite.create({
      NotiteTitlu: titlu,
      NotiteContinutMarkdown: continut,
      MateriiId: MateriiId,
      UtilizatorId: userId,
      NotiteSursaExterna: sursa || null,
      NotiteAtasamentUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    if (taguri) {
      const lista = taguri
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
      for (let nume of lista) {
        const [tagDB] = await Taguri.findOrCreate({
          where: { TaguriNume: nume },
        });
        await notita.addTags(tagDB);
      }
    }
    res.status(201).json({ message: "Salvat!", notita });
  } catch (err) {
    res.status(500).json({ message: "Eroare salvare" });
  }
});

// 3. PUT EDITARE NOTITA
router.put("/notite/:id", upload.single("fisier"), async (req, res) => {
  try {
    const { id } = req.params;
    const { titlu, continut, MateriiId, sursa, taguri } = req.body;

    const notita = await Notite.findByPk(id);
    if (!notita) return res.status(404).json({ message: "Notita nu exista" });

    notita.NotiteTitlu = titlu;
    notita.NotiteContinutMarkdown = continut;
    notita.MateriiId = MateriiId;
    notita.NotiteSursaExterna = sursa;

    if (req.file) {
      notita.NotiteAtasamentUrl = `/uploads/${req.file.filename}`;
    }

    await notita.save();

    if (taguri !== undefined) {
      const lista = taguri
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
      const tagIds = [];
      for (let nume of lista) {
        const [tagDB] = await Taguri.findOrCreate({
          where: { TaguriNume: nume },
        });
        tagIds.push(tagDB);
      }
      await notita.setTags(tagIds);
    }

    res.json({ message: "Actualizat cu succes!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Eroare la editare" });
  }
});

// DELETE
router.delete("/notite/:id", async (req, res) => {
  try {
    await Notite.destroy({ where: { NotiteId: req.params.id } });
    res.json({ message: "Sters" });
  } catch (err) {
    res.status(500).json({ message: "Eroare stergere" });
  }
});
export default router;
