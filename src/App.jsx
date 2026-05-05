import { useEffect, useMemo, useState } from "react"
import { supabase } from "./supabaseClient"

function App() {
  const isAdminPage = window.location.search.includes("admin=1")

  const categories = [
    "Culture",
    "Sport",
    "Éducation",
    "Digital",
    "Solidarité",
    "Mobilité",
    "Autre",
  ]

  const [session, setSession] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [category, setCategory] = useState("Culture")
  const [imageFile, setImageFile] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [filter, setFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    fetchEvents()

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  function showMessage(text) {
    setMessage(text)

    setTimeout(() => {
      setMessage("")
    }, 3500)
  }

  async function fetchEvents() {
    setLoading(true)

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })

    if (error) {
      showMessage(error.message)
      setLoading(false)
      return
    }

    setEvents(data || [])
    setLoading(false)
  }

  function shortText(text, max = 120) {
    if (!text) return ""
    return text.length > max ? text.substring(0, max) + "..." : text
  }

  function formatDate(value) {
    if (!value) return ""

    return new Date(value).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  function isPastEvent(eventDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const eventDay = new Date(eventDate)
    eventDay.setHours(0, 0, 0, 0)

    return eventDay < today
  }

  const upcomingEvents = useMemo(() => {
    return events.filter((event) => !isPastEvent(event.date))
  }, [events])

  const pastEvents = useMemo(() => {
    return events.filter((event) => isPastEvent(event.date)).reverse()
  }, [events])

  const filteredEvents = useMemo(() => {
    let list = events

    if (filter === "past") list = pastEvents
    if (filter === "upcoming") list = upcomingEvents

    if (categoryFilter !== "all") {
      list = list.filter((event) => event.category === categoryFilter)
    }

    return list
  }, [filter, categoryFilter, events, pastEvents, upcomingEvents])

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.15 }
    )

    elements.forEach((element) => observer.observe(element))

    return () => {
      elements.forEach((element) => observer.unobserve(element))
    }
  }, [filteredEvents.length])

  async function signIn(e) {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      showMessage(error.message)
      return
    }

    showMessage("Connexion réussie")
  }

  async function signOut() {
    await supabase.auth.signOut()
    showMessage("Déconnexion réussie")
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setDate("")
    setCategory("Culture")
    setImageFile(null)
    setEditingEvent(null)

    const fileInput = document.querySelector(".event-form input[type='file']")
    if (fileInput) fileInput.value = ""
  }

  function startEdit(event) {
    setEditingEvent(event)
    setTitle(event.title || "")
    setDescription(event.description || "")
    setDate(event.date || "")
    setCategory(event.category || "Culture")
    setImageFile(null)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  async function uploadImage() {
    if (!imageFile) return null

    const cleanName = imageFile.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")

    const fileName = `${Date.now()}-${cleanName}`

    const { error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(fileName, imageFile)

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data } = supabase.storage.from("event-images").getPublicUrl(fileName)

    return data.publicUrl
  }

  async function saveEvent(e) {
    e.preventDefault()

    if (!title || !description || !date || !category) {
      showMessage("Merci de remplir tous les champs")
      return
    }

    setSaving(true)

    try {
      const uploadedImageUrl = await uploadImage()

      if (editingEvent) {
        const updatePayload = {
          title,
          description,
          date,
          category,
        }

        if (uploadedImageUrl) {
          updatePayload.image_url = uploadedImageUrl
        }

        const { error } = await supabase
          .from("events")
          .update(updatePayload)
          .eq("id", editingEvent.id)

        if (error) {
          showMessage(error.message)
          setSaving(false)
          return
        }

        showMessage("Événement modifié avec succès")
      } else {
        const { error } = await supabase.from("events").insert([
          {
            title,
            description,
            date,
            category,
            image_url: uploadedImageUrl,
          },
        ])

        if (error) {
          showMessage(error.message)
          setSaving(false)
          return
        }

        showMessage("Événement ajouté avec succès")
      }

      resetForm()
      fetchEvents()
    } catch (error) {
      showMessage(error.message)
    }

    setSaving(false)
  }

  async function deleteEvent(id) {
    const confirmDelete = confirm("Supprimer cet événement ?")
    if (!confirmDelete) return

    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) {
      showMessage(error.message)
      return
    }

    showMessage("Événement supprimé")
    fetchEvents()
  }

  function FilterBox() {
    return (
      <div className="filters-row">
        <div className="filter-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Tous
          </button>

          <button
            className={filter === "upcoming" ? "active" : ""}
            onClick={() => setFilter("upcoming")}
          >
            À venir
          </button>

          <button
            className={filter === "past" ? "active" : ""}
            onClick={() => setFilter("past")}
          >
            Passés
          </button>
        </div>

        <select
          className="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Toutes les catégories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    )
  }

  function EventsList({ data, admin = false }) {
    if (loading) {
      return <p className="empty-message">Chargement des événements...</p>
    }

    if (data.length === 0) {
      return <p className="empty-message">Aucun événement pour le moment.</p>
    }

    return (
      <div className="events-grid">
        {data.map((event, index) => (
          <div
            className={`event-card reveal-card ${admin ? "" : "clickable"}`}
            style={{ animationDelay: `${index * 70}ms` }}
            key={event.id}
            onClick={() => !admin && setSelectedEvent(event)}
          >
            <div className="event-image-wrap">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} loading="lazy" />
              ) : (
                <div className="event-placeholder">ATAL</div>
              )}

              {isPastEvent(event.date) && (
                <span className="event-status">Passé</span>
              )}
            </div>

            <div className="event-content">
              <div className="event-meta">
                <span className="event-date">{formatDate(event.date)}</span>
                <span className="event-category">
                  {event.category || "Autre"}
                </span>
              </div>

              <h3>{event.title}</h3>
              <p>{shortText(event.description, 130)}</p>

              {admin ? (
                <div className="admin-actions">
                  <button type="button" onClick={() => startEdit(event)}>
                    Modifier
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => deleteEvent(event.id)}
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <span className="read-more">Voir les détails →</span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isAdminPage) {
    if (!session) {
      return (
        <div className="login-page">
          {message && <div className="toast">{message}</div>}

          <form className="login-box" onSubmit={signIn}>
            <img src="/logo.png" alt="ATAL" />
            <p className="eyebrow">Administration</p>
            <h2>Connexion Bureau ATAL</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Se connecter</button>
          </form>
        </div>
      )
    }

    return (
      <div className="admin-page">
        {message && <div className="toast">{message}</div>}

        <div className="admin-header">
          <div>
            <p className="eyebrow">Bureau ATAL</p>
            <h1>Gestion des événements</h1>
          </div>

          <button onClick={signOut}>Se déconnecter</button>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">
            <div>
              <p className="eyebrow">
                {editingEvent ? "Modification" : "Nouvel événement"}
              </p>

              <h2>
                {editingEvent ? "Modifier l’événement" : "Ajouter un événement"}
              </h2>
            </div>

            {editingEvent && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Annuler
              </button>
            )}
          </div>

          <form className="event-form" onSubmit={saveEvent}>
            <input
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />

            <textarea
              placeholder="Description complète"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit" disabled={saving}>
              {saving
                ? "Enregistrement..."
                : editingEvent
                  ? "Sauvegarder"
                  : "Ajouter"}
            </button>
          </form>
        </div>

        <div className="admin-list-header">
          <h2 className="admin-section-title">Événements ajoutés</h2>
          <FilterBox />
        </div>

        <EventsList data={filteredEvents} admin />
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

        <div className="header-actions">
          <a className="join-btn" href="#contact">
            Rejoignez-nous
          </a>

          <a className="admin-link" href="/?admin=1" title="Administration">
            Admin
          </a>
        </div>
      </header>

      <section className="hero reveal" id="accueil">
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
              <strong>5000+</strong>
              <span>Jeunes impactés</span>
            </div>
            <div>
              <strong>200+</strong>
              <span>Projets réalisés</span>
            </div>
            <div>
              <strong>100+</strong>
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

      <section className="action-zone reveal" id="activites">
        <div className="action-left">
          <p className="eyebrow">Nos activités</p>
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

      <section className="section reveal" id="evenements">
        <div className="section-header">
          <div>
            <p className="eyebrow">Programme</p>
            <h2>
              Tous les <span>événements</span>
            </h2>
          </div>

          <FilterBox />
        </div>

        <EventsList data={filteredEvents} />
      </section>

      <section className="contact reveal" id="contact">
        <p className="eyebrow">Contact</p>
        <h2>Rejoignez le mouvement</h2>
        <p>Email : atalarache@gmail.com</p>
        <p>Téléphone : +212701079340</p>
        <p>Réseaux sociaux : @FutureTrainLarache</p>
      </section>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>

            {selectedEvent.image_url ? (
              <img
                className="modal-img"
                src={selectedEvent.image_url}
                alt={selectedEvent.title}
              />
            ) : (
              <div className="modal-img modal-placeholder">ATAL</div>
            )}

            <div className="modal-content">
              <span className="modal-date">{formatDate(selectedEvent.date)}</span>
              <span className="modal-category">
                {selectedEvent.category || "Autre"}
              </span>
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
