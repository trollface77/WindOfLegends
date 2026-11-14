// Source of truth for message keys. Other languages must match this shape.
const ptBR = {
  common: {
    appName: "Wind of Legend",
    tagline: "O oceano é o playground. Cada sessão é progresso.",
    save: "Salvar",
    cancel: "Cancelar",
    continue: "Continuar",
    signOut: "Sair",
    comingSoon: "Em breve",
    optional: "opcional",
    genericError: "Algo deu errado. Tente novamente.",
  },
  nav: {
    home: "Início",
    explore: "Explorar",
    create: "Criar",
    league: "Liga",
    profile: "Perfil",
  },
  landing: {
    title: "A aventura do kite começa no mundo real",
    subtitle:
      "Registre sessões, complete downwinds, descubra spots e evolua com a comunidade de Preá e do mundo.",
    cta: "Entrar ou criar conta",
    pillars: {
      explore: {
        title: "Explore",
        body: "Descubra novos spots e rotas de downwind.",
      },
      progress: {
        title: "Evolua",
        body: "Ganhe XP com sessões verificadas e suba de nível.",
      },
      crew: {
        title: "Conecte",
        body: "Monte sua crew, organize downwinds e divida a carona.",
      },
    },
  },
  auth: {
    title: "Entrar no Wind of Legend",
    subtitle: "Enviaremos um link mágico para o seu e-mail. Sem senha.",
    emailLabel: "E-mail",
    emailPlaceholder: "voce@exemplo.com",
    sendLink: "Enviar link de acesso",
    google: "Continuar com Google",
    or: "ou",
    checkEmailTitle: "Confira seu e-mail",
    checkEmailBody:
      "Enviamos um link de acesso para {email}. Abra-o neste dispositivo.",
    invalidEmail: "Informe um e-mail válido.",
    sendFailed: "Não foi possível enviar o link. Tente novamente em instantes.",
    callbackFailed: "O link expirou ou já foi usado. Peça um novo.",
  },
  onboarding: {
    title: "Crie sua identidade de rider",
    subtitle: "Isso aparece no seu perfil e nos rankings.",
    username: "Nome de usuário",
    usernameHint: "3–24 caracteres: letras, números e _",
    displayName: "Nome de exibição",
    homeSpot: "Spot principal",
    homeSpotNone: "Escolher depois",
    gpsTitle: "Privacidade do GPS",
    gpsBody:
      "Para verificar sessões, o app pode gravar seu trajeto por GPS. Os trajetos são privados: só você vê. Nunca mostramos sua localização ao vivo.",
    gpsConsent: "Autorizo a gravação de GPS durante as sessões que eu iniciar",
    gpsLater: "Você pode mudar isso a qualquer momento no perfil.",
    submit: "Começar a aventura",
  },
  profile: {
    edit: "Editar perfil",
    lifetimeXp: "XP total",
    level: "Nível",
    homeSpot: "Spot principal",
    memberSince: "Rider desde",
    noBio: "Ainda sem bio.",
    sessionsTitle: "Sessões",
    sessionsEmpty: "As sessões verificadas aparecerão aqui.",
    achievementsTitle: "Conquistas",
    achievementsEmpty: "Suas conquistas aparecerão aqui.",
    notFound: "Rider não encontrado.",
    editTitle: "Editar perfil",
    bio: "Bio",
    avatar: "Foto de perfil",
    avatarHint: "JPG, PNG ou WebP, até 2 MB.",
    saved: "Perfil salvo.",
    gpsSection: "GPS e privacidade",
  },
  validation: {
    usernameFormat: "Use 3–24 letras, números ou _.",
    usernameTaken: "Esse nome de usuário já está em uso.",
    displayName: "Informe um nome de 1 a 60 caracteres.",
    bio: "A bio pode ter no máximo 280 caracteres.",
    avatarType: "Envie uma imagem JPG, PNG ou WebP.",
    avatarSize: "A imagem deve ter no máximo 2 MB.",
  },
  home: {
    greeting: "Bom vento, {name}",
    missionsTitle: "Missões de hoje",
    missionsEmpty: "As missões diárias chegam na Fase 4.",
    downwindsTitle: "Downwinds perto de você",
    downwindsEmpty: "A organização de downwinds chega na Fase 3.",
  },
  placeholders: {
    explore: "Mapa de spots, rotas e caronas chega nas próximas fases.",
    create: "Registrar sessões e criar downwinds chega na Fase 3.",
    league: "Ligas regionais e globais chegam na Fase 5.",
  },
};

export default ptBR;
export type Messages = typeof ptBR;
