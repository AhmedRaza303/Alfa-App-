import { AppLanguage } from '../types';

export interface TranslationDict {
  // General / Common
  save: string;
  cancel: string;
  confirm: string;
  close: string;
  back: string;
  continue: string;
  submit: string;
  clear: string;
  search: string;
  delete: string;
  edit: string;
  copy: string;
  copied: string;
  loading: string;
  refresh: string;
  remove: string;
  required: string;
  optional: string;

  // Language names
  english: string;
  spanish: string;
  appLanguage: string;
  selectLanguage: string;

  // Auth & Signup
  login: string;
  signUp: string;
  signOut: string;
  getStartedHeading: string;
  getStartedSubtitle: string;
  stepIndicator: (current: number, total: number) => string;
  backToLogin: string;
  profilePicture: string;
  uploadPhoto: string;
  changePhoto: string;
  removePhoto: string;
  name: string;
  instagramHandle: string;
  preferredFlyerLanguage: string;
  preferredFlyerCategory: string;
  selectCategory: string;
  workInjury: string;
  carAccident: string;
  email: string;
  password: string;
  showPassword: string;
  hidePassword: string;
  phoneNumber: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  selectCountry: string;
  selectState: string;
  enterCity: string;
  enterPostalCode: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  forgotPassword: string;
  passwordRequirements: string;
  cityNameHint: string;
  postalCodeHint: string;
  phoneDigitsHint: (current: number, max: number) => string;
  step1Title: string;
  step2Title: string;

  // Status screens for Marketer
  registrationSubmittedTitle: string;
  registrationSubmittedDesc: string;
  accountUnderReviewTitle: string;
  accountUnderReviewDesc: string;
  registrationNotApprovedTitle: string;
  registrationNotApprovedDesc: string;
  checkStatus: string;

  // Categories
  flyer: string;
  personalized: string;
  normal: string;
  allCategories: string;
  contentType: string;

  // Navigation
  conversations: string;
  bulkSender: string;
  marketerRequests: string;
  analytics: string;
  performance: string;
  referrals: string;
  leads: string;
  help: string;
  notifications: string;
  profile: string;

  // Marketer Requests (Admin)
  requestsTitle: string;
  requestsSubtitle: string;
  pendingRequests: string;
  approved: string;
  rejected: string;
  totalMarketers: string;
  allFilter: string;
  viewProfile: string;
  approve: string;
  reject: string;
  revokeApproval: string;
  marketerApprovedSuccess: string;
  marketerRejectedSuccess: string;
  confirmApproveTitle: string;
  confirmApproveDesc: (name: string) => string;
  confirmRejectTitle: string;
  confirmRejectDesc: (name: string) => string;
  rejectionReasonPlaceholder: string;
  registrationDate: string;
  approvalStatus: string;
  noRequestsFound: string;

  // Conversation & Messaging
  typeMessage: string;
  send: string;
  sharedWithAll: string;
  toRecipient: (name: string) => string;
  postedStatus: string;
  notPostedStatus: string;
  pendingStatus: string;
  postAction: string;
  editAction: string;
  viewFlyers: string;
  showingCount: (shown: number, total: number) => string;
  clearFilters: string;
  allMessages: string;

  // Onboarding Tour
  welcomeTitle: string;
  welcomeDesc: string;
  startTour: string;
  skipForNow: string;
  next: string;
  previous: string;
  finish: string;
  replayTour: string;
  tourNavChatsTitle: string;
  tourNavChatsDesc: string;
  tourChatFiltersTitle: string;
  tourChatFiltersDesc: string;
  tourChatMessagesTitle: string;
  tourChatMessagesDesc: string;
  tourChatActionsTitle: string;
  tourChatActionsDesc: string;
  tourNavLeadsTitle: string;
  tourNavLeadsDesc: string;
  tourLeadsToolsTitle: string;
  tourLeadsToolsDesc: string;
  tourLeadsListTitle: string;
  tourLeadsListDesc: string;
  tourNavStatsTitle: string;
  tourNavStatsDesc: string;
  tourStatsOverviewTitle: string;
  tourStatsOverviewDesc: string;
  tourNavReferralTitle: string;
  tourNavReferralDesc: string;
  tourReferralInviteTitle: string;
  tourReferralInviteDesc: string;
  tourReferralDownlineTitle: string;
  tourReferralDownlineDesc: string;
  tourNavAlertsTitle: string;
  tourNavAlertsDesc: string;
  tourAlertsListTitle: string;
  tourAlertsListDesc: string;
  skipTour: string;
  stepOf: (current: number, total: number) => string;
}

const en: TranslationDict = {
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  close: 'Close',
  back: 'Back',
  continue: 'Continue',
  submit: 'Submit',
  clear: 'Clear',
  search: 'Search',
  delete: 'Delete',
  edit: 'Edit',
  copy: 'Copy',
  copied: 'Copied!',
  loading: 'Loading...',
  refresh: 'Refresh',
  remove: 'Remove',
  required: 'Required',
  optional: 'Optional',

  english: 'English',
  spanish: 'Spanish (Español)',
  appLanguage: 'Application Language',
  selectLanguage: 'Select Language',

  login: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',
  getStartedHeading: 'Get Started with Alfa',
  getStartedSubtitle: 'Enter your details below to set up your workspace.',
  stepIndicator: (curr, total) => `Step ${curr} of ${total}`,
  backToLogin: 'Back to Login',
  profilePicture: 'Profile Picture',
  uploadPhoto: 'Upload Photo',
  changePhoto: 'Change Photo',
  removePhoto: 'Remove Photo',
  name: 'Name',
  instagramHandle: 'Instagram Handle',
  preferredFlyerLanguage: 'Preferred Flyer Language',
  preferredFlyerCategory: 'Preferred Flyer Category',
  selectCategory: 'Select category',
  workInjury: 'Work Injury',
  carAccident: 'Car Accident',
  email: 'Email',
  password: 'Password',
  showPassword: 'Show Password',
  hidePassword: 'Hide Password',
  phoneNumber: 'Phone Number',
  country: 'Country',
  state: 'State / Province',
  city: 'City',
  postalCode: 'Postal Code',
  selectCountry: 'Select Country',
  selectState: 'Select State / Region',
  enterCity: 'Enter City',
  enterPostalCode: 'Enter Postal Code',
  alreadyHaveAccount: 'Already have an account? Sign In',
  dontHaveAccount: 'Don\'t have an account? Sign Up',
  forgotPassword: 'Forgot Password?',
  passwordRequirements: 'Minimum 8 characters with at least one letter and number.',
  cityNameHint: 'Letters only — city name, no numbers.',
  postalCodeHint: 'Exactly 5 digits.',
  phoneDigitsHint: (current, max) => `${current} / ${max} digits`,
  step1Title: 'Personal profile',
  step2Title: 'Account & location',

  registrationSubmittedTitle: 'Registration Submitted',
  registrationSubmittedDesc: 'Your account has been created and is awaiting admin approval. You\'ll be able to access your workspace once your account is approved.',
  accountUnderReviewTitle: 'Account Under Review',
  accountUnderReviewDesc: 'Your registration is pending admin approval. Please check back after your account has been reviewed.',
  registrationNotApprovedTitle: 'Registration Not Approved',
  registrationNotApprovedDesc: 'Your account registration was not approved. Please contact the administrator for assistance.',
  checkStatus: 'Check Status / Refresh',

  flyer: 'Flyer',
  personalized: 'Personalized',
  normal: 'Normal',
  allCategories: 'All Categories',
  contentType: 'Content Type',

  conversations: 'Conversations',
  bulkSender: 'Bulk Sender',
  marketerRequests: 'Requests',
  analytics: 'Analytics',
  performance: 'Performance',
  referrals: 'Referrals',
  leads: 'Leads',
  help: 'Help',
  notifications: 'Notifications',
  profile: 'Profile',

  requestsTitle: 'Marketer Requests',
  requestsSubtitle: 'Review and manage marketer registrations.',
  pendingRequests: 'Pending Requests',
  approved: 'Approved',
  rejected: 'Rejected',
  totalMarketers: 'Total Marketers',
  allFilter: 'All',
  viewProfile: 'View Profile',
  approve: 'Approve',
  reject: 'Reject',
  revokeApproval: 'Revoke Approval',
  marketerApprovedSuccess: 'Marketer Approved Successfully',
  marketerRejectedSuccess: 'Marketer Request Rejected',
  confirmApproveTitle: 'Approve Marketer?',
  confirmApproveDesc: (name) => `Grant active workspace access and recipient eligibility to ${name}?`,
  confirmRejectTitle: 'Reject Marketer Request?',
  confirmRejectDesc: (name) => `Block workspace access and exclude ${name} from content distribution?`,
  rejectionReasonPlaceholder: 'Optional internal note or rejection reason...',
  registrationDate: 'Registration Date',
  approvalStatus: 'Approval Status',
  noRequestsFound: 'No marketer requests found matching current filter.',

  typeMessage: 'Type a message...',
  send: 'Send',
  sharedWithAll: 'Shared with all marketers',
  toRecipient: (name) => `To: ${name}`,
  postedStatus: 'Posted',
  notPostedStatus: 'Need Revision',
  pendingStatus: 'Pending',
  postAction: 'Post',
  editAction: 'Edit',
  viewFlyers: 'View Flyers',
  showingCount: (shown, total) => `Showing ${shown} of ${total} messages`,
  clearFilters: 'Clear Filters',
  allMessages: 'All Messages',

  welcomeTitle: 'Welcome to Alfa!',
  welcomeDesc:
    'You are approved and ready. We will highlight this page now — when you open other tabs for the first time, a short tour will run there too.',
  startTour: 'Start Quick Tour',
  skipForNow: 'Skip for Now',
  next: 'Next',
  previous: 'Previous',
  finish: 'Finish',
  replayTour: 'Replay Tour',
  tourNavChatsTitle: 'Chats tab',
  tourNavChatsDesc:
    'Tap Chats anytime from the bottom bar to open your inbox with admin creatives and messages.',
  tourChatFiltersTitle: 'Filters & search',
  tourChatFiltersDesc:
    'Filter by category, media type, and status — Pending, Posted, Revision, or Language Requested.',
  tourChatMessagesTitle: 'Message feed',
  tourChatMessagesDesc:
    'Flyers, personalized content, and notes from admin appear here in order. Scroll to review each deliverable.',
  tourChatActionsTitle: 'Post & copy actions',
  tourChatActionsDesc:
    'Open the ⋮ menu to mark content as Posted or Need Revision. Use Copy to grab captions before sharing.',
  tourNavLeadsTitle: 'Leads tab',
  tourNavLeadsDesc: 'Switch to Leads to register and manage accident contacts you bring in.',
  tourLeadsToolsTitle: 'New lead & filters',
  tourLeadsToolsDesc:
    'Tap New lead to add a contact. Search and filter by submission status or accident type.',
  tourLeadsListTitle: 'Your leads list',
  tourLeadsListDesc:
    'Each card shows status. Edit or delete within 24 hours; after that the lead locks.',
  tourNavStatsTitle: 'Stats tab',
  tourNavStatsDesc: 'Open Stats to see how your posting and lead activity are performing.',
  tourStatsOverviewTitle: 'Your performance dashboard',
  tourStatsOverviewDesc:
    'Filter by period, then review responses, lead capture by accident type, and content mix (flyers vs personalized).',
  tourNavReferralTitle: 'Referrals tab',
  tourNavReferralDesc: 'Grow your network by inviting other marketers from Referrals.',
  tourReferralInviteTitle: 'Invite link & code',
  tourReferralInviteDesc:
    'Share your referral link or copy your code. New signups with either join your network.',
  tourReferralDownlineTitle: 'Downline details',
  tourReferralDownlineDesc:
    'See Direct and Indirect referrals, filter the list, and track approval status.',
  tourNavAlertsTitle: 'Alerts tab',
  tourNavAlertsDesc: 'Alerts show new content, posting updates, and account activity.',
  tourAlertsListTitle: 'Notification feed',
  tourAlertsListDesc:
    'Tap an alert to jump to the related chat or action. Use Mark all read to clear the badge.',
  skipTour: 'Skip',
  stepOf: (current, total) => `Step ${current} of ${total}`
};

const es: TranslationDict = {
  save: 'Guardar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  close: 'Cerrar',
  back: 'Atrás',
  continue: 'Continuar',
  submit: 'Enviar',
  clear: 'Limpiar',
  search: 'Buscar',
  delete: 'Eliminar',
  edit: 'Editar',
  copy: 'Copiar',
  copied: '¡Copiado!',
  loading: 'Cargando...',
  refresh: 'Actualizar',
  remove: 'Quitar',
  required: 'Obligatorio',
  optional: 'Opcional',

  english: 'Inglés (English)',
  spanish: 'Español',
  appLanguage: 'Idioma de la Aplicación',
  selectLanguage: 'Seleccionar Idioma',

  login: 'Iniciar Sesión',
  signUp: 'Registrarse',
  signOut: 'Cerrar Sesión',
  getStartedHeading: 'Comienza con Alfa',
  getStartedSubtitle: 'Ingresa tus datos a continuación para configurar tu espacio de trabajo.',
  stepIndicator: (curr, total) => `Paso ${curr} de ${total}`,
  backToLogin: 'Volver a Iniciar Sesión',
  profilePicture: 'Foto de Perfil',
  uploadPhoto: 'Subir Foto',
  changePhoto: 'Cambiar Foto',
  removePhoto: 'Eliminar Foto',
  name: 'Nombre',
  instagramHandle: 'Usuario de Instagram',
  preferredFlyerLanguage: 'Idioma Preferido de Folletos',
  preferredFlyerCategory: 'Categoría Preferida de Folletos',
  selectCategory: 'Seleccionar categoría',
  workInjury: 'Accidente Laboral',
  carAccident: 'Accidente de Auto',
  email: 'Correo Electrónico',
  password: 'Contraseña',
  showPassword: 'Ver Contraseña',
  hidePassword: 'Ocultar Contraseña',
  phoneNumber: 'Número de Teléfono',
  country: 'País',
  state: 'Estado / Región',
  city: 'Ciudad',
  postalCode: 'Código Postal',
  selectCountry: 'Seleccionar País',
  selectState: 'Seleccionar Estado / Región',
  enterCity: 'Ingresar Ciudad',
  enterPostalCode: 'Ingresar Código Postal',
  alreadyHaveAccount: '¿Ya tienes una cuenta? Inicia Sesión',
  dontHaveAccount: '¿No tienes una cuenta? Regístrate',
  forgotPassword: '¿Olvidaste tu contraseña?',
  passwordRequirements: 'Mínimo 8 caracteres con al menos una letra y un número.',
  cityNameHint: 'Solo letras — nombre de ciudad, sin números.',
  postalCodeHint: 'Exactamente 5 dígitos.',
  phoneDigitsHint: (current, max) => `${current} / ${max} dígitos`,
  step1Title: 'Perfil personal',
  step2Title: 'Cuenta y ubicación',

  registrationSubmittedTitle: 'Registro Enviado',
  registrationSubmittedDesc: 'Tu cuenta ha sido creada y está esperando aprobación de un administrador. Podrás acceder a tu espacio de trabajo una vez aprobada.',
  accountUnderReviewTitle: 'Cuenta en Revisión',
  accountUnderReviewDesc: 'Tu registro está pendiente de aprobación por el administrador. Vuelve a consultar después de que tu cuenta haya sido revisada.',
  registrationNotApprovedTitle: 'Registro No Aprobado',
  registrationNotApprovedDesc: 'El registro de tu cuenta no fue aprobado. Por favor contacta al administrador para recibir asistencia.',
  checkStatus: 'Verificar Estado / Actualizar',

  flyer: 'Folleto',
  personalized: 'Personalizado',
  normal: 'Normal',
  allCategories: 'Todas las Categorías',
  contentType: 'Tipo de Contenido',

  conversations: 'Conversaciones',
  bulkSender: 'Envío Masivo',
  marketerRequests: 'Solicitudes',
  analytics: 'Analítica',
  performance: 'Rendimiento',
  referrals: 'Referidos',
  leads: 'Leads',
  help: 'Ayuda',
  notifications: 'Notificaciones',
  profile: 'Perfil',

  requestsTitle: 'Solicitudes de Asesores',
  requestsSubtitle: 'Revisa y gestiona los registros de nuevos asesores.',
  pendingRequests: 'Solicitudes Pendientes',
  approved: 'Aprobados',
  rejected: 'Rechazados',
  totalMarketers: 'Total de Asesores',
  allFilter: 'Todos',
  viewProfile: 'Ver Perfil',
  approve: 'Aprobar',
  reject: 'Rechazar',
  revokeApproval: 'Revocar Aprobación',
  marketerApprovedSuccess: 'Asesor Aprobado con Éxito',
  marketerRejectedSuccess: 'Solicitud de Asesor Rechazada',
  confirmApproveTitle: '¿Aprobar Asesor?',
  confirmApproveDesc: (name) => `¿Conceder acceso al espacio de trabajo y elegibilidad de mensajes a ${name}?`,
  confirmRejectTitle: '¿Rechazar Solicitud?',
  confirmRejectDesc: (name) => `¿Bloquear el acceso y excluir a ${name} de la distribución de campañas?`,
  rejectionReasonPlaceholder: 'Nota interna opcional o motivo de rechazo...',
  registrationDate: 'Fecha de Registro',
  approvalStatus: 'Estado de Aprobación',
  noRequestsFound: 'No se encontraron solicitudes con el filtro seleccionado.',

  typeMessage: 'Escribe un mensaje...',
  send: 'Enviar',
  sharedWithAll: 'Compartido con todos los asesores',
  toRecipient: (name) => `Para: ${name}`,
  postedStatus: 'Publicado',
  notPostedStatus: 'Necesita revisión',
  pendingStatus: 'Pendiente',
  postAction: 'Publicar',
  editAction: 'Editar',
  viewFlyers: 'Ver Folletos',
  showingCount: (shown, total) => `Mostrando ${shown} de ${total} mensajes`,
  clearFilters: 'Limpiar Filtros',
  allMessages: 'Todos los Mensajes',

  welcomeTitle: '¡Bienvenido a Alfa!',
  welcomeDesc:
    'Ya estás aprobado. Resaltaremos esta pantalla ahora — al abrir otras pestañas por primera vez, verás un recorrido corto allí también.',
  startTour: 'Comenzar recorrido',
  skipForNow: 'Omitir por ahora',
  next: 'Siguiente',
  previous: 'Anterior',
  finish: 'Finalizar',
  replayTour: 'Repetir recorrido',
  tourNavChatsTitle: 'Pestaña Chats',
  tourNavChatsDesc:
    'Toca Chats en la barra inferior para abrir tu bandeja con creativos y mensajes del admin.',
  tourChatFiltersTitle: 'Filtros y búsqueda',
  tourChatFiltersDesc:
    'Filtra por Publicado, Pendiente o Retenido. Busca texto, elige tipo de contenido o solo Media.',
  tourChatMessagesTitle: 'Feed de mensajes',
  tourChatMessagesDesc:
    'Aquí aparecen flyers, contenido personalizado y notas del admin. Desplázate para revisar cada entrega.',
  tourChatActionsTitle: 'Acciones Post y copiar',
  tourChatActionsDesc:
    'Marca como Publicado o Editar/No Publicado. Usa Copiar para capturar textos antes de compartir.',
  tourNavLeadsTitle: 'Pestaña Leads',
  tourNavLeadsDesc: 'Cambia a Leads para registrar y gestionar los contactos que captas.',
  tourLeadsToolsTitle: 'Nuevo lead y filtros',
  tourLeadsToolsDesc:
    'Toca New lead para agregar. Busca y filtra por estado de envío o tipo de accidente.',
  tourLeadsListTitle: 'Lista de leads',
  tourLeadsListDesc:
    'Cada tarjeta muestra el estado. Edita o elimina dentro de 24 horas; luego se bloquea.',
  tourNavStatsTitle: 'Pestaña Stats',
  tourNavStatsDesc: 'Abre Stats para ver el rendimiento de publicaciones y leads.',
  tourStatsOverviewTitle: 'Tu panel de rendimiento',
  tourStatsOverviewDesc:
    'Filtra por periodo y revisa respuestas, captura de leads por tipo de accidente y mezcla de contenido (flyers vs personalizado).',
  tourNavReferralTitle: 'Pestaña Referidos',
  tourNavReferralDesc: 'Haz crecer tu red invitando marketers desde Referidos.',
  tourReferralInviteTitle: 'Enlace y código',
  tourReferralInviteDesc:
    'Comparte tu enlace o copia tu código. Quien se registre con cualquiera entra a tu red.',
  tourReferralDownlineTitle: 'Detalle de red',
  tourReferralDownlineDesc:
    'Mira Directos e Indirectos, filtra la lista y sigue el estado de aprobación.',
  tourNavAlertsTitle: 'Pestaña Alertas',
  tourNavAlertsDesc: 'Las alertas muestran nuevo contenido, publicaciones y actividad de cuenta.',
  tourAlertsListTitle: 'Feed de notificaciones',
  tourAlertsListDesc:
    'Toca una alerta para ir al chat o acción. Usa Marcar todo leído para limpiar el badge.',
  skipTour: 'Omitir',
  stepOf: (current, total) => `Paso ${current} de ${total}`
};

export const translations: Record<AppLanguage, TranslationDict> = { en, es };

export const getTranslation = (lang: AppLanguage = 'en'): TranslationDict => {
  return translations[lang] || translations.en;
};
