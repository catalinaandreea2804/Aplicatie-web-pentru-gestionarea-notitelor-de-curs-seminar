import express from "express";
import Utilizatori from "../entities/Utilizatori.js"; // <--- Asigură-te că importi modelul!

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, parola } = req.body;

    if (!email || !parola) {
      return res
        .status(400)
        .json({ succes: false, mesaj: "Email si parola sunt obligatorii!" });
    }

    if (!email.endsWith("@stud.ase.ro")) {
      return res
        .status(400)
        .json({ succes: false, mesaj: "Foloseste contul @stud.ase.ro!" });
    }

    const user = await Utilizatori.findOne({
      where: { email: email, parola: parola },
    });

    if (user) {
      res.json({ succes: true, userId: user.UtilizatorId, nume: user.nume });
    } else {
      res.status(401).json({ succes: false, mesaj: "Date incorecte!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ succes: false, mesaj: "Eroare server" });
  }
});

export default router;
