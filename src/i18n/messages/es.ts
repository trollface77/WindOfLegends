import type { Messages } from "./pt-BR";

const es: Messages = {
  common: {
    appName: "Wind of Legend",
    tagline: "El océano es el campo de juego. Cada sesión es progreso.",
    save: "Guardar",
    cancel: "Cancelar",
    continue: "Continuar",
    signOut: "Cerrar sesión",
    comingSoon: "Próximamente",
    optional: "opcional",
    genericError: "Algo salió mal. Inténtalo de nuevo.",
  },
  nav: {
    home: "Inicio",
    explore: "Explorar",
    create: "Crear",
    league: "Liga",
    profile: "Perfil",
  },
  landing: {
    title: "La aventura del kite empieza en el mundo real",
    subtitle:
      "Registra sesiones, completa downwinds, descubre spots y progresa con riders de Preá y del mundo.",
    cta: "Entrar o crear cuenta",
    pillars: {
      explore: {
        title: "Explora",
        body: "Descubre nuevos spots y rutas de downwind.",
      },
      progress: {
        title: "Progresa",
        body: "Gana XP con sesiones verificadas y sube de nivel.",
      },
      crew: {
        title: "Conecta",
        body: "Arma tu crew, organiza downwinds y comparte el viaje.",
      },
    },
  },
  auth: {
    title: "Entrar en Wind of Legend",
    subtitle: "Te enviaremos un enlace mágico por correo. Sin contraseña.",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@ejemplo.com",
    sendLink: "Enviar enlace de acceso",
    google: "Continuar con Google",
    or: "o",
    checkEmailTitle: "Revisa tu correo",
    checkEmailBody:
      "Enviamos un enlace de acceso a {email}. Ábrelo en este dispositivo.",
    invalidEmail: "Introduce un correo válido.",
    sendFailed:
      "No pudimos enviar el enlace. Inténtalo de nuevo en un momento.",
    callbackFailed: "El enlace caducó o ya se usó. Pide uno nuevo.",
  },
  onboarding: {
    title: "Crea tu identidad de rider",
    subtitle: "Esto aparece en tu perfil y en los rankings.",
    username: "Nombre de usuario",
    usernameHint: "3–24 caracteres: letras, números y _",
    displayName: "Nombre visible",
    homeSpot: "Spot principal",
    homeSpotNone: "Elegir después",
    gpsTitle: "Privacidad del GPS",
    gpsBody:
      "Para verificar sesiones, la app puede grabar tu recorrido por GPS. Los recorridos son privados: solo tú los ves. Nunca mostramos tu ubicación en vivo.",
    gpsConsent:
      "Autorizo la grabación de GPS durante las sesiones que yo inicie",
    gpsLater: "Puedes cambiarlo cuando quieras desde tu perfil.",
    submit: "Empezar la aventura",
  },
  profile: {
    edit: "Editar perfil",
    lifetimeXp: "XP total",
    level: "Nivel",
    homeSpot: "Spot principal",
    memberSince: "Rider desde",
    noBio: "Todavía sin bio.",
    sessionsTitle: "Sesiones",
    sessionsEmpty: "Las sesiones verificadas aparecerán aquí.",
    achievementsTitle: "Logros",
    achievementsEmpty: "Tus logros aparecerán aquí.",
    notFound: "Rider no encontrado.",
    editTitle: "Editar perfil",
    bio: "Bio",
    avatar: "Foto de perfil",
    avatarHint: "JPG, PNG o WebP, hasta 2 MB.",
    saved: "Perfil guardado.",
    gpsSection: "GPS y privacidad",
  },
  validation: {
    usernameFormat: "Usa 3–24 letras, números o _.",
    usernameTaken: "Ese nombre de usuario ya está en uso.",
    displayName: "Introduce un nombre de 1 a 60 caracteres.",
    bio: "La bio puede tener como máximo 280 caracteres.",
    avatarType: "Sube una imagen JPG, PNG o WebP.",
    avatarSize: "La imagen debe pesar 2 MB o menos.",
  },
  home: {
    greeting: "Buen viento, {name}",
    missionsTitle: "Misiones de hoy",
    missionsEmpty: "Las misiones diarias llegan en la Fase 4.",
    downwindsTitle: "Downwinds cerca de ti",
    downwindsEmpty: "La organización de downwinds llega en la Fase 3.",
  },
  placeholders: {
    explore:
      "El mapa de spots, rutas y viajes compartidos llega en las próximas fases.",
    create: "Registrar sesiones y crear downwinds llega en la Fase 3.",
    league: "Las ligas regionales y globales llegan en la Fase 5.",
  },
};

export default es;
