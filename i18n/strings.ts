// Translation keys as constants for easier usage
export const strings = {
  // Navigation
  home: 'home',
  events: 'events',
  contacts: 'contacts',
  profile: 'profile',
  
  // Common actions
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  save: 'save',
  cancel: 'cancel',
  confirm: 'confirm',
  back: 'back',
  next: 'next',
  done: 'done',
  
  // Events
  addEvent: 'addEvent',
  editEvent: 'editEvent',
  eventName: 'eventName',
  eventDate: 'eventDate',
  eventDescription: 'eventDescription',
  eventLocation: 'eventLocation',
  eventParticipants: 'eventParticipants',
  eventExpenses: 'eventExpenses',
  eventBalance: 'eventBalance',
  noEvents: 'noEvents',
  createFirstEvent: 'createFirstEvent',
  
  // Expenses
  addExpense: 'addExpense',
  editExpense: 'editExpense',
  expenseName: 'expenseName',
  expenseAmount: 'expenseAmount',
  expenseCategory: 'expenseCategory',
  expensePaidBy: 'expensePaidBy',
  expenseSplitBetween: 'expenseSplitBetween',
  expenseDate: 'expenseDate',
  expenseNotes: 'expenseNotes',
  expenseCategories: {
    food: 'expenseCategories.food',
    transport: 'expenseCategories.transport',
    entertainment: 'expenseCategories.entertainment',
    accommodation: 'expenseCategories.accommodation',
    other: 'expenseCategories.other'
  },
  
  // Contacts
  addContact: 'addContact',
  editContact: 'editContact',
  contactName: 'contactName',
  contactPhone: 'contactPhone',
  contactEmail: 'contactEmail',
  contactAvatar: 'contactAvatar',
  noContacts: 'noContacts',
  createFirstContact: 'createFirstContact',
  
  // Profile
  appAppearance: 'appAppearance',
  theme: 'theme',
  appLanguage: 'appLanguage',
  personalInfo: 'personalInfo',
  about: 'about',
  help: 'help',
  faq: 'faq',
  terms: 'terms',
  privacy: 'privacy',
  
  // Theme options
  systemDefault: 'systemDefault',
  light: 'light',
  dark: 'dark',
  
  // Language options
  english: 'english',
  polish: 'polish',
  ukrainian: 'ukrainian',
  
  // Auth
  login: 'login',
  register: 'register',
  forgotPassword: 'forgotPassword',
  email: 'email',
  password: 'password',
  confirmPassword: 'confirmPassword',
  firstName: 'firstName',
  lastName: 'lastName',
  signIn: 'signIn',
  signUp: 'signUp',
  resetPassword: 'resetPassword',
  logout: 'logout',
  
  // Onboarding
  welcome: 'welcome',
  welcomeSubtitle: 'welcomeSubtitle',
  getStarted: 'getStarted',
  skip: 'skip',
  
  // Messages
  loading: 'loading',
  error: 'error',
  success: 'success',
  warning: 'warning',
  info: 'info',
  
  // Validation
  required: 'required',
  invalidEmail: 'invalidEmail',
  passwordTooShort: 'passwordTooShort',
  passwordsDoNotMatch: 'passwordsDoNotMatch',
  
  // Currency
  currency: 'currency',
  usd: 'usd',
  eur: 'eur',
  pln: 'pln',
  uah: 'uah',
} as const;

// Type for string keys
export type StringKey = keyof typeof strings;

// Events Screen
export const EVENTS = {
  TITLE: 'events.title',
  SEARCH_PLACEHOLDER: 'events.searchPlaceholder',
  NO_EVENTS: 'events.noEvents',
  NO_EVENTS_SUBTEXT: 'events.noEventsSubtext',
} as const;

// Add Event Screen
export const ADD_EVENT = {
  TITLE: 'addEventScreen.title',
  SELECT_PARTICIPANTS: 'addEventScreen.selectParticipants',
  UPLOAD_COVER_IMAGE: 'addEventScreen.uploadCoverImage',
  TITLE_LABEL: 'addEventScreen.titleLabel',
  TITLE_PLACEHOLDER: 'addEventScreen.titlePlaceholder',
  DESCRIPTION_LABEL: 'addEventScreen.descriptionLabel',
  DESCRIPTION_PLACEHOLDER: 'addEventScreen.descriptionPlaceholder',
  CURRENCY_LABEL: 'addEventScreen.currencyLabel',
  CURRENCY_PLACEHOLDER: 'addEventScreen.currencyPlaceholder',
  CATEGORY_LABEL: 'addEventScreen.categoryLabel',
  ALL_CONTACTS: 'addEventScreen.allContacts',
  FAVORITES: 'addEventScreen.favorites',
  SEARCH_CONTACT: 'addEventScreen.searchContact',
  NO_CONTACTS_FOUND: 'addEventScreen.noContactsFound',
  YOU_TAG: 'addEventScreen.youTag',
  CANCEL: 'addEventScreen.cancel',
  CONTINUE: 'addEventScreen.continue',
  SAVE: 'addEventScreen.save',
  ERROR_TITLE_REQUIRED: 'addEventScreen.errorTitleRequired',
  ERROR_DESCRIPTION_REQUIRED: 'addEventScreen.errorDescriptionRequired',
  ERROR_CURRENCY_REQUIRED: 'addEventScreen.errorCurrencyRequired',
  ERROR_PARTICIPANTS_REQUIRED: 'addEventScreen.errorParticipantsRequired',
  PERMISSION_REQUIRED: 'addEventScreen.permissionRequired',
  PERMISSION_MESSAGE: 'addEventScreen.permissionMessage',
} as const;

// Contacts Screen
export const CONTACTS = {
  TITLE: 'contactsScreen.title',
  SEARCH_PLACEHOLDER: 'contactsScreen.searchPlaceholder',
  ALL_CONTACTS: 'contactsScreen.allContacts',
  FAVORITES: 'contactsScreen.favorites',
  NO_CONTACTS_FOUND: 'contactsScreen.noContactsFound',
} as const;

// Profile Screen
export const PROFILE = {
  TITLE: 'PROFILE_SCREEN.TITLE',
  PERSONAL_INFO: 'PROFILE_SCREEN.PERSONAL_INFO',
  APP_APPEARANCE: 'PROFILE_SCREEN.APP_APPEARANCE',
  HELP: 'PROFILE_SCREEN.HELP',
  ABOUT_US: 'PROFILE_SCREEN.ABOUT_US',
  LOGOUT: 'PROFILE_SCREEN.LOGOUT',
  LOGOUT_CONFIRMATION: 'PROFILE_SCREEN.LOGOUT_CONFIRMATION',
  LOGOUT_MESSAGE: 'PROFILE_SCREEN.LOGOUT_MESSAGE',
  CANCEL: 'PROFILE_SCREEN.CANCEL',
} as const;

// About Screen
export const ABOUT = {
  TITLE: 'about.title',
  APP_NAME: 'about.appName',
  DESCRIPTION: 'about.description',
  FEATURES_TITLE: 'about.featuresTitle',
  FEATURE_1: 'about.feature1',
  FEATURE_2: 'about.feature2',
  FEATURE_3: 'about.feature3',
  FEATURE_4: 'about.feature4',
  FEATURE_5: 'about.feature5',
  FEATURE_6: 'about.feature6',
  MISSION: 'about.mission',
  VERSION: 'about.version',
  DEVELOPER: 'about.developer',
  CONTACT: 'about.contact',
  WEBSITE: 'about.website',
  PRIVACY_POLICY: 'about.privacyPolicy',
  TERMS_OF_SERVICE: 'about.termsOfService',
} as const;

// FAQ Screen
export const FAQ = {
  TITLE: 'faq.title',
  QUESTION_1: 'faq.question1',
  ANSWER_1: 'faq.answer1',
  QUESTION_2: 'faq.question2',
  ANSWER_2: 'faq.answer2',
  QUESTION_3: 'faq.question3',
  ANSWER_3: 'faq.answer3',
  QUESTION_4: 'faq.question4',
  ANSWER_4: 'faq.answer4',
  QUESTION_5: 'faq.question5',
  ANSWER_5: 'faq.answer5',
} as const;

// Help Screen
export const HELP = {
  TITLE: 'help.title',
  GETTING_STARTED: 'help.gettingStarted',
  GETTING_STARTED_DESC: 'help.gettingStartedDesc',
  CREATING_EVENTS: 'help.creatingEvents',
  CREATING_EVENTS_DESC: 'help.creatingEventsDesc',
  ADDING_EXPENSES: 'help.addingExpenses',
  ADDING_EXPENSES_DESC: 'help.addingExpensesDesc',
  MANAGING_CONTACTS: 'help.managingContacts',
  MANAGING_CONTACTS_DESC: 'help.managingContactsDesc',
  SETTINGS: 'help.settings',
  SETTINGS_DESC: 'help.settingsDesc',
  CONTACT_SUPPORT: 'help.contactSupport',
  CONTACT_SUPPORT_DESC: 'help.contactSupportDesc',
  FAQ: 'help.faq',
  TERMS_OF_SERVICE: 'help.termsOfService',
  SUPPORT_TEXT: 'help.supportText',
  SUPPORT_EMAIL: 'help.supportEmail',
} as const;

// Event Details Screen
export const EVENT_DETAILS = {
  EXPENSES: 'eventDetails.expenses',
  BALANCES: 'eventDetails.balances',
  TOTALS: 'eventDetails.totals',
  GROUP_INFO: 'eventDetails.groupInfo',
  ADD_EXPENSE: 'eventDetails.addExpense',
  ADD_PARTICIPANT: 'eventDetails.addParticipant',
  EDIT_EVENT: 'eventDetails.editEvent',
  DELETE_EVENT: 'eventDetails.deleteEvent',
  DELETE_CONFIRMATION: 'eventDetails.deleteConfirmation',
  DELETE_MESSAGE: 'eventDetails.deleteMessage',
  REMOVE_PARTICIPANT: 'eventDetails.removeParticipant',
  REMOVE_CONFIRMATION: 'eventDetails.removeConfirmation',
  REMOVE_MESSAGE: 'eventDetails.removeMessage',
  NO_EXPENSES: 'eventDetails.noExpenses',
  NO_EXPENSES_SUBTEXT: 'eventDetails.noExpensesSubtext',
  TOTAL_SPENT: 'eventDetails.totalSpent',
  BALANCE: 'eventDetails.balance',
  OWES: 'eventDetails.owes',
  OWED: 'eventDetails.owed',
  SETTLED: 'eventDetails.settled',
  OPTIMAL_TRANSACTIONS: 'eventDetails.optimalTransactions',
  PAYS: 'eventDetails.pays',
  TO: 'eventDetails.to',
  PAID_BY: 'eventDetails.paidBy',
  GROUP_TITLE: 'eventDetails.groupTitle',
  DESCRIPTION: 'eventDetails.description',
  CURRENCY: 'eventDetails.currency',
  CATEGORY: 'eventDetails.category',
  GROUP_MEMBERS: 'eventDetails.groupMembers',
  CANCEL: 'eventDetails.cancel',
  TOTAL_GROUP_SPENDING: 'eventDetails.totalGroupSpending',
  NO_EXPENSES_YET: 'eventDetails.noExpensesYet',
} as const;

// Add Contact Screen
export const ADD_CONTACT = {
  TITLE: 'addContact.title',
  ACCOUNT_HOLDER_NAME: 'addContact.accountHolderName',
  NAME_PLACEHOLDER: 'addContact.namePlaceholder',
  EMAIL: 'addContact.email',
  EMAIL_PLACEHOLDER: 'addContact.emailPlaceholder',
  PERMISSION_REQUIRED: 'addContact.permissionRequired',
  PERMISSION_MESSAGE: 'addContact.permissionMessage',
  FILL_ALL_FIELDS: 'addContact.fillAllFields',
  VALID_EMAIL: 'addContact.validEmail',
  CANCEL: 'addContact.cancel',
  ADD_CONTACT: 'addContact.addContact',
  ADDING: 'addContact.adding',
} as const;

// Contact Details Screen
export const CONTACT_DETAILS = {
  TITLE: 'contactDetails.title',
  CONTACT_NOT_FOUND: 'contactDetails.contactNotFound',
  PERMISSION_REQUIRED: 'contactDetails.permissionRequired',
  PERMISSION_MESSAGE: 'contactDetails.permissionMessage',
  FILL_ALL_FIELDS: 'contactDetails.fillAllFields',
  VALID_EMAIL: 'contactDetails.validEmail',
  NAME_PLACEHOLDER: 'contactDetails.namePlaceholder',
  EMAIL_PLACEHOLDER: 'contactDetails.emailPlaceholder',
  SPLITTER_ACCOUNT: 'contactDetails.SPLITTERAccount',
  DELETE_CONTACT: 'contactDetails.deleteContact',
  DELETE_CONTACT_TITLE: 'contactDetails.deleteContactTitle',
  DELETE_CONTACT_MESSAGE: 'contactDetails.deleteContactMessage',
  YES_DELETE: 'contactDetails.yesDelete',
  CANCEL: 'contactDetails.cancel',
  EDIT: 'contactDetails.edit',
  SAVE: 'contactDetails.save',
} as const;

// Add Expense Screen
export const ADD_EXPENSE = {
  TITLE: 'addExpense.title',
  EXPENSE_NAME: 'addExpense.expenseName',
  EXPENSE_NAME_PLACEHOLDER: 'addExpense.expenseNamePlaceholder',
  AMOUNT: 'addExpense.amount',
  AMOUNT_PLACEHOLDER: 'addExpense.amountPlaceholder',
  CATEGORY: 'addExpense.category',
  SELECT_CATEGORY: 'addExpense.selectCategory',
  PAID_BY: 'addExpense.paidBy',
  SELECT_PAID_BY: 'addExpense.selectPaidBy',
  SPLIT_BETWEEN: 'addExpense.splitBetween',
  SELECT_SPLIT_BETWEEN: 'addExpense.selectSplitBetween',
  NOTES: 'addExpense.notes',
  NOTES_PLACEHOLDER: 'addExpense.notesPlaceholder',
  ADD_RECEIPT: 'addExpense.addReceipt',
  EQUALLY: 'addExpense.equally',
  UNEQUALLY: 'addExpense.unequally',
  SAVE_EXPENSE: 'addExpense.saveExpense',
  ERROR_TITLE_REQUIRED: 'addExpense.errorTitleRequired',
  ERROR_AMOUNT_REQUIRED: 'addExpense.errorAmountRequired',
  ERROR_PAID_BY_REQUIRED: 'addExpense.errorPaidByRequired',
  ERROR_SPLIT_REQUIRED: 'addExpense.errorSplitRequired',
  ERROR_AMOUNT_MISMATCH: 'addExpense.errorAmountMismatch',
  ERROR_SPLIT_MISMATCH: 'addExpense.errorSplitMismatch',
  PERMISSION_REQUIRED: 'addExpense.permissionRequired',
  PERMISSION_MESSAGE: 'addExpense.permissionMessage',
  CANCEL: 'addExpense.cancel',
} as const;

// Categories
export const CATEGORIES = {
  GENERAL: 'categories.general',
  GAMES: 'categories.games',
  MOVIES: 'categories.movies',
  MUSIC: 'categories.music',
  SPORTS: 'categories.sports',
  GROCERIES: 'categories.groceries',
  DINING: 'categories.dining',
  LIQUOR: 'categories.liquor',
  SHOPPING: 'categories.shopping',
  TRANSPORT: 'categories.transport',
  ACCOMMODATION: 'categories.accommodation',
  ENTERTAINMENT: 'categories.entertainment',
  HEALTH: 'categories.health',
  EDUCATION: 'categories.education',
  OTHER: 'categories.other',
  TRIP: 'categories.trip',
  FAMILY: 'categories.family',
  COUPLE: 'categories.couple',
  EVENT: 'categories.event',
  PROJECT: 'categories.project',
} as const;

// Personal Info Screen
export const PERSONAL_INFO = {
  TITLE: 'PERSONAL_INFO_SCREEN.TITLE',
  FIRST_NAME: 'PERSONAL_INFO_SCREEN.FIRST_NAME',
  LAST_NAME: 'PERSONAL_INFO_SCREEN.LAST_NAME',
  EMAIL: 'PERSONAL_INFO_SCREEN.EMAIL',
  PHONE: 'PERSONAL_INFO_SCREEN.PHONE',
  NAME_LABEL: 'PERSONAL_INFO_SCREEN.NAME_LABEL',
  NAME_PLACEHOLDER: 'PERSONAL_INFO_SCREEN.NAME_PLACEHOLDER',
  EMAIL_LABEL: 'PERSONAL_INFO_SCREEN.EMAIL_LABEL',
  EMAIL_PLACEHOLDER: 'PERSONAL_INFO_SCREEN.EMAIL_PLACEHOLDER',
  SAVE_CHANGES: 'PERSONAL_INFO_SCREEN.SAVE_CHANGES',
  SAVE: 'PERSONAL_INFO_SCREEN.SAVE',
  SAVING: 'PERSONAL_INFO_SCREEN.SAVING',
  CHANGES_SAVED: 'PERSONAL_INFO_SCREEN.CHANGES_SAVED',
  ERROR_SAVING: 'PERSONAL_INFO_SCREEN.ERROR_SAVING',
  ERROR: 'PERSONAL_INFO_SCREEN.ERROR',
  PERMISSION_REQUIRED: 'PERSONAL_INFO_SCREEN.PERMISSION_REQUIRED',
  PERMISSION_MESSAGE: 'PERSONAL_INFO_SCREEN.PERMISSION_MESSAGE',
} as const;

// Terms of Service Screen
export const TERMS = {
  TITLE: 'terms.title',
  LAST_UPDATED: 'terms.lastUpdated',
  ACCEPTANCE: 'terms.acceptance',
  ACCEPTANCE_TEXT: 'terms.acceptanceText',
  USE_LICENSE: 'terms.useLicense',
  USE_LICENSE_TEXT: 'terms.useLicenseText',
  DISCLAIMER: 'terms.disclaimer',
  DISCLAIMER_TEXT: 'terms.disclaimerText',
  LIMITATIONS: 'terms.limitations',
  LIMITATIONS_TEXT: 'terms.limitationsText',
  PRIVACY: 'terms.privacy',
  PRIVACY_TEXT: 'terms.privacyText',
  CHANGES: 'terms.changes',
  CHANGES_TEXT: 'terms.changesText',
  CONTACT: 'terms.contact',
  CONTACT_TEXT: 'terms.contactText',
} as const;

// Edit Event Screen
export const EDIT_EVENT = {
  TITLE: 'editEvent.title',
  TITLE_LABEL: 'editEvent.titleLabel',
  TITLE_PLACEHOLDER: 'editEvent.titlePlaceholder',
  DESCRIPTION_LABEL: 'editEvent.descriptionLabel',
  DESCRIPTION_PLACEHOLDER: 'editEvent.descriptionPlaceholder',
  CURRENCY_LABEL: 'editEvent.currencyLabel',
  CURRENCY_PLACEHOLDER: 'editEvent.currencyPlaceholder',
  CATEGORY_LABEL: 'editEvent.categoryLabel',
  UPLOAD_IMAGE: 'editEvent.uploadImage',
  ERROR: 'editEvent.error',
  TITLE_REQUIRED: 'editEvent.titleRequired',
  DESCRIPTION_REQUIRED: 'editEvent.descriptionRequired',
  CURRENCY_REQUIRED: 'editEvent.currencyRequired',
  PERMISSION_REQUIRED: 'editEvent.permissionRequired',
  PERMISSION_MESSAGE: 'editEvent.permissionMessage',
  SAVE: 'editEvent.save',
  SAVING: 'editEvent.saving',
  CANCEL: 'editEvent.cancel',
  EVENT_NAME: 'editEvent.eventName',
  EVENT_NAME_PLACEHOLDER: 'editEvent.eventNamePlaceholder',
  DESCRIPTION: 'editEvent.description',
  SELECT_CURRENCY: 'editEvent.selectCurrency',
  PARTICIPANTS: 'editEvent.participants',
  ADD_PARTICIPANT: 'editEvent.addParticipant',
  REMOVE_PARTICIPANT: 'editEvent.removeParticipant',
  SAVE_CHANGES: 'editEvent.saveChanges',
  DELETE_EVENT: 'editEvent.deleteEvent',
  DELETE_CONFIRMATION: 'editEvent.deleteConfirmation',
  DELETE_MESSAGE: 'editEvent.deleteMessage',
  CONFIRM: 'editEvent.confirm',
} as const;

// Edit Expense Screen
export const EDIT_EXPENSE = {
  TITLE: 'editExpense.title',
  TITLE_LABEL: 'editExpense.titleLabel',
  TITLE_PLACEHOLDER: 'editExpense.titlePlaceholder',
  AMOUNT_LABEL: 'editExpense.amountLabel',
  AMOUNT_PLACEHOLDER: 'editExpense.amountPlaceholder',
  CATEGORY_LABEL: 'editExpense.categoryLabel',
  CATEGORY: 'editExpense.category',
  SELECT_CATEGORY: 'editExpense.selectCategory',
  PAID_BY: 'editExpense.paidBy',
  PAID_BY_LABEL: 'editExpense.paidByLabel',
  SELECT_PAID_BY: 'editExpense.selectPaidBy',
  SPLIT_BETWEEN: 'editExpense.splitBetween',
  SPLIT_BY_LABEL: 'editExpense.splitByLabel',
  SELECT_SPLIT_BETWEEN: 'editExpense.selectSplitBetween',
  EQUALLY_BETWEEN_ALL: 'editExpense.equallyBetweenAll',
  SELECTED: 'editExpense.selected',
  NOTES: 'editExpense.notes',
  NOTES_LABEL: 'editExpense.notesLabel',
  NOTES_PLACEHOLDER: 'editExpense.notesPlaceholder',
  ADD_RECEIPT: 'editExpense.addReceipt',
  ADD_IMAGE: 'editExpense.addImage',
  EQUALLY: 'editExpense.equally',
  UNEQUALLY: 'editExpense.unequally',
  PEOPLE: 'editExpense.people',
  SAVE_CHANGES: 'editExpense.saveChanges',
  SAVE: 'editExpense.save',
  OK: 'editExpense.ok',
  DELETE_EXPENSE: 'editExpense.deleteExpense',
  DELETE_CONFIRMATION: 'editExpense.deleteConfirmation',
  DELETE_MESSAGE: 'editExpense.deleteMessage',
  CANCEL: 'editExpense.cancel',
  CONFIRM: 'editExpense.confirm',
  PERMISSION_REQUIRED: 'editExpense.permissionRequired',
  PERMISSION_MESSAGE: 'editExpense.permissionMessage',
  UNKNOWN_MEMBER: 'editExpense.unknownMember',
  ERROR_TITLE_REQUIRED: 'editExpense.errorTitleRequired',
  ERROR_AMOUNT_REQUIRED: 'editExpense.errorAmountRequired',
  ERROR_PAID_BY_REQUIRED: 'editExpense.errorPaidByRequired',
  ERROR_SPLIT_REQUIRED: 'editExpense.errorSplitRequired',
  ERROR_AMOUNT_MISMATCH: 'editExpense.errorAmountMismatch',
  ERROR_SPLIT_MISMATCH: 'editExpense.errorSplitMismatch',
  ASSIGN_REMAINDER: 'editExpense.assignRemainder',
  TOTAL_PAID: 'editExpense.totalPaid',
  TOTAL_SPLIT: 'editExpense.totalSplit',
  ASSIGN: 'editExpense.assign',
  CHOOSE_FROM_LIBRARY: 'editExpense.chooseFromLibrary',
  IMAGE: 'editExpense.image',
  CHANGE_IMAGE: 'editExpense.changeImage',
  REMOVE_IMAGE: 'editExpense.removeImage',
  PAID_BY_ERROR_TITLE: 'editExpense.paidByErrorTitle',
  PAID_BY_ERROR_MESSAGE: 'editExpense.paidByErrorMessage',
} as const;

// Edit Group Screen
export const EDIT_GROUP = {
  TITLE: 'editGroup.title',
  SAVE: 'editGroup.save',
  DELETE: 'editGroup.delete',
  DELETE_CONFIRMATION: 'editGroup.deleteConfirmation',
  DELETE_MESSAGE: 'editGroup.deleteMessage',
  YES_DELETE: 'editGroup.yesDelete',
  CANCEL: 'editGroup.cancel',
} as const;

// Expense Details Screen
export const EXPENSE_DETAILS = {
  ERROR: 'expenseDetails.error',
  EXPENSE_NOT_FOUND: 'expenseDetails.expenseNotFound',
  EXPENSE_NOT_FOUND_MESSAGE: 'expenseDetails.expenseNotFoundMessage',
  RETURN_TO_EVENT: 'expenseDetails.returnToEvent',
  UNKNOWN_MEMBER: 'expenseDetails.unknownMember',
  PAID_BY: 'expenseDetails.paidBy',
  SPLIT_BETWEEN: 'expenseDetails.splitBetween',
  NOTES: 'expenseDetails.notes',
  EDIT: 'expenseDetails.edit',
  DELETE: 'expenseDetails.delete',
  DELETE_CONFIRMATION: 'expenseDetails.deleteConfirmation',
  DELETE_MESSAGE: 'expenseDetails.deleteMessage',
  YES_DELETE: 'expenseDetails.yesDelete',
  CANCEL: 'expenseDetails.cancel',
} as const;

export const EXPENSE_CATEGORIES = {
  GENERAL: 'expenseCategories.general',
  GAMES: 'expenseCategories.games',
  MOVIES: 'expenseCategories.movies',
  MUSIC: 'expenseCategories.music',
  SPORTS: 'expenseCategories.sports',
  GROCERIES: 'expenseCategories.groceries',
  DINING: 'expenseCategories.dining',
  LIQUOR: 'expenseCategories.liquor',
  SHOPPING: 'expenseCategories.shopping',
  TRANSPORT: 'expenseCategories.transport',
  ACCOMMODATION: 'expenseCategories.accommodation',
  ENTERTAINMENT: 'expenseCategories.entertainment',
  HEALTH: 'expenseCategories.health',
  EDUCATION: 'expenseCategories.education',
  OTHER: 'expenseCategories.other',
} as const;

export const GROUP_CATEGORIES = {
  TRIP: 'groupCategories.trip',
  FAMILY: 'groupCategories.family',
  COUPLE: 'groupCategories.couple',
  EVENT: 'groupCategories.event',
  PROJECT: 'groupCategories.project',
  OTHER: 'groupCategories.other',
} as const;

export const GROUP_CATEGORY_EMOJIS = {
  TRIP: '✈️',
  FAMILY: '👨‍👩‍👧‍👦',
  COUPLE: '💑',
  EVENT: '🎬',
  PROJECT: '💼',
  OTHER: '☘️',
} as const;

// Onboarding
export const ONBOARDING = {
  SLIDE_1_TITLE: 'onboarding.slide1.title',
  SLIDE_1_DESC: 'onboarding.slide1.desc',
  SLIDE_2_TITLE: 'onboarding.slide2.title',
  SLIDE_2_DESC: 'onboarding.slide2.desc',
  SLIDE_3_TITLE: 'onboarding.slide3.title',
  SLIDE_3_DESC: 'onboarding.slide3.desc',
  GET_STARTED: 'onboarding.getStarted',
} as const; 