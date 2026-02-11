import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Supported languages
export type Language = 'en' | 'fil' | 'es';

// Translation keys
type TranslationKey = 
  // Common
  | 'common.save' | 'common.cancel' | 'common.delete' | 'common.edit' | 'common.add' | 'common.search'
  | 'common.export' | 'common.loading' | 'common.noData' | 'common.success' | 'common.error'
  | 'common.view' | 'common.close' | 'common.confirm' | 'common.yes' | 'common.no'
  // Navigation
  | 'nav.dashboard' | 'nav.employees' | 'nav.payroll' | 'nav.reports' | 'nav.settings' | 'nav.monitoring' | 'nav.notifications' | 'nav.logout'
  // Dashboard
  | 'dashboard.title' | 'dashboard.totalTrees' | 'dashboard.activeEmployees' | 'dashboard.totalHarvest' | 'dashboard.totalSalaries'
  | 'dashboard.quickActions' | 'dashboard.recentActivity' | 'dashboard.generateReport' | 'dashboard.viewMonitoring'
  // Employees
  | 'employees.title' | 'employees.addNew' | 'employees.totalFarmers' | 'employees.activeFarmers' | 'employees.assignedTrees' | 'employees.avgQuality'
  | 'employees.searchPlaceholder' | 'employees.sortBy' | 'employees.name' | 'employees.location' | 'employees.status' | 'employees.joinDate'
  | 'employees.harvest' | 'employees.quality' | 'employees.viewTrees' | 'employees.deleteConfirm'
  // Payroll
  | 'payroll.title' | 'payroll.totalPayroll' | 'payroll.pending' | 'payroll.processing' | 'payroll.completed' | 'payroll.onHold'
  | 'payroll.processAll' | 'payroll.exportPayroll' | 'payroll.bonuses' | 'payroll.deductions' | 'payroll.netPay' | 'payroll.grossPay'
  // Reports
  | 'reports.title' | 'reports.disputes' | 'reports.notifications' | 'reports.analytics' | 'reports.qualityReports'
  // Settings
  | 'settings.title' | 'settings.general' | 'settings.sensors' | 'settings.alerts' | 'settings.saveChanges'
  // Login
  | 'login.title' | 'login.email' | 'login.password' | 'login.signIn' | 'login.forgotPassword' | 'login.resetPassword';

// Translations for each language
const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.export': 'Export',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.view': 'View',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.employees': 'Employees',
    'nav.payroll': 'Payroll',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.monitoring': 'Monitoring',
    'nav.notifications': 'Notifications',
    'nav.logout': 'Logout',
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.totalTrees': 'Total Trees',
    'dashboard.activeEmployees': 'Active Employees',
    'dashboard.totalHarvest': 'Total Harvest',
    'dashboard.totalSalaries': 'Total Salaries',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.generateReport': 'Generate Report',
    'dashboard.viewMonitoring': 'View Monitoring',
    // Employees
    'employees.title': 'Employee Management',
    'employees.addNew': 'Add New Farmer',
    'employees.totalFarmers': 'Total Farmers',
    'employees.activeFarmers': 'Active Farmers',
    'employees.assignedTrees': 'Assigned Trees',
    'employees.avgQuality': 'Avg Quality',
    'employees.searchPlaceholder': 'Search farmers by name or location...',
    'employees.sortBy': 'Sort by',
    'employees.name': 'Name',
    'employees.location': 'Location',
    'employees.status': 'Status',
    'employees.joinDate': 'Join Date',
    'employees.harvest': 'Harvest',
    'employees.quality': 'Quality',
    'employees.viewTrees': 'View Trees',
    'employees.deleteConfirm': 'Are you sure you want to delete this farmer?',
    // Payroll
    'payroll.title': 'Payroll Management',
    'payroll.totalPayroll': 'Total Payroll',
    'payroll.pending': 'Pending',
    'payroll.processing': 'Processing',
    'payroll.completed': 'Completed',
    'payroll.onHold': 'On Hold',
    'payroll.processAll': 'Process All Pending',
    'payroll.exportPayroll': 'Export Payroll',
    'payroll.bonuses': 'Bonuses',
    'payroll.deductions': 'Deductions',
    'payroll.netPay': 'Net Pay',
    'payroll.grossPay': 'Gross Pay',
    // Reports
    'reports.title': 'Reports & Analytics',
    'reports.disputes': 'Dispute Resolution',
    'reports.notifications': 'Notifications & Alerts',
    'reports.analytics': 'Analytics',
    'reports.qualityReports': 'Quality Reports',
    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General Settings',
    'settings.sensors': 'Sensor Configuration',
    'settings.alerts': 'Alert Thresholds',
    'settings.saveChanges': 'Save Changes',
    // Login
    'login.title': 'Sign in to your account',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.signIn': 'Sign In',
    'login.forgotPassword': 'Forgot password?',
    'login.resetPassword': 'Reset Password',
  },
  fil: {
    // Common - Filipino
    'common.save': 'I-save',
    'common.cancel': 'Kanselahin',
    'common.delete': 'Tanggalin',
    'common.edit': 'I-edit',
    'common.add': 'Magdagdag',
    'common.search': 'Maghanap',
    'common.export': 'I-export',
    'common.loading': 'Naglo-load...',
    'common.noData': 'Walang available na data',
    'common.success': 'Tagumpay',
    'common.error': 'Error',
    'common.view': 'Tingnan',
    'common.close': 'Isara',
    'common.confirm': 'Kumpirmahin',
    'common.yes': 'Oo',
    'common.no': 'Hindi',
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.employees': 'Mga Empleyado',
    'nav.payroll': 'Sahod',
    'nav.reports': 'Mga Ulat',
    'nav.settings': 'Mga Setting',
    'nav.monitoring': 'Pagsubaybay',
    'nav.notifications': 'Mga Abiso',
    'nav.logout': 'Mag-logout',
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.totalTrees': 'Kabuuang Puno',
    'dashboard.activeEmployees': 'Aktibong Empleyado',
    'dashboard.totalHarvest': 'Kabuuang Ani',
    'dashboard.totalSalaries': 'Kabuuang Sahod',
    'dashboard.quickActions': 'Mabilis na Aksyon',
    'dashboard.recentActivity': 'Kamakailang Aktibidad',
    'dashboard.generateReport': 'Gumawa ng Ulat',
    'dashboard.viewMonitoring': 'Tingnan ang Pagsubaybay',
    // Employees
    'employees.title': 'Pamamahala ng Empleyado',
    'employees.addNew': 'Magdagdag ng Bagong Magsasaka',
    'employees.totalFarmers': 'Kabuuang Magsasaka',
    'employees.activeFarmers': 'Aktibong Magsasaka',
    'employees.assignedTrees': 'Nakatalang Puno',
    'employees.avgQuality': 'Ave. Kalidad',
    'employees.searchPlaceholder': 'Maghanap ng magsasaka ayon sa pangalan o lokasyon...',
    'employees.sortBy': 'Ayusin ayon sa',
    'employees.name': 'Pangalan',
    'employees.location': 'Lokasyon',
    'employees.status': 'Katayuan',
    'employees.joinDate': 'Petsa ng Pagsali',
    'employees.harvest': 'Ani',
    'employees.quality': 'Kalidad',
    'employees.viewTrees': 'Tingnan ang Puno',
    'employees.deleteConfirm': 'Sigurado ka bang gusto mong tanggalin ang magsasakang ito?',
    // Payroll
    'payroll.title': 'Pamamahala ng Sahod',
    'payroll.totalPayroll': 'Kabuuang Sahod',
    'payroll.pending': 'Naghihintay',
    'payroll.processing': 'Pinoproseso',
    'payroll.completed': 'Nakumpleto',
    'payroll.onHold': 'Nakahinto',
    'payroll.processAll': 'Iproseso Lahat ng Naghihintay',
    'payroll.exportPayroll': 'I-export ang Sahod',
    'payroll.bonuses': 'Mga Bonus',
    'payroll.deductions': 'Mga Bawas',
    'payroll.netPay': 'Net na Sahod',
    'payroll.grossPay': 'Gross na Sahod',
    // Reports
    'reports.title': 'Mga Ulat at Analytics',
    'reports.disputes': 'Resolusyon ng Dispute',
    'reports.notifications': 'Mga Abiso at Alerto',
    'reports.analytics': 'Analytics',
    'reports.qualityReports': 'Mga Ulat ng Kalidad',
    // Settings
    'settings.title': 'Mga Setting',
    'settings.general': 'Pangkalahatang Setting',
    'settings.sensors': 'Kompigurasyon ng Sensor',
    'settings.alerts': 'Mga Threshold ng Alerto',
    'settings.saveChanges': 'I-save ang mga Pagbabago',
    // Login
    'login.title': 'Mag-sign in sa iyong account',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.signIn': 'Mag-sign In',
    'login.forgotPassword': 'Nakalimutan ang password?',
    'login.resetPassword': 'I-reset ang Password',
  },
  es: {
    // Common - Spanish
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Agregar',
    'common.search': 'Buscar',
    'common.export': 'Exportar',
    'common.loading': 'Cargando...',
    'common.noData': 'No hay datos disponibles',
    'common.success': 'Éxito',
    'common.error': 'Error',
    'common.view': 'Ver',
    'common.close': 'Cerrar',
    'common.confirm': 'Confirmar',
    'common.yes': 'Sí',
    'common.no': 'No',
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.employees': 'Empleados',
    'nav.payroll': 'Nómina',
    'nav.reports': 'Informes',
    'nav.settings': 'Configuración',
    'nav.monitoring': 'Monitoreo',
    'nav.notifications': 'Notificaciones',
    'nav.logout': 'Cerrar sesión',
    // Dashboard
    'dashboard.title': 'Panel de Control',
    'dashboard.totalTrees': 'Total de Árboles',
    'dashboard.activeEmployees': 'Empleados Activos',
    'dashboard.totalHarvest': 'Cosecha Total',
    'dashboard.totalSalaries': 'Salarios Totales',
    'dashboard.quickActions': 'Acciones Rápidas',
    'dashboard.recentActivity': 'Actividad Reciente',
    'dashboard.generateReport': 'Generar Informe',
    'dashboard.viewMonitoring': 'Ver Monitoreo',
    // Employees
    'employees.title': 'Gestión de Empleados',
    'employees.addNew': 'Agregar Nuevo Agricultor',
    'employees.totalFarmers': 'Total de Agricultores',
    'employees.activeFarmers': 'Agricultores Activos',
    'employees.assignedTrees': 'Árboles Asignados',
    'employees.avgQuality': 'Calidad Promedio',
    'employees.searchPlaceholder': 'Buscar agricultores por nombre o ubicación...',
    'employees.sortBy': 'Ordenar por',
    'employees.name': 'Nombre',
    'employees.location': 'Ubicación',
    'employees.status': 'Estado',
    'employees.joinDate': 'Fecha de Ingreso',
    'employees.harvest': 'Cosecha',
    'employees.quality': 'Calidad',
    'employees.viewTrees': 'Ver Árboles',
    'employees.deleteConfirm': '¿Estás seguro de que deseas eliminar a este agricultor?',
    // Payroll
    'payroll.title': 'Gestión de Nómina',
    'payroll.totalPayroll': 'Nómina Total',
    'payroll.pending': 'Pendiente',
    'payroll.processing': 'Procesando',
    'payroll.completed': 'Completado',
    'payroll.onHold': 'En Espera',
    'payroll.processAll': 'Procesar Todo lo Pendiente',
    'payroll.exportPayroll': 'Exportar Nómina',
    'payroll.bonuses': 'Bonificaciones',
    'payroll.deductions': 'Deducciones',
    'payroll.netPay': 'Pago Neto',
    'payroll.grossPay': 'Pago Bruto',
    // Reports
    'reports.title': 'Informes y Análisis',
    'reports.disputes': 'Resolución de Disputas',
    'reports.notifications': 'Notificaciones y Alertas',
    'reports.analytics': 'Análisis',
    'reports.qualityReports': 'Informes de Calidad',
    // Settings
    'settings.title': 'Configuración',
    'settings.general': 'Configuración General',
    'settings.sensors': 'Configuración de Sensores',
    'settings.alerts': 'Umbrales de Alerta',
    'settings.saveChanges': 'Guardar Cambios',
    // Login
    'login.title': 'Iniciar sesión en tu cuenta',
    'login.email': 'Correo electrónico',
    'login.password': 'Contraseña',
    'login.signIn': 'Iniciar Sesión',
    'login.forgotPassword': '¿Olvidaste tu contraseña?',
    'login.resetPassword': 'Restablecer Contraseña',
  },
};

// Language names for display
export const languageNames: Record<Language, string> = {
  en: 'English',
  fil: 'Filipino',
  es: 'Español',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    availableLanguages: ['en', 'fil', 'es'],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
