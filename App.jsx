import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calculator, Shield, TrendingDown, Calendar, CheckCircle, 
  AlertCircle, DollarSign, Plus, Trash2, Save, ChevronDown, 
  ChevronUp, Trophy, ArrowRight, Target, RotateCcw, Database,
  Download, Cloud, WifiOff, Loader, User, LogIn, X, Copy, HardDrive,
  LayoutDashboard, PieChart, TrendingUp, Menu, Wallet, HelpCircle,
  Sparkles, Zap, Droplet, Wifi, Flame, Home, ShoppingCart, 
  Heart, Bus, Tv, ShoppingBag, Coffee, MoreHorizontal, Square, CheckSquare,
  Ticket, Brain, Lock, Rocket, Scale, BarChart3, Clock, Search, Banknote,
  RefreshCw, LogOut, Mail, Image as ImageIcon, CalendarClock, AlertTriangle,
  Eye, EyeOff, Award, Medal, CloudLightning, Check, Activity, Radio, Star,
  Moon, Sun, Code, LockKeyhole, Facebook, Chrome, KeyRound, PiggyBank, ThumbsUp, ZapOff,
  Fingerprint, Crown, BookOpen, Settings, ShieldCheck, ChevronRight, Edit3, Swords, 
  Euro, Bitcoin, CreditCard, PlusCircle, Gem, JapaneseYen, PawPrint, Users, Scissors, PoundSterling, Globe, Gift, Mic
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCredential,
  signInWithCustomToken, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  updateProfile,
  setPersistence,        
  browserLocalPersistence, 
  deleteUser,
} from 'firebase/auth'; 

import { getFirestore, doc, setDoc, onSnapshot, getDoc, collection, enableIndexedDbPersistence  } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Preferences } from '@capacitor/preferences';
import confetti from 'canvas-confetti';
import { FacebookLogin } from '@capacitor-community/facebook-login';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

// --- IMPORT DA BIOMETRIA (IMPORTANTE: Se der erro, remova esta linha temporariamente) ---
//import { NativeBiometric } from '@capacitor-community/native-biometric';

// --- CONFIGURAÇÃO FIREBASE (REAL) ---
const firebaseConfig = {
  apiKey: "AIzaSyAlHtdx79BgxFYcskeuXZ_RHVyDUl6Oc3c",
  authDomain: "liberta-6681e.firebaseapp.com",
  projectId: "liberta-6681e",
  storageBucket: "liberta-6681e.firebasestorage.app",
  messagingSenderId: "640425467573",
  appId: "1:640425467573:android:c4a72a4a465a3312b1a8fc", 
  measurementId: "G-CPC5LJNL3F"
};
console.log("Firebase conectado:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Ativa a persistência apenas se estiver no ambiente correto
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Geralmente acontece se você tiver o app aberto em duas abas do navegador
      console.warn("Persistência falhou: Múltiplas abas abertas.");
    } else if (err.code === 'unimplemented') {
      // O navegador ou dispositivo é muito antigo (não é o caso do seu S25)
      console.warn("O dispositivo não suporta cache offline.");
    }
  });
}
const functions = getFunctions(app);

// --- CONFIGURAÇÃO DE PERSISTÊNCIA (LOGIN NÃO CAIR) ---
setPersistence(auth, browserLocalPersistence)
  .then(() => {
     console.log("Sistema de login salvo localmente.");
  })
  .catch((error) => {
     console.error("Erro na persistência:", error);
  });
// -----------------------------------------------------

// Chaves de Cache
const RATES_CACHE_KEY = 'liberdade_financeira_rates_cache_v1';
const THEME_CACHE_KEY = 'liberdade_financeira_theme_preference';

// --- HELPERS E VALIDATORS ---
const validateMoney = (val) => {
  if (val === '' || val === undefined) return '';
  let num = parseFloat(val);
  if (isNaN(num)) return '';
  if (num < 0) return 0;
  if (num > 99999999) return 99999999;
  return val; 
};

const validateDay = (val) => {
  if (val === '' || val === undefined) return '';
  let num = parseInt(val);
  if (isNaN(num)) return '';
  if (num < 1) return 1;
  if (num > 31) return 31;
  return num;
};

// --- FUNÇÃO DE CELEBRAÇÃO (CONFETES OTIMIZADOS PARA MOBILE) ---
const triggerCelebration = () => {
  // Feedback Tátil (Vibração leve)
  try { Haptics.notification({ type: 'SUCCESS' }); } catch(e){}

  // Um disparo único e bonito (Não trava a memória do WebView no Android)
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#a855f7', '#ec4899', '#3b82f6'],
    disableForReducedMotion: true // Respeita configurações de acessibilidade do celular
  });
};

// --- COMPONENTES UI (DESIGN SYSTEM) ---

const Card = ({ children, className = "", title, icon: Icon, action, subtitle }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden w-full transition-all duration-300 hover:shadow-md ${className}`}>
    {(title || Icon) && (
      <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-start bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="flex items-center gap-4">
          {Icon && <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700"><Icon size={20} /></div>}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    )}
    <div className="p-5 md:p-6">{children}</div>
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, size = "md", type = "button" }) => {
  const sizes = { sm: "px-3 py-2 text-xs", md: "px-5 py-3 text-sm", lg: "px-8 py-4 text-base" };
  const variants = {
    primary: "bg-slate-900 dark:bg-purple-600 text-white hover:bg-slate-800 dark:hover:bg-purple-700 shadow-xl shadow-slate-900/20 dark:shadow-purple-900/20 active:scale-95 border border-transparent",
    secondary: "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm",
    accent: "bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20 active:scale-95",
    ghost: "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent active:bg-slate-100",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border-transparent active:scale-95",
    facebook: "bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-lg shadow-blue-900/20 active:scale-95",
    google: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
  };
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled} 
      className={`rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none touch-manipulation tracking-wide ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {disabled && variant === 'primary' ? <Loader size={16} className="animate-spin" /> : children}
    </button>
  );
};

const InfoTip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-2 group">
      <button 
        onClick={() => setShow(!show)} 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-slate-400 hover:text-indigo-500 transition-colors cursor-help"
      >
        <HelpCircle size={14} />
      </button>
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none animate-fade-in text-center leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE DE INPUT DE MOEDA (UX MELHORADA) ---
const CurrencyInput = ({ value, onChange, className, placeholder = "0,00", ...props }) => {
  const handleChange = (e) => {
    // 1. Pega apenas os números digitados
    const rawValue = e.target.value.replace(/\D/g, "");
    
    // 2. Divide por 100 para criar os centavos (ex: 1234 -> 12,34)
    const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0;
    
    // 3. Devolve o número puro para o estado do App
    onChange(numericValue);
  };

  // 4. Formata o valor visualmente (ex: 1.250,00) sem o "R$" (porque seu layout já tem o span R$)
  const displayValue = value !== undefined && value !== null && value !== ''
    ? Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "";

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric" // Abre o teclado numérico no celular
      value={displayValue}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
    />
  );
};

// --- FEEDBACK VISUAL DE SALVAMENTO (DYNAMIC ISLAND) ---
const GlobalFeedback = ({ status, showToast, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [displayStatus, setDisplayStatus] = useState('idle'); // idle, syncing, success, error

  // Gerencia as animações baseado no status do App
  useEffect(() => {
    if (status === 'syncing') {
      setVisible(true);
      setDisplayStatus('syncing');
    } else if (status === 'synced') {
      setDisplayStatus('success');
      // Fica verde por 2.5 segundos e some
      const timer = setTimeout(() => {
        setVisible(false);
        if(onClose) onClose(); 
      }, 2500);
      return () => clearTimeout(timer);
    } else if (status === 'error') {
      setDisplayStatus('error');
      setVisible(true);
    }
  }, [status]);

  // Se o Toast for chamado manualmente (ex: botão salvar)
  useEffect(() => {
    if(showToast) {
        setVisible(true);
        setDisplayStatus('success');
        const timer = setTimeout(() => { setVisible(false); if(onClose) onClose(); }, 2500);
        return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!visible && displayStatus !== 'syncing') return null;

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
      <div className={`
        flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-500
        ${displayStatus === 'syncing' ? 'bg-slate-900/80 dark:bg-slate-800/90 text-slate-200 border-slate-700 w-40 justify-center' : ''}
        ${displayStatus === 'success' ? 'bg-emerald-500 text-white border-emerald-400 w-auto scale-105' : ''}
        ${displayStatus === 'error' ? 'bg-red-500 text-white border-red-400' : ''}
      `}>
        
        {/* ESTADO: SALVANDO (Spinner) */}
        {displayStatus === 'syncing' && (
          <>
            <Loader size={16} className="animate-spin text-purple-400" />
            <span className="text-xs font-bold tracking-wider">SALVANDO...</span>
          </>
        )}

        {/* ESTADO: SUCESSO (Check Animado) */}
        {displayStatus === 'success' && (
          <>
            <div className="bg-white/20 rounded-full p-1 animate-bounce-short">
                <Check size={18} strokeWidth={3} />
            </div>
            <span className="text-sm font-bold animate-fade-in-up">Salvo com sucesso!</span>
          </>
        )}

        {/* ESTADO: ERRO */}
        {displayStatus === 'error' && (
          <>
            <AlertCircle size={18} />
            <span className="text-sm font-bold">Erro ao salvar!</span>
          </>
        )}
      </div>
    </div>
  );
};

const ExpenseRow = ({ icon: Icon, label, value, fieldKey, dateKey, dateValue, onChange, onDateChange, isExcluded, onExclude, salaryDay }) => {
  const isRisk = !isExcluded && dateValue && salaryDay && Number(dateValue) < Number(salaryDay);

  return (
    <div className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl border mb-3 transition-all gap-3 ${isExcluded ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-sm'}`}>
      
      <div className="flex items-center gap-4 flex-1">
        <div className={`p-3 rounded-xl shrink-0 transition-colors ${isExcluded ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:text-purple-600'}`}>
          <Icon size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-sm md:text-base font-bold truncate ${isExcluded ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{label}</span>
          <button 
            onClick={() => onExclude(fieldKey)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 w-fit mt-1 p-0.5 -ml-0.5 transition-colors"
          >
            {isExcluded ? <CheckSquare size={14} className="text-purple-500"/> : <Square size={14}/>}
            {isExcluded ? "Não pago isso" : "Não se aplica?"}
          </button>
        </div>
      </div>
      
      {!isExcluded && (
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className="relative w-1/3 sm:w-24" title={isRisk ? "Vence antes do pagamento!" : "Dia do Vencimento"}>
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${isRisk ? 'text-red-500' : 'text-slate-400'}`}>
                  {isRisk ? <AlertTriangle size={12} /> : 'DIA'}
              </span>
              <input 
                type="number" 
                min="1" max="31"
                className={`w-full pl-8 pr-2 py-3 bg-slate-50 dark:bg-slate-900 border rounded-lg text-center font-bold outline-none text-sm transition-all
                    ${isRisk 
                        ? 'border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/30' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'}`}
                placeholder="--"
                value={dateValue || ''}
                onChange={(e) => onDateChange(dateKey, e.target.value)}
              />
           </div>

           <div className="relative flex-1 sm:w-36">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
            <CurrencyInput 
                className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-base"
              placeholder="0,00"
               value={value}
                onChange={(val) => onChange(fieldKey, val)} // Note que aqui recebemos 'val' direto, sem e.target
              />
          </div>
        </div>
      )}
    </div>
  );
};

const DonutChart = ({ percentage, color = "#10b981", label = "Gasto" }) => {
  const radius = 40; 
  const circumference = 2 * Math.PI * radius;
  const safePercentage = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative w-36 h-36 md:w-48 md:h-48 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
        <circle cx="50%" cy="50%" r={radius} stroke={color} strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{safePercentage.toFixed(0)}%</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">{label}</span>
      </div>
    </div>
  );
};

// --- gráficos ---
  const VisualReports = ({ finance, data }) => {
  const total = finance.totalExpenses + finance.investedAmount;
  const pEssentials = total > 0 ? (finance.essentials / total) * 100 : 0;
  const pLifestyle = total > 0 ? (finance.lifestyle / total) * 100 : 0;
  const pInvest = total > 0 ? (finance.investedAmount / total) * 100 : 0;
  const r = 15.9155; 
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* GRÁFICO 1: DONUT */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative">
        <h3 className="w-full text-left font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <PieChart size={20} className="text-purple-500"/> Distribuição Real
        </h3>
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
            <circle cx="21" cy="21" r={r} fill="transparent" strokeWidth="5" className="stroke-slate-100 dark:stroke-slate-800" />
            <circle cx="21" cy="21" r={r} fill="transparent" stroke="#3b82f6" strokeWidth="5" strokeDasharray={`${pEssentials} ${100 - pEssentials}`} strokeDashoffset="0" className="transition-all duration-1000 ease-out" />
            <circle cx="21" cy="21" r={r} fill="transparent" stroke="#a855f7" strokeWidth="5" strokeDasharray={`${pLifestyle} ${100 - pLifestyle}`} strokeDashoffset={`-${pEssentials}`} className="transition-all duration-1000 ease-out" />
            <circle cx="21" cy="21" r={r} fill="transparent" stroke="#10b981" strokeWidth="5" strokeDasharray={`${pInvest} ${100 - pInvest}`} strokeDashoffset={`-${pEssentials + pLifestyle}`} className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-xs text-slate-400 font-bold uppercase">Total Gasto</span>
             <span className="text-xl font-bold text-slate-800 dark:text-white">
                {Number(total).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL', maximumFractionDigits: 0})}
             </span>
          </div>
        </div>
        <div className="flex gap-4 mt-6 text-xs font-bold">
           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Essenciais</div>
           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Lazer</div>
           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Futuro</div>
        </div>
      </div>

      {/* GRÁFICO 2: BARRAS */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Target size={20} className="text-red-500"/> Meta vs Realidade
        </h3>
        <div className="space-y-6">
           <div>
              <div className="flex justify-between mb-2 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Essenciais (50%)</span><span className="text-slate-400">{(finance.essentials / (finance.totalIncome || 1) * 100).toFixed(0)}%</span></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                 <div className="absolute top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600 z-10" style={{left: '50%'}}></div>
                 <div className={`h-full rounded-full ${finance.essentials > (finance.totalIncome * 0.5) ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${Math.min(100, (finance.essentials / (finance.totalIncome || 1)) * 100)}%`}}></div>
              </div>
           </div>
           <div>
              <div className="flex justify-between mb-2 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Estilo de Vida (30%)</span><span className="text-slate-400">{(finance.lifestyle / (finance.totalIncome || 1) * 100).toFixed(0)}%</span></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                 <div className="absolute top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600 z-10" style={{left: '30%'}}></div>
                 <div className={`h-full rounded-full ${finance.lifestyle > (finance.totalIncome * 0.3) ? 'bg-red-500' : 'bg-purple-500'}`} style={{width: `${Math.min(100, (finance.lifestyle / (finance.totalIncome || 1)) * 100)}%`}}></div>
              </div>
           </div>
           <div>
              <div className="flex justify-between mb-2 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Investimentos (20%)</span><span className="text-slate-400">{finance.savingsRate.toFixed(0)}%</span></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                 <div className="absolute top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600 z-10" style={{left: '20%'}}></div>
                 <div className={`h-full rounded-full ${finance.savingsRate >= 20 ? 'bg-emerald-500' : 'bg-orange-400'}`} style={{width: `${Math.min(100, finance.savingsRate)}%`}}></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- SMART INSIGHTS: Empático e Controlável ---
const SmartInsights = ({ finance, data }) => {
  const [dismissed, setDismissed] = useState([]);

  // Função para fechar o alerta
  const handleDismiss = (id) => {
    setDismissed((prev) => [...prev, id]);
  };

const getInsights = () => {
    const tips = [];
    const income = finance.totalIncome || 1; 

    // --- NOVA LÓGICA: COMPARAÇÃO DE MÊS (DELIVERY) ---
    const lastDelivery = data.lastMonthExpenses?.delivery || 0;
    const currentDelivery = data.expenses?.delivery || 0;

    // Se ele gastou com delivery mês passado e já passou esse valor neste mês
    if (lastDelivery > 0 && currentDelivery > lastDelivery && !dismissed.includes('delivery_alert')) {
        const percentIncrease = ((currentDelivery - lastDelivery) / lastDelivery) * 100;
        
        // Só avisa se o aumento for maior que 10%
        if (percentIncrease > 10) {
            tips.push({
                id: 'delivery_alert',
                icon: Coffee, // Reutilizamos o ícone de café/delivery
                color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30",
                title: "Alerta de Frequência 🍔",
                text: `Você já gastou ${percentIncrease.toFixed(0)}% a mais com delivery este mês comparado ao mês passado. Que tal cozinhar hoje?`
            });
        }
    }
    // ------------------------------------------------

    // 1. ANÁLISE DE ESSENCIAIS (Com empatia)
    const essentialsPct = (finance.essentials / income) * 100;
    
    // ... o resto do código continua igual para baixo ...

    // 2. O VILÃO DO DELIVERY (Foco no benefício, não na culpa)
    if (data.expenses.delivery > 0 && !dismissed.includes('delivery')) {
      const deliveryShare = (data.expenses.delivery / income) * 100;
      if (deliveryShare > 8) { 
        tips.push({
          id: 'delivery',
          icon: Coffee,
          color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30",
          title: "Uma troca inteligente",
          text: `Você investiu ${deliveryShare.toFixed(0)}% em delivery. Cozinhar em casa uma ou duas vezes na semana pode sobrar dinheiro para aquele seu sonho!`
        });
      }
    }

    // --- ALERTA: ESTOURO DE ORÇAMENTO ---
    const expenseRatio = (finance.totalExpenses / income) * 100;

    // Cenário 1: Já estourou o orçamento (Passou de 100%)
    if (expenseRatio >= 100 && !dismissed.includes('overbudget')) {
        tips.push({
            id: 'overbudget',
            icon: AlertTriangle, 
            color: "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30",
            title: "Orçamento Estourado! 🚨",
            text: `Atenção: Suas despesas ultrapassaram sua renda. Você já gastou ${expenseRatio.toFixed(0)}% do que ganha. Hora de ativar o modo de emergência e cortar tudo que não for essencial.`
        });
    } 
    // Cenário 2: Quase estourando (Entre 90% e 99%)
    else if (expenseRatio >= 90 && expenseRatio < 100 && !dismissed.includes('warning_budget')) {
        tips.push({
            id: 'warning_budget',
            icon: AlertCircle,
            color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30",
            title: "Sinal de Alerta ⚠️",
            text: `Você já comprometeu ${expenseRatio.toFixed(0)}% da sua renda. Pise no freio agora para garantir que o mês não feche no vermelho!`
        });
    }

    // 3. ALUGUEL (Acolhimento)
    if (data.expenses.rent > 0 && !dismissed.includes('rent')) {
        const rentShare = (data.expenses.rent / income) * 100;
        if (rentShare > 35) {
            tips.push({
                id: 'rent',
                icon: Shield, // Ícone de proteção/casa
                color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30",
                title: "O aluguel pesou?",
                text: `Moradia está levando ${rentShare.toFixed(0)}% da renda. Não se culpe, o mercado está difícil. O foco agora é tentar aumentar sua renda extra para equilibrar.`
            });
        }
    }

    // 4. ELOGIO (Reforço Positivo - Sempre bom manter)
    if (finance.savingsRate >= 20 && !dismissed.includes('saver')) {
      tips.push({
        id: 'saver',
        icon: Trophy, 
        color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30",
        title: "Você está voando! 🚀",
        text: "Parabéns! Poupando mais de 20%, você está construindo uma liberdade incrível. Continue assim."
      });
    } else if (finance.balance < 0 && !dismissed.includes('negative')) {
      tips.push({
        id: 'negative',
        icon: Heart, // Coração para apoio
        color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30",
        title: "Vamos sair dessa juntos",
        text: "O mês fechou no negativo, mas respira fundo. Vamos priorizar o essencial e cortar o supérfluo hoje. Você consegue virar esse jogo!"
      });
    }

    return tips.slice(0, 3); // Mostra no máximo 3
  };

  const insights = getInsights();

  if (insights.length === 0) return null;

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 animate-fade-in">
      {insights.map((tip) => (
        <div key={tip.id} className={`relative flex items-start gap-3 p-4 rounded-2xl border shadow-sm transition-all ${tip.color} pr-10`}>
          
          {/* Ícone */}
          <div className="p-2 bg-white/50 dark:bg-black/20 rounded-xl shrink-0 backdrop-blur-sm">
             <tip.icon size={20} strokeWidth={2.5} />
          </div>
          
          {/* Texto */}
          <div>
            <h4 className="text-sm font-bold opacity-90 mb-0.5">{tip.title}</h4>
            <p className="text-xs font-medium opacity-80 leading-relaxed">
              {tip.text}
            </p>
          </div>

          {/* Botão Fechar (X) */}
          <button 
            onClick={() => handleDismiss(tip.id)}
            className="absolute top-3 right-3 p-1.5 text-current opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      ))}
    </div>
  );
};

// --- TUTORIAL DE USO (TOUR GUIADO) ---
const TutorialModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Seja Bem-vindo! 🚀",
      description: "O **Liberta** não é apenas uma planilha, é o teu GPS financeiro. Vamos configurar o básico para o teu dinheiro render mais!",
      tip: "Tudo começa com o que entra na conta.",
      icon: Sparkles,
      color: "from-blue-600 to-indigo-600",
      light: "bg-blue-500/20"
    },
    {
      title: "Regra do 50/30/20 📊",
      description: "Dividimos o teu dinheiro para ti: **50%** Essencial, **30%** Lazer e **20%** Investimento. Se a barra ficar vermelha, avisamos-te na hora!",
      tip: "Não precises de fazer contas de cabeça.",
      icon: PieChart,
      color: "from-purple-600 to-pink-600",
      light: "bg-purple-500/20"
    },
    {
      title: "Reserva de Emergência 🛡️",
      description: "Calculamos o teu **Custo de Vida**. O objetivo é ter 6 meses guardados para que nunca mais tenhas medo de imprevistos.",
      tip: "Dormir descansado é o melhor investimento.",
      icon: ShieldCheck,
      color: "from-emerald-600 to-teal-600",
      light: "bg-emerald-500/20"
    },
    {
      title: "IA & Terminal B3 🤖",
      description: "Usa a voz para registar gastos com a nossa **IA** e acompanha o valor do **Dólar, Euro e Ações** em tempo real.",
      tip: "Tecnologia de elite na palma da tua mão.",
      icon: Activity,
      color: "from-orange-600 to-red-600",
      light: "bg-orange-500/20"
    }
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-hidden">
      {/* Luz de Fundo Difusa que muda com o passo */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-700 ${current.light}`}></div>

      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col border border-white/10">
        
        {/* Barras de Progresso no Topo (Estilo Stories) */}
        <div className="flex gap-1.5 px-8 pt-6">
          {steps.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 ${i <= step ? `bg-gradient-to-r ${current.color}` : 'w-0'}`} style={{ width: i === step ? '100%' : i < step ? '100%' : '0%' }}></div>
            </div>
          ))}
        </div>

        <div className="p-8 pt-10 flex flex-col items-center text-center">
          {/* Ícone Gigante e Estilizado */}
          <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${current.color} flex items-center justify-center text-white shadow-2xl mb-8 transform transition-transform duration-500 hover:scale-110`}>
            <Icon size={48} strokeWidth={1.5} />
          </div>

          {/* Textos */}
          <div className="space-y-4 mb-10 min-h-[160px]">
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
              {current.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              {current.description.split('**').map((part, i) => i % 2 === 1 ? <span key={i} className="font-bold text-slate-900 dark:text-slate-100">{part}</span> : part)}
            </p>
            <div className="inline-block px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={12} className="text-amber-500"/> {current.tip}
               </p>
            </div>
          </div>

          {/* Botão de Ação */}
          <button 
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
                try { Haptics.impact({ style: ImpactStyle.Medium }); } catch(e){}
              } else {
                onClose();
              }
            }}
            className={`w-full py-5 rounded-[2rem] font-black text-white text-lg transition-all shadow-xl active:scale-95 bg-gradient-to-r ${current.color}`}
          >
            {step < steps.length - 1 ? "Continuar" : "Bora Dominar! 🚀"}
          </button>

          {/* Botão Pular */}
          {step < steps.length - 1 && (
            <button onClick={onClose} className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
              Pular Introdução
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SISTEMA DE GAMIFICAÇÃO (CONQUISTAS 2.0) ---
const AchievementsModal = ({ isOpen, onClose, data, finance }) => {
  if (!isOpen) return null;

  // Cálculos auxiliares para as conquistas
  const survivalValue = Number(data.survivalCost) || 0;
  const hasOneMonthSaved = survivalValue > 0 && finance.balance >= survivalValue;
  const essentialsRatio = finance.totalIncome > 0 ? (finance.essentials / finance.totalIncome) : 1;

  // LISTA DE CONQUISTAS
  const achievements = [
    // NÍVEL 1: BÁSICO
    {
      id: 'start',
      title: 'O Início',
      desc: 'Deu o primeiro passo e cadastrou sua renda.',
      icon: DollarSign,
      color: 'from-blue-400 to-blue-600',
      unlocked: data.income.salary > 0
    },
    {
      id: 'dreamer',
      title: 'Sonhador',
      desc: 'Criou sua primeira meta ou sonho no app.',
      icon: Rocket,
      color: 'from-purple-400 to-purple-600',
      unlocked: data.dreams.length > 0
    },
    {
      id: 'safe',
      title: 'Sobrevivente',
      desc: 'Definiu quanto custa sua sobrevivência básica.',
      icon: Home,
      color: 'from-yellow-400 to-orange-500',
      unlocked: survivalValue > 0
    },

    // NÍVEL 2: INTERMEDIÁRIO
    {
      id: 'saver',
      title: 'No Azul',
      desc: 'Fechou a conta com saldo positivo (Sobrou dinheiro!).',
      icon: PiggyBank,
      color: 'from-emerald-400 to-emerald-600',
      unlocked: finance.balance > 0
    },
    {
      id: 'debt_free',
      title: 'Vida Leve', // Nome corrigido (Era Nome Limpo)
      desc: 'Zero dívidas ativas cadastradas no aplicativo.',
      icon: ShieldCheck, // Requer importar ShieldCheck
      color: 'from-cyan-400 to-blue-500',
      unlocked: data.debts.filter(d => !d.paid).length === 0
    },
    {
      id: 'first_1k',
      title: 'Primeiro 1k', // Nova
      desc: 'Acumulou seus primeiros R$ 1.000,00 livres.',
      icon: Gem, // Requer importar Gem (ou use Diamond/Star)
      color: 'from-pink-500 to-rose-500',
      unlocked: finance.balance >= 1000
    },

    // NÍVEL 3: AVANÇADO
    {
      id: 'strategist',
      title: 'Estrategista', // Nova
      desc: 'Gastos Essenciais abaixo de 50% da renda.',
      icon: Brain,
      color: 'from-indigo-400 to-violet-600',
      unlocked: essentialsRatio <= 0.50 && data.income.salary > 0
    },
    {
      id: 'investor',
      title: 'Visionário',
      desc: 'Atingiu 20% ou mais de taxa de poupança.',
      icon: TrendingUp,
      color: 'from-orange-400 to-red-500',
      unlocked: finance.savingsRate >= 20
    },
    {
      id: 'shielded',
      title: 'Blindado', // Nova
      desc: 'Tem saldo suficiente para 1 mês de sobrevivência.',
      icon: Shield,
      color: 'from-gray-700 to-slate-900',
      unlocked: hasOneMonthSaved
    },
    {
      id: 'pro_member',
      title: 'Membro VIP', // Nova
      desc: 'Apoiador oficial com acesso Premium.',
      icon: Crown,
      color: 'from-yellow-300 via-yellow-500 to-yellow-600', // Dourado
      unlocked: data.isPro
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progress = (unlockedCount / achievements.length) * 100;

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header com Progresso */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
           <div className="flex justify-between items-center mb-4">
              <div>
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Trophy className="text-yellow-500 fill-yellow-500" /> Sala de Troféus
                 </h2>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Sua jornada rumo à liberdade financeira.</p>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300 hover:scale-110 transition-transform"><X size={20}/></button>
           </div>
           
           <div className="flex items-center gap-3">
               <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{width: `${progress}%`}}></div>
               </div>
               <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{progress.toFixed(0)}% Completo</span>
           </div>
           
        </div>

        {/* Grid de Conquistas */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
           {achievements.map((item) => (
              <div key={item.id} className={`relative p-4 rounded-2xl border flex items-center gap-4 transition-all group hover:scale-[1.02] ${item.unlocked ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-50 grayscale'}`}>
                 
                 {/* Ícone com Gradiente */}
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 transition-transform group-hover:rotate-6 ${item.unlocked ? `bg-gradient-to-br ${item.color} text-white shadow-lg` : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {item.unlocked ? <item.icon size={26} strokeWidth={2}/> : <Lock size={22}/>}
                 </div>
                 
                 <div>
                    <h4 className={`font-bold text-base ${item.unlocked ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1">{item.desc}</p>
                    
                    {item.unlocked && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={10} /> Conquistado
                        </div>
                    )}
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ 
  isOpen, onClose, data, onSaveSettings, onDeleteAccount, 
  isDarkMode, setIsDarkMode, handleLogout, isPrivacyMode, setIsPrivacyMode 
}) => {
  const [tempName, setTempName] = useState(data.userName || '');
  const [tempSalary, setTempSalary] = useState(data.income.salary || 0);

  useEffect(() => {
    if(isOpen) {
      setTempName(data.userName);
      setTempSalary(data.income.salary);
    }
  }, [isOpen, data]);

 // --- AUTOSAVE: Salva automático após 800ms ---
  useEffect(() => {
    const mudouNome = tempName !== data.userName;
    const mudouSalario = Number(tempSalary) !== Number(data.income.salary);

    if (isOpen && (mudouNome || mudouSalario)) {
        const timer = setTimeout(() => {
            onSaveSettings(tempName, tempSalary);
        }, 800); 

        return () => clearTimeout(timer);
    }
  }, [tempName, tempSalary, isOpen, data.userName, data.income.salary, onSaveSettings]);

 if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#F8FAFC] dark:bg-slate-950 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up border-t dark:border-slate-800">
        
        {/* HEADER: Título e Fechar */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600"><Settings size={20}/></div>
              <h2 className="text-xl font-bold dark:text-white">Ajustes</h2>
           </div>
           <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:scale-110 transition-transform"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
           
           {/* GRUPO 1: IDENTIDADE */}
           <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Perfil & Renda</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y dark:divide-slate-800 shadow-sm">
                <div className="p-4 flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500"><User size={20}/></div>
                   <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Nome de Exibição</label>
                      <input className="bg-transparent w-full outline-none text-slate-800 dark:text-white font-bold text-sm" value={tempName} onChange={e => setTempName(e.target.value)} />
                   </div>
                </div>
                <div className="p-4 flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500"><Banknote size={20}/></div>
                   <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Salário Mensal</label>
                      <input type="number" className="bg-transparent w-full outline-none text-slate-800 dark:text-white font-bold text-sm" value={tempSalary} onChange={e => setTempSalary(e.target.value)} />
                   </div>
                </div>
              </div>
           </div>

           {/* GRUPO 2: CUSTOMIZAÇÃO */}
           <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Aparência</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y dark:divide-slate-800 shadow-sm overflow-hidden">
                
                {/* Dark Mode Toggle */}
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                   <div className="flex items-center gap-4">
                      {isDarkMode ? <Moon size={18} className="text-indigo-400"/> : <Sun size={18} className="text-orange-400"/>}
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Modo {isDarkMode ? 'Escuro' : 'Claro'}</span>
                   </div>
                   <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
                   </div>
                </button>

                {/* Privacy Mode Toggle */}
                <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className="w-full p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                   <div className="flex items-center gap-4">
                      {isPrivacyMode ? <EyeOff size={18} className="text-purple-500"/> : <Eye size={18} className="text-slate-400"/>}
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Ocultar Valores</span>
                   </div>
                   <div className={`w-10 h-5 rounded-full relative transition-colors ${isPrivacyMode ? 'bg-purple-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isPrivacyMode ? 'left-6' : 'left-1'}`}></div>
                   </div>
                </button>
              </div>
           </div>

           {/* Botão da Política de Privacidade */}
             <button 
               onClick={() => window.open('https://liberta-6681e.web.app', '_system')} 
              className="w-full p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-t dark:border-slate-800"
             >    
              <div className="flex items-center gap-4">
             <ShieldCheck size={18} className="text-emerald-500"/>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Política de Privacidade</span>
         </div>
             <ChevronRight size={16} className="text-slate-400" />
        </button>

           {/* GRUPO 3: CONTA */}
           <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Segurança</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <button 
                  onClick={() => { handleLogout(); onClose(); }}
                  className="w-full p-4 flex items-center gap-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                   <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"><LogOut size={18}/></div>
                   <span className="text-sm font-bold">Sair do Aplicativo</span>
                   <ChevronRight size={16} className="ml-auto opacity-30" />
                </button>
              </div>
              <button onClick={onDeleteAccount} className="w-full py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                Excluir todos os dados
              </button>
           </div>
        </div>
        </div>
    </div>
  );
};

// --- MODAIS ---

// --- INTRODUÇÃO PREMIUM (CARROSSEL TIPO INSTAGRAM) ---
const IntroModal = ({ isOpen, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      id: 1,
      title: "Inteligência Financeira.",
      text: "Aposente as folhas de cálculo. O Liberta usa o método 50/30/20 para organizar o seu dinheiro de forma automática e inteligente.",
      icon: Brain,
      color: "from-purple-600 to-indigo-600",
      glow: "bg-purple-500/20"
    },
    {
      id: 2,
      title: "A Bolsa, Descomplicada.",
      text: "Acompanhe Ações e FIIs em tempo real no nosso Terminal B3. Invista com confiança através de dicas simples e diretas.",
      icon: Activity,
      color: "from-emerald-500 to-teal-500",
      glow: "bg-emerald-500/20"
    },
    {
      id: 3,
      title: "Câmbio em Tempo Real.",
      text: "Dólar, Euro, Libra e muito mais. Acompanhe a cotação das principais moedas do mundo ao vivo, diretamente no seu telemóvel.",
      icon: Globe, // Certifique-se de que importou o Globe do lucide-react! (Ou troque por Banknote)
      color: "from-blue-500 to-cyan-500",
      glow: "bg-blue-500/20"
    },
    {
      id: 4,
      title: "Guerra às Dívidas.",
      text: "Crie um plano de ataque infalível (Efeito Bola de Neve) para limpar o seu nome, liquidar as faturas e voltar a respirar.",
      icon: Shield,
      color: "from-red-500 to-orange-500",
      glow: "bg-red-500/20"
    },
    {
      id: 5,
      title: "Realize os seus Sonhos.",
      text: "Viagens, carro novo ou reserva de emergência? Defina as suas metas e a aplicação calcula a data exata da sua conquista.",
      icon: Rocket,
      color: "from-pink-500 to-rose-500",
      glow: "bg-pink-500/20"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden">
      {/* Elementos de fundo abstratos dinâmicos */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ${slides[currentSlide].glow} -translate-y-1/2 translate-x-1/2`}></div>
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] transition-all duration-1000 ${slides[currentSlide].glow} translate-y-1/2 -translate-x-1/2`}></div>

      <div className="relative z-10 flex-1 flex flex-col justify-between p-8 pt-20">
        
        {/* Logo Liberta sempre presente */}
        <div className="flex justify-center animate-fade-in">
           <img 
              src="https://i.postimg.cc/cLjNJnTc/Chat-GPT-Image-30-de-jan-de-2026-16-16-07.png" 
              alt="Liberta" 
              className="h-12 w-auto rounded-xl shadow-2xl border border-white/10" 
           />
        </div>

        {/* Centro: Ícone Gigante e Animado */}
        <div className="flex-1 flex items-center justify-center">
           <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center text-white shadow-2xl animate-bounce-short`}>
              <CurrentIcon size={64} strokeWidth={1.5} />
           </div>
        </div>

        {/* Texto e Controles */}
        <div className="pb-12">
            {/* Barras de Progresso no topo do texto */}
            <div className="flex gap-2 mb-8">
                {slides.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-white transition-all duration-500 ${idx <= currentSlide ? 'w-full' : 'w-0'}`}></div>
                    </div>
                ))}
            </div>

            {/* Títulos com Animação de Troca */}
            <div className="space-y-4 animate-fade-in-up" key={currentSlide}>
                <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
                    {slides[currentSlide].title}
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                    {slides[currentSlide].text}
                </p>
            </div>

            {/* Botões de Ação */}
            <div className="mt-10 flex items-center justify-between">
                <button onClick={onComplete} className="text-slate-500 text-sm font-bold hover:text-white transition-colors">
                    Pular
                </button>
                
                <button 
                    onClick={nextSlide}
                    className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 bg-gradient-to-r ${slides[currentSlide].color}`}
                >
                    {currentSlide === slides.length - 1 ? "Começar" : "Próximo"} <ArrowRight size={20}/>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- SETUP PROFISSIONAL (CARTÃO FLUTUANTE) ---
const SetupModal = ({ isOpen, onSave, onClose }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');

  if (!isOpen) return null;

  const val = parseFloat(income || 0);
  
  return (
    // z-[150] para garantir que ele ignore interferências visuais
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in">
       <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors z-20">
             <X size={20}/>
          </button>

          <div className="h-1 bg-slate-800 w-full">
             <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }}></div>
          </div>

          <div className="p-8 pt-10">
              {step === 1 && (
                  <div className="space-y-6 animate-slide-up">
                     <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
                        <User size={32} className="text-white"/>
                     </div>
                     <h2 className="text-2xl font-bold text-white">Olá! 👋</h2>
                     <input 
                        autoFocus
                        className="w-full bg-transparent border-b-2 border-slate-700 focus:border-purple-500 py-3 text-xl text-white outline-none transition-all"
                        placeholder="Seu nome..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && name && setStep(2)}
                     />
                     <Button onClick={() => setStep(2)} disabled={!name} className="w-full mt-4" size="lg">Continuar</Button>
                  </div>
              )}

              {step === 2 && (
                  <div className="space-y-6 animate-slide-up">
                     <h2 className="text-2xl font-bold text-white">Renda Mensal 💰</h2>
                     <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-3">
                        <span className="text-slate-400 font-bold">R$</span>
                        <input 
                            autoFocus
                            type="number"
                            className="bg-transparent w-full text-2xl font-bold text-white outline-none"
                            placeholder="0,00"
                            value={income}
                            onChange={e => setIncome(validateMoney(e.target.value))}
                        />
                     </div>
                     <Button onClick={() => onSave(name, income)} disabled={!income} className="w-full bg-emerald-600 hover:bg-emerald-500" size="lg">
                        Finalizar e Entrar
                     </Button>
                  </div>
              )}
          </div>
       </div>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose, onGuestLogin, loading, auth, onSignupComplete, initialView = 'home' }) => {
  const [view, setView] = useState(initialView); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  useEffect(() => {
    if (isOpen) setView(initialView);
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const resetState = () => {
    setEmail('');
    setPassword('');
    setName('');
    setIncome('');
    setError('');
    setResetSent(false);
    setIsSubmitting(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; 
    setError('');
    setIsSubmitting(true); 
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false); 
      if (err.code === 'auth/invalid-credential') setError('E-mail ou senha incorretos.');
      else if (err.code === 'auth/user-not-found') setError('Usuário não encontrado.');
      else setError('Erro ao fazer login. Tente novamente.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!name) { setError("Por favor, preencha seu nome."); return; }
    setError('');
    setIsSubmitting(true); 
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      onSignupComplete(userCredential.user, name, income);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false); 
      if (err.code === 'auth/email-already-in-use') setError('Este e-mail já está cadastrado.');
      else if (err.code === 'auth/weak-password') setError('A senha deve ter pelo menos 6 caracteres.');
      else setError('Erro ao cadastrar. Tente novamente.');
    }
  };
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setResetSent(false);
    if(!email) { setError('Digite seu e-mail para recuperar a senha.'); return; }
    setIsSubmitting(true);
    try {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
        setIsSubmitting(false);
    } catch(err) {
        console.error("Erro ao enviar e-mail:", err);
        setIsSubmitting(false);
        setError('Erro ao enviar e-mail. Verifique se o endereço está correto.');
    }
  };

const handleSocialLogin = async (providerName) => {
    setError('');

    // --- LÓGICA DO GOOGLE ---
    if (providerName === 'google') {
        try {
            if (Capacitor.isNativePlatform()) {
                // 1. Login Nativo (Android)
                const googleUser = await GoogleAuth.signIn();
                // 2. Cria a credencial para o Firebase
                const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
                // 3. Entra no Firebase
                await signInWithCredential(auth, credential);
            } else {
                // Login Web (Computador)
                await signInWithPopup(auth, new GoogleAuthProvider());
            }
            onClose(); // Fecha o modal após sucesso
        } catch (err) {
            console.error(err);
            setError('Erro ao entrar com Google. Tente novamente.');
        }
    } 

    // --- LÓGICA DO FACEBOOK (Deixe desativado no APK por enquanto) ---
else if (providerName === 'facebook') {
    try {
        if (Capacitor.isNativePlatform()) {
            const result = await FacebookLogin.login({ permissions: ['public_profile', 'email'] });
            if (result.accessToken) {
                const credential = FacebookAuthProvider.credential(result.accessToken.token);
                await signInWithCredential(auth, credential);
                onClose();
            }
        } else {
            // CORREÇÃO: Usar FacebookAuthProvider aqui, não Google
            await signInWithPopup(auth, new FacebookAuthProvider()); 
            onClose();
        }
    } catch (err) {
        console.error("Erro Facebook:", err);
        setError('Erro ao entrar com Facebook. Tente novamente.');
    }
}
};

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[60] flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up relative border-t md:border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 z-20 flex items-center justify-center">
            <Loader className="animate-spin text-purple-500" size={32} />
          </div>
        )}
        
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 z-10 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
            <X size={20}/>
        </button>

        <div className="bg-slate-50 dark:bg-slate-800 p-6 text-center border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 dark:border-slate-600">
            <LockKeyhole size={28} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {view === 'home' ? 'Bem-vindo ao Liberta' : view === 'login' ? 'Acesse sua Conta' : view === 'forgot' ? 'Recuperar Senha' : 'Crie sua Conta'}
          </h3>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-medium animate-pulse">
              <AlertCircle size={18} className="shrink-0 mt-0.5"/>
              <span>{error}</span>
            </div>
          )}
          
          {resetSent && (
             <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl flex items-start gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <CheckCircle size={18} className="shrink-0 mt-0.5"/>
              <span>E-mail enviado! Verifique sua caixa.</span>
            </div>
          )}

          {view === 'home' && (
            <div className="space-y-3">
              <Button onClick={() => { setView('login'); resetState(); }} variant="primary" size="lg" className="w-full shadow-lg shadow-purple-500/20">
                Entrar com E-mail
              </Button>
              <Button onClick={() => { setView('signup'); resetState(); }} variant="secondary" size="lg" className="w-full">
                Criar Nova Conta
              </Button>
              
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest"><span className="bg-white dark:bg-slate-900 px-3 text-slate-400">ou continue com</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => handleSocialLogin('google')} variant="google" className="w-full justify-center">
                  <Chrome size={18} className="text-blue-500"/> <span className="truncate">Google</span>
                </Button>
                <Button onClick={() => handleSocialLogin('facebook')} variant="facebook" className="w-full justify-center">
                  <Facebook size={18}/> <span className="truncate">Facebook</span>
                </Button>
              </div>

              <button type="button" onClick={onGuestLogin} className="w-full py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline mt-1">
                 Continuar sem conta
              </button>
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5 ml-1">E-mail</label>
                <input type="email" required className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5 ml-1">Senha</label>
                <input type="password" required className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setView('forgot')} className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-2 ml-1 hover:underline">Esqueci minha senha</button>
              </div>
              
              <Button type="submit" disabled={isSubmitting} variant="primary" size="lg" className="w-full mt-2">
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest"><span className="bg-white dark:bg-slate-900 px-3 text-slate-400">ou</span></div>
              </div>

              <div className="flex gap-3 justify-center">
                 <button type="button" onClick={() => handleSocialLogin('google')} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><Chrome size={20} className="text-blue-500"/></button>
                 <button type="button" onClick={() => handleSocialLogin('facebook')} className="p-3 bg-[#1877F2] text-white rounded-xl hover:bg-[#166fe5] transition-colors"><Facebook size={20}/></button>
              </div>

              <Button onClick={() => setView('home')} variant="ghost" size="sm" className="w-full">Voltar</Button>
            </form>
          )}
          
          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
               <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5 ml-1">Confirme seu E-mail</label>
                <input type="email" required className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <Button type="submit" disabled={isSubmitting} variant="primary" size="lg" className="w-full mt-2">
                 {isSubmitting ? 'Enviando...' : 'Enviar Link'}
              </Button>
              <Button onClick={() => setView('login')} variant="ghost" size="sm" className="w-full">Voltar para Login</Button>
            </form>
          )}

          {view === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5 ml-1">Seu Nome</label>
                <input type="text" required className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all" value={name} onChange={e => setName(e.target.value)} placeholder="Como quer ser chamado?" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5 ml-1">E-mail</label>
                <input type="email" required className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5 ml-1">Senha</label>
                <input type="password" required className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white transition-all" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
              
              <Button type="submit" disabled={isSubmitting} variant="primary" size="lg" className="w-full mt-2">
                {isSubmitting ? 'Criando...' : 'Criar Conta'}
              </Button>
              
              <Button onClick={() => setView('home')} variant="ghost" size="sm" className="w-full">Voltar</Button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                Feito por <span className="font-bold text-slate-600 dark:text-slate-300">Prime Studios</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DE AVALIAÇÃO PREMIUM ---
const RatingModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleRate = async () => {
    try {
      // Feedback tátil ao clicar (vibração leve)
      await Haptics.impact({ style: ImpactStyle.Medium });
      
      // Link corrigido para o seu pacote oficial
      window.location.href = "market://details?id=com.primestudios.liberta";
      onClose();
    } catch (e) {
      console.error("Erro ao redirecionar para a loja:", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
        
        {/* Detalhe de luz no topo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          {/* Ícone de Estrela com Gradiente e Animação */}
          <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 rotate-3">
             <Star size={40} className="text-white fill-current animate-bounce-short" />
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Curtindo o Liberta?
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 px-2">
            Sua avaliação ajuda a **Prime Studios** a levar educação financeira para mais brasileiros. Leva só 5 segundos! ⭐
          </p>

          <div className="space-y-3">
            <Button 
              onClick={handleRate} 
              variant="primary" 
              size="lg" 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/30"
            >
               Avaliar na Google Play
            </Button>
            
            <button 
              onClick={onClose} 
              className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors py-2"
            >
               Talvez mais tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SKELETON LOADER ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}></div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6 p-4 md:p-8 animate-fade-in pb-32">
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-3">
        <Skeleton className="h-10 w-48 md:w-80" />
        <Skeleton className="h-4 w-32 md:w-56" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="md:col-span-2 h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
    </div>
  </div>
);

// --- MODAL DE CONFIRMAÇÃO DE NOTIFICAÇÃO (BOLSA E CÂMBIO) ---
const NotifPromptModal = ({ prompt, setPrompt, data, saveData }) => {
  if (!prompt.isOpen) return null;

  const handleChoice = (querAviso) => {
    // Descobre se é Ação ou Moeda
    const isStock = prompt.type === 'stock';
    const favKey = isStock ? 'favoriteStocks' : 'favoriteCurrencies';
    const notifKey = isStock ? 'notifiedStocks' : 'notifiedCurrencies';

    // Pega as listas atuais
    const favs = data[favKey] || [];
    const notifs = data[notifKey] || [];

    // Salva no banco/estado
    saveData({
      ...data,
      [favKey]: [...favs, prompt.key], // Adiciona aos favoritos
      [notifKey]: querAviso ? [...notifs, prompt.key] : notifs // Adiciona aos alertas se o usuário aceitou
    });

    // Fecha o modal e dá um feedback tátil
    try { Haptics.impact({ style: ImpactStyle.Medium }); } catch(e){}
    setPrompt({ isOpen: false, type: '', key: '', name: '' });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-scale-up">
        
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Star size={32} className="fill-current animate-bounce-short" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Favorito Adicionado!
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Deseja que o Liberta te envie alertas automáticos no celular quando <strong>{prompt.name}</strong> oscilar de preço?
        </p>

        <div className="flex gap-3 w-full">
          <Button onClick={() => handleChoice(false)} variant="secondary" className="flex-1">
            Não, só favoritar
          </Button>
          
          <Button onClick={() => handleChoice(true)} variant="primary" className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/20 border-none">
            Sim, me avise
          </Button>
        </div>

      </div>
    </div>
  );
};

// --- COMPONENTE: BOTÃO DE INSERÇÃO POR VOZ ---
const VoiceExpenseButton = ({ onVoiceCaptured }) => {
  const [isListening, setIsListening] = useState(false);

  const handleStartListening = async () => {
    // Bloqueio Premium removido para testes livres! 🚀

    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') return;

      try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch(e){}
      setIsListening(true);

      await SpeechRecognition.start({
        language: 'pt-BR',
        maxResults: 1,
        prompt: 'Diga seu gasto...',
        partialResults: true,
        popup: false,
      });

      SpeechRecognition.addListener('partialResults', (data) => {
        if (data.matches && data.matches.length > 0) {
          const spokenText = data.matches[0];
          SpeechRecognition.stop();
          setIsListening(false);
          
          try { Haptics.notification({ type: 'SUCCESS' }); } catch(e){}
          onVoiceCaptured(spokenText);
        }
      });

    } catch (error) {
      console.error("Erro na voz:", error);
      setIsListening(false);
    }
  };

  return (
    <button
      onClick={handleStartListening}
      className={`p-2 rounded-full transition-all active:scale-90 ${
        isListening 
          ? 'text-red-500 animate-pulse' 
          : 'text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Mic size={20} strokeWidth={isListening ? 2.5 : 2} />
    </button>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const appId = "liberta-financeira-app";
  // Estado para controlar o Modal de Confirmação
const [confirmConfig, setConfirmConfig] = useState({
  isOpen: false,
  title: '',
  message: '',
  action: null // Aqui guardaremos a função de deletar
});

// Estado para controlar a pergunta de notificação (Ações e Câmbio)
  const [notifPrompt, setNotifPrompt] = useState({ 
    isOpen: false, 
    type: '', // 'currency' ou 'stock'
    key: '',  // Ex: 'USD' ou 'PETR4'
    name: ''  // Ex: 'Dólar EUA' ou 'Petrobras'
  });

// Função auxiliar para chamar o modal
const requestConfirm = (title, message, action) => {
  setConfirmConfig({
    isOpen: true,
    title,
    message,
    action
  });
};

    // Estado para o formulário de Nova Meta (Sonhos)
const [newDream, setNewDream] = useState({ 
  title: '', 
  target: '',     
  monthly: '',    
  category: 'buy',
  currency: 'BRL' // <--- NOVO: Moeda padrão é o Real
});

// --- ESTADOS DA BOLSA DE VALORES ---
  const [stockQuery, setStockQuery] = useState('');
  const [stockResult, setStockResult] = useState(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState('');
  const [activeStockCategory, setActiveStockCategory] = useState('Destaques');

                     // ... outros modais ...
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [investmentSubTab, setInvestmentSubTab] = useState('renda_fixa');
  const [budgetSubTab, setBudgetSubTab] = useState('renda');
  const [debtSubTab, setDebtSubTab] = useState('estrategia');
  const [showFixedIncomeGuide, setShowFixedIncomeGuide] = useState(true);
  const [brlToConvert, setBrlToConvert] = useState(1000);
  const [convCurrency1, setConvCurrency1] = useState('USD');
  const [convCurrency2, setConvCurrency2] = useState('EUR');
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [currencyHistory, setCurrencyHistory] = useState(null);
  const [loadingCurrencyHistory, setLoadingCurrencyHistory] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [useBiometrics, setUseBiometrics] = useState(() => {
    return localStorage.getItem('liberta_use_biometrics') === 'true';
  });
  const [isBioAuthenticated, setIsBioAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalView, setLoginModalView] = useState('home');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('offline'); 
  const [isPrivacyMode, setIsPrivacyMode] = useState(false); 
  const [showToast, setShowToast] = useState(false); 
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showBudgetGuide, setShowBudgetGuide] = useState(true);
  // ESTADO DO MODO ESCURO
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 1. Verifica se o usuário já tem preferência salva
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme_mode');
      if (saved !== null) {
        return saved === 'dark';
      }
    }
    // 2. PARA MUDAR O PADRÃO, ALTERE AQUI:
    return true; // Use 'true' para Escuro ou 'false' para Claro
  });

  // --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (SEGURANÇA) ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden animate-scale-up">
        
        <div className="flex flex-col items-center text-center">
          {/* Ícone de Alerta Animado */}
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
             <AlertTriangle size={32} className="animate-pulse-slow" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {title || "Tem certeza?"}
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            {message || "Essa ação não poderá ser desfeita. O item será excluído permanentemente."}
          </p>

          <div className="flex gap-3 w-full">
            <Button 
              onClick={onClose} 
              variant="secondary" 
              className="flex-1"
            >
               Cancelar
            </Button>
            
            <Button 
              onClick={() => { onConfirm(); onClose(); }} 
              variant="danger" 
              className="flex-1 shadow-lg shadow-red-500/20"
            >
               Sim, Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Efeito ÚNICO para aplicar o tema
  useEffect(() => {
    localStorage.setItem('theme_mode', isDarkMode ? 'dark' : 'light');
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Configuração do Tailwind (estava no bloco duplicado, trouxemos para cá)
    if (typeof window !== 'undefined' && window.tailwind) {
        window.tailwind.config = {
            darkMode: 'class',
            ...window.tailwind.config
        };
    }
  }, [isDarkMode]);

const defaultData = {
    isPro: false, 
    userName: '',

    currentMonthId: new Date().getMonth(),
    lastMonthExpenses: {},

    // --- GAMIFICAÇÃO (NOVO) ---
    xp: 0,
    quests: [
      { id: 'q_salario', title: 'Mestre da Renda', desc: 'Cadastre seu salário mensal no Orçamento.', xp: 50, claimed: false },
      { id: 'q_sobrevivencia', title: 'Sobrevivente', desc: 'Defina seu Custo de Sobrevivência.', xp: 50, claimed: false },
      { id: 'q_sonho', title: 'Sonhador', desc: 'Crie sua primeira meta na aba Sonhos.', xp: 100, claimed: false }
    ],
    // --------------------------

    favoriteCurrencies: [],
    notifiedCurrencies: [], 
    favoriteStocks: [],
    notifiedStocks: [],     
    notificationCount: 0,
    lastNotificationDate: '', 
    income: { salary: 0, extra: 0, salaryDay: 5 }, 
    expenses: { 
      rent: 0, water: 0, light: 0, internet: 0, gas: 0, market: 0, pharmacy: 0, transport: 0, education: 0, health: 0,
      creditCard: 0, dependents: 0, pets: 0, insurance: 0,
      leisure: 0, streaming: 0, delivery: 0, shopping: 0, personalCare: 0, other: 0
    },
    expenseDates: {}, 
    excludedExpenses: {},
    debts: [], 
    accounts: [],
    cards: [], 
    investments: { initial: 0, monthly: 0, rate: 10, years: 10 },
    dreams: [], 
    challengeProgress: {},
    survivalCost: 0
  };
  
  // No seu useState logo abaixo (onde carrega o backup local), atualize a linha do return:
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('liberta_backup_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { 
          ...defaultData, 
          ...parsed,
          cards: parsed.cards || [], // <--- GARANTE QUE NÃO DÊ ERRO EM CONTAS ANTIGAS
          income: { ...defaultData.income, ...(parsed.income || {}) },
        investments: { ...defaultData.investments, ...(parsed.investments || {}) }
      };
    }
    return defaultData;
  } catch (error) {
    console.error("Erro ao carregar dados locais:", error);
    return defaultData; // Se der erro, inicia limpo em vez de travar
  }
});
  // ------------------------------

// --- ESTADO PARA CONTROLAR O ESPAÇO DO ANÚNCIO ---
  const [adLoaded, setAdLoaded] = useState(false);

// Inicializa o Google Auth apenas se estiver no celular
useEffect(() => {
   if (Capacitor.isNativePlatform()) {
       GoogleAuth.initialize({
           // Use este ID que é o correto do seu projeto atual
           clientId: '640425467573-2o4rfscvvs7o09j85pvcpe96gt1bvbuu.apps.googleusercontent.com',
           scopes: ['profile', 'email'],
           grantOfflineAccess: true,
       });
   }
}, []);

 // --- LÓGICA DE ANÚNCIOS (CORRIGIDA PARA NÃO COBRIR O MENU) ---
useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      AdMob.initialize();
    }
  }, []);

  // 2. Controla se o banner aparece ou se esconde (Gere a visibilidade)
useEffect(() => {
  const manageAds = async () => {
    if (!Capacitor.isNativePlatform() || loading) return;

    // Garante inicialização antes de tentar mostrar
    await AdMob.initialize();

    const shouldHide = data.isPro || isSettingsOpen || isLoginModalOpen || 
                       isAchievementsOpen || isSetupOpen || isTutorialOpen || isOnboardingOpen;

    try {
      if (shouldHide) {
        await AdMob.hideBanner();
        setAdLoaded(false);
      } else {
        // Tente forçar o resumo do banner se ele já existir, ou criar um novo
          await AdMob.showBanner({
           adId: 'ca-app-pub-4462253684230597/5323695316', 
           adSize: BannerAdSize.BANNER,
           position: BannerAdPosition.BOTTOM_CENTER,
           margin: 0,
           isTesting: false 
      });
        setAdLoaded(true);
      }
    } catch (e) {
      console.error("Erro crítico no AdMob:", e);
    }
  };
  
  manageAds();
}, [data.isPro, loading, isSettingsOpen, isLoginModalOpen, isAchievementsOpen, isSetupOpen, isTutorialOpen, isOnboardingOpen]);

  // --- LÓGICA DAS ESTRELAS/AVALIAÇÃO (ATUALIZADA) ---
useEffect(() => {
  const verificarAvaliacao = async () => {
    try {
      // 1. Pega quantas vezes o app já foi aberto via Capacitor Preferences
      const { value } = await Preferences.get({ key: 'launch_count' });
      let count = value ? parseInt(value) : 0;

      // 2. Aumenta a contagem e salva no dispositivo
      count++;
      await Preferences.set({ key: 'launch_count', value: count.toString() });

      // 3. REGRA DE NEGÓCIO: Mostra na 3ª vez, na 10ª e na 50ª (estratégia de reforço)
      if (count === 3 || count === 10 || count === 50) {
        // Delay de 3 segundos para o app carregar tudo antes de pedir
        setTimeout(() => {
           setIsRatingModalOpen(true); // <--- Abre o seu novo modal moderno
        }, 3000); 
      }
    } catch (e) {
      console.error("Erro na lógica de avaliação:", e);
    }
  };

  verificarAvaliacao();
}, []);
  // ------------------------------------

  // --- FUNÇÃO DE COMPRA REAL (MENSAL) ---
const handleBuyPro = async () => {
    if (!authUser) {
      alert("Para assinar o Premium, você precisa criar uma conta primeiro.");
      setLoginModalView('signup');
      setIsLoginModalOpen(true);
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      alert("A assinatura nativa só funciona no aplicativo instalado no celular.");
      return;
    }

    try {
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        
        const { customerInfo } = await Purchases.purchasePackage({ 
          aPackage: offerings.current.monthly 
        });

        if (typeof customerInfo.entitlements.active['pro'] !== "undefined") {
          const newData = { ...data, isPro: true };
          saveData(newData);
          
          alert("🎉 Pagamento aprovado! Bem-vindo ao Liberta Pro.");
          triggerCelebration(); 
        }
      } else {
        alert("A loja está sendo configurada. Tente novamente nos próximos dias!");
      }
    } catch (e) {
      if (!e.userCancelled) {
        console.error("Erro na compra:", e);
        alert("Erro ao conectar com a Google Play. Verifique sua conexão.");
      }
    }
  };

// --- SISTEMA DE NOTIFICAÇÕES "HOOK" (BLINDADO & APRIMORADO) ---
  const scheduleAppNotifications = async () => {
    // Só roda se for app nativo (Android/iOS)
    if (!Capacitor.isNativePlatform()) return;

    try {
      // 1. Checagem rígida de permissão
      let perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        perm = await LocalNotifications.requestPermissions();
      }
      if (perm.display !== 'granted') return;

      // 2. CRIAÇÃO DE CANAL ANDROID (ESSENCIAL PARA O S25 E ANDROID 8+)
      // Isso força a notificação a saltar no ecrã (Heads-up) e tocar som.
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
            id: 'liberta_alerts_pro',
            name: 'Alertas Financeiros',
            description: 'Avisos de vencimentos e lembretes importantes',
            importance: 5, // 5 = HIGH (Garante o Pop-up na tela e vibração)
            visibility: 1, // 1 = PUBLIC (Aparece no ecrã de bloqueio)
            vibration: true,
        });
      }

      // 3. Limpa pendentes antigas para não duplicar
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      const notifications = [];
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const firstName = data.userName ? data.userName.split(' ')[0] : 'Campeão';
      
      // Mapeamento expandido para abranger mais despesas do seu App
      const labelMap = {
        rent: 'o Aluguel 🏠', light: 'a Luz 💡', water: 'a Água 💧', internet: 'a Internet 🌐',
        card: 'o Cartão 💳', gas: 'o Gás 🔥', education: 'a Educação 🎓', transport: 'o Transporte 🚌',
        market: 'o Mercado 🛒', pharmacy: 'a Farmácia 💊', health: 'o Plano de Saúde 🏥',
        insurance: 'o Seguro 🛡️', dependents: 'os Filhos 👨‍👩‍👧‍👦', pets: 'o Pet 🐕'
      };

      // --- A: CONTAS A VENCER ---
      let categoryIndex = 1; // Para gerar IDs únicos sem conflitos

      Object.entries(data.expenseDates).forEach(([key, dayStr]) => {
        if (!dayStr || data.excludedExpenses[key] || Number(data.expenses[key]) === 0) return;

        const dueDay = parseInt(dayStr);
        
        // Lógica de Data Segura: Cria a data do vencimento para o mês atual
        let dueDate = new Date(currentYear, currentMonth, dueDay, 9, 0, 0);

        // Se a data já passou (ou se hoje é o dia mas já passa das 9h da manhã), joga para o mês seguinte
        if (dueDate.getTime() <= Date.now()) {
            if (currentMonth === 11) {
                dueDate = new Date(currentYear + 1, 0, dueDay, 9, 0, 0);
            } else {
                dueDate = new Date(currentYear, currentMonth + 1, dueDay, 9, 0, 0);
            }
        }

        // VÉSPERA (16:00 do dia anterior)
        const warningDate = new Date(dueDate);
        warningDate.setDate(dueDate.getDate() - 1);
        warningDate.setHours(16, 0, 0);

        const baseId = categoryIndex * 100;

        if (warningDate.getTime() > Date.now()) {
            notifications.push({
              id: baseId + 1,
              channelId: 'liberta_alerts_pro',
              title: `Amanhã vence ${labelMap[key] || 'uma conta'} 📅`,
              body: `Ei ${firstName}, passa aqui no Liberta para conferir o valor e garantir que está tudo sob controlo para amanhã!`,
              schedule: { at: warningDate }
            });
        }

        // DIA DO VENCIMENTO (09:00)
        if (dueDate.getTime() > Date.now()) {
            notifications.push({
              id: baseId + 2,
              channelId: 'liberta_alerts_pro',
              title: `🚨 É hoje: ${labelMap[key] || 'sua conta'}!`,
              body: `${firstName}, não deixe para a última hora. Pague agora para evitar juros e manter a sua paz mental.`,
              schedule: { at: dueDate }
            });
        }
        categoryIndex++;
      });

      // --- B: SALÁRIO ---
      const userSalaryDay = data.income.salaryDay || 5;
      let salaryDate = new Date(currentYear, currentMonth, userSalaryDay, 10, 0, 0);
      
      if (salaryDate.getTime() <= Date.now()) {
          if (currentMonth === 11) {
              salaryDate = new Date(currentYear + 1, 0, userSalaryDay, 10, 0, 0);
          } else {
              salaryDate = new Date(currentYear, currentMonth + 1, userSalaryDay, 10, 0, 0);
          }
      }

      if (salaryDate.getTime() > Date.now()) {
          notifications.push({
              id: 8888,
              channelId: 'liberta_alerts_pro',
              title: `O dia da vitória chegou, ${firstName}! 💰`,
              body: "O seu salário caiu (ou está quase lá)! Antes de gastar, abra o Liberta e pague o seu 'Eu do Futuro' primeiro.",
              schedule: { at: salaryDate }
          });
      }

      // --- C: INATIVIDADE (Para não perder o hábito) ---
      const missYouDate = new Date();
      missYouDate.setDate(missYouDate.getDate() + 3);
      missYouDate.setHours(19, 30, 0); // Notifica de noite (19h30) quando a pessoa está livre

      notifications.push({
          id: 7011,
          channelId: 'liberta_alerts_pro',
          title: `A sua saúde financeira precisa de si 👀`,
          body: `${firstName}, pequenos gastos diários esquecidos fazem grandes furos. Venha registar o que gastou hoje!`,
          schedule: { at: missYouDate }
      });

      // --- D: PREMIUM ---
      

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`⏰ ${notifications.length} notificações agendadas com sucesso no Canal Pro.`);
      }
    } catch (e) {
      console.error("Erro crítico ao agendar notificações:", e);
    }
  };

  // Chama a função com "Debounce" (Espera o usuário parar de digitar por 2 segundos antes de recalcular tudo)
  useEffect(() => {
    const timer = setTimeout(() => {
      scheduleAppNotifications();
    }, 2000);
    return () => clearTimeout(timer);
  }, [data]);

  // Chama a função sempre que os dados mudarem
  useEffect(() => {
    scheduleAppNotifications();
  }, [data]);

  // --- NOVA LÓGICA: VIRADA DE MÊS AUTOMÁTICA ---
  useEffect(() => {
    if (loading || !data) return;

    const currentMonth = new Date().getMonth();

    // Se o mês atual do calendário for diferente do mês salvo no banco:
    if (data.currentMonthId !== currentMonth && data.currentMonthId !== undefined) {
      
      // 1. Salva os gastos atuais como "mês passado"
      const newData = {
        ...data,
        currentMonthId: currentMonth,
        lastMonthExpenses: data.expenses,
        
        // OPCIONAL: Se você quiser que o app zere os gastos automaticamente na virada do mês, 
        // descomente a linha abaixo (remova as duas barras //):
        // expenses: defaultData.expenses 
      };

      saveData(newData);
    }
  }, [data, loading]);
  // ---------------------------------------------

  const [investProfile, setInvestProfile] = useState(null); 
  const [searching, setSearching] = useState(false);
  const [marketOpportunities, setMarketOpportunities] = useState([]);
  const [marketRates, setMarketRates] = useState({ selic: 11.25, cdi: 11.15, ipca: 4.50, loaded: false, lastUpdate: 0 });
  const saveTimeoutRef = useRef(null);
  const dataToSaveRef = useRef(defaultData);
  const currentDataRef = useRef(data);
  const notifiedAssetsRef = useRef({});

  

  // --- GARANTE QUE O BACKGROUND SEMPRE LEIA OS DADOS MAIS RECENTES ---
  useEffect(() => {
    currentDataRef.current = data;
  }, [data]);


  const formatMoney = (value) => {
    if (isPrivacyMode) return 'R$ •••••';
    return Number(value).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  };
  
const formatMoneyNoSign = (value) => {
    if (isPrivacyMode) return '•••••';
    return Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }; // <--- IMPORTANTE: Fechamos a função aqui com };

// --- FUNÇÃO DE CÂMBIO COMERCIAL (Tudo Venda/Ask) ---
  const [quotes, setQuotes] = useState(null);

// --- FUNÇÃO DE ALERTA INTELIGENTE (LIMITE 3x/DIA) ---
  const sendFinancialAlert = async (title, body) => {
    const MAX_NOTIF_PER_DAY = 20;
    const hoje = new Date().toLocaleDateString();
    
    const actualData = currentDataRef.current;
    let count = actualData.notificationCount || 0;
    let ultimaData = actualData.lastNotificationDate || "";

    if (ultimaData !== hoje) {
      count = 0;
      ultimaData = hoje;
    }

    if (count >= MAX_NOTIF_PER_DAY) {
      console.log("Limite diário de notificações atingido.");
      return;
    }

    try {
      let permission = await LocalNotifications.checkPermissions();
      if (permission.display !== 'granted') {
        permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') return; 
      }

      // CRIA O CANAL AQUI TAMBÉM (Garante que o S25 não bloqueia o alerta)
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
            id: 'liberta_alerts_pro',
            name: 'Alertas Financeiros',
            importance: 5,
            visibility: 1,
            vibration: true,
        });
      }

      await LocalNotifications.schedule({
        notifications: [{
          title: title,
          body: body,
          id: Math.floor(Math.random() * 100000),
          channelId: 'liberta_alerts_pro', 
          smallIcon: 'ic_stat_liberta', 
          iconColor: '#7C3AED'          
        }]
      });

      saveData({
        ...actualData,
        notificationCount: count + 1,
        lastNotificationDate: hoje
      });
    } catch (e) {
      console.error("Erro ao enviar notificação local:", e);
    }
  };

const fetchTicker = async () => {
    try {
      const res = await fetch(`https://economia.awesomeapi.com.br/last/USD-BRL,CAD-BRL,EUR-BRL,GBP-BRL,CHF-BRL,ARS-BRL,JPY-BRL,CNY-BRL,AUD-BRL,CLP-BRL,BTC-BRL?t=${Date.now()}`);
      const dataApi = await res.json();
      
      const newQuotes = {
        BRL: { val: 1, pct: 0, name: 'Real Brasileiro' },
        USD: { val: parseFloat(dataApi.USDBRL.ask), pct: parseFloat(dataApi.USDBRL.pctChange), name: 'Dólar EUA' },
        CAD: { val: parseFloat(dataApi.CADBRL.ask), pct: parseFloat(dataApi.CADBRL.pctChange), name: 'Dólar Can.' },
        EUR: { val: parseFloat(dataApi.EURBRL.ask), pct: parseFloat(dataApi.EURBRL.pctChange), name: 'Euro' },
        GBP: { val: parseFloat(dataApi.GBPBRL.ask), pct: parseFloat(dataApi.GBPBRL.pctChange), name: 'Libra' },
        CHF: { val: parseFloat(dataApi.CHFBRL.ask), pct: parseFloat(dataApi.CHFBRL.pctChange), name: 'Franco Suíço' },
        AUD: { val: parseFloat(dataApi.AUDBRL.ask), pct: parseFloat(dataApi.AUDBRL.pctChange), name: 'Dólar Aus.' },
        ARS: { val: parseFloat(dataApi.ARSBRL.ask), pct: parseFloat(dataApi.ARSBRL.pctChange), name: 'Peso Arg.' },
        CLP: { val: parseFloat(dataApi.CLPBRL.ask), pct: parseFloat(dataApi.CLPBRL.pctChange), name: 'Peso Chileno' },
        JPY: { val: parseFloat(dataApi.JPYBRL.ask), pct: parseFloat(dataApi.JPYBRL.pctChange), name: 'Iene Jap.' },
        CNY: { val: parseFloat(dataApi.CNYBRL.ask), pct: parseFloat(dataApi.CNYBRL.pctChange), name: 'Yuan Chinês' }
      };

       // --- MONITORIZAÇÃO DE FAVORITOS (CÂMBIO) ---
      const actualData = currentDataRef.current;
      const hoje = new Date().toLocaleDateString();
      const horaAtual = new Date().getHours();
      
      let turno = null;
      if (horaAtual >= 9 && horaAtual < 13) turno = 'manha';
      else if (horaAtual >= 13 && horaAtual < 17) turno = 'tarde';
      else if (horaAtual >= 17) turno = 'noite';
      
      if (turno && actualData.notifiedCurrencies && actualData.notifiedCurrencies.length > 0) {
        actualData.notifiedCurrencies.forEach(favKey => {
          const moedaInfo = newQuotes[favKey];
          
          if (moedaInfo) {
            const controleTurno = `${hoje}-${turno}`;
            if (notifiedAssetsRef.current[favKey] !== controleTurno) { 
               const direcao = moedaInfo.pct >= 0 ? "📈" : "📉";
               sendFinancialAlert(
                 `Boletim Câmbio: ${favKey}`,
                 `O ${moedaInfo.name} está valendo R$ ${moedaInfo.val.toFixed(2)} neste momento ${direcao}`
               );
               notifiedAssetsRef.current[favKey] = controleTurno;
            }
          }
        });
      }

      setQuotes(newQuotes);

      // 👇 MOTOR DINÂMICO DO WIDGET 👇
      if (Capacitor.isNativePlatform()) {
        const actualData = currentDataRef.current;
        const favCur = actualData.favoriteCurrencies || [];
        const favStocks = actualData.favoriteStocks || [];

        // Junta tudo numa lista só (até 3 itens no máximo)
        let widgetItems = [];

        // 1. Adiciona as moedas favoritas
        favCur.forEach(moeda => {
            if (newQuotes[moeda] && widgetItems.length < 3) {
                widgetItems.push({ name: moeda, val: newQuotes[moeda].val.toFixed(2) });
            }
        });

        // 2. Adiciona as ações favoritas (se sobrar espaço)
        if (stockResult && favStocks.includes(stockResult.symbol) && widgetItems.length < 3) {
            widgetItems.push({ name: stockResult.symbol, val: stockResult.regularMarketPrice.toFixed(2) });
        }

        // 3. Salva os 3 slots. Se não tiver item, salva VAZIO ("")
        for (let i = 1; i <= 3; i++) {
            const item = widgetItems[i - 1];
            Preferences.set({ key: `wdg_nome_${i}`, value: item ? item.name : "" });
            Preferences.set({ key: `wdg_val_${i}`, value: item ? item.val : "" });
        }
      }

    } catch (e) {
      // 👇 O CATCH FICA APENAS PARA OS ERROS 👇
      console.error("Erro ao buscar câmbio:", e);
    }
  };

  

// Atualiza ao abrir e a cada 60s (PARA O VISUAL DO CÂMBIO)
  useEffect(() => {
    fetchTicker();
    const interval = setInterval(fetchTicker, 60000);
    return () => clearInterval(interval);
  }, []);

// --- MONITORIZAÇÃO DAS AÇÕES (CORRIGIDA - POR TURNOS) ---
  useEffect(() => {
    const monitorarAcoes = async () => {
      const actualData = currentDataRef.current;
      
      if (!actualData.notifiedStocks || actualData.notifiedStocks.length === 0) return;

      try { // <-- Esse é o cara que estava faltando no seu print!
        const tickers = actualData.notifiedStocks.join(',');
        const res = await fetch(`https://brapi.dev/api/quote/${tickers}`);
        const json = await res.json();

        if (json.results) {
          const hoje = new Date().toLocaleDateString();
          const horaAtual = new Date().getHours();
          
          let turno = null;
          if (horaAtual >= 9 && horaAtual < 13) turno = 'manha';
          else if (horaAtual >= 13 && horaAtual < 17) turno = 'tarde';
          else if (horaAtual >= 17) turno = 'noite';

          if (turno) {
            json.results.forEach(stock => {
              const controleTurno = `${hoje}-${turno}`;
              
              if (notifiedAssetsRef.current[stock.symbol] !== controleTurno) {
                const direcao = stock.regularMarketChangePercent >= 0 ? "em alta! 📈" : "em queda! 📉";
                
                sendFinancialAlert(
                  `Boletim Bolsa: ${stock.symbol}`,
                  `${stock.shortName} cotada a R$ ${stock.regularMarketPrice.toFixed(2)} agora ${direcao}`
                );
                
                notifiedAssetsRef.current[stock.symbol] = controleTurno;
              }
            });
          }
        }
      } catch (e) {
        console.error("Erro ao monitorar ações:", e);
      }
    };

    monitorarAcoes();
    const intervalId = setInterval(monitorarAcoes, 300000);
    return () => clearInterval(intervalId);
    
  }, []); 
  
  // ----------------------------------------------------------------

  const handleCurrencyClick = async (currencyCode, currencyName, currentPrice) => {
    // 1. Abre o modal imediatamente com o nome e preço
    setSelectedCurrency({ code: currencyCode, name: currencyName, price: currentPrice });

    try {
      // 2. Busca o histórico dos últimos 30 dias na API
      const res = await fetch(`https://economia.awesomeapi.com.br/json/daily/${currencyCode}-BRL/30`);
      const data = await res.json();
      
      // 3. A API manda do mais novo pro mais velho. Precisamos inverter (.reverse()) pro gráfico ficar certo
      const history = data.map(item => parseFloat(item.ask)).reverse();
      setCurrencyHistory(history);
    } catch (e) {
      console.error("Erro ao buscar histórico da moeda:", e);
    } finally {
      setLoadingCurrencyHistory(false);
    }
  };

  // Efeito para configurar a StatusBar do Android (Capacitor)
  useEffect(() => {
    const configurarBarra = async () => {
      try {
        await StatusBar.setBackgroundColor({ color: '#7C3AED' }); 
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (e) {
        // Ignora se não for app nativo
      }
    };
    configurarBarra();
  }, []);

  useEffect(() => {
    let unsubscribeAuth;

    const initApp = async () => {
      if (!app) {
        setLoading(false);
        setSyncStatus('offline');
        return;
      }
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          setLoading(false); 
        }
      } catch (e) {
        console.error("Auth falhou", e);
        setSyncStatus('error');
      }
    };

    if (auth) {
        unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
          setAuthUser(currentUser);

          if (currentUser) {
            // --- PREPARAÇÃO DO REVENUECAT ---
            if (Capacitor.isNativePlatform()) {
              try {
                await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
                await Purchases.configure({ 
                  apiKey: "goog_CHAVE_PENDENTE", // Substituiremos quando o Google aprovar a conta
                  appUserID: currentUser.uid // Amarra a compra ao ID do usuário no Firebase
                });
              } catch (error) {
                console.error("Erro ao iniciar a loja:", error);
              }
            }
            // --------------------------------

            // Se já tiver usuário logado, entra direto no painel
            subscribeToData(currentUser.uid);
            setIsLoginModalOpen(false);
            setIsOnboardingOpen(false);
          } else {
            // --- USUÁRIO DESLOGADO ---
            setLoading(false);
            
            // VERIFICAÇÃO DE SEGURANÇA:
            // Pergunta: "Existe a confirmação de que ele já fez a intro?"
            const jaFezIntro = localStorage.getItem('liberta_intro_complete');
        
            if (jaFezIntro === 'true') {
                // CENÁRIO A: JÁ FEZ ANTES (Segunda vez em diante)
                // Pula a intro e manda direto para a tela de Login
                console.log("Intro já realizada. Indo para login.");
                setIsOnboardingOpen(false);
                setLoginModalView('home'); 
                setIsLoginModalOpen(true);
            } else {
                // CENÁRIO B: PRIMEIRA VEZ NA VIDA (Nunca abriu o app)
                // Mostra a Intro/Onboarding
                console.log("Primeira vez no app. Abrindo Intro.");
                setData(defaultData);
                setIsOnboardingOpen(true);
                setIsLoginModalOpen(false);
            }
          }
        });
    }

    initApp();
    fetchRates(); 

    const interval = setInterval(() => {
        fetchRates();
    }, 60 * 1000); 

    return () => {
        if(unsubscribeAuth) unsubscribeAuth();
        clearInterval(interval);
    }
  }, []);

// --- FUNÇÃO DE TAXAS (BLINDADA CONTRA ERROS) ---
const fetchRates = async (manual = false) => {
  try {
    // Tenta pegar a Selic Anual (Série 432)
    const response = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json');
    
    // Verifica se a resposta da internet foi OK
    if (!response.ok) throw new Error('Falha na conexão com BCB');

    const dataJson = await response.json();

    // Verifica se os dados vieram no formato certo (Array com pelo menos 1 item)
    if (dataJson && Array.isArray(dataJson) && dataJson.length > 0) {
        const selicValue = parseFloat(dataJson[0].valor);
        
        setMarketRates(prev => ({ 
            ...prev, 
            selic: selicValue, 
            cdi: selicValue - 0.10, // CDI geralmente é 0.10 abaixo da Selic
            loaded: true,
            lastUpdate: Date.now()
        }));

        if (manual) setShowToast(true);
    } else {
        throw new Error('Formato de dados inválido');
    }

  } catch (e) {
    console.warn("Usando taxas offline:", e);
    // FALLBACK DE SEGURANÇA: Se der qualquer erro, usa valores fixos e o app NÃO trava
    setMarketRates(prev => ({ 
        ...prev, 
        selic: 11.25, // Valor fixo seguro
        cdi: 11.15, 
        loaded: true 
    }));
    
    if (manual) alert("Sem conexão com o Banco Central. Usando taxas padrão.");
  }
};

  const handleLogout = () => setIsLogoutConfirmOpen(true);
  const confirmLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    setIsLogoutConfirmOpen(false);
    window.location.reload();
  };

  const handleGuestLogin = () => {
    setIsLoginModalOpen(false);
    setIsOnboardingOpen(false);
    // O useEffect "Vigia" abrirá o SetupModal para o visitante
  };

  const handleSignupComplete = async (user, name, income) => {
    const newData = { ...defaultData, userName: name, income: { ...defaultData.income, salary: Number(income) } };
    await saveData(newData);
    setIsLoginModalOpen(false);
  };

// --- 1. FUNÇÃO DE SINCRONIZAÇÃO (CORRIGIDA) ---
  const subscribeToData = (userId) => {
    if (!db || !appId || !userId) return;
    const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'data', 'financial_profile');

    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      setLoading(false); 
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        const mergedData = { 
            ...defaultData, 
            ...remoteData,
            expenses: { ...defaultData.expenses, ...(remoteData.expenses || {}) },
            income: { ...defaultData.income, ...(remoteData.income || {}) }
        };
        setData(mergedData);
        setSyncStatus('synced');
      } else {
        const temBackup = localStorage.getItem('liberta_backup_data');
        if (temBackup) {
             try {
                const localData = JSON.parse(temBackup);
                await setDoc(userDocRef, localData); 
             } catch (e) {
                setData(JSON.parse(temBackup));
             }
        } else {
             setData(defaultData);
        }
        setSyncStatus('synced'); 
      }
    }, (error) => {
      console.error("Erro Firebase:", error);
      setSyncStatus('error');
      setLoading(false);
    });

    return unsubscribe;
  };

  // --- 2. FUNÇÕES DE FLUXO (FORA DO ERRO DO FIREBASE) ---
  const handleIntroComplete = () => {
      localStorage.setItem('liberta_intro_complete', 'true');
      setIsOnboardingOpen(false);
      setLoginModalView('home');
      setIsLoginModalOpen(true);
  };

  const handleSetupSave = (name, income) => {
      const newData = { 
          ...data, 
          userName: name, 
          income: { ...data.income, salary: Number(income) } 
      };
      saveData(newData);
      setIsSetupOpen(false);
      setTimeout(() => setIsTutorialOpen(true), 500);
  };

  const handleUpdateSettings = async (newName, newSalary) => {
    const updatedData = { 
        ...data, 
        userName: newName, 
        income: { ...data.income, salary: Number(newSalary) } 
    };
    saveData(updatedData);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("⚠️ EXCLUIR CONTA: Deseja apagar tudo permanentemente?")) {
        setLoading(true);
        try {
            if (authUser) {
                const userDocRef = doc(db, 'artifacts', appId, 'users', authUser.uid, 'data', 'financial_profile');
                await setDoc(userDocRef, {});
                await deleteUser(authUser);
            }
            localStorage.clear();
            window.location.reload();
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }
  };

  // --- 3. VIGIA DO SETUP (useEffect Corrigido) ---
  useEffect(() => {
      if (!loading && (authUser || localStorage.getItem('liberta_backup_data'))) {
          if (data.income.salary === 0 && !data.userName) {
              if (!isOnboardingOpen && !isLoginModalOpen) {
                  const timer = setTimeout(() => setIsSetupOpen(true), 1000);
                  return () => clearTimeout(timer);
              }
          }
      }
  }, [loading, authUser, data.income.salary, data.userName, isOnboardingOpen, isLoginModalOpen]);

  // --- 4. FUNÇÃO DE SALVAMENTO ---
  const saveData = (newData) => {
    setData(newData);
    localStorage.setItem('liberta_backup_data', JSON.stringify(newData));
    if (!authUser || !db) return;
    setSyncStatus('syncing');
    const userDocRef = doc(db, 'artifacts', appId, 'users', authUser.uid, 'data', 'financial_profile');
    setDoc(userDocRef, newData, { merge: true })
      .then(() => setSyncStatus('synced'))
      .catch(() => setSyncStatus('error'));
  };

  const toggleExclude = (key) => {
    const isNowExcluded = !data.excludedExpenses[key];
    const newExcluded = { ...data.excludedExpenses, [key]: isNowExcluded };
    let newExpenses = { ...data.expenses };
    let newExpenseDates = { ...data.expenseDates };
    if (isNowExcluded) {
      newExpenses[key] = 0;
      newExpenseDates[key] = '';
    }
    saveData({ ...data, excludedExpenses: newExcluded, expenses: newExpenses, expenseDates: newExpenseDates });
  };

  const updateExpense = (key, value) => {
    saveData({...data, expenses: {...data.expenses, [key]: validateMoney(value)}});
  };
  
  const updateExpenseDate = (key, value) => {
    saveData({...data, expenseDates: {...data.expenseDates, [key]: validateDay(value)}});
  };

// --- LÓGICA: PROCESSAMENTO DE GASTOS COM IA (GEMINI) ---
const processVoiceCommand = async (texto) => {
  setShowToast(true);
  
  try {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // O Super Prompt: Ensinando as regras do seu app para a IA
    const prompt = `
      Você é a assistente virtual do app financeiro Liberta.
      Analise o comando de voz do usuário e extraia a intenção e os dados.
      
      Ações que você entende:
      1. "add_expense": O usuário quer registrar um gasto. Extraia "category" (market, transport, leisure, delivery, health, other) e "amount" (número).
      2. "add_income": O usuário quer adicionar renda. Extraia "type" (salary, extra) e "amount".
      3. "navigate": O usuário quer mudar de aba. Extraia "screen" (dashboard, budget, investments, dreams, debts, premium).
      4. "toggle_theme": O usuário quer mudar a aparência. Extraia "theme" (dark, light).
      
      Comando do usuário: "${texto}"
      
      Retorne APENAS um objeto JSON válido, sem mais nada, neste formato:
      {"action": "nome_da_acao", "data": { ...dados extraidos... }, "message": "Mensagem curta confirmando o que foi feito"}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const command = JSON.parse(cleanJson);

    // Executa a ação baseada no que a IA decidiu
    executeVoiceCommand(command);

  } catch (error) {
    console.error("Erro no Gemini:", error);
    alert("🎙️ Não entendi o comando. Pode repetir?");
    setShowToast(false);
  }
};

const executeVoiceCommand = (command) => {
  const { action, data, message } = command;

  switch (action) {
    case 'add_expense':
      const gastoAtual = Number(data.expenses[data.category]) || 0;
      updateExpense(data.category, gastoAtual + Number(data.amount));
      break;

    case 'add_income':
      const rendaAtual = Number(data.income[data.type]) || 0;
      saveData({...data, income: {...data.income, [data.type]: rendaAtual + Number(data.amount)}});
      break;

    case 'navigate':
      setActiveTab(data.screen);
      window.scrollTo(0, 0);
      break;

    case 'toggle_theme':
      setIsDarkMode(data.theme === 'dark');
      break;

    default:
      alert("Comando reconhecido, mas a função ainda não foi programada no app.");
      return;
  }

  // Dá o feedback para o usuário
  alert(`🤖 ${message}`);
  triggerCelebration();
  setShowToast(false);
};
  const handleProfileSelect = (profile) => {
    setInvestProfile(profile);
    let newRate = marketRates.selic; 
    if (profile === 'safe') newRate = marketRates.selic; 
    if (profile === 'moderate') newRate = marketRates.cdi * 1.10; 
    if (profile === 'risky') newRate = marketRates.selic + 4; 
    saveData({...data, investments: {...data.investments, rate: parseFloat(newRate.toFixed(2))}});
    handleMarketSearch(profile); 
  };

  const handleMarketSearch = async (profile) => {
    setSearching(true);
    setMarketOpportunities([]);
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    const { selic, cdi, ipca } = marketRates;

    const opportunities = [
      { id: 1, bank: "Sofisa Direto", name: "CDB Liquidez", rate: `${(cdi * 1.10).toFixed(2)}% a.a.`, numericRate: cdi * 1.10, min: 1, type: "reserva", risk: "Baixo", obs: "110% do CDI" },
      { id: 2, bank: "Banco Inter", name: "LCI 90 Dias", rate: `${(cdi * 0.94).toFixed(2)}% a.a.`, numericRate: cdi * 0.94, min: 50, type: "curto", risk: "Baixo", obs: "Isento de IR" },
      { id: 3, bank: "Nubank", name: "Caixinha", rate: `${cdi.toFixed(2)}% a.a.`, numericRate: cdi, min: 1, type: "reserva", risk: "Baixo", obs: "100% do CDI" },
      { id: 4, bank: "Tesouro", name: "Selic 2029", rate: `${(selic + 0.16).toFixed(2)}% a.a.`, numericRate: selic + 0.16, min: 145, type: "reserva", risk: "Minimo", obs: "Selic + 0.16%" },
      { id: 5, bank: "BTG Pactual", name: "CDB Prefixado", rate: "12.8% a.a.", numericRate: 12.8, min: 1000, type: "longo", risk: "Médio", obs: "Taxa Fixa" },
      { id: 6, bank: "XP Inv.", name: "Fundo Infra", rate: "Isento + Var.", numericRate: 14, min: 100, type: "renda", risk: "Médio/Alto", obs: "Renda Variável" },
      { id: 7, bank: "PagBank", name: "CDB Promo", rate: `${(cdi * 1.30).toFixed(2)}% a.a.`, numericRate: cdi * 1.30, min: 500, type: "curto", risk: "Baixo", obs: "130% do CDI" },
    ];

    const filtered = opportunities.filter(item => {
      if (profile === 'safe') return item.risk.includes('Baixo') || item.risk.includes('Minimo');
      if (profile === 'moderate') return item.type === 'curto' || item.type === 'longo';
      if (profile === 'risky') return item.risk.includes('Médio') || item.type === 'renda';
      return false;
    });

    if (filtered.length > 0) {
        const maxRate = Math.max(...filtered.map(o => o.numericRate || 0));
        filtered.forEach(o => {
            if (o.numericRate === maxRate) o.isBest = true;
        });
    }

    setMarketOpportunities(filtered);
    setSearching(false);
  };

  const addDream = (title, value, deadline, img) => {
    const newDream = {
       id: Date.now(),
       title,
       target: Number(value),
       saved: 0,
       deadline,
       img: img || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' 
    };
    saveData({...data, dreams: [...data.dreams, newDream]});
  };

// --- ATUALIZADOR EM TEMPO REAL (HOME BROKER) ---
  useEffect(() => {
      let interval;
      // Só atualiza se o usuário estiver na aba da bolsa e houver uma ação na tela
      if (activeTab === 'investments' && investmentSubTab === 'renda_variavel' && stockResult?.symbol) {
          interval = setInterval(() => {
              handleSearchStock(stockResult.symbol, true); // true = atualiza silenciosamente (sem spinner)
          }, 20000); // 20 Segundos exatos
      }
      return () => clearInterval(interval);
  }, [activeTab, investmentSubTab, stockResult?.symbol]);

  // --- COMPONENTE DE GRÁFICO PROFISSIONAL ---
  const AdvancedChart = ({ data, isPositive, currentPrice }) => {
    if (!data || data.length === 0) return null;
    const min = Math.min(...data) * 0.998; // Margem
    const max = Math.max(...data) * 1.002;
    const range = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`);
    
    const pathData = `M 0,100 L 0,${100 - ((data[0]-min)/range)*100} L ${pts.join(' L ')} L 100,100 Z`;
    const lineData = `M 0,${100 - ((data[0]-min)/range)*100} L ${pts.join(' L ')}`;
    const color = isPositive ? '#10b981' : '#ef4444'; // Verde ou Vermelho
    const currentY = 100 - ((currentPrice - min) / range) * 100;

    return (
      <div className="relative h-56 w-full flex bg-[#0B0F19] rounded-xl overflow-hidden border border-slate-800 font-mono">
         {/* Grid Horizontal & Eixo Y (Preços) */}
         <div className="absolute inset-0 flex flex-col justify-between py-2 z-0 opacity-20 pointer-events-none">
            {[max, min + (range * 0.75), min + (range * 0.5), min + (range * 0.25), min].map((val, i) => (
                <div key={i} className="border-t border-dashed border-slate-500 w-full relative">
                    <span className="absolute right-2 -top-2.5 text-[9px] text-slate-300 font-bold bg-[#0B0F19] px-1">{val.toFixed(2)}</span>
                </div>
            ))}
         </div>

         {/* Desenho do Gráfico SVG */}
         <div className="flex-1 mr-12 relative z-10 pt-2 pb-2">
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                   <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
                      <stop offset="100%" stopColor={color} stopOpacity="0.0"/>
                   </linearGradient>
                </defs>
                <path d={pathData} fill={`url(#grad-${color})`} />
                <path d={lineData} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Linha tracejada do preço atual e Ponto Pulsante */}
                <line x1="0" y1={currentY} x2="100" y2={currentY} stroke={color} strokeWidth="0.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" opacity="0.5" />
                <circle cx="100" cy={currentY} r="2.5" fill={color} className="animate-pulse" />
             </svg>
         </div>
      </div>
    );
  };

// --- FUNÇÃO PARA BUSCAR AÇÕES NA B3 (MODO PRO TERMINAL) ---
  const handleSearchStock = async (queryOverride = null, silent = false) => {
    const queryToSearch = queryOverride || stockQuery;
    if (!queryToSearch) return;
    
    if (!silent) {
        setStockLoading(true);
        setStockError('');
        setStockResult(null);
    }

    const ticker = queryToSearch.toUpperCase().trim();

    try {
        const res = await fetch(`https://brapi.dev/api/quote/${ticker}`);
        const json = await res.json();

        if (json.results && json.results.length > 0) {
            const result = json.results[0];
            // Histórico simulado intraday para o gráfico (se a API não fornecer o array intraday gratuito)
            const history = Array.from({length: 25}, (_, i) => result.regularMarketPrice * (1 + ((Math.random() * 2 - 1)/100)));
            history.push(result.regularMarketPrice);
            
            setStockResult({ 
                ...result, 
                history, 
                recommendation: result.regularMarketChangePercent > 0 ? 'TENDÊNCIA DE ALTA' : 'TENDÊNCIA DE BAIXA',
                lastUpdate: new Date()
            });
        } else {
            throw new Error("Não encontrado");
        }
    } catch (e) {
        if (!silent) await new Promise(resolve => setTimeout(resolve, 800)); 

        const mockNames = { 'PETR4': 'Petrobras PN', 'VALE3': 'Vale ON', 'ITUB4': 'Itaú Unibanco PN', 'MXRF11': 'Maxi Renda FII', 'BBDC4': 'Bradesco PN', 'WEGE3': 'WEG ON' };
        const basePrice = mockNames[ticker] ? 30 + (ticker.length * 5) : 15.50;
        const randomChange = (Math.random() * 4) - 2; 
        const currentPrice = basePrice * (1 + (randomChange/100));

        // Cria uma linha de gráfico simulada com volatilidade
        let lastPt = basePrice;
        const history = Array.from({length: 30}, () => {
            lastPt = lastPt * (1 + ((Math.random() * 2 - 1)/100));
            return lastPt;
        });
        history.push(currentPrice); 

        setStockResult({
            symbol: ticker,
            shortName: mockNames[ticker] || `${ticker} S.A.`,
            regularMarketPrice: currentPrice,
            regularMarketDayHigh: currentPrice * 1.02,
            regularMarketDayLow: currentPrice * 0.98,
            regularMarketOpen: basePrice,
            regularMarketVolume: Math.floor(Math.random() * 50000000) + 10000000,
            regularMarketChangePercent: randomChange,
            history: history,
            recommendation: randomChange > 0 ? 'TENDÊNCIA DE ALTA' : 'TENDÊNCIA DE BAIXA',
            lastUpdate: new Date()
        });
    }
    setStockQuery(ticker); 
    if (!silent) setStockLoading(false);
  };

// Mini componente para desenhar a linha do gráfico
  const MiniSparkline = ({ data, isPositive }) => {
    if (!data || data.length === 0) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' L ');
    const color = isPositive ? '#10b981' : '#ef4444'; // Emerald ou Red

    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
         <path d={`M 0,100 L 0,${100 - ((data[0]-min)/range)*100} L ${points} L 100,100 Z`} fill={color} opacity="0.1" />
         <path d={`M 0,${100 - ((data[0]-min)/range)*100} L ${points}`} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };
    
  // --- LÓGICA DE RPG: XP E NÍVEIS ---
  const rpgState = useMemo(() => {
    const currentXP = Number(data.xp) || 0; // CORREÇÃO AQUI: Forçando a ser Número
    const level = Math.floor(currentXP / 100) + 1; // A cada 100 XP, sobe de nível
    const xpProgress = currentXP % 100; // Progresso para o próximo nível (0 a 100%)

    // Evolução visual do Avatar baseada no nível
    let avatarStyle = 'from-slate-400 to-slate-500 shadow-slate-400/20'; // Nível 1 (Ferro)
    let rankName = 'Iniciante';

    if (level >= 10) { avatarStyle = 'from-red-500 to-rose-600 shadow-red-500/50'; rankName = 'Mítico'; }
    else if (level >= 5) { avatarStyle = 'from-yellow-400 to-amber-500 shadow-yellow-500/40'; rankName = 'Ouro'; }
    else if (level >= 3) { avatarStyle = 'from-slate-300 to-slate-400 shadow-slate-300/40'; rankName = 'Prata'; }
    else if (level >= 2) { avatarStyle = 'from-orange-400 to-orange-700 shadow-orange-500/30'; rankName = 'Bronze'; }
    else if (data.isPro) { avatarStyle = 'from-purple-600 to-indigo-600 shadow-purple-500/40'; rankName = 'Pro'; }

    return { level, xpProgress, avatarStyle, rankName };
  }, [data.xp, data.isPro]);

  // Validação automática das missões ativas
  const checkQuestCompletion = (questId) => {
      if (questId === 'q_salario') return Number(data.income?.salary) > 0;
      if (questId === 'q_sobrevivencia') return Number(data.survivalCost) > 0;
      if (questId === 'q_sonho') return (data.dreams?.length || 0) > 0;
      return false;
  };

  const finance = useMemo(() => {
    const val = (v) => Number(v) || 0;
    const totalIncome = val(data.income.salary) + val(data.income.extra);
    
// 1. SOMA TODOS OS CARTÕES ATIVOS (AGORA USANDO A FATURA)
    const activeCardsTotal = (data.cards || []).reduce((acc, card) => {
        if (!card.isExcluded) return acc + val(card.invoiceValue); 
        return acc;
    }, 0);

    const essentials = Object.keys(data.expenses).reduce((acc, key) => {
        if(['rent','water','light','internet','gas','market','pharmacy','transport','education','health', 'dependents', 'pets', 'insurance'].includes(key)) return acc + val(data.expenses[key]);
        return acc;
    }, 0) + activeCardsTotal; 

    const lifestyle = Object.keys(data.expenses).reduce((acc, key) => {
        // Adicionamos: personalCare
        if(['leisure','streaming','shopping','delivery', 'personalCare', 'other'].includes(key)) return acc + val(data.expenses[key]);
        return acc;
    }, 0);
    
    const totalExpenses = essentials + lifestyle;
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    
    const totalDebt = data.debts.reduce((acc, d) => acc + val(d.value), 0);
    const paidDebt = data.debts.filter(d => d.paid).reduce((acc, d) => acc + val(d.value), 0);
    
    const r = val(data.investments.rate) / 100 / 12;
    const t = val(data.investments.years) * 12;
    
    const investedAmount = val(data.investments.initial) + (val(data.investments.monthly) * t);
    const futureValue = (val(data.investments.initial) * Math.pow(1 + r, t)) + 
                        (val(data.investments.monthly) * (Math.pow(1 + r, t) - 1) / r);
    const interestEarned = futureValue - investedAmount;

    let score = 0;
    if (balance > 0) score += 40;
    if (savingsRate >= 20) score += 20;
    if (totalDebt === 0 || paidDebt === totalDebt) score += 20;
    if (val(data.survivalCost) > 0 && balance > 0) score += 20;

    return { totalIncome, totalExpenses, balance, essentials, lifestyle, savingsRate, totalDebt, paidDebt, futureValue, interestEarned, investedAmount, score };
  }, [data]);

  const getBadge = (score) => {
      if (score <= 30) return { title: "Sobrevivente", color: "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900", icon: AlertCircle };
      if (score <= 60) return { title: "Organizador", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900", icon: Brain };
      if (score <= 80) return { title: "Poupador", color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900", icon: Shield };
      return { title: "Investidor Livre", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900", icon: Rocket };
  };

  const currentBadge = getBadge(finance.score);

  const cashflowRisks = useMemo(() => {
     const salaryDay = Number(data.income.salaryDay) || 5;
     const risks = [];
     Object.entries(data.expenseDates).forEach(([key, day]) => {
        if (day && Number(day) < salaryDay && !data.excludedExpenses[key] && Number(data.expenses[key]) > 0) {
            risks.push({ name: key, day: Number(day), value: data.expenses[key] });
        }
     });
     return risks;
  }, [data]);

  if (loading) return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
       <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 z-20 p-8 space-y-8">
           <Skeleton className="h-14 w-40" />
           <div className="space-y-4">
               {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
           </div>
       </aside>
       <main className="lg:ml-72 w-full">
          <DashboardSkeleton />
       </main>
       <div className="lg:hidden fixed bottom-0 left-0 w-full h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-30"></div>
    </div>
  );

  const NavItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { setActiveTab(id); window.scrollTo(0,0); }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm mb-1 ${
        activeTab === id 
          ? 'bg-slate-900 dark:bg-purple-600 text-white shadow-lg shadow-slate-900/20 dark:shadow-purple-900/20 scale-100' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 hover:scale-[1.02]'
      }`}
    >
      <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 2} className={activeTab === id ? 'text-purple-400 dark:text-purple-200' : ''} />
      {label}
    </button>
  );

return (
    <div className={`min-h-screen font-sans flex text-slate-800 dark:text-slate-100 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
      
      <GlobalFeedback status={syncStatus} showToast={showToast} onClose={() => setShowToast(false)} />
      <IntroModal isOpen={isOnboardingOpen} onComplete={handleIntroComplete} />
      <SetupModal isOpen={isSetupOpen} onSave={handleSetupSave} />
      <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} data={data} finance={finance} />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <NotifPromptModal prompt={notifPrompt} setPrompt={setNotifPrompt} data={data} saveData={saveData} />
        {/* --- MODAL DO GRÁFICO DA MOEDA --- */}
      {selectedCurrency && (
          <div className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up relative">
                  
                  {/* Botão Fechar */}
                  <button 
                      onClick={() => setSelectedCurrency(null)} 
                      className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-full z-20 transition-all hover:scale-110 hover:bg-red-500"
                  >
                      <X size={20} />
                  </button>
                  
                  {/* Cabeçalho do Modal */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-transparent">
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                          {selectedCurrency.code} <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{selectedCurrency.name}</span>
                      </h3>
                      <p className="text-3xl md:text-4xl font-mono font-black mt-2 text-slate-800 dark:text-white tracking-tighter">
                          R$ {selectedCurrency.price.toFixed(4)}
                      </p>
                  </div>
                  
                  {/* Área do Gráfico */}
                  <div className="p-4 bg-white dark:bg-[#0B0F19]">
                      <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 ml-2">Histórico (30 Dias)</h4>
                      
                      {loadingCurrencyHistory ? (
                          <div className="h-56 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/20 rounded-xl">
                              <Loader className="animate-spin text-blue-500 mb-3" size={32} />
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">Carregando dados...</p>
                          </div>
                      ) : (
                          currencyHistory && currencyHistory.length > 0 ? (
                              <AdvancedChart 
                                  data={currencyHistory} 
                                  isPositive={currencyHistory[currencyHistory.length - 1] >= currencyHistory[0]} 
                                  currentPrice={selectedCurrency.price}
                              />
                          ) : (
                              <div className="h-56 flex items-center justify-center bg-slate-50 dark:bg-slate-800/20 rounded-xl">
                                  <p className="text-sm text-slate-500 font-bold">Gráfico indisponível no momento.</p>
                              </div>
                          )
                      )}
                  </div>
              </div>
          </div>
      )}

<SettingsModal 
  isOpen={isSettingsOpen}
  onClose={() => setIsSettingsOpen(false)}
  data={data}
  onSaveSettings={handleUpdateSettings}
  onDeleteAccount={handleDeleteAccount}
  isDarkMode={isDarkMode}
  setIsDarkMode={setIsDarkMode}
  handleLogout={handleLogout}
  isPrivacyMode={isPrivacyMode}
  setIsPrivacyMode={setIsPrivacyMode}
/>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        auth={auth}
        onGuestLogin={handleGuestLogin}
        onSignupComplete={handleSignupComplete}
        loading={loading}
        initialView={loginModalView}
      />

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 animate-scale-up">
               <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut size={24} />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center">Sair da Conta?</h3>
               <p className="text-slate-500 dark:text-slate-400 mb-6 text-center text-sm">
                   Você precisará fazer login novamente.
               </p>
               <div className="flex gap-3">
                 <Button onClick={() => setIsLogoutConfirmOpen(false)} variant="secondary" className="flex-1">Cancelar</Button>
                 <Button onClick={confirmLogout} variant="danger" className="flex-1">Sim, Sair</Button>
               </div>
            </div>
        </div>
      )}

{/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 z-20 transition-colors duration-300 shadow-sm">
        <div className="p-8 pb-4">
          <img src="https://i.postimg.cc/cLjNJnTc/Chat-GPT-Image-30-de-jan-de-2026-16-16-07.png" alt="Logo Liberta" className="h-16 w-auto mb-4 drop-shadow-sm rounded-xl" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 w-full overflow-hidden">
            {syncStatus === 'syncing' ? <RefreshCw size={12} className="animate-spin text-purple-500"/> : <div className={`w-2 h-2 rounded-full shrink-0 ${syncStatus === 'error' ? 'bg-red-500' : syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate flex-1" title={authUser?.uid}>
               {syncStatus === 'syncing' ? 'Salvando...' : syncStatus === 'synced' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <NavItem id="budget" icon={PieChart} label="Orçamento" />
          <NavItem id="investments" icon={TrendingUp} label="Investimentos" />
          <NavItem id="dreams" icon={Rocket} label="Sonhos & Metas" />
          <NavItem id="debts" icon={Shield} label="Dívidas" />

          {/* AGORA SIM: O CÓDIGO ESTÁ DENTRO DO NAV E SEM COMENTÁRIO */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <NavItem id="premium" icon={Crown} label="Loja & Premium" />
          </div>
        </nav>

        <div className="px-8 pb-6 text-center">
           <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Desenvolvido por <span className="font-bold text-purple-600 dark:text-purple-500">Prime Studios</span></p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 p-4 md:p-8 pb-40 md:pb-8 w-full max-w-[100vw] overflow-x-hidden">

{/* --- MOBILE HEADER: TROFÉU, OLHO E CONFIGS --- */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-3 mb-4 transition-colors">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          
          {/* LADO ESQUERDO: LOGO E MICROFONE DISCRETO */}
          <div className="flex items-center gap-3">
             <img 
               src="https://i.postimg.cc/cLjNJnTc/Chat-GPT-Image-30-de-jan-de-2026-16-16-07.png" 
               alt="Liberta" 
               className="h-9 w-auto rounded-lg shadow-sm" 
             />
             <VoiceExpenseButton onVoiceCaptured={processVoiceCommand} />
          </div>

          <div className="flex items-center gap-2">
            {/* 1. TROFÉU */}

            {/* 2. OLHO (Privacidade) */}
            <button 
              onClick={() => setIsPrivacyMode(!isPrivacyMode)} 
              className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500 active:scale-90 transition-all"
            >
              {isPrivacyMode ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>

            {/* 3. PERFIL COM LEVEL E XP (RPG) */}
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="flex items-center gap-2 p-1 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm active:scale-95 transition-all relative"
            >
              <div className="relative">
                  {/* Aro de XP em volta do Avatar */}
                  <svg className="absolute -inset-1 w-10 h-10 transform -rotate-90">
                      <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-slate-100 dark:text-slate-800" />
                      <circle 
                         cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="2" 
                         strokeDasharray="113" 
                         strokeDashoffset={113 - ((Number(rpgState?.xpProgress) || 0) / 100) * 113} 
                         className="text-emerald-500 transition-all duration-1000" 
                      />
                  </svg>
                  {/* O Avatar com a cor do Nível */}
                  <div className={`w-8 h-8 bg-gradient-to-tr ${rpgState?.avatarStyle || 'from-slate-400 to-slate-500'} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner relative z-10`}>
                    {data.userName ? data.userName[0].toUpperCase() : <User size={16}/>}
                  </div>
                  {/* Badge de Nível */}
                  <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full z-20 border border-white dark:border-slate-800">
                      Lvl {rpgState?.level || 1}
                  </div>
              </div>
              <div className="flex flex-col items-start hidden sm:flex">
                  <span className="text-[9px] font-black text-slate-400 uppercase leading-none">{rpgState?.rankName || 'Iniciante'}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-1" />
            </button>
          </div>
        </div>
      </div>

{activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
          
          {/* --- HEADER DESKTOP MINIMALISTA --- */}
          <div className="hidden lg:flex justify-between items-end mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Olá, {data.userName || 'Investidor'}! 👋
              </h1>
              <p className="text-sm text-slate-500 mt-1">Aqui está o resumo da sua liberdade financeira.</p>
            </div>
            <div className="flex gap-3">
               <button onClick={() => setIsAchievementsOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-colors text-sm font-bold">
                  <Trophy size={16}/> Conquistas
               </button>
               <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                 {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
               </button>
               <button onClick={handleLogout} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Sair">
                  <LogOut size={18}/>
               </button>
            </div>
          </div>

          {/* --- ALERTAS INTELIGENTES --- */}
          <SmartInsights finance={finance} data={data} />

          {/* Alerta de Visitante (Clean) */}
          {(!authUser || authUser.isAnonymous) && (
              <div className="bg-white dark:bg-slate-900 border-l-4 border-indigo-500 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-4">
                      <CloudLightning size={24} className="text-indigo-500 shrink-0"/>
                      <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">Modo Visitante Ativo</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Seus dados não estão salvos na nuvem. Crie uma conta para garantir sua segurança.</p>
                      </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto shrink-0">
                      <button onClick={() => { setLoginModalView('login'); setIsLoginModalOpen(true); }} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">Entrar</button>
                      <button onClick={() => { setLoginModalView('signup'); setIsLoginModalOpen(true); }} className="px-4 py-2 text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors shadow-md">Criar Conta</button>
                  </div>
              </div>
          )}

          {/* Alerta de Fluxo de Caixa (Clean) */}
          {cashflowRisks.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border-l-4 border-red-500 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-fade-in">
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20}/>
                  <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Atenção ao Fluxo de Caixa</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Você tem {cashflowRisks.length} contas vencendo antes do seu salário. Verifique o Orçamento.</p>
                  </div>
              </div>
          )}

          {/* CTA Primeiro Passo (Se Renda for 0) */}
          {finance.totalIncome === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm animate-fade-in">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Zap size={32} /></div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Configure sua Renda</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Para o painel funcionar e a mágica acontecer, precisamos saber quanto você ganha.</p>
              <Button onClick={() => setActiveTab('budget')} variant="primary" className="mx-auto w-full md:w-auto shadow-lg shadow-purple-500/20 px-8 py-3">Dar o Primeiro Passo</Button>
            </div>
          )}

          {/* --- 1. CARTÕES PRINCIPAIS (GRID PREMIUM) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             
             {/* CARD DESTAQUE: SALDO LIVRE (Dark Minimalista) */}
             <div className={`md:col-span-3 lg:col-span-1 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[160px] group transition-all duration-500 ${finance.balance < 0 ? 'bg-gradient-to-br from-[#450a0a] to-[#0F172A] border border-red-900/50' : 'bg-[#0F172A]'}`}>
                
                {/* Efeito de Luz de Fundo Dinâmico */}
                <div className={`absolute top-0 right-0 w-40 h-40 rounded-full mix-blend-screen opacity-10 blur-3xl -translate-y-8 translate-x-8 transition-all group-hover:opacity-25 ${finance.balance < 0 ? 'bg-red-500' : 'bg-purple-500'}`}></div>
                
                <div className="relative z-10 flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        Saldo Livre {finance.balance < 0 && <AlertTriangle size={14} className="text-red-400 animate-pulse"/>}
                    </span>
                    <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className="text-slate-500 hover:text-white transition-colors">
                        {isPrivacyMode ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>
                
                <div className="relative z-10">
                   <h2 className={`text-4xl md:text-5xl font-black tracking-tight mb-3 ${finance.balance < 0 ? 'text-red-400' : 'text-white'}`}>
                      {formatMoney(finance.balance)}
                   </h2>
                   
                   {/* --- CÉREBRO DO CARTÃO --- */}
                   {(() => {
                       // Cenário 1: No Vermelho
                       if (finance.balance < 0) {
                           return (
                               <div className="flex flex-col gap-1.5 mt-1 animate-fade-in">
                                   <div className="flex items-center gap-1.5 text-[11px] text-red-300 font-bold bg-red-500/10 w-fit px-2.5 py-1 rounded-lg border border-red-500/20">
                                      <TrendingDown size={12}/> Modo de Sobrevivência Ativo
                                   </div>
                                   <p className="text-[10px] text-slate-400 font-medium">Os gastos ultrapassaram a receita deste mês.</p>
                               </div>
                           );
                       }
                       
                       // Cenário 2: Tem Dinheiro (Lógica de Orçamento Diário)
                       if (finance.balance > 0) {
                           const today = new Date();
                           // Pega o último dia do mês atual
                           const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                           // Dias restantes (se for o último dia, evita dividir por zero usando 1)
                           const daysLeft = (lastDay - today.getDate()) || 1; 
                           const dailyBudget = finance.balance / daysLeft;
                           
                           // Projeção baseada na Selic/CDI média mensal (~0.8%)
                           const projectedYield = finance.balance * 0.008;
                           
                           return (
                               <div className="flex flex-col gap-2 mt-1 animate-fade-in">
                                  <div className="flex flex-wrap gap-2">
                                      <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                          <TrendingUp size={12}/> +{formatMoney(projectedYield)} se investir
                                      </span>
                                      <span className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                                          <Calendar size={12}/> Faltam {daysLeft} dias
                                      </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                                      Pode gastar <strong className="text-white text-xs">{formatMoney(dailyBudget)}/dia</strong> sem estourar o orçamento.
                                  </p>
                               </div>
                           );
                       }
                       
                       // Cenário 3: Exatamente Zero
                       return <p className="text-[11px] text-slate-400 font-medium">O seu saldo está matematicamente a zero.</p>;
                   })()}
                </div>
             </div>

             {/* CARD: RECEITAS (Clean White) */}
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl"><TrendingUp size={18}/></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Receitas</span>
                </div>
                <div>
                   <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{formatMoney(finance.totalIncome)}</p>
                </div>
             </div>

             {/* CARD: DESPESAS E COMPARATIVO (Integrado) */}
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl"><TrendingDown size={18}/></div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Despesas</span>
                    </div>
                    
                    {/* Badge Elegante de Comparação */}
                    {(() => {
                        const lastMonthTotal = Object.values(data.lastMonthExpenses || {}).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
                        if (lastMonthTotal === 0) return null; 
                        
                        const diffPct = ((finance.totalExpenses - lastMonthTotal) / lastMonthTotal) * 100;
                        const isMore = diffPct > 0;

                        return (
                            <span className={`text-[10px] font-black tracking-wider flex items-center gap-1 px-2.5 py-1 rounded-lg ${isMore ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10'}`}>
                                {isMore ? <TrendingUp size={12} strokeWidth={3}/> : <TrendingDown size={12} strokeWidth={3}/>} 
                                {Math.abs(diffPct).toFixed(1)}%
                            </span>
                        );
                    })()}
                </div>

                <div>
                    <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{formatMoney(finance.totalExpenses)}</p>
                    
                    {(() => {
                        const lastMonthTotal = Object.values(data.lastMonthExpenses || {}).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
                        if (lastMonthTotal === 0) return <p className="text-[11px] text-slate-400 mt-1 font-medium">Primeiro mês de uso</p>;
                        return (
                            <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                vs {formatMoney(lastMonthTotal)} no mês passado
                            </p>
                        );
                    })()}
                </div>
             </div>
          </div>

          {/* --- 2. TERMÔMETRO UNIFICADO 50/30/20 (Design Ultra Fino) --- */}
<div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl">
            <Activity size={20}/>
        </div>
        {/* Adicionado o InfoTip ao lado do título para ensinar o usuário */}
        <div className="flex items-center">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Diagnóstico 50/30/20</h3>
            <InfoTip text="É o valor mínimo que você precisa para pagar o básico (aluguel, luz, água e comida) e não passar aperto se ficar sem renda hoje." />
        </div>
    </div>

    <div className="flex flex-col md:flex-row gap-10 items-center">
        {/* Barras Ultra Finas */}
        <div className="flex-1 w-full space-y-7">
            <div>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white block">Gastos Essenciais</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Meta: 50%</span>
                    </div>
                    <span className={`text-sm font-black ${((finance.essentials / (finance.totalIncome || 1)) * 100) > 50 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                        {finance.totalIncome > 0 ? ((finance.essentials / finance.totalIncome) * 100).toFixed(0) : 0}%
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${((finance.essentials / (finance.totalIncome || 1)) * 100) > 50 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (finance.essentials / (finance.totalIncome || 1)) * 100)}%` }}></div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white block">Estilo de Vida</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Meta: 30%</span>
                    </div>
                    <span className={`text-sm font-black ${((finance.lifestyle / (finance.totalIncome || 1)) * 100) > 30 ? 'text-orange-500' : 'text-slate-800 dark:text-white'}`}>
                        {finance.totalIncome > 0 ? ((finance.lifestyle / finance.totalIncome) * 100).toFixed(0) : 0}%
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${((finance.lifestyle / (finance.totalIncome || 1)) * 100) > 30 ? 'bg-orange-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(100, (finance.lifestyle / (finance.totalIncome || 1)) * 100)}%` }}></div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white block">Futuro e Investimentos</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Meta: 20%</span>
                    </div>
                    <span className={`text-sm font-black ${finance.savingsRate < 20 ? 'text-slate-400' : 'text-emerald-500'}`}>
                        {finance.savingsRate.toFixed(0)}%
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${finance.savingsRate >= 20 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} style={{ width: `${Math.min(100, finance.savingsRate)}%` }}></div>
                </div>
            </div>
        </div>

                 {/* Badge de Gamificação (Mais limpo) */}
                 <div className="w-full md:w-48 shrink-0 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                     <currentBadge.icon size={36} className={`mb-4 ${currentBadge.color.split(' ')[0]}`} strokeWidth={1.5} />
                     <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Nível Atual</span>
                     <span className="font-black text-slate-800 dark:text-white text-center leading-tight mb-3">{currentBadge.title}</span>
                     <span className="text-[11px] font-black text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg shadow-sm">Score: {finance.score}</span>
                 </div>
              </div>
          </div>

          {/* --- 3. MISSÕES ATIVAS (Clean List) --- */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500 rounded-xl"><Swords size={20}/></div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">Quests Disponíveis</h3>
              </div>
              
              <div className="space-y-4">
                  {(data.quests || []).map(quest => {
                      const isCompleted = checkQuestCompletion(quest.id);
                      if (quest.claimed) return null;

                      return (
                          <div key={quest.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500 text-white shadow-md animate-pulse-slow' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                      {isCompleted ? <Gift size={18} /> : <Target size={18} />}
                                  </div>
                                  <div>
                                      <h4 className={`text-sm font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>{quest.title}</h4>
                                      <p className="text-xs text-slate-500 mt-0.5">{quest.desc}</p>
                                  </div>
                              </div>
                              
                              <div className="shrink-0 ml-4">
                                  {isCompleted ? (
                                      <button 
                                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95"
                                          onClick={() => {
                                              // Correção aplicada aqui 👇
                                              const updatedQuests = (data.quests || []).map(q => q.id === quest.id ? { ...q, claimed: true } : q);
                                              const currentXp = Number(data.xp) || 0;
                                              const gainedXp = Number(quest.xp) || 50;
                                              
                                              saveData({...data, quests: updatedQuests, xp: currentXp + gainedXp});
                                              triggerCelebration();
                                          }}
                                      >
                                          Pegar +{quest.xp} XP
                                      </button>
                                  ) : (
                                      <span className="text-xs font-black text-slate-400 px-2 py-1 bg-white dark:bg-slate-900 rounded-md">+{quest.xp} XP</span>
                                  )}
                              </div>
                          </div>
                      );
                  })}
                  
                  {/* Estado Vazio */}
                  {(!data.quests || data.quests.every(q => q.claimed)) && (
                      <div className="text-center py-8">
                          <Swords size={32} className="mx-auto text-slate-300 mb-3" strokeWidth={1.5}/>
                          <p className="text-sm font-bold text-slate-500">Nenhuma missão ativa.</p>
                          <p className="text-xs text-slate-400 mt-1">O mestre da guilda está preparando novas quests.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* --- 4. DÍVIDAS E RESERVA (Fim da página) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Dívidas (Clean Card) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl"><Shield size={20}/></div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">Dívidas Ativas</h3>
              </div>

              {data.debts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                  <CheckCircle size={40} className="text-emerald-400 mb-4" strokeWidth={1.5}/>
                  <p className="text-slate-800 dark:text-white font-bold">Você não possui dívidas!</p>
                  <p className="text-slate-500 text-sm mt-1 mb-6">Sua paz mental agradece.</p>
                  <button onClick={() => setActiveTab('debts')} className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">Gerenciar Histórico</button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Total Pago</span>
                        <span className="text-sm font-bold text-emerald-500">{formatMoney(finance.paidDebt)}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Dívida Total</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{formatMoney(finance.totalDebt)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div className="bg-red-500 h-full transition-all duration-1000" style={{width: `${finance.totalDebt > 0 ? (finance.paidDebt / finance.totalDebt) * 100 : 0}%`}}></div>
                  </div>
                  <p className="text-xs text-slate-500 mb-6">Faltam <strong className="text-slate-700 dark:text-slate-300">{formatMoney(finance.totalDebt - finance.paidDebt)}</strong> para a quitação.</p>
                  <button onClick={() => setActiveTab('debts')} className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors mt-auto">Acessar Plano de Ataque</button>
                </div>
              )}
            </div>
            
{/* Reserva de Emergência com Explicação Simples */}
<div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
  <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl"><Target size={20}/></div>
      <div className="flex items-center gap-1">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">Custo de Vida</h3>
          {/* Tooltip para o usuário "burro" - Explicação bem direta */}
          <InfoTip text="Este é o valor das suas contas que não dá pra fugir (aluguel, luz, comida). É o mínimo que você precisa pra viver um mês sem passar fome." />
      </div>
  </div>
  
  <div className="flex-1 flex flex-col justify-center">
      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Gasto Essencial Mensal</span>
      <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
          {formatMoney(finance.essentials)}
      </p>
      
      {/* Alerta Visual de Segurança */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
          <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Meta de Segurança (6 meses)</p>
          <p className="text-xl font-bold text-blue-900 dark:text-white">
              {formatMoney(finance.essentials * 6)}
          </p>
          <p className="text-[11px] text-blue-500 mt-2 leading-relaxed">
              Tente juntar este valor para ficar <strong>6 meses tranquilo</strong> se você perder o emprego amanhã.
          </p>
      </div>

      <button onClick={() => setActiveTab('budget')} className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors mt-6">
          Revisar minhas contas
      </button>
  </div>
</div>

          </div>
        </div>
      )}

{activeTab === 'budget' && (
  <div className="space-y-6 animate-fade-in pb-24">
    
    {/* BANNER DE GUIA RÁPIDO - PARA O USUÁRIO APRENDER */}
    {showBudgetGuide && (
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl animate-fade-in mb-8">
        {/* Botão X para fechar */}
        <button 
          onClick={() => setShowBudgetGuide(false)}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all z-20"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 flex gap-5 items-start">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md hidden sm:block">
            <Brain size={32} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              Como organizar seu dinheiro 💰
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <p className="text-xs font-black uppercase mb-1 opacity-80">Passo 1</p>
                <p className="text-sm font-medium leading-relaxed">Vá em <b>Entradas</b> e coloque seu salário limpo (o que cai no banco).</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <p className="text-xs font-black uppercase mb-1 opacity-80">Passo 2</p>
                <p className="text-sm font-medium leading-relaxed">Em <b>Contas</b>, adicione seus bancos e cartões de crédito.</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <p className="text-xs font-black uppercase mb-1 opacity-80">Passo 3</p>
                <p className="text-sm font-medium leading-relaxed">Em <b>Gastos</b>, coloque suas contas fixas (Luz, Aluguel, Comida).</p>
              </div>
            </div>
            <p className="text-[11px] mt-4 opacity-70 font-bold italic">* O Liberta calculará automaticamente quanto você pode gastar no mês!</p>
          </div>
        </div>
        
        {/* Detalhe visual de luz de fundo */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    )}

    {/* ... RESTO DO CÓDIGO DA ABA BUDGET (CABEÇALHO, SUB-ABAS, ETC) ... */}
            
            {/* CABEÇALHO E TÍTULO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-purple-500 pl-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Orçamento Detalhado</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                   Organize suas rendas, contas e despesas de forma inteligente.
                </p>
              </div>
            </div>

            {/* SEGMENTED CONTROL (AS SUB-ABAS) */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex flex-col md:flex-row items-center w-full border border-slate-200 dark:border-slate-700 shadow-inner gap-1">
               <button 
                 onClick={() => setBudgetSubTab('renda')}
                 className={`flex-1 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${budgetSubTab === 'renda' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <TrendingUp size={16} /> Entradas (Renda)
               </button>
               <button 
                 onClick={() => setBudgetSubTab('contas')}
                 className={`flex-1 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${budgetSubTab === 'contas' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <Wallet size={16} /> Contas & Cartões
               </button>
               <button 
                 onClick={() => setBudgetSubTab('gastos')}
                 className={`flex-1 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${budgetSubTab === 'gastos' ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <TrendingDown size={16} /> Gastos Mensais
               </button>
            </div>

            {/* ========================================== */}
            {/* SUB-ABA 1: ENTRADAS (RENDA)                */}
            {/* ========================================== */}
            {budgetSubTab === 'renda' && (
                <div className="space-y-6 animate-fade-in mt-4">
                    <Card title="Entradas (Renda)" icon={Wallet}>
                       <div className="space-y-4">
                          {['salary', 'extra'].map(k => (
                            <div key={k} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                              <label className="text-base font-bold text-slate-700 dark:text-slate-300 capitalize">{k === 'salary' ? 'Salário Líquido' : 'Renda Extra'}</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                                <CurrencyInput 
                                 className="bg-transparent text-right font-bold text-slate-800 dark:text-white outline-none w-40 text-lg pl-10"
                                 placeholder="0,00"
                                 value={data.income[k]}
                                 onChange={val => saveData({...data, income: {...data.income, [k]: val}})}
                                  />
                              </div>
                            </div>
                          ))}
                           <div className="flex justify-between items-center bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40 mt-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg text-purple-600"><CalendarClock size={20}/></div>
                                <label className="text-sm font-bold text-purple-900 dark:text-purple-300">Dia do Pagamento (Salário)</label>
                              </div>
                              <input 
                                  type="number" min="1" max="31"
                                  className="w-20 py-2 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg text-center font-bold text-purple-700 dark:text-purple-400 outline-none focus:ring-2 focus:ring-purple-500"
                                  value={data.income.salaryDay || 5}
                                  onChange={e => saveData({...data, income: {...data.income, salaryDay: validateDay(e.target.value)}})}
                                />
                           </div>
                        </div>
                    </Card>
                </div>
            )}

           {/* ========================================== */}
            {/* SUB-ABA 2: CONTAS E CARTÕES                */}
            {/* ========================================== */}
{budgetSubTab === 'contas' && (
    <div className="space-y-6 animate-fade-in mt-4">
        
        {/* 1. CARTÃO DE CONTAS BANCÁRIAS */}
        <Card title="Minhas Contas & Carteira" icon={Wallet} className="border-l-4 border-l-emerald-500 shadow-lg">
            <div className="flex flex-col gap-2 mb-6">
                <div className="flex gap-2 items-end">
                    <div className="relative flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Nome do Banco / Conta</label>
                        <input 
                            id="newAccountName" 
                            placeholder="Ex: Itaú, Nubank..." 
                            autoComplete="off"
                            // Lógica de visualização do dropdown
                            onFocus={() => document.getElementById('accountBankDropdown').classList.remove('hidden')}
                            onBlur={() => setTimeout(() => { const el = document.getElementById('accountBankDropdown'); if(el) el.classList.add('hidden'); }, 200)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 text-sm font-bold dark:text-white transition-colors" 
                        />
                        {/* DROPDOWN DE BANCOS (IGUAL AOS CARTÕES) */}
                        <div id="accountBankDropdown" className="hidden absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-2xl z-50 flex flex-col p-1.5 animate-fade-in">
                            {['Itaú', 'Nubank', 'Inter', 'C6 Bank', 'Bradesco', 'Santander', 'Caixa', 'Banco do Brasil', 'PicPay', 'XP'].map(b => (
                                <div key={b} className="px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 rounded-lg cursor-pointer" 
                                     onClick={() => { document.getElementById('newAccountName').value = b; document.getElementById('accountBankDropdown').classList.add('hidden'); }}>{b}</div>
                            ))}
                        </div>
                    </div>

                    <div className="w-1/3">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Tipo</label>
                        <select id="newAccountType" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm font-bold dark:text-slate-300 cursor-pointer">
                           <option value="checking">Conta Corrente</option>
                           <option value="savings">Poupança</option>
                           <option value="piggybank">Cofrinho</option>
                        </select>
                    </div>

                    <Button onClick={() => {
                        const nameEl = document.getElementById('newAccountName');
                        const typeEl = document.getElementById('newAccountType');
                        if(nameEl && nameEl.value.trim()) {
                            const name = nameEl.value.trim();
                            const type = typeEl.value;
                            
                            if((data.accounts || []).some(a => a.name.toLowerCase() === name.toLowerCase() && a.type === type)) {
                                alert("Esta conta já existe!"); return;
                            }

                            const newAcc = { id: `acc_${Date.now()}`, name, type, balance: 0 };
                            saveData({...data, accounts: [...(data.accounts || []), newAcc]});
                            nameEl.value = '';
                            try { Haptics.impact({ style: ImpactStyle.Light }); } catch(e){}
                        }
                    }} className="h-[46px] aspect-square bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg"><Plus size={20}/></Button>
                </div>
            </div>

            <div className="space-y-4">
                {(() => {
                    const accounts = data.accounts || [];
                    if (accounts.length === 0) return <p className="text-center text-slate-400 text-sm py-8 italic">Nenhuma conta cadastrada ainda.</p>;

                    // LÓGICA DE AGRUPAMENTO CORRIGIDA
                    const grouped = accounts.reduce((acc, current) => {
                        const key = current.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
                        if(!acc[key]) acc[key] = { name: current.name, total: 0, items: [] };
                        acc[key].total += Number(current.balance || 0);
                        acc[key].items.push(current);
                        return acc;
                    }, {});

                    return Object.values(grouped).map(group => {
                        const isGroup = group.items.length > 1;
                        return (
                            <div key={group.name} className={`relative flex flex-col transition-all ${isGroup ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm mb-2' : ''}`}>
                                
                                {isGroup && (
                                    <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400"><Banknote size={18}/></div>
                                            <span className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">{group.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Total</p>
                                            <p className="text-sm font-black text-emerald-500">{formatMoneyNoSign(group.total)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className={`flex flex-col ${isGroup ? 'divide-y divide-slate-100 dark:divide-slate-700' : 'space-y-3'}`}>
                                    {group.items.map(acc => {
                                        // VERIFICAÇÃO DE DUPLICIDADE COM O SALÁRIO
                                        const isDup = Number(acc.balance) === Number(data.income.salary) && Number(data.income.salary) > 0;

                                        return (
                                            <div key={acc.id} className={`flex items-center justify-between p-4 relative group transition-all ${!isGroup ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2.5 rounded-xl ${isDup ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                                                        {acc.type === 'savings' ? <PiggyBank size={20}/> : acc.type === 'piggybank' ? <Target size={20}/> : <Banknote size={20}/>}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 dark:text-white text-sm">
                                                            {!isGroup ? acc.name : (acc.type === 'savings' ? 'Poupança' : acc.type === 'piggybank' ? 'Cofrinho' : 'Corrente')}
                                                        </p>
                                                        {isDup && (
                                                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-tighter flex items-center gap-1">
                                                                <AlertTriangle size={10}/> Valor igual ao salário!
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="relative w-32">
                                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${isDup ? 'text-amber-500' : 'text-slate-400'}`}>R$</span>
                                                    <CurrencyInput 
                                                        className={`w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-right font-black text-sm outline-none transition-all
                                                            ${isDup ? 'border-amber-400 text-amber-600 ring-4 ring-amber-500/5' : 'border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500'}`}
                                                        value={acc.balance}
                                                        onChange={(val) => {
                                                            const updated = data.accounts.map(a => a.id === acc.id ? { ...a, balance: val } : a);
                                                            saveData({...data, accounts: updated});
                                                        }}
                                                    />
                                                </div>
                                                <button onClick={() => { if(window.confirm("Excluir conta?")) saveData({...data, accounts: data.accounts.filter(a => a.id !== acc.id)}); }} className="absolute -top-1 -right-1 p-1.5 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    });
                })()}
            </div>
        </Card>

{/* 2. CARTÃO DE CRÉDITO - VISUAL PREMIUM REFORMULADO */}
        <Card title="Meus Cartões de Crédito" icon={CreditCard} className="border-l-4 border-l-purple-500 shadow-xl">
            <div className="flex flex-col gap-3 mb-6 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Novo Cartão</p>
                <div className="flex flex-col sm:flex-row gap-2 items-end">
                    <div className="relative flex-1 w-full">
                        <input 
                            id="newCardName" 
                            placeholder="Nome do Cartão (ex: Nubank UV)" 
                            autoComplete="off"
                            onFocus={() => document.getElementById('cardBankDropdown').classList.remove('hidden')}
                            onBlur={() => setTimeout(() => { const el = document.getElementById('cardBankDropdown'); if(el) el.classList.add('hidden'); }, 200)}
                            className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500 text-sm font-bold dark:text-white transition-all shadow-sm" 
                        />
                        {/* DROPDOWN DE CARTÕES */}
                        <div id="cardBankDropdown" className="hidden absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-2xl z-50 flex flex-col p-1.5 animate-fade-in">
                            {['Nubank', 'Inter', 'C6 Bank', 'Itaú', 'Bradesco', 'Santander', 'XP', 'BTG', 'PicPay'].map(b => (
                                <div key={b} className="px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 rounded-lg cursor-pointer" 
                                     onClick={() => { document.getElementById('newCardName').value = b; document.getElementById('cardBankDropdown').classList.add('hidden'); }}>{b}</div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full sm:w-1/3">
                        <input id="newCardLimit" type="number" placeholder="Limite R$" className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500 text-sm font-bold dark:text-white shadow-sm" />
                    </div>
                    <Button onClick={() => {
                        const n = document.getElementById('newCardName');
                        const l = document.getElementById('newCardLimit');
                        if(n?.value.trim() && l?.value) {
                            saveData({...data, cards: [...(data.cards || []), { id: `card_${Date.now()}`, name: n.value.trim(), limit: Number(l.value), invoiceValue: 0, closingDate: '', dueDate: '', isExcluded: false }]});
                            n.value = ''; l.value = '';
                            try { Haptics.impact({ style: ImpactStyle.Light }); } catch(e){}
                        }
                    }} className="h-[46px] w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white border-none shadow-lg shadow-purple-500/30 px-6">
                        <Plus size={20} className="mr-1"/> Add
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {(data.cards || []).map(card => {
                    const limit = Number(card.limit) || 1; 
                    const invoice = Number(card.invoiceValue) || 0;
                    const percent = Math.min(100, (invoice / limit) * 100);
                    const isEx = card.isExcluded;

                    return (
                        <div key={card.id} className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${isEx ? 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800' : 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg'}`}>
                            
                            {/* Efeito de brilho no fundo para cartões ativos */}
                            {!isEx && <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl"></div>}

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${isEx ? 'bg-slate-200 text-slate-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>
                                        <CreditCard size={20}/>
                                    </div>
                                    <div>
                                        <h4 className={`font-black text-sm uppercase tracking-tight ${isEx ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>{card.name}</h4>
                                        <button onClick={() => saveData({...data, cards: data.cards.map(c => c.id === card.id ? { ...c, isExcluded: !c.isExcluded } : c)})} 
                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border mt-1 transition-colors ${isEx ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-100 dark:border-purple-800'}`}>
                                            {isEx ? 'Fatura Ignorada' : 'Monitoramento Ativo'}
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Fatura</p>
                                    <p className={`text-lg font-black ${isEx ? 'text-slate-400' : 'text-red-500'}`}>{formatMoneyNoSign(invoice)}</p>
                                </div>
                            </div>

                            {!isEx && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mb-1">Limite Livre</p>
                                            <p className="text-sm font-bold text-emerald-500">{formatMoneyNoSign(limit - invoice)}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700 relative">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mb-1">Ajustar Gasto</p>
                                            <CurrencyInput 
                                                className="w-full bg-transparent text-right font-black text-red-500 text-sm outline-none" 
                                                value={card.invoiceValue} 
                                                onChange={(v) => saveData({...data, cards: data.cards.map(c => c.id === card.id ? { ...c, invoiceValue: v } : c)})}
                                            />
                                        </div>
                                    </div>

                                    {/* Barra de Progresso Estilizada */}
                                    <div className="relative pt-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Uso do Limite</span>
                                            <span className={`text-[10px] font-bold ${percent > 85 ? 'text-red-500' : 'text-purple-500'}`}>{percent.toFixed(1)}%</span>
                                        </div>
                                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100 dark:bg-slate-700">
                                            <div style={{ width: `${percent}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${percent > 85 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}></div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Fecha</span>
                                            <input type="number" className="w-8 bg-transparent text-center font-bold text-xs dark:text-white outline-none" value={card.closingDate} onChange={(e) => saveData({...data, cards: data.cards.map(c => c.id === card.id ? { ...c, closingDate: validateDay(e.target.value) } : c)})}/>
                                        </div>
                                        <div className="flex-1 bg-red-50/50 dark:bg-red-900/10 p-2 rounded-xl border border-red-100 dark:border-red-900/20 flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-red-400 uppercase">Vence</span>
                                            <input type="number" className="w-8 bg-transparent text-center font-bold text-xs text-red-600 outline-none" value={card.dueDate} onChange={(e) => saveData({...data, cards: data.cards.map(c => c.id === card.id ? { ...c, dueDate: validateDay(e.target.value) } : c)})}/>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button onClick={() => { if(window.confirm(`Excluir ${card.name}?`)) saveData({...data, cards: data.cards.filter(c => c.id !== card.id)}); }} 
                                    className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    );
                })}
                {(!data.cards || data.cards.length === 0) && (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <CreditCard size={32} className="mx-auto text-slate-300 mb-2 opacity-20"/>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhum cartão cadastrado</p>
                    </div>
                )}
            </div>
        </Card>

    </div>
)}
            {/* ========================================== */}
            {/* SUB-ABA 3: GASTOS FIXOS E MENSAIS          */}
            {/* ========================================== */}
            {budgetSubTab === 'gastos' && (
                <div className="space-y-6 animate-fade-in mt-4">
                    
                    {/* Linha do Tempo Visual */}
                    <div className="w-full overflow-x-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-6 flex items-center gap-2 tracking-wider"><Clock size={14}/> Calendário de Vencimentos</h4>
                        <div className="flex items-center gap-2 min-w-[700px] relative pt-6 pb-2 mx-4">
                            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full -translate-y-1/2 z-0"></div>
                            
                            {/* Marcador Salário */}
                            <div className="absolute top-1/2 -translate-y-1/2 z-10 flex flex-col items-center group" style={{left: `${(Math.min(31, data.income.salaryDay) / 31) * 100}%`}}>
                                 <div className="w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-xs text-white font-bold mb-2 transition-transform group-hover:scale-110">$</div>
                                 <div className="h-4 w-0.5 bg-emerald-300"></div>
                                 <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded absolute -bottom-8">Dia {data.income.salaryDay}</span>
                            </div>

                            {Object.entries(data.expenseDates).map(([key, day]) => {
                                 if(!day || data.excludedExpenses[key] || Number(data.expenses[key]) === 0) return null;
                                 const isRisk = Number(day) < Number(data.income.salaryDay);
                                 return (
                                    <div key={key} className="absolute top-1/2 -translate-y-1/2 z-0 flex flex-col items-center group cursor-pointer hover:z-20" style={{left: `${(Math.min(31, day) / 31) * 100}%`}}>
                                        <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-all group-hover:scale-125 ${isRisk ? 'bg-red-500 ring-2 ring-red-200' : 'bg-slate-300 hover:bg-slate-500'}`}></div>
                                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-6 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity shadow-lg z-50 pointer-events-none">
                                            {key} (Dia {day})
                                        </div>
                                    </div>
                                 );
                            })}
                        </div>
                    </div>

                    <Card title="Obrigações & Seguros" className="border-l-4 border-l-red-500">
                        <div className="space-y-1">
                          <ExpenseRow icon={Shield} label="Seguros (Carro, Vida)" fieldKey="insurance" dateKey="insurance" dateValue={data.expenseDates.insurance} value={data.expenses.insurance} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.insurance} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                        </div>
                    </Card>

                    <Card title="Casa & Contas Básicas" className="border-l-4 border-l-purple-500">
                        <div className="space-y-1">
                          <ExpenseRow icon={Home} label="Aluguel / Condomínio" fieldKey="rent" dateKey="rent" dateValue={data.expenseDates.rent} value={data.expenses.rent} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.rent} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Zap} label="Conta de Luz" fieldKey="light" dateKey="light" dateValue={data.expenseDates.light} value={data.expenses.light} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.light} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Droplet} label="Conta de Água" fieldKey="water" dateKey="water" dateValue={data.expenseDates.water} value={data.expenses.water} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.water} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Wifi} label="Internet / Celular" fieldKey="internet" dateKey="internet" dateValue={data.expenseDates.internet} value={data.expenses.internet} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.internet} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Flame} label="Gás" fieldKey="gas" dateKey="gas" dateValue={data.expenseDates.gas} value={data.expenses.gas} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.gas} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                        </div>
                    </Card>

                    <Card title="Família & Saúde" className="border-l-4 border-l-purple-500">
                        <div className="space-y-1">
                          <ExpenseRow icon={ShoppingCart} label="Mercado (Mês)" fieldKey="market" dateKey="market" dateValue={data.expenseDates.market} value={data.expenses.market} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.market} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Users} label="Gastos com Filhos" fieldKey="dependents" dateKey="dependents" dateValue={data.expenseDates.dependents} value={data.expenses.dependents} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.dependents} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Heart} label="Farmácia / Plano de Saúde" fieldKey="health" dateKey="health" dateValue={data.expenseDates.health} value={data.expenses.health} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.health} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Heart} label="Pets (Ração, Vet)" fieldKey="pets" dateKey="pets" dateValue={data.expenseDates.pets} value={data.expenses.pets} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.pets} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Bus} label="Transporte / Combustível" fieldKey="transport" dateKey="transport" dateValue={data.expenseDates.transport} value={data.expenses.transport} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.transport} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={MoreHorizontal} label="Educação (Escola, Cursos)" fieldKey="education" dateKey="education" dateValue={data.expenseDates.education} value={data.expenses.education} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.education} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                        </div>
                    </Card>

                     <Card title="Lazer & Estilo de Vida" className="border-l-4 border-l-blue-500">
                        <div className="space-y-1">
                          <ExpenseRow icon={Ticket} label="Lazer / Passeios" fieldKey="leisure" dateKey="leisure" dateValue={data.expenseDates.leisure} value={data.expenses.leisure} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.leisure} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Scissors} label="Cuidados Pessoais (Cabelo, etc)" fieldKey="personalCare" dateKey="personalCare" dateValue={data.expenseDates.personalCare} value={data.expenses.personalCare} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.personalCare} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Tv} label="Streaming (Netflix, etc)" fieldKey="streaming" dateKey="streaming" dateValue={data.expenseDates.streaming} value={data.expenses.streaming} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.streaming} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={Coffee} label="Delivery / Restaurante" fieldKey="delivery" dateKey="delivery" dateValue={data.expenseDates.delivery} value={data.expenses.delivery} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.delivery} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={ShoppingBag} label="Compras / Shopping" fieldKey="shopping" dateKey="shopping" dateValue={data.expenseDates.shopping} value={data.expenses.shopping} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.shopping} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                          <ExpenseRow icon={MoreHorizontal} label="Outros Gastos" fieldKey="other" dateKey="other" dateValue={data.expenseDates.other} value={data.expenses.other} onChange={updateExpense} onDateChange={updateExpenseDate} isExcluded={data.excludedExpenses.other} onExclude={toggleExclude} salaryDay={data.income.salaryDay} />
                        </div>
                      </Card>
                </div>
              )}
          </div>
        )}

        {activeTab === 'investments' && (
<div className="space-y-8 animate-fade-in pb-24">
            
            {/* --- 1. CABEÇALHO DA SEÇÃO --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-emerald-500 pl-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Área de Investimentos</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                   Faça o seu dinheiro trabalhar para você.
                </p>
              </div>
            </div>

            {/* --- SEGMENTED CONTROL  --- */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex flex-col md:flex-row items-center w-full border border-slate-200 dark:border-slate-700 shadow-inner gap-1">
               <button 
                 onClick={() => setInvestmentSubTab('renda_fixa')}
                 className={`flex-1 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${investmentSubTab === 'renda_fixa' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <Shield size={16} /> Renda Fixa
               </button>
               <button 
                 onClick={() => setInvestmentSubTab('renda_variavel')}
                 className={`flex-1 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${investmentSubTab === 'renda_variavel' ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <Activity size={16} /> Bolsa & Ações
               </button>
               <button 
                 onClick={() => setInvestmentSubTab('cambio')}
                 className={`flex-1 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${investmentSubTab === 'cambio' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <Globe size={16} /> Câmbio
               </button>
            </div>

            {/* ========================================== */}
            {/* SUB-ABA: RENDA FIXA                        */}
            {/* ========================================== */}
            {investmentSubTab === 'renda_fixa' && (
              <div className="space-y-6 animate-fade-in mt-4">
                
                {/* --- EXPLICAÇÃO EDUCATIVA PREMIUM (COM CARROSSEL DE FAQ) --- */}
                {showFixedIncomeGuide && (
                    <div className="relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-[#0B0F19] dark:to-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm">
                        
                        <button 
                            onClick={() => setShowFixedIncomeGuide(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-800/80 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all z-20 hover:scale-110"
                            title="Ocultar dicas"
                        >
                            <X size={18} />
                        </button>

                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[60px] pointer-events-none -translate-y-1/3 translate-x-1/3 transition-all"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-5 pr-8">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner border border-emerald-100 dark:border-emerald-500/30">
                                    <Shield size={28} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Guia da Renda Fixa</h3>
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">Segurança & Previsibilidade</p>
                                </div>
                            </div>

                            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                Investir aqui é como <strong>emprestar o seu dinheiro</strong> para um banco ou para o governo. Em troca, você recebe o valor de volta garantido e acrescido de juros. É o porto seguro da sua carteira, perfeito para a sua Reserva de Emergência.
                            </p>

                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                                
                                <div className="min-w-[220px] max-w-[220px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl flex-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors group cursor-default">
                                    <h4 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-2 flex items-center gap-1.5">
                                        <CheckCircle size={14} className="group-hover:scale-110 transition-transform"/> Rende todo dia?
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Sim! Ativos como o Tesouro Selic e CDBs de liquidez diária rendem um pouquinho todos os dias úteis.
                                    </p>
                                </div>

                                <div className="min-w-[220px] max-w-[220px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl flex-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors group cursor-default">
                                    <h4 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-2 flex items-center gap-1.5">
                                        <Shield size={14} className="group-hover:scale-110 transition-transform"/> Posso perder tudo?
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Não. É o investimento mais seguro do Brasil. Bancos possuem o FGC que protege seu dinheiro em até R$ 250 mil.
                                    </p>
                                </div>

                                <div className="min-w-[220px] max-w-[220px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl flex-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors group cursor-default">
                                    <h4 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-2 flex items-center gap-1.5">
                                        <TrendingUp size={14} className="group-hover:scale-110 transition-transform"/> E a Poupança?
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        A Renda Fixa costuma render cerca de <strong>30% a 40% a mais</strong> do que a poupança tradicional, tendo a mesma segurança.
                                    </p>
                                </div>

                                <div className="min-w-[220px] max-w-[220px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 p-5 rounded-2xl flex-1 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors group cursor-default">
                                    <h4 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-2 flex items-center gap-1.5">
                                        <HelpCircle size={14} className="group-hover:scale-110 transition-transform"/> Quando posso sacar?
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Depende do ativo. Se tiver "Liquidez Diária", você saca no mesmo dia. Se for pré-fixado longo, só no vencimento.
                                    </p>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                )}
                
                {/* --- ÁREA DE ESTRATÉGIA --- */}
                <Card title="Estratégia de Investimento" icon={Brain}>
                  {finance.balance <= 0 ? (
                    <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle size={32}/>
                      </div>
                      <h3 className="text-lg font-bold text-red-900 dark:text-red-300">Caixa Zerado</h3>
                      <p className="text-red-600 dark:text-red-400 mt-2 max-w-xs mx-auto text-sm leading-relaxed">
                        Para começar a investir, você precisa gastar menos do que ganha. Ajuste seu orçamento.
                      </p>
                      <Button onClick={() => setActiveTab('budget')} variant="secondary" className="mt-6 mx-auto text-red-600 border-red-200 hover:bg-red-100">
                        Revisar Gastos
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {/* --- SALDO + SELIC DISCRETA --- */}
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                          <div className="flex items-center gap-5 z-10">
                              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Wallet size={28} />
                              </div>
                              <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Disponível para Aporte</p>
                                  <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                    {formatMoney(finance.balance)}
                                  </p>
                                  <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1">
                                    + {formatMoney(finance.balance * 0.009)} aprox. no primeiro mês
                                  </p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 z-10 w-full md:w-auto justify-center md:justify-end">
                              <div className="text-right">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Selic</p>
                                  <p className="text-sm font-bold text-emerald-500 flex items-center justify-end gap-1">
                                     <TrendingUp size={14}/> {marketRates.selic}%
                                  </p>
                              </div>
                              <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
                              <div className="text-left">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">CDI</p>
                                  <p className="text-sm font-bold text-purple-500">
                                     {marketRates.cdi}%
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Seleção de Perfil */}
                      <div className="mb-6">
                         <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Target size={16}/> Qual seu objetivo hoje?
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              {id: 'safe', icon: Shield, label: 'Segurança', desc: 'Reserva de Emergência', color: 'blue'}, 
                              {id: 'moderate', icon: Scale, label: 'Equilíbrio', desc: 'Metas de Médio Prazo', color: 'purple'}, 
                              {id: 'risky', icon: Rocket, label: 'Multiplicação', desc: 'Foco no Longo Prazo', color: 'orange'}
                            ].map(p => (
                               <button 
                                 key={p.id}
                                 onClick={() => handleProfileSelect(p.id)}
                                 className={`relative p-4 rounded-2xl border text-left flex items-center gap-4 transition-all duration-300 overflow-hidden group
                                    ${investProfile === p.id 
                                        ? `bg-${p.color}-50 dark:bg-${p.color}-900/20 border-${p.color}-500 ring-1 ring-${p.color}-500 shadow-md` 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'}`}
                               >
                                  <div className={`p-3 rounded-xl transition-colors ${investProfile === p.id ? `bg-${p.color}-500 text-white shadow-lg` : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                    <p.icon size={20}/>
                                  </div>
                                  <div>
                                     <span className={`font-bold text-base block ${investProfile === p.id ? `text-${p.color}-700 dark:text-${p.color}-300` : 'text-slate-700 dark:text-slate-200'}`}>{p.label}</span>
                                     <span className="text-xs text-slate-500 dark:text-slate-400">{p.desc}</span>
                                  </div>
                                  {investProfile === p.id && <div className={`absolute right-4 w-2 h-2 rounded-full bg-${p.color}-500`}></div>}
                               </button>
                            ))}
                         </div>
                      </div>

                      {/* Lista de Oportunidades */}
                      {investProfile && (
                        <div className="animate-fade-in-up">
                           <div className="flex items-center justify-between mb-4 mt-8">
                              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                 <Gem size={18} className="text-purple-500"/> Oportunidades Encontradas
                              </h3>
                              {searching && <Loader size={16} className="animate-spin text-purple-500"/>}
                           </div>
                           
                          {!searching && marketOpportunities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {marketOpportunities.map((opp) => {
                                const yield1k = 1000 * (1 + (opp.numericRate / 100));
                                const savingsGain = 1000 * 0.062;
                                const profit = yield1k - 1000;
                                const advantage = (profit / savingsGain).toFixed(1);

                                return (
                                  <div key={opp.id} className={`relative bg-white dark:bg-slate-900 border p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl group
                                      ${opp.isBest ? 'border-yellow-400 ring-1 ring-yellow-400 bg-gradient-to-b from-yellow-50/50 to-white dark:from-yellow-900/10 dark:to-slate-900' : 'border-slate-200 dark:border-slate-700'}`}>
                                    
                                    {opp.isBest && (
                                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] font-black px-3 py-1.5 rounded-bl-xl shadow-sm z-10 tracking-widest uppercase">
                                            Melhor Retorno
                                        </div>
                                    )}
                                    
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0 
                                            ${opp.bank.includes('Nubank') ? 'bg-[#820AD1]' : opp.bank.includes('Inter') ? 'bg-[#FF7A00]' : opp.bank.includes('Sofisa') ? 'bg-[#005AA5]' : 'bg-slate-700'}`}>
                                          {opp.bank.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                          <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{opp.name}</h4>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{opp.bank} • Risco {opp.risk}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Simulação Visual */}
                                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-700/50">
                                         <div className="flex justify-between items-center mb-1">
                                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Investindo R$ 1.000</span>
                                             <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                                {advantage}x a Poupança
                                             </span>
                                         </div>
                                         <div className="flex justify-between items-end">
                                             <span className="text-xs text-slate-500">Em 12 meses:</span>
                                             <span className="text-lg font-black text-slate-800 dark:text-white">
                                                {yield1k.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                             </span>
                                         </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                                      <div>
                                          <p className="text-[10px] text-slate-400 uppercase font-bold">Rentabilidade</p>
                                          <p className="text-base font-bold text-purple-600 dark:text-purple-400">{opp.rate}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Mínimo</p>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">R$ {opp.min}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                              {searching ? (
                                  <>
                                    <Loader className="animate-spin text-purple-500 mb-3" size={24}/>
                                    <p className="text-xs text-slate-400 font-bold uppercase animate-pulse">Analisando taxas...</p>
                                  </>
                              ) : (
                                  <p className="text-sm text-slate-400">Selecione um perfil acima para ver opções.</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* ========================================== */}
            {/* SUB-ABA: CÂMBIO E MOEDAS GLOBAIS           */}
            {/* ========================================== */}
            {investmentSubTab === 'cambio' && (
              <div className="space-y-6 animate-fade-in mt-4">
                
                {/* --- CONVERSOR EM TEMPO REAL (DESTAQUE) --- */}
                <div className="bg-gradient-to-br from-blue-900 to-indigo-950 dark:from-slate-900 dark:to-indigo-950 rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-blue-800/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-1/2">
                            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2">
                                <RefreshCw size={20} className="text-blue-400" /> Conversor Rápido
                            </h3>
                            <p className="text-blue-200/70 text-sm mb-5">
                                Digite o valor em Reais (R$) para ver a conversão instantânea. Toque nas moedas para trocar.
                            </p>
                            
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-300 font-black text-xl">R$</span>
                                <input 
                                    type="number" 
                                    value={brlToConvert || ''}
                                    onChange={(e) => setBrlToConvert(Number(e.target.value))}
                                    placeholder="0,00"
                                    className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-3xl font-black outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/10 placeholder-blue-300/30 backdrop-blur-md transition-all shadow-inner"
                                />
                            </div>
                        </div>
                        
                        <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                            {[
                                { state: convCurrency1, setter: setConvCurrency1 },
                                { state: convCurrency2, setter: setConvCurrency2 }
                            ].map((card, idx) => {
                                const selectedQuote = quotes ? quotes[card.state] : null;
                                let Icon = Banknote;
                                let colorClass = "text-slate-300";
                                let symbol = card.state;

                                // Define Cores e Ícones dinâmicos baseados na escolha
                                if (card.state === 'BRL') { Icon = Banknote; colorClass = "text-emerald-500"; symbol = "R$"; }
                                if (card.state === 'USD') { Icon = DollarSign; colorClass = "text-emerald-400"; symbol = "$"; }
                                else if (card.state === 'CAD') { Icon = DollarSign; colorClass = "text-red-400"; symbol = "C$"; }
                                else if (card.state === 'EUR') { Icon = Euro; colorClass = "text-blue-300"; symbol = "€"; }
                                else if (card.state === 'GBP') { Icon = PoundSterling; colorClass = "text-purple-400"; symbol = "£"; }
                                else if (card.state === 'CHF') { Icon = Banknote; colorClass = "text-slate-300"; symbol = "Fr"; }
                                else if (card.state === 'ARS') { Icon = Banknote; colorClass = "text-cyan-400"; symbol = "$"; }
                                else if (card.state === 'JPY') { Icon = JapaneseYen; colorClass = "text-pink-400"; symbol = "¥"; }
                                else if (card.state === 'CNY') { Icon = Banknote; colorClass = "text-amber-400"; symbol = "¥"; }

                                return selectedQuote ? (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-md flex flex-col justify-center transition-all hover:bg-white/10 relative group">
                                        
                                        <div className="flex justify-between items-center mb-2 relative">
                                            {/* Select Invisível (Truque para abrir o menu do sistema) */}
                                            <select 
                                                value={card.state}
                                                onChange={(e) => card.setter(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                title="Trocar Moeda"
                                            >
                                                {Object.entries(quotes).map(([k, v]) => (
                                                    <option key={k} value={k} className="text-slate-900 font-bold">{k} - {v.name}</option>
                                                ))}
                                            </select>

                                            <div className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider ${colorClass}`}>
                                                {card.state} <ChevronDown size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <Icon size={14} className={`${colorClass} opacity-50`} />
                                        </div>
                                        
                                        <p className="text-xl lg:text-2xl font-black text-white truncate" title={`${symbol} ${(brlToConvert / selectedQuote.val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                            {symbol} {(brlToConvert / selectedQuote.val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                ) : (
                                    <div key={idx} className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- LISTA DE MOEDAS GLOBAIS (GRID MODERNO) --- */}
                <div className="mt-8">
    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 px-1 mb-4">
        <Globe size={18} className="text-blue-500"/> Painel de Cotações 
    </h4>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quotes ? Object.entries(quotes)
          .filter(([key]) => key !== 'BRL') // <--- FILTRO ADICIONADO AQUI: Remove o BRL da grade
          .sort(([keyA], [keyB]) => {
              // LÓGICA DE ORDENAÇÃO: Favoritos sempre em primeiro lugar
              const isFavA = (data.favoriteCurrencies || []).includes(keyA);
              const isFavB = (data.favoriteCurrencies || []).includes(keyB);
              if (isFavA && !isFavB) return -1;
              if (!isFavA && isFavB) return 1;
              return 0; // Se os dois forem iguais, mantém a ordem normal
          }).map(([key, item]) => {
            
            const isFav = (data.favoriteCurrencies || []).includes(key);
            const isPositive = item.pct >= 0;
                        
                        let Icon = Banknote; 
                        let colorClass = "text-slate-500";
                        let borderClass = "border-slate-100 dark:border-slate-800";

                        if (key === 'USD') { Icon = DollarSign; colorClass = "text-emerald-500"; borderClass = "hover:border-emerald-300 dark:hover:border-emerald-700"; }
                        if (key === 'CAD') { Icon = DollarSign; colorClass = "text-red-500"; borderClass = "hover:border-red-300 dark:hover:border-red-700"; }
                        if (key === 'EUR') { Icon = Euro; colorClass = "text-blue-500"; borderClass = "hover:border-blue-300 dark:hover:border-blue-700"; }
                        if (key === 'GBP') { Icon = PoundSterling; colorClass = "text-purple-500"; borderClass = "hover:border-purple-300 dark:hover:border-purple-700"; }
                        if (key === 'CHF') { Icon = Banknote; colorClass = "text-slate-600 dark:text-slate-400"; }
                        if (key === 'ARS') { Icon = Banknote; colorClass = "text-cyan-500"; borderClass = "hover:border-cyan-300 dark:hover:border-cyan-700"; }
                        if (key === 'JPY') { Icon = JapaneseYen; colorClass = "text-pink-500"; borderClass = "hover:border-pink-300 dark:hover:border-pink-700"; }
                        if (key === 'CNY') { Icon = Banknote; colorClass = "text-amber-500"; borderClass = "hover:border-amber-300 dark:hover:border-amber-700"; }

                        const decimals = (key === 'ARS' || key === 'JPY') ? 4 : 2;

                        return (
                          <div 
                             key={key} 
                             onClick={() => handleCurrencyClick(key, item.name, item.val)}
                             className={`bg-white dark:bg-slate-900 p-5 rounded-3xl border ${isFav ? 'border-yellow-400/50 shadow-md ring-1 ring-yellow-400/20' : borderClass} shadow-sm flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 cursor-pointer group relative`}
                          >
                             {/* BOTÃO ESTRELA (FAVORITAR) */}
                             <button 
 onClick={(e) => {
    e.stopPropagation();
    const favs = data.favoriteCurrencies || [];
    const notifs = data.notifiedCurrencies || [];

    if (favs.includes(key)) {
        saveData({
            ...data, 
            favoriteCurrencies: favs.filter(k => k !== key),
            notifiedCurrencies: notifs.filter(k => k !== key)
        });
    } else {
        // 👇 Abre o nosso novo modal ao invés do window.confirm 👇
        setNotifPrompt({ isOpen: true, type: 'currency', key: key, name: item.name });
    }
}}
                                 className="absolute top-2 right-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
                                 title="Fixar no Início"
                             >
                                 <Star size={16} className={isFav ? "text-yellow-500 fill-yellow-500" : "text-slate-300 dark:text-slate-600"} />
                             </button>

                             <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${colorClass} mb-3 transition-transform group-hover:scale-110 mt-2`}>
                                <Icon size={24} strokeWidth={2}/>
                             </div>
                             <div className="w-full">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.name}</p>
                                <p className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                   {item.val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                                </p>
                                
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center w-full">
                                    <span className="text-[10px] text-slate-400 font-medium">Variação</span>
                                    <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                                       {isPositive ? <TrendingUp size={10}/> : <TrendingDown size={10}/>} {Math.abs(item.pct)}%
                                    </span>
                                </div>
                             </div>
                          </div>
                        );
                      }) : (
                         [1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-[180px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>)
                      )}
                    </div>
                </div>

               {/* Card Explicativo Premium */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-700/50 flex flex-col md:flex-row items-center md:items-start gap-4 mt-4">
                   <div className="p-3 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm rounded-xl shrink-0">
                       <AlertCircle size={20} />
                   </div>
                   <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center md:text-left mt-1">
                       <strong>Importante:</strong> Estas são cotações do câmbio comercial. Se você for comprar papel-moeda para uma viagem ou usar o cartão de crédito no exterior (câmbio turismo), o valor final será maior devido ao <em>spread</em> da corretora e cobrança de IOF.
                   </p>
                </div>

              </div>
            )}

            {/* ========================================== */}
            {/* SUB-ABA: RENDA VARIÁVEL (BOLSA / AÇÕES)    */}
            {/* ========================================== */}
            {investmentSubTab === 'renda_variavel' && (
              <div className="space-y-6 animate-fade-in mt-4">
                
                {/* 1. BARRA DE PESQUISA CENTRAL */}
                <div className="bg-gradient-to-br from-slate-900 to-[#0B0F19] rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            <Activity size={24} className="text-purple-500" />
                            Terminal B3
                        </h3>
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Mercado Aberto
                        </div>
                    </div>

                    <div className="flex gap-2 relative z-10">
                        <input 
                            value={stockQuery}
                            onChange={e => {
                                const val = e.target.value.toUpperCase();
                                setStockQuery(val);
                                if (val === '') {
                                    setStockResult(null);
                                    setStockError('');
                                }
                            }}
                            onKeyDown={e => e.key === 'Enter' && handleSearchStock()}
                            placeholder="Busque (Ex: PETR4, MXRF11)..." 
                            className="flex-1 p-4 bg-[#0F172A] border border-slate-700 rounded-xl outline-none font-bold text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase transition-all shadow-inner placeholder:text-slate-500"
                        />
                        {stockResult && stockQuery === stockResult.symbol ? (
                            <Button onClick={() => { setStockResult(null); setStockQuery(''); }} variant="danger" className="h-auto aspect-square px-5 bg-red-500/20 hover:bg-red-500/40 text-red-400">
                                <X size={24}/>
                            </Button>
                        ) : (
                            <Button onClick={() => handleSearchStock()} disabled={stockLoading || !stockQuery} className="h-auto aspect-square px-5 shadow-lg shadow-purple-500/20">
                                {stockLoading ? <Loader className="animate-spin text-white" size={24}/> : <Search size={24}/>}
                            </Button>
                        )}
                    </div>
                    {stockError && <p className="text-red-400 text-sm mt-3 font-bold animate-pulse relative z-10">{stockError}</p>}
                </div>

                {/* 2. TELA DE DESCOBERTA E EDUCAÇÃO */}
                {!stockResult && !stockLoading && (
                    <div className="space-y-8 animate-slide-up">
                        
                        {(data.favoriteStocks && data.favoriteStocks.length > 0) && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 px-1">
                                    <Star size={16} className="text-yellow-500 fill-yellow-500"/> Minha Carteira Rápida
                                </h4>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                    {data.favoriteStocks.map(ticker => (
                                        <button
                                            key={ticker}
                                            onClick={() => handleSearchStock(ticker)}
                                            className="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-yellow-400 dark:hover:border-yellow-500 transition-all shadow-sm active:scale-95 shrink-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-yellow-500 group-hover:bg-yellow-50 dark:group-hover:bg-yellow-500/10 transition-colors shadow-inner">
                                                <Activity size={14} />
                                            </div>
                                            <span className="font-black text-slate-800 dark:text-white tracking-widest">{ticker}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 px-1">
                                <BookOpen size={16} className="text-blue-500"/> Entenda o Mercado
                            </h4>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                <div className="min-w-[240px] md:min-w-0 md:flex-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50 relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 text-blue-500/10 group-hover:text-blue-500/20 transition-colors"><PieChart size={80}/></div>
                                    <h5 className="font-bold text-blue-900 dark:text-blue-300 mb-1 relative z-10">O que são Ações?</h5>
                                    <p className="text-xs text-blue-800 dark:text-blue-400/80 leading-relaxed relative z-10">Você compra um "pedacinho" de uma empresa. Se ela crescer e lucrar, o seu dinheiro cresce junto!</p>
                                </div>
                                
                                <div className="min-w-[240px] md:min-w-0 md:flex-1 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800/50 relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 text-orange-500/10 group-hover:text-orange-500/20 transition-colors"><Home size={80}/></div>
                                    <h5 className="font-bold text-orange-900 dark:text-orange-300 mb-1 relative z-10">O que são FIIs?</h5>
                                    <p className="text-xs text-orange-800 dark:text-orange-400/80 leading-relaxed relative z-10">Fundos Imobiliários. É como receber "aluguéis" de shoppings e galpões todos os meses.</p>
                                </div>

                                <div className="min-w-[240px] md:min-w-0 md:flex-1 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors"><DollarSign size={80}/></div>
                                    <h5 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1 relative z-10">E os Dividendos?</h5>
                                    <p className="text-xs text-emerald-800 dark:text-emerald-400/80 leading-relaxed relative z-10">É a parte do lucro que a empresa divide com você. É dinheiro vivo caindo na sua conta.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 px-1">
                                <Zap size={16} className="text-yellow-500"/> Explorar Setores
                            </h4>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                {[
                                    { name: 'Destaques', icon: Sparkles, colorStr: 'text-yellow-500', activeBg: 'bg-yellow-500', hoverBorder: 'hover:border-yellow-400' },
                                    { name: 'Dividendos', icon: DollarSign, colorStr: 'text-emerald-500', activeBg: 'bg-emerald-500', hoverBorder: 'hover:border-emerald-400' },
                                    { name: 'Fundos Imob.', icon: Home, colorStr: 'text-blue-500', activeBg: 'bg-blue-500', hoverBorder: 'hover:border-blue-400' },
                                    { name: 'Tecnologia', icon: Code, colorStr: 'text-purple-500', activeBg: 'bg-purple-500', hoverBorder: 'hover:border-purple-400' },
                                    { name: 'Bancos', icon: Banknote, colorStr: 'text-orange-500', activeBg: 'bg-orange-500', hoverBorder: 'hover:border-orange-400' }
                                ].map(sec => {
                                    const isActive = activeStockCategory === sec.name;
                                    return (
                                        <button 
                                            key={sec.name} 
                                            onClick={() => setActiveStockCategory(sec.name)}
                                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap transition-all shadow-sm active:scale-95 text-sm font-bold ${
                                                isActive 
                                                ? `${sec.activeBg} text-white border-transparent shadow-lg shadow-current/30` 
                                                : `bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 ${sec.hoverBorder}`
                                            }`}
                                        >
                                            <sec.icon size={16} className={isActive ? 'text-white' : sec.colorStr} />
                                            {sec.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CARROSSEL PREMIUM DINÂMICO (CORRIGIDO COM PERGUNTA) */}
                        <div className="animate-fade-in" key={activeStockCategory}>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 px-1">
                                <Sparkles size={16} className="text-purple-500"/> 
                                {activeStockCategory === 'Destaques' ? 'Escolhas do Especialista' : `Exemplos em ${activeStockCategory}`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {{
                                    'Destaques': [
                                        { ticker: 'WEGE3', name: 'WEG S.A.', tip: 'Crescimento', price: '38,50', up: true, grad: 'from-[#0B132B] to-[#1E3A8A]', ring: 'blue' },
                                        { ticker: 'ITUB4', name: 'Itaú Unibanco', tip: 'Dividendos', price: '34,20', up: true, grad: 'from-[#2A1610] to-[#7C2D12]', ring: 'orange' },
                                        { ticker: 'MXRF11', name: 'Maxi Renda FII', tip: 'Fundo Base 10', price: '10,40', up: false, grad: 'from-[#1A1025] to-[#4C1D95]', ring: 'purple' }
                                    ],
                                    'Dividendos': [
                                        { ticker: 'TAEE11', name: 'Taesa S.A.', tip: 'Transmissão Segura', price: '35,10', up: true, grad: 'from-[#064E3B] to-[#047857]', ring: 'emerald' },
                                        { ticker: 'BBAS3', name: 'Banco do Brasil', tip: 'Alta Rentabilidade', price: '58,30', up: true, grad: 'from-[#422006] to-[#B45309]', ring: 'yellow' },
                                        { ticker: 'TRPL4', name: 'ISA CTEEP', tip: 'Pagamento Frequente', price: '26,15', up: false, grad: 'from-[#1E1B4B] to-[#6D28D9]', ring: 'purple' }
                                    ],
                                    'Fundos Imob.': [
                                        { ticker: 'HGLG11', name: 'CGHG Logística', tip: 'Galpões Premium', price: '162,50', up: true, grad: 'from-[#172554] to-[#1D4ED8]', ring: 'blue' },
                                        { ticker: 'BTLG11', name: 'BTG Logística', tip: 'Carteira Forte', price: '102,10', up: true, grad: 'from-[#022C22] to-[#059669]', ring: 'emerald' },
                                        { ticker: 'KNRI11', name: 'Kinea Renda', tip: 'Lajes', price: '160,25', up: false, grad: 'from-[#2A1610] to-[#C2410C]', ring: 'orange' }
                                    ],
                                    'Tecnologia': [
                                        { ticker: 'TOTS3', name: 'TOTVS', tip: 'Software Líder', price: '30,10', up: true, grad: 'from-[#2E1065] to-[#7C3AED]', ring: 'purple' },
                                        { ticker: 'LWSA3', name: 'Locaweb', tip: 'E-commerce', price: '5,80', up: false, grad: 'from-[#0B132B] to-[#2563EB]', ring: 'blue' },
                                        { ticker: 'POSI3', name: 'Positivo Tec', tip: 'Hardware e Gov', price: '8,45', up: true, grad: 'from-[#064E3B] to-[#10B981]', ring: 'emerald' }
                                    ],
                                    'Bancos': [
                                        { ticker: 'SANB11', name: 'Santander Brasil', tip: 'Aposta Arrojada', price: '28,90', up: true, grad: 'from-[#450A0A] to-[#DC2626]', ring: 'red' },
                                        { ticker: 'BBDC4', name: 'Bradesco PN', tip: 'Reestruturação', price: '14,20', up: false, grad: 'from-[#2A1610] to-[#9A3412]', ring: 'orange' },
                                        { ticker: 'ITSA4', name: 'Itaúsa Holding', tip: 'Desconto Holding', price: '10,50', up: true, grad: 'from-[#172554] to-[#1E40AF]', ring: 'blue' }
                                    ]
                                }[activeStockCategory]?.map(item => {
                                    
                                    const isFav = (data.favoriteStocks || []).includes(item.ticker);
                                    
                                    return (
                                    <div 
                                        key={item.ticker} 
                                        onClick={() => handleSearchStock(item.ticker)} 
                                        className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${item.grad} p-6 border ${isFav ? 'border-yellow-400/80 ring-2 ring-yellow-400/30' : 'border-slate-700/50 hover:border-slate-500'} transition-all cursor-pointer group shadow-xl active:scale-95`}
                                    >
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${item.ring}-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${item.ring}-500/30 transition-all duration-500`}></div>
                                        
                                        <div className="relative z-10 flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-2xl font-black text-white tracking-tight">{item.ticker}</h4>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">{item.name}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                               {/* BOTÃO ESTRELA COM LÓGICA DE NOTIFICAÇÃO */}
<button 
    onClick={(e) => {
        e.stopPropagation();
        const favs = data.favoriteStocks || [];
        const notifs = data.notifiedStocks || [];
        
        if (favs.includes(item.ticker)) {
            // Remove de favoritos e notificações
            saveData({
                ...data, 
                favoriteStocks: favs.filter(t => t !== item.ticker),
                notifiedStocks: notifs.filter(t => t !== item.ticker)
            });
        } else {
            // 👇 Abre o nosso novo modal ao invés do window.confirm 👇
            setNotifPrompt({ isOpen: true, type: 'stock', key: item.ticker, name: item.ticker });
        }
    }}
    className="p-2 bg-black/20 hover:bg-black/40 rounded-xl transition-all z-20 backdrop-blur-sm border border-white/5"
    title="Adicionar à Carteira Rápida"
>
    <Star size={16} className={isFav ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-white/40 group-hover:text-white/80"} />
</button>

                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${item.up ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {item.up ? <TrendingUp size={18} strokeWidth={2.5}/> : <TrendingDown size={18} strokeWidth={2.5}/>}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="relative z-10 flex flex-col gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-200 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5 w-fit">
                                                {item.tip}
                                            </span>
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-slate-400 font-medium">Cot. Atual</span>
                                                <span className="text-2xl font-black text-white font-mono tracking-tighter">R$ {item.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. TERMINAL PRO DO ATIVO (CORRIGIDO COM PERGUNTA) */}
                {stockResult && (
                    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] rounded-3xl overflow-hidden animate-slide-up shadow-2xl">
                        
                        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-transparent">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-black text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">{stockResult.symbol}</h4>
                                    
                                    <button 
onClick={() => {
    const symbol = stockResult.symbol;
    const favs = data.favoriteStocks || [];
    const notifs = data.notifiedStocks || [];
    
    if (favs.includes(symbol)) {
        saveData({
            ...data, 
            favoriteStocks: favs.filter(t => t !== symbol),
            notifiedStocks: notifs.filter(t => t !== symbol)
        });
    } else {
        // 👇 Abre o nosso novo modal ao invés do window.confirm 👇
        setNotifPrompt({ isOpen: true, type: 'stock', key: symbol, name: symbol });
    }
    try { Haptics.impact({ style: ImpactStyle.Light }); } catch(e){}
}}
                                        className={`p-2 rounded-full transition-all hover:scale-110 active:scale-90 ${
                                            (data.favoriteStocks || []).includes(stockResult.symbol) 
                                            ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-yellow-500'
                                        }`}
                                        title="Favoritar Ação"
                                    >
                                        <Star size={18} fill={(data.favoriteStocks || []).includes(stockResult.symbol) ? "currentColor" : "none"} />
                                    </button>

                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black tracking-widest uppercase animate-pulse">
                                        <Radio size={10}/> AO VIVO
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stockResult.shortName}</p>
                            </div>
                            
                            <div className="text-left md:text-right w-full md:w-auto">
                                <p className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter font-mono">
                                    R$ {stockResult.regularMarketPrice?.toFixed(2)}
                                </p>
                                <p className={`text-sm font-bold flex items-center md:justify-end gap-1 mt-1 ${stockResult.regularMarketChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {stockResult.regularMarketChangePercent >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                                    {stockResult.regularMarketChangePercent?.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-white dark:bg-[#0B0F19]">
                            <AdvancedChart 
                                data={stockResult.history} 
                                isPositive={stockResult.regularMarketChangePercent >= 0} 
                                currentPrice={stockResult.regularMarketPrice}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800">
                            {[
                                { label: 'Abertura', val: stockResult.regularMarketOpen ? `R$ ${stockResult.regularMarketOpen.toFixed(2)}` : '--' },
                                { label: 'Mínima Dia', val: stockResult.regularMarketDayLow ? `R$ ${stockResult.regularMarketDayLow.toFixed(2)}` : '--' },
                                { label: 'Máxima Dia', val: stockResult.regularMarketDayHigh ? `R$ ${stockResult.regularMarketDayHigh.toFixed(2)}` : '--' },
                                { label: 'Volume', val: stockResult.regularMarketVolume ? `${(stockResult.regularMarketVolume / 1000000).toFixed(1)}M` : '--' }
                            ].map((met, i) => (
                                <div key={i} className="bg-white dark:bg-[#0F172A] p-4 text-center">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{met.label}</p>
                                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">{met.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        )}

{activeTab === 'dreams' && (
  <div className="space-y-8 animate-fade-in">
     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-purple-500 pl-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Meus Objetivos</h2>
          <p className="text-slate-500 text-sm">Transforme sonhos em planos concretos.</p>
        </div>
     </div>
     
     {/* --- FORMULÁRIO DE NOVA META --- */}
     <Card title="Criar Nova Meta" icon={Sparkles}>
       <div className="flex flex-col gap-6">
           {/* Linha 1: Nome e Valor */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                 <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Nome do Objetivo</label>
                 <input 
                   value={newDream.title}
                   onChange={(e) => setNewDream({...newDream, title: e.target.value})}
                   placeholder="Ex: MacBook, Viagem..." 
                   className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all font-bold" 
                 />
             </div>
             <div>
                 <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Valor da Meta</label>
                 <div className="flex gap-2">
                   {/* Seletor de Moeda */}
                   <select
                      value={newDream.currency || 'BRL'}
                      onChange={(e) => setNewDream({...newDream, currency: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
                   >
                      <option value="BRL">R$ (Real)</option>
                      <option value="USD">US$ (Dólar)</option>
                      <option value="EUR">€ (Euro)</option>
                      <option value="GBP">£ (Libra)</option>
                   </select>

                   {/* Input de Valor */}
                   <div className="relative flex-1">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                       {newDream.currency === 'USD' ? 'US$' : newDream.currency === 'EUR' ? '€' : newDream.currency === 'GBP' ? '£' : 'R$'}
                     </span>
                     <CurrencyInput 
                       value={newDream.target}
                       onChange={(val) => setNewDream({...newDream, target: val})}
                       placeholder="0,00" 
                       className="w-full pl-12 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all font-bold" 
                     />
                   </div>
                 </div>
             </div>
           </div>

           {/* Linha 2: Categoria e Aporte */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <div>
                 <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Categoria</label>
                 <div className="grid grid-cols-4 gap-2">
                   {[
                     {id: 'buy', icon: ShoppingBag, label: 'Compra', color: 'blue'},
                     {id: 'reserve', icon: Shield, label: 'Reserva', color: 'emerald'},
                     {id: 'trip', icon: Rocket, label: 'Viagem', color: 'orange'},
                     {id: 'debt', icon: TrendingDown, label: 'Dívida', color: 'red'}
                   ].map(cat => (
                       <button 
                         key={cat.id} 
                         onClick={() => setNewDream({...newDream, category: cat.id})}
                         className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                           newDream.category === cat.id 
                             ? 'bg-purple-50 dark:bg-purple-900/40 border-purple-500 ring-1 ring-purple-500' 
                             : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                         }`}
                       >
                         <cat.icon size={20} className={`mb-1 ${newDream.category === cat.id ? 'text-purple-600 dark:text-purple-300' : `text-${cat.color}-500`}`}/>
                         <span className={`text-[10px] font-bold ${newDream.category === cat.id ? 'text-purple-700 dark:text-purple-200' : 'text-slate-600 dark:text-slate-300'}`}>{cat.label}</span>
                       </button>
                   ))}
                 </div>
             </div>
             
             <div className="flex gap-2 items-end">
                 <div className="flex-1">
                     <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Aporte Mensal (Opcional)</label>
                     <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                       <CurrencyInput 
                         value={newDream.monthly}
                         onChange={(val) => setNewDream({...newDream, monthly: val})}
                         placeholder="0,00" 
                         className="w-full pl-8 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all" 
                       />
                     </div>
                 </div>
                 <Button onClick={() => {
                     if(newDream.title && newDream.target > 0) {
                         const dreamToAdd = {
                         id: Date.now(),
                         title: newDream.title,
                         target: Number(newDream.target),
                         saved: 0,
                         category: newDream.category,
                         monthlyContribution: Number(newDream.monthly) || 0,
                         currency: newDream.currency || 'BRL',
                         createdAt: Date.now(),
                         tasks: [] 
                       };
                         saveData({...data, dreams: [...data.dreams, dreamToAdd]});
                         
                         // Limpa o formulário e reseta a moeda
                         setNewDream({ title: '', target: '', monthly: '', category: 'buy', currency: 'BRL' });
                         
                         // Feedback Tátil
                         try { Haptics.notification({ type: 'SUCCESS' }); } catch(e){}
                     } else {
                         alert("Preencha pelo menos o Nome e o Valor da meta!");
                     }
                   }} className="h-[58px] aspect-square shadow-xl shadow-purple-500/20">
                     <Plus size={24}/>
                 </Button>
             </div>
           </div>
       </div>
     </Card>

     {/* --- LISTA DE METAS (GRID) --- */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* ESTADO VAZIO */}
        {data.dreams.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center opacity-60 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Rocket size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Nenhum sonho cadastrado</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">Defina sua primeira meta acima e comece a realizar.</p>
          </div>
        )}

        {/* CARTÕES DE METAS */}
{data.dreams.map(dream => {
             // Configuração Visual por Categoria
             const catConfig = {
                buy: { icon: ShoppingBag, color: 'blue', bg: 'from-blue-600 to-indigo-600' },
                reserve: { icon: Shield, color: 'emerald', bg: 'from-emerald-600 to-teal-600' },
                trip: { icon: Rocket, color: 'orange', bg: 'from-orange-500 to-pink-500' },
                debt: { icon: TrendingDown, color: 'red', bg: 'from-red-600 to-rose-600' }
             }[dream.category || 'buy'];

             const DreamIcon = catConfig.icon;

             // --- LÓGICA DE MULTIMOEDAS E CÂMBIO ---
             const isForeign = dream.currency && dream.currency !== 'BRL';
             const exchangeRate = (isForeign && quotes && quotes[dream.currency]) ? quotes[dream.currency].val : 1;
             const targetInBRL = dream.target * exchangeRate;
             const percent = Math.min(100, (dream.saved / targetInBRL) * 100);
             
             // Cálculo Inteligente de Previsão
             let prediction = null;
             if (dream.monthlyContribution > 0 && dream.saved < targetInBRL) {
                const remaining = targetInBRL - dream.saved;
                const months = Math.ceil(remaining / dream.monthlyContribution);
                const date = new Date();
                date.setMonth(date.getMonth() + months);
                prediction = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
             }

             return (
             <div key={dream.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
                 {/* Cabeçalho do Card */}
                 <div className={`h-28 bg-gradient-to-r ${catConfig.bg} relative p-5 flex justify-between items-start`}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    
                    <div className="relative z-10 text-white">
                        <div className="flex items-center gap-2 mb-1 opacity-90">
                           <DreamIcon size={14}/>
                           <span className="text-[10px] uppercase font-bold tracking-wider">
                             {dream.category === 'debt' ? 'Eliminar Dívida' : dream.category === 'reserve' ? 'Segurança' : dream.category === 'trip' ? 'Experiência' : 'Conquista'}
                           </span>
                        </div>
                        <h3 className="font-bold text-xl drop-shadow-md truncate w-48">{dream.title}</h3>
                    </div>

                    {/* BOTÃO EXCLUIR */}
                      <button 
                         onClick={() => requestConfirm(
                               "Desistir do Sonho?",
                               `Você vai excluir a meta "${dream.title}". Todo o valor guardado voltará para o saldo livre.`,
                         () => saveData({...data, dreams: data.dreams.filter(d => d.id !== dream.id)})
                          )}
                        className="relative z-10 p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md transition-colors"
                         >
                             <Trash2 size={16}/>
                       </button>
                 </div>

                 {/* Corpo do Card */}
                 <div className="p-6">
                     {/* Previsão Automática */}
                     {prediction && (
                        <div className="mb-4 flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-100 dark:border-purple-800/50">
                           <CalendarClock size={14} className="text-purple-600 dark:text-purple-400"/> 
                           <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Previsão: <strong>{prediction}</strong></p>
                        </div>
                     )}

                     <div className="flex justify-between text-xs mb-2 font-medium">
                         <span className="text-slate-400">Progresso</span>
                         <span className={`font-bold ${percent >= 100 ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>{percent.toFixed(0)}%</span>
                     </div>
                     
                     <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6 shadow-inner">
                         <div className={`h-full bg-gradient-to-r ${catConfig.bg} relative transition-all duration-1000`} style={{width: `${percent}%`}}>
                             {percent < 100 && <div className="absolute inset-0 bg-white/30 animate-pulse"></div>}
                         </div>
                     </div>
                     
                     <div className="flex justify-between items-end mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                         <div>
                             <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Guardado</p>
                             <p className={`text-lg font-bold ${percent >= 100 ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>{formatMoney(dream.saved)}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Meta</p>
                             
                             {/* EXIBIÇÃO: MOSTRA ESTRANGEIRA + CONVERSÃO BR */}
                             {isForeign ? (
                                 <div className="flex flex-col items-end">
                                     <p className="text-sm font-bold text-slate-500 dark:text-slate-300 flex items-center gap-1">
                                        <Globe size={12}/> {dream.currency} {dream.target.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                     </p>
                                     <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                        ~ {formatMoney(targetInBRL)}
                                     </p>
                                 </div>
                             ) : (
                                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{formatMoney(dream.target)}</p>
                             )}
                         </div>
                     </div>

                     {percent < 100 ? (
                         <div className="relative">
                            <input 
                                type="number" 
                                placeholder="Adicionar aporte..." 
                                className="w-full p-3 pl-4 pr-12 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-purple-500 transition-colors font-medium"
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        const val = Number(e.target.value);
                                        if(val > 0) {
                                            const updated = data.dreams.map(d => d.id === dream.id ? {...d, saved: d.saved + val} : d);
                                            saveData({...data, dreams: updated});
                                            e.target.value = '';
                                            if(dream.saved + val >= targetInBRL) alert("PARABÉNS! META ATINGIDA! 🎉");
                                        }
                                    }
                                }}
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-slate-700 rounded-lg text-emerald-500 shadow-sm border border-slate-100 dark:border-slate-600 hover:scale-110 transition-transform"><Plus size={16}/></button>
                         </div>
                     ) : (
                         <div className="w-full py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-center text-sm flex items-center justify-center gap-2">
                             <CheckCircle size={18}/> Conquistado!
                         </div>
                     )}

                     {/* --- CHECKLIST / SUBMETAS --- */}
                     <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                         <div className="flex items-center justify-between mb-3">
                             <h5 className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1.5">
                                 <CheckSquare size={14} className="text-purple-500" /> Etapas do Sonho
                             </h5>
                             <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                 {(dream.tasks || []).filter(t => t.completed).length} / {(dream.tasks || []).length}
                             </span>
                         </div>

                         {/* LISTA DE TAREFAS */}
                         <div className="space-y-2 mb-4">
                             {(dream.tasks || []).map(task => (
                                 <div key={task.id} className="flex items-center justify-between group bg-slate-50/50 dark:bg-slate-800/30 p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                                     <label className="flex items-center gap-3 cursor-pointer flex-1">
                                         <input
                                             type="checkbox"
                                             checked={task.completed}
                                             onChange={() => {
                                                 const updated = data.dreams.map(d =>
                                                     d.id === dream.id
                                                     ? { ...d, tasks: d.tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t) }
                                                     : d
                                                 );
                                                 saveData({...data, dreams: updated});
                                                 if(!task.completed) { try { Haptics.impact({ style: ImpactStyle.Light }); } catch(e){} }
                                             }}
                                             className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 bg-white dark:bg-slate-900 cursor-pointer accent-purple-500"
                                         />
                                         <span className={`text-sm font-medium transition-all ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                             {task.title}
                                         </span>
                                     </label>
                                     
                                     {/* Botão de Excluir Tarefa */}
                                     <button
                                         onClick={() => {
                                             const updated = data.dreams.map(d =>
                                                 d.id === dream.id
                                                 ? { ...d, tasks: d.tasks.filter(t => t.id !== task.id) }
                                                 : d
                                             );
                                             saveData({...data, dreams: updated});
                                         }}
                                         className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1.5"
                                     >
                                         <Trash2 size={14} />
                                     </button>
                                 </div>
                             ))}
                         </div>

                         {/* INPUT PARA ADICIONAR NOVA TAREFA */}
                         <div className="relative">
                             <input
                                 type="text"
                                 placeholder="Nova etapa (ex: Comprar passagens)..."
                                 className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-purple-500 transition-colors font-medium placeholder:text-slate-400"
                                 onKeyDown={(e) => {
                                     if (e.key === 'Enter' && e.target.value.trim()) {
                                         const newTaskTitle = e.target.value.trim();
                                         const updated = data.dreams.map(d =>
                                             d.id === dream.id
                                             ? { ...d, tasks: [...(d.tasks || []), { id: Date.now(), title: newTaskTitle, completed: false }] }
                                             : d
                                         );
                                         saveData({...data, dreams: updated});
                                         e.target.value = '';
                                     }
                                 }}
                             />
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                 <span className="text-[9px] font-bold uppercase border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">Enter</span>
                             </div>
                         </div>
                     </div>

                 </div>
             </div>
         )})}
     </div>
  </div>
)}

        {activeTab === 'debts' && (
          <div className="space-y-6 animate-fade-in pb-24">
            
            {/* CABEÇALHO E TÍTULO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-red-500 pl-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Guerra às Dívidas</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                   Estratégia e controlo para recuperar a sua liberdade financeira.
                </p>
              </div>
            </div>

            {/* SEGMENTED CONTROL (AS SUB-ABAS) */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex flex-col md:flex-row items-center w-full border border-slate-200 dark:border-slate-700 shadow-inner gap-1">
               <button 
                 onClick={() => setDebtSubTab('estrategia')}
                 className={`flex-1 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${debtSubTab === 'estrategia' ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <Brain size={16} /> Estratégia e Resumo
               </button>
               <button 
                 onClick={() => setDebtSubTab('gerenciar')}
                 className={`flex-1 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${debtSubTab === 'gerenciar' ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                 <Shield size={16} /> Gerir Dívidas
               </button>
            </div>

            {/* ========================================== */}
            {/* SUB-ABA 1: ESTRATÉGIA E RESUMO             */}
            {/* ========================================== */}
            {debtSubTab === 'estrategia' && (
                <div className="space-y-6 animate-fade-in mt-4">
                    {/* RESUMO GERAL */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-red-300 transition-colors">
                        <div className="absolute right-0 top-0 p-4 opacity-5 text-red-500 group-hover:opacity-10 transition-opacity"><Shield size={80}/></div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 relative z-10">Dívida Total</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 relative z-10">{formatMoney(finance.totalDebt)}</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                         <div className="absolute right-0 top-0 p-4 opacity-10 text-emerald-600 group-hover:opacity-20 transition-opacity"><CheckCircle size={80}/></div>
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2 relative z-10">Já Eliminado</p>
                        <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 relative z-10">{formatMoney(finance.paidDebt)}</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm relative overflow-hidden group hover:border-purple-300 transition-colors">
                         <div className="absolute right-0 top-0 p-4 opacity-10 text-purple-600 group-hover:opacity-20 transition-opacity"><CalendarClock size={80}/></div>
                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-2 relative z-10">Previsão de Liberdade</p>
                        <p className="text-lg font-bold text-purple-800 dark:text-purple-300 leading-tight relative z-10">
                            {finance.balance > 0 && (finance.totalDebt - finance.paidDebt) > 0
                                ? `${Math.ceil((finance.totalDebt - finance.paidDebt) / finance.balance)} meses` 
                                : (finance.totalDebt - finance.paidDebt) <= 0 ? "LIVRE!" : "Indefinido"}
                        </p>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 relative z-10">Baseado no seu fluxo livre mensal</p>
                      </div>
                    </div>

                    {/* DÍVIDA PRIORITÁRIA (MANUAL OU AUTOMÁTICA) */}
                    {data.debts.filter(d => !d.paid).length > 0 ? (
                        (() => {
                            let priorityDebt = data.debts.find(d => d.isPriority && !d.paid);
                            let method = "Sua Escolha Manual";

                            if (!priorityDebt) {
                                priorityDebt = [...data.debts].filter(d => !d.paid).sort((a, b) => a.value - b.value)[0];
                                method = "Sugestão Bola de Neve (Menor Valor)";
                            }

                            const monthsToPay = finance.balance > 0 ? Math.ceil(priorityDebt.value / finance.balance) : 0;

                            return (
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden group hover:shadow-purple-500/10 transition-shadow">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full mix-blend-overlay opacity-20 blur-[60px] -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
                                    <div className="relative z-10">
                                        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                        <Target size={12}/> Prioridade #1
                                                    </span>
                                                    <span className="text-slate-300 text-[10px] uppercase tracking-wider border border-white/20 px-2.5 py-1 rounded-full">{method}</span>
                                                </div>
                                                <h3 className="text-3xl font-bold mb-1">{priorityDebt.name}</h3>
                                                <p className="text-slate-400 text-sm">Foque toda a sua energia aqui!</p>
                                            </div>
                                            <div className="text-left md:text-right bg-black/20 p-4 rounded-2xl border border-white/5 w-full md:w-auto">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Valor Restante</p>
                                                <p className="text-2xl font-bold text-red-400">{formatMoney(priorityDebt.value)}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 flex items-start gap-4">
                                            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400 shrink-0 mt-1">
                                                <Zap size={24} fill="currentColor"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">Plano de Ataque</p>
                                                <p className="text-xs text-slate-300 leading-relaxed">
                                                    Use o seu fluxo livre de <strong className="text-white bg-white/10 px-1 py-0.5 rounded">{formatMoney(finance.balance)}</strong> + a parcela mensal desta dívida. 
                                                    {monthsToPay > 0 
                                                        ? ` Concentrando os esforços, elimina isto em cerca de ${monthsToPay} meses!` 
                                                        : " Aumente a sua renda ou corte gastos no Orçamento para pagar mais rápido."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-700/50 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-4"><CheckCircle size={32}/></div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Tudo Limpo!</h3>
                            <p className="text-sm text-slate-500">Você não tem dívidas ativas para atacar no momento.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================== */}
            {/* SUB-ABA 2: GERIR DÍVIDAS                   */}
            {/* ========================================== */}
            {debtSubTab === 'gerenciar' && (
                <div className="space-y-6 animate-fade-in mt-4">
                    <Card title="Cadastrar Nova Dívida" icon={PlusCircle}>
                      <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Nome do Credor / Dívida</label>
                            <input 
                              type="text" placeholder="Ex: Empréstimo, Cartão Antigo..." 
                              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-base border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                              id="debtName"
                            />
                        </div>
                        <div className="w-full md:w-40">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Total Devido (R$)</label>
                            <input 
                                type="number" placeholder="0,00" 
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-base border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all font-bold text-red-500 focus:text-red-500"
                                id="debtValue"
                              />
                        </div>
                        <div className="w-full md:w-40">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Parcela (Opcional)</label>
                            <div className="flex gap-2">
                              <input 
                                type="number" placeholder="0,00" 
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-base border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                id="debtInstallment"
                              />
                              <Button onClick={() => {
                                const name = document.getElementById('debtName').value;
                                const val = document.getElementById('debtValue').value;
                                const inst = document.getElementById('debtInstallment').value;
                                if(name && val) {
                                  const newD = [...data.debts, { 
                                      id: Date.now(), 
                                      name, 
                                      value: Number(val), 
                                      installment: Number(inst) || 0, 
                                      paid: false,
                                      isPriority: false
                                  }];
                                  newD.sort((a, b) => a.value - b.value);
                                  saveData({...data, debts: newD});
                                  
                                  document.getElementById('debtName').value = '';
                                  document.getElementById('debtValue').value = '';
                                  document.getElementById('debtInstallment').value = '';
                                }
                              }} className="aspect-square h-[58px] shadow-lg shadow-purple-500/20 hover:scale-105"><Plus size={24}/></Button>
                            </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {data.debts.length === 0 && (
                            <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <Sparkles size={32} className="mx-auto text-emerald-400 mb-3" />
                                <p className="text-slate-500 font-bold">Nenhuma dívida cadastrada.</p>
                                <p className="text-xs text-slate-400 mt-1">A sua vida está financeiramente limpa e saudável!</p>
                            </div>
                        )}
                        
                       {data.debts.map((debt, i) => {
                        const parcelsLeft = debt.installment > 0 ? (debt.value / debt.installment).toFixed(1) : 0;
                        
                        return (
                          <div key={debt.id} className={`flex flex-col p-5 rounded-2xl border transition-all relative overflow-hidden group ${debt.paid ? 'bg-slate-50 opacity-60 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800' : 'bg-white shadow-sm border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'}`}>
                            {debt.isPriority && !debt.paid && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>}
                            
                            <div className="flex items-center justify-between mb-2 pl-2">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div onClick={() => {
                                        const newD = data.debts.map(d => d.id === debt.id ? {...d, paid: !d.paid} : d);
                                        saveData({...data, debts: newD});
                                        if (!debt.paid) { triggerCelebration(); }
                                    }} 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-all active:scale-90 shadow-sm ${debt.paid ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-600'}`}>
                                        {debt.paid ? <CheckCircle size={20}/> : <span className="font-bold text-sm">{i+1}</span>}
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`font-bold text-base md:text-lg truncate dark:text-white ${debt.paid ? 'line-through decoration-slate-400 text-slate-400' : 'text-slate-800'}`}>{debt.name}</p>
                                            
                                            {!debt.paid && (
                                                <button 
                                                    onClick={() => {
                                                        const newDebts = data.debts.map(d => ({
                                                            ...d,
                                                            isPriority: d.id === debt.id ? !d.isPriority : false
                                                        }));
                                                        saveData({...data, debts: newDebts});
                                                    }}
                                                    className={`transition-all hover:scale-110 p-1.5 rounded-lg ${debt.isPriority ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500 shadow-sm' : 'text-slate-300 hover:text-yellow-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                    title="Marcar como Alvo Principal"
                                                >
                                                    <Star size={16} fill={debt.isPriority ? "currentColor" : "none"} />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm mt-1">
                                            <span className={`font-bold px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 ${debt.paid ? 'text-slate-400' : 'text-red-500'}`}>
                                                Valor: {formatMoney(debt.value)}
                                            </span>
                                            {debt.installment > 0 && (
                                                <span className="text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/50 px-2 py-0.5 rounded">
                                                    Restam {parcelsLeft.replace('.0', '')}x de {formatMoney(debt.installment)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => requestConfirm(
                                        "Excluir Dívida?",
                                        `Deseja realmente apagar a dívida "${debt.name}"? O histórico de pagamentos será perdido.`,
                                        () => saveData({...data, debts: data.debts.filter(d => d.id !== debt.id)})
                                    )} 
                                    className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                >
                                    <Trash2 size={18}/>
                              </button>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
            </div>
            )}
          </div>
        )}

{/* --- CONTEÚDO DA ABA PREMIUM (CORRIGIDO) --- */}
{activeTab === 'premium' && (
    <div className="space-y-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white border-l-4 border-yellow-400 pl-4">
            Premium & Loja
        </h2>

{/* CARD DE ASSINATURA (MENSAL) */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white shadow-2xl">
            {/* Efeitos de fundo */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-500 rounded-full mix-blend-overlay opacity-20 blur-[60px]"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay opacity-20 blur-[60px]"></div>

            <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                        <Crown size={14} /> Plano Liberta Pro
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold">O controle definitivo do seu dinheiro.</h3>
                    <ul className="space-y-3 text-slate-300 font-medium mt-2">
                        <li className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-emerald-400 shrink-0"/> 
                            <span>Experiência VIP: <strong className="text-white">Zero anúncios</strong> e foco total</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-emerald-400 shrink-0"/> 
                            <span>Assistente IA: <strong className="text-white">Registe gastos</strong> usando apenas a voz</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-emerald-400 shrink-0"/> 
                            <span>Ferramentas de elite para <strong className="text-white">multiplicar o seu dinheiro</strong></span>
                        </li>
                    </ul>
                </div>

                <div className="text-center md:text-right w-full md:w-auto">
                    <p className="text-sm text-slate-400 mb-1">Apenas</p>
                    <p className="text-4xl font-bold text-white mb-4">R$ 15,99<span className="text-lg text-slate-400 font-normal">/mês</span></p>
                    
                    {data.isPro ? (
                        <button disabled className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 w-full md:w-auto opacity-90 cursor-default">
                            <CheckCircle size={20}/> Assinatura Ativa
                        </button>
                    ) : (
                        <button 
                            onClick={handleBuyPro} 
                            className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-xl font-bold shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 w-full md:w-auto"
                        >
                            <Crown size={20}/> Assinar Mensal
                        </button>
                    )}
                    <p className="text-center md:text-right text-[10px] text-slate-500 mt-3">Cancele quando quiser na Google Play.</p>
                </div>
            </div>
        </div>
        
        {/* SEÇÃO DA LOJA (EBOOKS E CURSOS) */}
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                    <BookOpen size={24}/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Loja de Conhecimento</h3>
                    <p className="text-sm text-slate-500">Materiais para acelerar sua liberdade.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* PRODUTO 1 - EBOOK */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                    {/* AQUI ESTÁ A MUDANÇA: aspect-[2/1] w-full */}
                    <div className="aspect-[2/1] w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden shrink-0">
                        <img src="https://i.postimg.cc/rwsKzzCb/Chat-GPT-Image-7-de-fev-de-2026-23-41-13.png" alt="Ebook" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                        <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">E-BOOK</div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Liberdade Financeira</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">O método prático para assumir o controle do seu dinheiro e da sua vida</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-xl text-purple-600 dark:text-purple-400">R$ 19,90</span>
                            <button 
                                onClick={() => window.open('https://go.hotmart.com/Q104332161D', '_blank')} 
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors"
                            >
                                Comprar
                            </button>
                        </div>
                    </div>
                </div>

                {/* PRODUTO 2 - MENTORIA */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                    {/* AQUI ESTÁ A MUDANÇA: aspect-[2/1] w-full */}
                    <div className="aspect-[2/1] w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden shrink-0">
                        <img src="https://i.postimg.cc/BZC6g2mk/Chat-GPT-Image-7-de-fev-de-2026-23-43-51.png" alt="Curso" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                        <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">CURSO</div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Em breve!</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">Curso completo em desenvolvimento.</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-xl text-purple-600 dark:text-purple-400">R$ --,--</span>
                            <button 
                                onClick={() => alert('Em breve estará disponível!')} 
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold opacity-60 cursor-not-allowed"
                            >
                                Aguarde
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)}

      </main>

{/* --- BARRA DE NAVEGAÇÃO "CAPSULE DOCK" --- */}
<div className={`lg:hidden fixed left-4 right-4 z-50 transition-all duration-500 ease-out flex justify-center ${adLoaded ? 'bottom-20' : 'bottom-6'}`}>
  
  {/* Container da Cápsula */}
  <div className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/60 rounded-full shadow-2xl shadow-slate-300/40 dark:shadow-black/60 h-[72px] px-2 w-full max-w-[380px] flex justify-between items-center relative">
    
    {[
        { id: 'dashboard', icon: LayoutDashboard },
        { id: 'budget', icon: PieChart },
        { id: 'premium', icon: Crown, isSpecial: true },
        { id: 'investments', icon: TrendingUp },
        { id: 'dreams', icon: Rocket },
    ].map((item) => {
        const isActive = activeTab === item.id;
        
        const handleClick = async () => {
            // Feedback Tátil Suave (Haptics)
            try { 
                if (item.isSpecial) await Haptics.impact({ style: ImpactStyle.Light }); 
                else await Haptics.selectionChanged();
            } catch(e) {}
            
            setActiveTab(item.id); 
            window.scrollTo({top: 0, behavior: 'smooth'}); 
        };

        if (item.isSpecial) {
           return (
              <button 
                key={item.id}
                onClick={handleClick}
                className="relative -top-6 group focus:outline-none mx-2"
              >
                {/* Botão Central Elevado e Brilhante */}
                <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center 
                    shadow-lg shadow-purple-600/40 transition-all duration-300
                    ${isActive 
                       ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white scale-110 ring-4 ring-[#F8FAFC] dark:ring-[#0F172A]' 
                       : 'bg-slate-900 text-purple-400 dark:bg-purple-600 dark:text-white ring-4 ring-[#F8FAFC] dark:ring-[#0F172A]'}
                `}>
                   <item.icon size={26} strokeWidth={2.5} />
                </div>
              </button>
           );
        }

        return (
          <button 
            key={item.id}
            onClick={handleClick}
            className="relative flex flex-col items-center justify-center w-14 h-full rounded-full transition-all active:scale-90 focus:outline-none group"
          >
            <div className={`transition-all duration-300 p-2 rounded-xl ${isActive ? 'bg-slate-100 dark:bg-white/10' : ''}`}>
                <item.icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`transition-colors duration-300 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'}`}
                />
            </div>
            {/* Indicador de Ponto (Dot) */}
            <span className={`
                absolute bottom-2 w-1 h-1 bg-slate-900 dark:bg-white rounded-full transition-all duration-300
                ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}></span>
          </button>
        );
    })}
  </div>
</div>

{/* --- MODAL DE CONFIRMAÇÃO (SEGURANÇA) --- */}
<ConfirmModal 
  isOpen={confirmConfig.isOpen}
  onClose={() => setConfirmConfig({...confirmConfig, isOpen: false})}
  onConfirm={confirmConfig.action} 
  title={confirmConfig.title}
  message={confirmConfig.message}
/>
{/* ------------------------------------------- */}
        
   <style>{`
  /* --- ANIMAÇÕES GERAIS --- */
  @keyframes fadeInScale { 
    from { opacity: 0; transform: scale(0.98) translateY(10px); } 
    to { opacity: 1; transform: scale(1) translateY(0); } 
  }
  @keyframes slideUpModal { 
    from { transform: translateY(100%); opacity: 0; } 
    to { transform: translateY(0); opacity: 1; } 
  }
  @keyframes bounceShort { 
    0%, 100% { transform: translateY(0); } 
    50% { transform: translateY(-25%); } 
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 1; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
    50% { opacity: 0.8; box-shadow: 0 0 10px rgba(168, 85, 247, 0.1); }
  }

  /* --- CLASSES UTILITÁRIAS --- */
  .animate-fade-in { animation: fadeInScale 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .animate-fade-in-up { animation: fadeInScale 0.5s ease-out forwards; animation-delay: 0.1s; opacity: 0; } /* Delay para o texto da intro */
  .animate-slide-up { animation: slideUpModal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-scale-up { animation: fadeInScale 0.3s ease-out forwards; }
  .animate-bounce-short { animation: bounceShort 0.5s ease-in-out; }
  .animate-pulse-slow { animation: pulseGlow 3s infinite; }

  /* --- AJUSTES PARA IPHONE/ANDROID (SAFE AREA) --- */
  .pb-safe { 
    padding-bottom: env(safe-area-inset-bottom); 
    padding-bottom: constant(safe-area-inset-bottom); 
  }

  /* --- ESCONDER BARRA DE ROLAGEM (Clean UI) --- */
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; }
  
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* --- FLUIDEZ --- */
  html, body { 
    scroll-behavior: smooth; 
    -webkit-tap-highlight-color: transparent; /* Remove clique cinza no mobile */
  }
`}</style>
    </div>
  );
}