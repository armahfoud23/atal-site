import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "./supabaseClient"

const categories = [
  "Culture",
  "Sport",
  "Éducation",
  "Digital",
  "Solidarité",
  "Mobilité",
  "Autre",
]

const initialAssociationRequest = {
  type: "member",
  name: "",
  contact: "",
  message: "",
}

const metricValues = [5000, 200, 100, 15]

const contentByLanguage = {
  fr: {
    locale: "fr-FR",
    languageButton: "EN",
    languageLabel: "Passer le site en anglais",
    nav: {
      home: "Accueil",
      activities: "Activités",
      association: "Association",
      impact: "Impact",
      events: "Événements",
      contact: "Contact",
    },
    hero: {
      eyebrow: "ASSOCIATION TRAIN OF FUTURE LARACHE",
      titleStart: "Construisons ensemble",
      titleHighlight: "l’avenir",
      titleEnd: "de notre jeunesse",
      text: "Nous œuvrons pour l’éducation, la culture, le sport et la solidarité afin de créer un impact positif durable à Larache.",
      primary: "Découvrir nos activités",
      secondary: "Nous contacter",
      stats: ["Jeunes impactés", "Projets réalisés", "Partenaires"],
      tags: ["Culture", "Sport", "Digital", "Solidarité"],
      cardTitle: "Jeunesse engagée",
      cardText: "Des jeunes motivés, des projets concrets, un impact réel.",
    },
    activities: {
      eyebrow: "Nos activités",
      titleStart: "Nos",
      titleHighlight: "domaines d’action",
      cards: [
        ["🎭 Culture & Art", "Ateliers, festivals, théâtre et activités créatives."],
        ["⚽ Sport", "Camp sportif, volleyball, football et inclusion des jeunes."],
        ["💻 Éducation & Digital", "Compétences numériques, formation et orientation."],
        ["🤝 Solidarité", "Actions humanitaires et aide à la communauté."],
        ["✈️ Mobilité", "Échanges internationaux, Erasmus+ et ESC."],
      ],
      quote: "La jeunesse d’aujourd’hui est le train de l’avenir de demain.",
    },
    association: {
      eyebrow: "L'association",
      titleStart: "Une équipe locale au service de",
      titleHighlight: "la jeunesse de Larache",
      text: "ATAL rassemble des jeunes, des bénévoles et des partenaires autour d’actions concrètes : apprendre, créer, bouger, s’entraider et ouvrir de nouvelles opportunités.",
      story: "Notre rôle est de transformer les idées utiles en projets accessibles. Chaque atelier, rencontre ou événement doit donner aux jeunes plus de confiance, de compétences et de liens avec leur ville.",
      note: "ATAL avance avec les personnes qui veulent agir : membres, bénévoles, parents, associations, écoles et partenaires.",
      pillars: [
        ["Accompagner", "Orienter les jeunes vers des activités éducatives, culturelles et citoyennes."],
        ["Mobiliser", "Créer des projets avec les bénévoles, les familles et les partenaires locaux."],
        ["Connecter", "Ouvrir des passerelles vers la mobilité, le digital et les opportunités internationales."],
      ],
    },
    involvement: {
      eyebrow: "S'impliquer",
      title: "Rejoindre ou soutenir ATAL",
      text: "Choisissez votre type de demande et envoyez votre message au bureau de l’association.",
      groupLabel: "Type de demande",
      namePlaceholder: "Nom complet",
      contactPlaceholder: "Email ou téléphone",
      emailButton: "Envoyer par email",
      whatsappButton: "WhatsApp",
      missingContact: "Merci d’ajouter votre nom et votre contact",
      ready: "Votre demande est prête à être envoyée",
      messageLabels: {
        type: "Type de demande",
        name: "Nom",
        contact: "Contact",
        message: "Message",
        missing: "Non indiqué",
        default: "Je souhaite avoir plus d’informations sur ATAL.",
      },
      options: [
        ["member", "Devenir membre", "Participer régulièrement à la vie de l’association.", "Demande d’adhésion à ATAL", "Présentez-vous et dites-nous comment vous souhaitez participer."],
        ["volunteer", "Être bénévole", "Aider pendant les événements et les actions terrain.", "Proposition de bénévolat pour ATAL", "Indiquez vos disponibilités et les activités qui vous intéressent."],
        ["partner", "Devenir partenaire", "Construire une action commune avec ATAL.", "Proposition de partenariat avec ATAL", "Présentez votre structure et le type de partenariat imaginé."],
        ["project", "Proposer une activité", "Partager une idée utile pour les jeunes de Larache.", "Nouvelle idée d’activité pour ATAL", "Décrivez votre idée, le public concerné et les besoins principaux."],
      ],
    },
    impact: {
      eyebrow: "Impact ATAL",
      titleStart: "Des actions visibles, un",
      titleHighlight: "trajet qui avance",
      text: "Chaque projet ATAL suit une logique simple : écouter les jeunes, créer une action utile, mobiliser l’équipe et partager l’impact avec la communauté.",
      timelineEyebrow: "Timeline des projets",
      timelineTitle: "Le parcours d’une idée jusqu’à son impact",
      lineLabel: "ATAL FUTURE LINE",
      metrics: [
        ["Jeunesse", "Jeunes impactés", "Ateliers, rencontres, activités sportives et actions citoyennes."],
        ["Actions", "Projets réalisés", "Des initiatives locales construites avec les jeunes et les partenaires."],
        ["Réseau", "Partenaires", "Associations, écoles, institutions et acteurs engagés avec ATAL."],
        ["Future", "Mobilités", "Ouvertures vers les échanges, Erasmus+ et expériences internationales."],
      ],
      timeline: [
        ["Station 01", "Écouter", "Comprendre les besoins", "Identifier les envies des jeunes, les priorités locales et les opportunités utiles à Larache."],
        ["Station 02", "Créer", "Transformer l’idée en projet", "Construire des activités concrètes autour de la culture, du sport, du digital et de la solidarité."],
        ["Station 03", "Agir", "Mobiliser l’équipe terrain", "Réunir bénévoles, membres et partenaires pour passer de la préparation à l’action."],
        ["Station 04", "Mesurer", "Partager l’impact", "Valoriser les résultats, les photos, les témoignages et les apprentissages après chaque action."],
        ["Prochaine", "Connecter", "Ouvrir de nouvelles voies", "Développer plus de partenariats, de mobilités et de projets portés par les jeunes."],
      ],
    },
    events: {
      eyebrow: "Programme",
      titleStart: "Tous les",
      titleHighlight: "événements",
      loading: "Chargement des événements...",
      empty: "Aucun événement pour le moment.",
      all: "Tous",
      upcoming: "À venir",
      past: "Passés",
      allCategories: "Toutes les catégories",
      pastStatus: "Passé",
      register: "S'inscrire",
      adminRegister: "Voir le formulaire",
      readMore: "Voir les détails →",
      categories: {
        Culture: "Culture",
        Sport: "Sport",
        Éducation: "Éducation",
        Digital: "Digital",
        Solidarité: "Solidarité",
        Mobilité: "Mobilité",
        Autre: "Autre",
      },
    },
    contact: {
      eyebrow: "Contact",
      title: "Contact Bureau ATAL",
      email: "Email : atalarache@gmail.com",
      phone: "Téléphone : +212701079340",
      socials: "Réseaux sociaux : @FutureTrainLarache",
    },
    join: "S'impliquer",
    admin: "Admin",
  },
  en: {
    locale: "en-US",
    languageButton: "FR",
    languageLabel: "Switch the site to French",
    nav: {
      home: "Home",
      activities: "Activities",
      association: "Association",
      impact: "Impact",
      events: "Events",
      contact: "Contact",
    },
    hero: {
      eyebrow: "TRAIN OF FUTURE LARACHE ASSOCIATION",
      titleStart: "Building",
      titleHighlight: "the future",
      titleEnd: "of our youth together",
      text: "We work through education, culture, sport and solidarity to create a lasting positive impact in Larache.",
      primary: "Explore our activities",
      secondary: "Contact us",
      stats: ["Young people reached", "Projects delivered", "Partners"],
      tags: ["Culture", "Sport", "Digital", "Solidarity"],
      cardTitle: "Engaged youth",
      cardText: "Motivated young people, concrete projects and real impact.",
    },
    activities: {
      eyebrow: "Our activities",
      titleStart: "Our",
      titleHighlight: "fields of action",
      cards: [
        ["🎭 Culture & Art", "Workshops, festivals, theatre and creative activities."],
        ["⚽ Sport", "Sports camps, volleyball, football and youth inclusion."],
        ["💻 Education & Digital", "Digital skills, training and guidance."],
        ["🤝 Solidarity", "Humanitarian actions and community support."],
        ["✈️ Mobility", "International exchanges, Erasmus+ and ESC."],
      ],
      quote: "The youth of today are the train of tomorrow’s future.",
    },
    association: {
      eyebrow: "The association",
      titleStart: "A local team serving",
      titleHighlight: "Larache’s youth",
      text: "ATAL brings young people, volunteers and partners together around concrete actions: learning, creating, moving, helping each other and opening new opportunities.",
      story: "Our role is to turn useful ideas into accessible projects. Every workshop, meeting or event should give young people more confidence, more skills and stronger ties with their city.",
      note: "ATAL moves forward with people who want to act: members, volunteers, parents, associations, schools and partners.",
      pillars: [
        ["Support", "Guide young people toward educational, cultural and civic activities."],
        ["Mobilize", "Create projects with volunteers, families and local partners."],
        ["Connect", "Open pathways to mobility, digital skills and international opportunities."],
      ],
    },
    involvement: {
      eyebrow: "Get involved",
      title: "Join or support ATAL",
      text: "Choose your request type and send your message to the association office.",
      groupLabel: "Request type",
      namePlaceholder: "Full name",
      contactPlaceholder: "Email or phone",
      emailButton: "Send by email",
      whatsappButton: "WhatsApp",
      missingContact: "Please add your name and contact",
      ready: "Your request is ready to send",
      messageLabels: {
        type: "Request type",
        name: "Name",
        contact: "Contact",
        message: "Message",
        missing: "Not provided",
        default: "I would like more information about ATAL.",
      },
      options: [
        ["member", "Become a member", "Take part regularly in the association’s life.", "Membership request for ATAL", "Introduce yourself and tell us how you would like to contribute."],
        ["volunteer", "Volunteer", "Help during events and field actions.", "Volunteering proposal for ATAL", "Share your availability and the activities you are interested in."],
        ["partner", "Become a partner", "Build a shared action with ATAL.", "Partnership proposal with ATAL", "Introduce your organization and the type of partnership you imagine."],
        ["project", "Suggest an activity", "Share a useful idea for Larache’s youth.", "New activity idea for ATAL", "Describe your idea, the audience and the main needs."],
      ],
    },
    impact: {
      eyebrow: "ATAL Impact",
      titleStart: "Visible action,",
      titleHighlight: "a journey moving forward",
      text: "Every ATAL project follows a simple path: listen to young people, create a useful action, mobilize the team and share the impact with the community.",
      timelineEyebrow: "Project timeline",
      timelineTitle: "From idea to impact",
      lineLabel: "ATAL FUTURE LINE",
      metrics: [
        ["Youth", "Young people reached", "Workshops, meetings, sports activities and civic actions."],
        ["Actions", "Projects delivered", "Local initiatives built with young people and partners."],
        ["Network", "Partners", "Associations, schools, institutions and committed actors working with ATAL."],
        ["Future", "Mobilities", "Openings toward exchanges, Erasmus+ and international experiences."],
      ],
      timeline: [
        ["Station 01", "Listen", "Understand the needs", "Identify young people’s ideas, local priorities and useful opportunities in Larache."],
        ["Station 02", "Create", "Turn the idea into a project", "Build concrete activities around culture, sport, digital skills and solidarity."],
        ["Station 03", "Act", "Mobilize the field team", "Bring volunteers, members and partners together to move from preparation to action."],
        ["Station 04", "Measure", "Share the impact", "Highlight results, photos, stories and learnings after each action."],
        ["Next", "Connect", "Open new paths", "Develop more partnerships, mobilities and youth-led projects."],
      ],
    },
    events: {
      eyebrow: "Program",
      titleStart: "All",
      titleHighlight: "events",
      loading: "Loading events...",
      empty: "No events yet.",
      all: "All",
      upcoming: "Upcoming",
      past: "Past",
      allCategories: "All categories",
      pastStatus: "Past",
      register: "Register",
      adminRegister: "View form",
      readMore: "View details →",
      categories: {
        Culture: "Culture",
        Sport: "Sport",
        Éducation: "Education",
        Digital: "Digital",
        Solidarité: "Solidarity",
        Mobilité: "Mobility",
        Autre: "Other",
      },
    },
    contact: {
      eyebrow: "Contact",
      title: "ATAL Office Contact",
      email: "Email: atalarache@gmail.com",
      phone: "Phone: +212701079340",
      socials: "Social media: @FutureTrainLarache",
    },
    join: "Get involved",
    admin: "Admin",
  },
}

function getTextDirection(value) {
  return /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/.test(value || "")
    ? "rtl"
    : "ltr"
}

function ImpactNumber({ target, suffix, active, locale }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!active) return

    const duration = 1300
    const startTime = performance.now()
    let frameId = 0

    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 3

      setDisplayValue(Math.round(target * easedProgress))

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [active, target])

  return (
    <>
      {displayValue.toLocaleString(locale)}
      {suffix}
    </>
  )
}

function App() {
  const isAdminPage = window.location.search.includes("admin=1")

  const [session, setSession] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [category, setCategory] = useState("Culture")
  const [hasRegistration, setHasRegistration] = useState(false)
  const [registrationLink, setRegistrationLink] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [filter, setFilter] = useState("upcoming")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [associationRequest, setAssociationRequest] = useState(
    initialAssociationRequest
  )
  const [impactActive, setImpactActive] = useState(false)
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "fr"

    return localStorage.getItem("atal-language") || "fr"
  })

  const content = contentByLanguage[language] || contentByLanguage.fr
  const involvementOptions = content.involvement.options.map(
    ([id, label, helper, subject, placeholder]) => ({
      id,
      label,
      helper,
      subject,
      placeholder,
    })
  )
  const selectedInvolvement =
    involvementOptions.find((option) => option.id === associationRequest.type) ||
    involvementOptions[0]

  const showMessage = useCallback((text) => {
    setMessage(text)

    setTimeout(() => {
      setMessage("")
    }, 3500)
  }, [])

  useEffect(() => {
    localStorage.setItem("atal-language", language)
    document.documentElement.lang = language
  }, [language])

  const fetchEvents = useCallback(async () => {
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
  }, [showMessage])

  useEffect(() => {
    let isActive = true

    supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .then(({ data, error }) => {
        if (!isActive) return

        if (error) {
          showMessage(error.message)
          setLoading(false)
          return
        }

        setEvents(data || [])
        setLoading(false)
      })

    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) return
      setSession(data.session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      isActive = false
      authListener.subscription.unsubscribe()
    }
  }, [showMessage])

  function cleanUrl(url) {
    if (!url) return "#"

    const trimmedUrl = url.trim()

    if (
      trimmedUrl.startsWith("http://") ||
      trimmedUrl.startsWith("https://")
    ) {
      return trimmedUrl
    }

    return `https://${trimmedUrl}`
  }

  function shortText(text, max = 120) {
    if (!text) return ""
    return text.length > max ? text.substring(0, max) + "..." : text
  }

  function formatDate(value) {
    if (!value) return ""

    return new Date(value).toLocaleDateString(content.locale, {
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

  function hasValidRegistration(event) {
    return Boolean(event?.has_registration && event?.registration_link)
  }

  function updateAssociationRequest(field, value) {
    setAssociationRequest((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function buildAssociationMessage() {
    const labels = content.involvement.messageLabels
    const name = associationRequest.name.trim() || labels.missing
    const contact = associationRequest.contact.trim() || labels.missing
    const details =
      associationRequest.message.trim() ||
      labels.default

    return [
      `${labels.type} : ${selectedInvolvement.label}`,
      `${labels.name} : ${name}`,
      `${labels.contact} : ${contact}`,
      "",
      `${labels.message} :`,
      details,
    ].join("\n")
  }

  function submitAssociationRequest(e) {
    e.preventDefault()

    if (!associationRequest.name.trim() || !associationRequest.contact.trim()) {
      showMessage(content.involvement.missingContact)
      return
    }

    const subject = encodeURIComponent(selectedInvolvement.subject)
    const body = encodeURIComponent(buildAssociationMessage())

    window.location.href = `mailto:atalarache@gmail.com?subject=${subject}&body=${body}`
    showMessage(content.involvement.ready)
  }

  function toggleLanguage() {
    setLanguage((currentLanguage) => (currentLanguage === "fr" ? "en" : "fr"))
  }

  function displayCategory(value) {
    if (!value) return content.events.categories.Autre

    return content.events.categories[value] || value
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

  useEffect(() => {
    const impactSection = document.querySelector(".impact-section")
    if (!impactSection) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImpactActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.28 }
    )

    observer.observe(impactSection)

    return () => observer.disconnect()
  }, [])

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
    setHasRegistration(false)
    setRegistrationLink("")
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
    setHasRegistration(event.has_registration || false)
    setRegistrationLink(event.registration_link || "")
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

    if (hasRegistration && !registrationLink) {
      showMessage("Merci d’ajouter le lien d’inscription")
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
          has_registration: hasRegistration,
          registration_link: hasRegistration ? cleanUrl(registrationLink) : null,
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
            has_registration: hasRegistration,
            registration_link: hasRegistration ? cleanUrl(registrationLink) : null,
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

  function renderFilterBox() {
    return (
      <div className="filters-row">
        <div className="filter-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            {content.events.all}
          </button>

          <button
            className={filter === "upcoming" ? "active" : ""}
            onClick={() => setFilter("upcoming")}
          >
            {content.events.upcoming}
          </button>

          <button
            className={filter === "past" ? "active" : ""}
            onClick={() => setFilter("past")}
          >
            {content.events.past}
          </button>
        </div>

        <select
          className="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">{content.events.allCategories}</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {displayCategory(item)}
            </option>
          ))}
        </select>
      </div>
    )
  }

  function renderEventsList(data, admin = false) {
    if (loading) {
      return <p className="empty-message">{content.events.loading}</p>
    }

    if (data.length === 0) {
      return <p className="empty-message">{content.events.empty}</p>
    }

    return (
      <div className="events-grid">
        {data.map((event, index) => {
          const descriptionDirection = getTextDirection(event.description)
          const isArabicDescription = descriptionDirection === "rtl"

          return (
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
                  <span className="event-status">{content.events.pastStatus}</span>
                )}
              </div>

              <div className="event-content">
                <div className="event-meta">
                  <span className="event-date">{formatDate(event.date)}</span>
                  <span className="event-category">
                    {displayCategory(event.category)}
                  </span>
                </div>

                <h3>{event.title}</h3>
                <p
                  className={isArabicDescription ? "rtl-text" : ""}
                  dir={descriptionDirection}
                  lang={isArabicDescription ? "ar" : "fr"}
                >
                  {shortText(event.description, 130)}
                </p>

                {admin ? (
                  <>
                    {hasValidRegistration(event) && (
                      <a
                        href={cleanUrl(event.registration_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="register-btn admin-register-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {content.events.adminRegister}
                    </a>
                    )}

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
                  </>
                ) : (
                  <>
                    {hasValidRegistration(event) && (
                      <a
                        href={cleanUrl(event.registration_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="register-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {content.events.register}
                    </a>
                  )}

                    <span className="read-more">{content.events.readMore}</span>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const selectedEventDescriptionDirection = selectedEvent
    ? getTextDirection(selectedEvent.description)
    : "ltr"
  const isSelectedEventDescriptionArabic =
    selectedEventDescriptionDirection === "rtl"

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

            <div className="registration-switch-box">
              <div>
                <h3>Lien d’inscription</h3>
                <p>Active si cet événement possède un formulaire Google.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={hasRegistration}
                  onChange={(e) => setHasRegistration(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {hasRegistration && (
              <input
                type="url"
                placeholder="Lien Google Form"
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />

            <textarea
              placeholder="Description complète"
              value={description}
              dir={getTextDirection(description)}
              lang={getTextDirection(description) === "rtl" ? "ar" : "fr"}
              className={getTextDirection(description) === "rtl" ? "rtl-text" : ""}
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
          {renderFilterBox()}
        </div>

        {renderEventsList(filteredEvents, true)}
      </div>
    )
  }

  return (
    <div lang={language}>
      <header className="site-header">
        <div className="brand">
          <img src="/logo.png" alt="ATAL" />
          <div>
            <strong>ASSOCIATION</strong>
            <span>TRAIN OF FUTURE LARACHE</span>
          </div>
        </div>

        <nav>
          <a href="#accueil">{content.nav.home}</a>
          <a href="#activites">{content.nav.activities}</a>
          <a href="#association">{content.nav.association}</a>
          <a href="#impact">{content.nav.impact}</a>
          <a href="#evenements">{content.nav.events}</a>
          <a href="#contact">{content.nav.contact}</a>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="language-toggle"
            aria-label={content.languageLabel}
            onClick={toggleLanguage}
          >
            {content.languageButton}
          </button>

          <a className="join-btn" href="#association">
            {content.join}
          </a>

          <a className="admin-link" href="/?admin=1" title="Administration">
            {content.admin}
          </a>
        </div>
      </header>

      <section className="hero reveal" id="accueil">
        <div className="hero-content">
          <p className="eyebrow">{content.hero.eyebrow}</p>

          <h1>
            {content.hero.titleStart}{" "}
            <span>{content.hero.titleHighlight}</span>{" "}
            {content.hero.titleEnd}
          </h1>

          <p>{content.hero.text}</p>

          <div className="hero-buttons">
            <a href="#activites" className="primary-btn">
              {content.hero.primary}
            </a>
            <a href="#contact" className="secondary-btn">
              {content.hero.secondary}
            </a>
          </div>

          <div className="stats">
            <div>
              <strong>5000+</strong>
              <span>{content.hero.stats[0]}</span>
            </div>
            <div>
              <strong>200+</strong>
              <span>{content.hero.stats[1]}</span>
            </div>
            <div>
              <strong>100+</strong>
              <span>{content.hero.stats[2]}</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="green-shape"></div>
          <div className="hero-logo-showcase" aria-label="Logo ATAL">
            <img src="/logo.png" alt="ATAL" />
          </div>
          <div className="hero-motion-tags" aria-hidden="true">
            {content.hero.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="hero-motion-line" aria-hidden="true"></div>
          <div className="hero-card">
            <h3>{content.hero.cardTitle}</h3>
            <p>{content.hero.cardText}</p>
          </div>
        </div>
      </section>

      <section className="action-zone reveal" id="activites">
        <div className="action-left">
          <p className="eyebrow">{content.activities.eyebrow}</p>
          <h2>
            {content.activities.titleStart}{" "}
            <span>{content.activities.titleHighlight}</span>
          </h2>

          <div className="cards">
            {content.activities.cards.map(([cardTitle, cardText]) => (
              <div className="card" key={cardTitle}>
                <h3>{cardTitle}</h3>
                <p>{cardText}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="quote-box">
          <p>{content.activities.quote}</p>
          <span>— ATAL</span>
        </div>
      </section>

      <section className="association-section reveal" id="association">
        <div className="association-header">
          <p className="eyebrow">{content.association.eyebrow}</p>
          <h2>
            {content.association.titleStart}{" "}
            <span>{content.association.titleHighlight}</span>
          </h2>
          <p>{content.association.text}</p>
        </div>

        <div className="association-grid">
          <div className="association-story">
            <p>{content.association.story}</p>

            <div className="association-pillar-grid">
              {content.association.pillars.map(([pillarTitle, pillarText]) => (
                <div className="association-pillar" key={pillarTitle}>
                  <strong>{pillarTitle}</strong>
                  <span>{pillarText}</span>
                </div>
              ))}
            </div>

            <div className="association-note">
              {content.association.note}
            </div>
          </div>

          <form className="involvement-form" onSubmit={submitAssociationRequest}>
            <div>
              <p className="eyebrow">{content.involvement.eyebrow}</p>
              <h3>{content.involvement.title}</h3>
              <p>{content.involvement.text}</p>
            </div>

            <div
              className="involvement-options"
              role="group"
              aria-label={content.involvement.groupLabel}
            >
              {involvementOptions.map((option) => (
                <button
                  type="button"
                  className={`involvement-option ${
                    associationRequest.type === option.id ? "active" : ""
                  }`}
                  aria-pressed={associationRequest.type === option.id}
                  key={option.id}
                  onClick={() => updateAssociationRequest("type", option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.helper}</span>
                </button>
              ))}
            </div>

            <div className="involvement-fields">
              <input
                type="text"
                placeholder={content.involvement.namePlaceholder}
                value={associationRequest.name}
                onChange={(e) =>
                  updateAssociationRequest("name", e.target.value)
                }
                required
              />

              <input
                type="text"
                placeholder={content.involvement.contactPlaceholder}
                value={associationRequest.contact}
                onChange={(e) =>
                  updateAssociationRequest("contact", e.target.value)
                }
                required
              />
            </div>

            <textarea
              placeholder={selectedInvolvement.placeholder}
              value={associationRequest.message}
              onChange={(e) =>
                updateAssociationRequest("message", e.target.value)
              }
            />

            <div className="involvement-actions">
              <button type="submit">{content.involvement.emailButton}</button>
              <a
                href={`https://wa.me/212701079340?text=${encodeURIComponent(
                  buildAssociationMessage()
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-link"
              >
                {content.involvement.whatsappButton}
              </a>
            </div>
          </form>
        </div>
      </section>

      <section className="impact-section reveal" id="impact">
        <div className="impact-header">
          <p className="eyebrow">{content.impact.eyebrow}</p>
          <h2>
            {content.impact.titleStart}{" "}
            <span>{content.impact.titleHighlight}</span>
          </h2>
          <p>{content.impact.text}</p>
        </div>

        <div className="impact-grid">
          {content.impact.metrics.map((metric, index) => (
            <div
              className="impact-card"
              style={{ animationDelay: `${index * 90}ms` }}
              key={metric[1]}
            >
              <span className="impact-chip">{metric[0]}</span>
              <strong>
                <ImpactNumber
                  active={impactActive}
                  locale={content.locale}
                  target={metricValues[index]}
                  suffix="+"
                />
              </strong>
              <h3>{metric[1]}</h3>
              <p>{metric[2]}</p>
            </div>
          ))}
        </div>

        <div className="project-track">
          <div className="project-track-header">
            <div>
              <p className="eyebrow">{content.impact.timelineEyebrow}</p>
              <h3>{content.impact.timelineTitle}</h3>
            </div>
            <span>{content.impact.lineLabel}</span>
          </div>

          <div className="timeline-rail" aria-hidden="true"></div>

          <div className="project-timeline">
            {content.impact.timeline.map((item, index) => (
              <div
                className="timeline-item"
                style={{ animationDelay: `${index * 110}ms` }}
                key={item[2]}
              >
                <span className="timeline-point">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="timeline-content">
                  <div className="timeline-meta">
                    <span>{item[0]}</span>
                    <small>{item[1]}</small>
                  </div>
                  <h3>{item[2]}</h3>
                  <p>{item[3]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section reveal" id="evenements">
        <div className="section-header">
          <div>
            <p className="eyebrow">{content.events.eyebrow}</p>
            <h2>
              {content.events.titleStart}{" "}
              <span>{content.events.titleHighlight}</span>
            </h2>
          </div>

          {renderFilterBox()}
        </div>

        {renderEventsList(filteredEvents)}
      </section>

      <section className="contact reveal" id="contact">
        <p className="eyebrow">{content.contact.eyebrow}</p>
        <h2>{content.contact.title}</h2>
        <p>{content.contact.email}</p>
        <p>{content.contact.phone}</p>
        <p>{content.contact.socials}</p>
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
                {displayCategory(selectedEvent.category)}
              </span>
              <h2>{selectedEvent.title}</h2>
              <p
                className={isSelectedEventDescriptionArabic ? "rtl-text" : ""}
                dir={selectedEventDescriptionDirection}
                lang={isSelectedEventDescriptionArabic ? "ar" : "fr"}
              >
                {selectedEvent.description}
              </p>

              {hasValidRegistration(selectedEvent) && (
                <a
                  href={cleanUrl(selectedEvent.registration_link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="register-btn modal-register-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  {content.events.register}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
