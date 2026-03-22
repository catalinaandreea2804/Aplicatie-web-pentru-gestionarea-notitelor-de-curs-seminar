let notiteCurente = [];
let editMode = false;
let toateMateriile = [];
let editId = null;

// LOGIN
async function executaLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const parola = document.getElementById("loginParola").value.trim();

  if (!email.endsWith("@stud.ase.ro")) {
    alert("Foloseste contul institutional (@stud.ase.ro)!");
    return;
  }

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, parola }),
    });
    const data = await res.json();

    if (data.succes) {
      localStorage.setItem("userId", data.userId);
      document.getElementById("view-login").style.display = "none";
      document.getElementById("view-dashboard").style.display = "flex";
      incarcaMaterii();
      showSection("list");
    } else {
      alert("Date incorecte!");
    }
  } catch (err) {
    console.error(err);
  }
}

// NAVIGARE
function showSection(section) {
  document.getElementById("section-add").style.display =
    section === "add" ? "block" : "none";
  document.getElementById("section-list").style.display =
    section === "list" ? "block" : "none";

  if (section === "list") {
    incarcaNotite();
  } else if (section === "add") {
    resetForm();
  }
}

//RESET FORMULAR

function resetForm() {
  editMode = false;
  editId = null;
  document.getElementById("section-add").querySelector("h2").innerText =
    "Notita noua";
  document.getElementById("notitaTitlu").value = "";
  document.getElementById("markdownInput").value = "";
  document.getElementById("notitaSource").value = "";
  document.getElementById("notitaTags").value = "";
  document.getElementById("notitaFile").value = "";
  document.getElementById("preview").innerHTML = "";
}

// INCARCARE MATERII
async function incarcaMaterii() {
  const res = await fetch("/api/materii");
  const materii = await res.json();

  toateMateriile = materii;

  const select = document.getElementById("materieSelect");
  const filterSelect = document.getElementById("filterMaterie");
  const ul = document.getElementById("materii");

  select.innerHTML = "";
  filterSelect.innerHTML = '<option value="">Toate materiile</option>';
  ul.innerHTML = "";

  materii.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.MateriiId;
    opt.innerText = m.MateriiNume;
    select.appendChild(opt);

    const fOpt = document.createElement("option");
    fOpt.value = m.MateriiId;
    fOpt.innerText = m.MateriiNume;
    filterSelect.appendChild(fOpt);

    const li = document.createElement("li");
    li.innerText = m.MateriiNume;
    ul.appendChild(li);
  });
}

// PRELIARE SI AFISARE NOTITE

async function incarcaNotite() {
  const userId = localStorage.getItem("userId");
  const res = await fetch(`/api/notite?userId=${userId}`);
  notiteCurente = await res.json();
  renderNotite(notiteCurente);
}

function renderNotite(lista) {
  const container = document.getElementById("notiteContainer");
  const template = document.getElementById("notita-template");

  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML =
      "<p>Nu ai notite sau cautarea nu a returnat rezultate.</p>";
    return;
  }

  lista.forEach((n) => {
    const nota = template.content.cloneNode(true);

    //Titlu
    nota.querySelector(".notita-titlu").textContent = n.NotiteTitlu;

    //Materie

    console.log(n);
    nota.querySelector(".materie-badge").textContent = n.Materii
      ? n.Materii.MateriiNume
      : "General";

    //Data creare
    nota.querySelector(".notita-data").textContent = new Date(
      n.NotiteDataCreare
    ).toLocaleDateString("ro-RO");

    // Contitut notita - Markdown to HTML
    nota.querySelector(".notita-body").innerHTML = marked.parse(
      n.NotiteContinutMarkdown || ""
    );

    // Taguri
    const tagsContainer = nota.querySelector(".notita-tags");
    tagsContainer.innerHTML = "";
    if (n.Tags && n.Tags.length > 0) {
      n.Tags.forEach((t) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = `#${t.TaguriNume}`;
        tagsContainer.appendChild(span);
      });
    }

    // Atasament
    if (n.NotiteAtasamentUrl) {
      nota.querySelector(".notita-attachment").innerHTML = `
        <a href="${n.NotiteAtasamentUrl}" target="_blank">Vezi atasament</a>
      `;
    }

    // Sursa
    if (n.NotiteSursaExterna) {
      nota.querySelector(".notita-source").innerHTML = `
        <a href="${n.NotiteSursaExterna}" target="_blank">Sursa</a>
      `;
    }

    // Butoane
    nota.querySelector(".btn-share").onclick = () =>
      partajeazaNotita(n.NotiteTitlu, n.NotiteContinutMarkdown);

    nota.querySelector(".btn-edit").onclick = () =>
      pregatesteEditare(n.NotiteId);

    nota.querySelector(".btn-delete").onclick = () => stergeNotita(n.NotiteId);

    container.appendChild(nota);
  });
}

// FILTRARE SI SORTARE
function filtreazaNotite() {
  const text = document.getElementById("searchInput").value.toLowerCase();
  const materieId = document.getElementById("filterMaterie").value;

  let filtrate = notiteCurente.filter((n) => {
    // Cautare text in titlu, taguri sau continut
    const titlu = n.NotiteTitlu.toLowerCase();
    const taguri = n.Tags
      ? n.Tags.map((t) => t.TaguriNume.toLowerCase()).join(" ")
      : "";
    const continut = n.NotiteContinutMarkdown.toLowerCase();
    const textMatch =
      titlu.includes(text) || taguri.includes(text) || continut.includes(text);

    // Filtrare materie
    const materieMatch = materieId ? n.MateriiId == materieId : true;

    return textMatch && materieMatch;
  });

  const sortOrder = document.getElementById("sortData").value;
  if (sortOrder === "asc") {
    filtrate.sort(
      (a, b) => new Date(a.NotiteDataCreare) - new Date(b.NotiteDataCreare)
    );
  } else if (sortOrder === "desc") {
    filtrate.sort(
      (a, b) => new Date(b.NotiteDataCreare) - new Date(a.NotiteDataCreare)
    );
  }

  renderNotite(filtrate);
}

// SALVARE
async function saveNotita() {
  const userId = localStorage.getItem("userId");
  const titlu = document.getElementById("notitaTitlu").value;
  const materieId = document.getElementById("materieSelect").value;
  const continut = document.getElementById("markdownInput").value;
  const sursa = document.getElementById("notitaSource").value;
  const taguri = document.getElementById("notitaTags").value;
  const fileInput = document.getElementById("notitaFile");

  if (!titlu) {
    alert("Titlul este obligatoriu!");
    return;
  }

  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("titlu", titlu);
  formData.append("MateriiId", materieId);
  formData.append("continut", continut);
  formData.append("sursa", sursa);
  formData.append("taguri", taguri);
  if (fileInput.files.length > 0) {
    formData.append("fisier", fileInput.files[0]);
  }

  const url = editMode ? `/api/notite/${editId}` : "/api/notite";
  const method = editMode ? "PUT" : "POST";

  try {
    const res = await fetch(url, { method: method, body: formData });
    if (res.ok) {
      alert(editMode ? "Notita actualizata!" : "Notita salvata!");
      showSection("list");
    } else {
      alert("Eroare la salvare.");
    }
  } catch (err) {
    console.error(err);
  }
}

//EDITARE
function pregatesteEditare(id) {
  const notita = notiteCurente.find((n) => n.NotiteId === id);
  if (!notita) return;

  editMode = true;
  editId = id;

  showSection("add");
  document.getElementById("section-add").querySelector("h2").innerText =
    "Editare Notiță";

  document.getElementById("notitaTitlu").value = notita.NotiteTitlu;
  document.getElementById("materieSelect").value = notita.MateriiId;
  document.getElementById("markdownInput").value =
    notita.NotiteContinutMarkdown;
  document.getElementById("notitaSource").value =
    notita.NotiteSursaExterna || "";

  const tagsStr = notita.Tags
    ? notita.Tags.map((t) => t.TaguriNume).join(", ")
    : "";
  document.getElementById("notitaTags").value = tagsStr;

  document.getElementById("preview").innerHTML = marked.parse(
    notita.NotiteContinutMarkdown
  );
}

// STERGERE
async function stergeNotita(id) {
  if (!confirm("Sigur ștergi?")) return;
  await fetch(`/api/notite/${id}`, { method: "DELETE" });
  incarcaNotite();
}

// PARTAJARE
function partajeazaNotita(titlu, continut) {
  const textDePartajat = `Notitele mele sunt: ${titlu}\n\n${continut}`;

  navigator.clipboard
    .writeText(textDePartajat)
    .then(() => {
      alert(
        " Continutul notitei a fost copiat in Clipboard!\nPoti da Paste intr-un mesaj catre colegi"
      );
    })
    .catch((err) => {
      alert("Nu s-a putut copia");
    });
}

// Preview Markdown
document.getElementById("markdownInput").addEventListener("input", function () {
  document.getElementById("preview").innerHTML = marked.parse(this.value);
});

//LOGOUT
function logout() {
  localStorage.removeItem("userId");

  document.getElementById("view-dashboard").style.display = "none";
  document.getElementById("view-login").style.display = "flex";

  document.getElementById("loginEmail").value = "";
  document.getElementById("loginParola").value = "";

  setTimeout(() => {
    alert("Te-ai delogat cu succes!");
  }, 50);
}
