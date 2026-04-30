import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

function App() {
  const isAdminPage =
    window.location.pathname.includes("admin") ||
    window.location.search.includes("admin=1")

  const [session, setSession] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    fetchEvents()

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })

    if (error) {
      alert(error.message)
      return
    }

    setEvents(data || [])
  }

  function shortText(text, max = 110) {
    if (!text) return ""
    return text.length > max ? text.substring(0, max) + "..." : text
  }

  async function signIn(e) {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) alert(error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function saveEvent(e) {
    e.preventDefault()

    if (!title || !description || !date) {
      alert("Merci de remplir tous les champs")
      return
    }

    let imageUrl = null

    if (imageFile) {
      const cleanName = imageFile.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_")

      const fileName = `${Date.now()}-${cleanName}`

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, imageFile)

      if (uploadError) {
        alert(uploadError.message)
        return
      }

      const { data } = supabase.storage
        .from("event-images")
        .getPublicUrl(fileName)

      imageUrl = data.publicUrl
    }

    const { error } = await supabase.from("events").insert([
      {
        title,
        description,
        date,
        image_url: imageUrl,
      },
    ])

    if (error) {
      alert(error.message)
      return
    }

    setTitle("")
    setDescription("")
    setDate("")
    setImageFile(null)
    fetchEvents()
  }

  async function deleteEvent(id) {
    const confirmDelete = confirm("Supprimer cet événement ?")
    if (!confirmDelete) return

    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    fetchEvents()
  }

  if (isAdminPage) {
    if (!session) {
      return (
        <div className="login-page">
          <form className="login-box" onSubmit={signIn}>
            <img src="/logo.png" alt="ATAL" />
            <h2>Connexion Bureau ATAL</h2>

            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Mot de passe"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Se connecter</button>
          </form>
        </div>
      )
    }

    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Bureau ATAL</h1>
          <button onClick={signOut}>Se déconnecter</button>
        </div>

        <div className="admin-card">
          <h2>Ajouter un événement</h2>

          <form className="event-form" onSubmit={saveEvent}>
            <input
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Description complète"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />

            <button type="submit">Ajouter</button>
          </form>
        </div>

        <h2 className="admin-section-title">Événements ajoutés</h2>

        <div className="events-grid">
          {events.map((event) => (
            <div className="event-card" key={event.id}>
              {event.image_url && (
                <img src={event.image_url} alt={event.title} />
              )}

              <div className="event-content">
                <h3>{event.title}</h3>
                <p>{shortText(event.description)}</p>
                <strong>{event.date}</strong>

                <button
                  className="delete-btn"
                  onClick={() => deleteEvent(event.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <header className="site-header">
        <div className="brand">
          <img src="/logo.png" alt="ATAL" />
          <div>
            <strong>ASSOCIATION</strong>
            <span>TRAIN OF FUTURE LARACHE</span>
          </div>
        </div>

        <nav>
          <a href="#accueil">Accueil</a>
          <a href="#activites">Activités</a>
          <a href="#evenements">Événements</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="join-btn" href="#contact">Rejoignez-nous</a>
      </header>

      <section className="hero" id="accueil">
        <div className="hero-content">
          <p className="eyebrow">ASSOCIATION TRAIN OF FUTURE LARACHE</p>

          <h1>
            Construisons ensemble <span>l’avenir</span> de notre jeunesse
          </h1>

          <p>
            Nous œuvrons pour l’éducation, la culture, le sport et la solidarité
            afin de créer un impact positif durable à Larache.
          </p>

          <div className="hero-buttons">
            <a href="#activites" className="primary-btn">
              Découvrir nos activités
            </a>
            <a href="#contact" className="secondary-btn">
              Nous contacter
            </a>
          </div>

          <div className="stats">
            <div>
              <strong>500+</strong>
              <span>Jeunes impactés</span>
            </div>
            <div>
              <strong>20+</strong>
              <span>Projets réalisés</span>
            </div>
            <div>
              <strong>10+</strong>
              <span>Partenaires</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="green-shape"></div>
          <div className="hero-card">
            <h3>Jeunesse engagée</h3>
            <p>Des jeunes motivés, des projets concrets, un impact réel.</p>
          </div>
        </div>
      </section>

      <section className="action-zone" id="activites">
        <div className="action-left">
          <h2>
            Nos <span>domaines d’action</span>
          </h2>

          <div className="cards">
            <div className="card">
              <h3>🎭 Culture & Art</h3>
              <p>Ateliers, festivals, théâtre et activités créatives.</p>
            </div>

            <div className="card">
              <h3>⚽ Sport</h3>
              <p>Camp sportif, volleyball, football et inclusion des jeunes.</p>
            </div>

            <div className="card">
              <h3>💻 Éducation & Digital</h3>
              <p>Compétences numériques, formation et orientation.</p>
            </div>

            <div className="card">
              <h3>🤝 Solidarité</h3>
              <p>Actions humanitaires et aide à la communauté.</p>
            </div>

            <div className="card">
              <h3>✈️ Mobilité</h3>
              <p>Échanges internationaux, Erasmus+ et ESC.</p>
            </div>
          </div>
        </div>

        <div className="quote-box">
          <p>La jeunesse d’aujourd’hui est le train de l’avenir de demain.</p>
          <span>— ATAL</span>
        </div>
      </section>

      <section className="section" id="evenements">
        <h2>
          Événements <span>à venir</span>
        </h2>

        <div className="events-grid">
          {events.length === 0 ? (
            <p>Aucun événement pour le moment.</p>
          ) : (
            events.map((event) => (
              <div
                className="event-card clickable"
                key={event.id}
                onClick={() => setSelectedEvent(event)}
              >
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} />
                )}

                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p>{shortText(event.description, 90)}</p>
                  <strong>{event.date}</strong>
                  <span className="read-more">Lire plus →</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="contact" id="contact">
        <h2>Rejoignez le mouvement</h2>
        <p>Email : atalarache@gmail.com</p>
        <p>Téléphone : +212701079340</p>
        <p>Réseaux sociaux : @FutureTrainLarache</p>
      </section>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvent(null)}>
              ×
            </button>

            {selectedEvent.image_url && (
              <img
                className="modal-img"
                src={selectedEvent.image_url}
                alt={selectedEvent.title}
              />
            )}

            <div className="modal-content">
              <span className="modal-date">{selectedEvent.date}</span>
              <h2>{selectedEvent.title}</h2>
              <p>{selectedEvent.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App