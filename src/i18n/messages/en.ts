import type { Messages } from "./pt-BR";

const en: Messages = {
  common: {
    appName: "Wind of Legend",
    tagline: "The ocean is the playground. Every session is progress.",
    save: "Save",
    cancel: "Cancel",
    continue: "Continue",
    signOut: "Sign out",
    comingSoon: "Coming soon",
    optional: "optional",
    genericError: "Something went wrong. Please try again.",
  },
  nav: {
    home: "Home",
    explore: "Explore",
    create: "Create",
    league: "League",
    profile: "Profile",
  },
  landing: {
    title: "The kite adventure starts in the real world",
    subtitle:
      "Record sessions, complete downwinds, discover spots and level up with riders from Preá and the world.",
    cta: "Sign in or create account",
    pillars: {
      explore: {
        title: "Explore",
        body: "Discover new spots and downwind routes.",
      },
      progress: {
        title: "Progress",
        body: "Earn XP from verified sessions and level up.",
      },
      crew: {
        title: "Connect",
        body: "Build your crew, organize downwinds and share rides.",
      },
    },
  },
  auth: {
    title: "Sign in to Wind of Legend",
    subtitle: "We'll email you a magic link. No password needed.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    sendLink: "Send sign-in link",
    google: "Continue with Google",
    or: "or",
    checkEmailTitle: "Check your email",
    checkEmailBody:
      "We sent a sign-in link to {email}. Open it on this device.",
    invalidEmail: "Enter a valid email address.",
    sendFailed: "We couldn't send the link. Please try again shortly.",
    callbackFailed: "The link expired or was already used. Request a new one.",
  },
  onboarding: {
    title: "Create your rider identity",
    subtitle: "This appears on your profile and in leaderboards.",
    username: "Username",
    usernameHint: "3–24 characters: letters, numbers and _",
    displayName: "Display name",
    homeSpot: "Home spot",
    homeSpotNone: "Choose later",
    gpsTitle: "GPS privacy",
    gpsBody:
      "To verify sessions, the app can record your track by GPS. Tracks are private: only you can see them. We never show your live location.",
    gpsConsent: "I allow GPS recording during sessions I start",
    gpsLater: "You can change this anytime from your profile.",
    submit: "Start the adventure",
  },
  profile: {
    edit: "Edit profile",
    lifetimeXp: "Lifetime XP",
    level: "Level",
    homeSpot: "Home spot",
    memberSince: "Rider since",
    noBio: "No bio yet.",
    sessionsTitle: "Sessions",
    sessionsEmpty: "Verified sessions will appear here.",
    achievementsTitle: "Achievements",
    achievementsEmpty: "Your achievements will appear here.",
    notFound: "Rider not found.",
    editTitle: "Edit profile",
    bio: "Bio",
    avatar: "Profile photo",
    avatarHint: "JPG, PNG or WebP, up to 2 MB.",
    saved: "Profile saved.",
    gpsSection: "GPS and privacy",
  },
  validation: {
    usernameFormat: "Use 3–24 letters, numbers or _.",
    usernameTaken: "That username is already taken.",
    displayName: "Enter a name between 1 and 60 characters.",
    bio: "Bio can be at most 280 characters.",
    avatarType: "Upload a JPG, PNG or WebP image.",
    avatarSize: "The image must be 2 MB or smaller.",
  },
  home: {
    greeting: "Good wind, {name}",
    missionsTitle: "Today's missions",
    missionsEmpty: "Daily missions arrive in Phase 4.",
    downwindsTitle: "Downwinds near you",
    downwindsEmpty: "Downwind organization arrives in Phase 3.",
  },
  placeholders: {
    explore: "The map of spots, routes and rides arrives in upcoming phases.",
    create: "Recording sessions and creating downwinds arrives in Phase 3.",
    league: "Regional and global leagues arrive in Phase 5.",
  },
};

export default en;
