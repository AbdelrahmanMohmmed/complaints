import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { sendContactMessage } from '../../services/contactService';
import {
  Brain,
  BarChart3,
  Shield,
  Globe2,
  Zap,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Moon,
  Sun,
  Languages,
  Menu,
  X,
  Filter,
} from 'lucide-react';

const ANALYTICS_IMAGE = 'https://images.unsplash.com/photo-1759661966728-4a02e3c6ed91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzJTIwYnVzaW5lc3MlMjBpbnRlbGxpZ2VuY2UlMjB2aXN1YWxpemF0aW9ufGVufDF8fHx8MTc3MjA4OTI4MXww&ixlib=rb-4.1.0&q=80&w=1080';

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [sending, setSending] = useState(false);

  const isAr = language === 'ar';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // const handleContactSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setContactSent(true);
  //   setContactForm({ name: '', email: '', company: '', message: '' });
  //   setTimeout(() => setContactSent(false), 4000);
  // };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sending) return;

    setSending(true);

    try {
      await sendContactMessage(contactForm);

      setContactSent(true);

      setContactForm({
        name: "",
        email: "",
        company: "",
        message: "",
      });

      setTimeout(() => setContactSent(false), 4000);

    } catch (error) {
      console.error("Contact form error:", error);
      alert(isAr ? "فشل إرسال الرسالة" : "Failed to send message");
    }

    setSending(false);
  };

  const navLinks = isAr
    ? [
      { label: 'الرئيسية', href: '#hero' },
      { label: 'من نحن', href: '#about' },
      { label: 'المميزات', href: '#features' },
      { label: 'كيف يعمل', href: '#how-it-works' },
      { label: 'تواصل معنا', href: '#contact' },
    ]
    : [
      { label: 'Home', href: '#hero' },
      { label: 'About', href: '#about' },
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Contact', href: '#contact' },
    ];

  const features = isAr
    ? [
      {
        icon: Brain,
        title: 'تحليل المشاعر بالذكاء الاصطناعي',
        desc: 'يحلل نظامنا تلقائياً مشاعر الآراء (إيجابية، سلبية، محايدة) ويكشف المشاعر الدقيقة مثل الغضب والرضا.',
        color: 'from-blue-500 to-blue-600',
      },
      {
        icon: Filter,
        title: 'تصنيف ذكي تلقائي',
        desc: 'يصنف الآراء تلقائياً حسب الفئات المحددة مسبقاً لتوجيهها للفريق المختص بكفاءة عالية.',
        color: 'from-purple-500 to-purple-600',
      },
      {
        icon: BarChart3,
        title: 'لوحة تحكم تفاعلية',
        desc: 'احصل على رؤى شاملة حول أداء خدمة العملاء مع مخططات وإحصاءات تفصيلية في الوقت الفعلي.',
        color: 'from-emerald-500 to-emerald-600',
      },
      {
        icon: Shield,
        title: 'نظام صلاحيات متعدد الأدوار',
        desc: 'يدعم ثلاث أدوار ( مدير الشركة، مشرف خدمة العملاء (CSS)، مهييْ الموقع) مع تحكم دقيق في الصلاحيات.',
        color: 'from-orange-500 to-orange-600',
      },
      {
        icon: Globe2,
        title: 'دعم ثنائي اللغة (عربي / إنجليزي)',
        desc: 'واجهة مستخدم كاملة باللغتين العربية والإنجليزية مع دعم تام للكتابة من اليمين إلى اليسار.',
        color: 'from-pink-500 to-pink-600',
      },

    ]
    : [
      {
        icon: Brain,
        title: 'AI Sentiment Analysis',
        desc: 'Automatically analyzes feedback sentiment (positive, negative, neutral) and detects granular emotions like anger, satisfaction, and frustration.',
        color: 'from-blue-500 to-blue-600',
      },
      {
        icon: Filter,
        title: 'Smart Auto-Categorization',
        desc: 'Automatically classifies feedback into predefined categories.',
        color: 'from-purple-500 to-purple-600',
      },
      {
        icon: BarChart3,
        title: 'Interactive Analytics Dashboard',
        desc: 'Get comprehensive insights into customer service performance with real-time charts, trends, and KPIs.',
        color: 'from-emerald-500 to-emerald-600',
      },
      {
        icon: Shield,
        title: 'Multi-Role Access Control',
        desc: 'Supports three roles (Company Admin, Customer Service Supervisor (CSS), website configurator) with granular permission control.',
        color: 'from-orange-500 to-orange-600',
      },
      {
        icon: Globe2,
        title: 'Bilingual Arabic / English',
        desc: 'Full Arabic and English UI with complete RTL layout support, switching seamlessly between languages.',
        color: 'from-pink-500 to-pink-600',
      },

    ];

  const steps = isAr
    ? [
      { step: '01', title: 'اجمع الآراء', desc: 'يجمع النظام الآراء من جميع القنوات (البريد الإلكتروني، تويتر (X) ,فيسبوك ، الموقع الإلكتروني، والمزيد).' },
      { step: '02', title: 'تحليل ذكي', desc: 'يحلل الذكاء الاصطناعي المشاعر والعواطف ويصنف الآراء تلقائياً.' },
      { step: '03', title: 'رؤى وتقارير', desc: 'تحليلات وتقارير شاملة تساعدك على اتخاذ قرارات أفضل.' },
    ]
    : [
      { step: '01', title: 'Collect feedback', desc: 'The system ingests feedback from all channels — email, Twitter (X), Facebook, your website, and more.' },
      { step: '02', title: 'AI Analysis', desc: 'Our AI analyzes sentiment, detects emotions, and auto-categorizes each feedback instantly.' },
      { step: '03', title: 'Insights & Reports', desc: 'Get comprehensive analytics and reports to make data-driven decisions.' }
    ];

  // const stats = isAr
  //   ? [
  //     { value: '98%', label: 'دقة تحليل المشاعر' },
  //     { value: '3x', label: 'أسرع في حل الآراء' },
  //     { value: '500+', label: 'شركة تثق بنا' },
  //     { value: '24/7', label: 'دعم متواصل' },
  //   ]
  //   : [
  //     { value: '98%', label: 'Sentiment Accuracy' },
  //     { value: '3x', label: 'Faster Resolution' },
  //     { value: '500+', label: 'Companies Trust Us' },
  //     { value: '24/7', label: 'Always Available' },
  //   ];

  // const testimonials = isAr
  //   ? [
  //     { name: 'خالد العمري', role: 'مدير خدمة العملاء', company: 'شركة الفجر للتقنية', quote: 'أحدث Ara2kom تحولاً جذرياً في طريقة إدارتنا للآراء. انخفضت أوقات الاستجابة بنسبة 70%.', rating: 5 },
  //     { name: 'Amira Benali', role: 'VP Customer Experience', company: 'Riyad Telecom', quote: 'The bilingual support and AI insights are game-changing for our Saudi and international teams.', rating: 5 },
  //     { name: 'سلمى النجار', role: 'مديرة العمليات', company: 'بنك الأمان', quote: 'واجهة سهلة الاستخدام ورؤى عميقة. الأفضل في مجاله على الإطلاق.', rating: 5 },
  //   ]
  //   : [
  //     { name: 'Khalid Al-Omari', role: 'Customer Service Director', company: 'Al-Fajr Technology', quote: 'Ara2kom transformed how we handle feedback. Our response times dropped by 70% in the first month.', rating: 5 },
  //     { name: 'Amira Benali', role: 'VP Customer Experience', company: 'Riyad Telecom', quote: 'The bilingual support and AI-powered insights are game-changing for our diverse teams.', rating: 5 },
  //     { name: 'Salma Al-Najjar', role: 'Operations Manager', company: 'Amanah Bank', quote: 'Easy to use and incredibly insightful. The best feedback analytics platform we\'ve ever used.', rating: 5 },
  //   ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <a href="#hero" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">A2</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-gray-900 dark:text-white">Ara2kom</span>
                <span className="font-bold text-lg text-blue-600"> AI</span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isAr ? 'English' : 'العربية'}
              >
                <Languages className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {isAr ? 'تسجيل الدخول' : 'Log In'}
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105"
              >
                {isAr ? 'ابدأ ' : 'Get Started '}
              </Link>
            </div>

            {/* Mobile: icons + hamburger */}
            <div className="flex lg:hidden items-center gap-1">
              <button onClick={toggleLanguage} className="p-2 text-gray-500 rounded-lg">
                <Languages className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className="p-2 text-gray-500 rounded-lg">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {isAr ? 'تسجيل الدخول' : 'Log In'}
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
              >
                {isAr ? 'ابدأ ' : 'Get Started '}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className={isAr ? 'text-right' : 'text-left'}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6 border border-blue-100 dark:border-blue-800">
                <Zap className="w-4 h-4" />
                <span>{isAr ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6">
                {isAr ? (
                  <>
                    <span className="block">حوّل الآراء</span>
                    <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      إلى فرص نمو
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block">Turn feedback</span>
                    <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Into Growth
                    </span>
                  </>
                )}
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl leading-relaxed">
                {isAr
                  ? 'منصة ذكاء اصطناعي متكاملة لتحليل آراء العملاء وقياس المشاعر وتصنيف المشكلات تلقائياً — لمساعدتك على تقديم خدمة عملاء استثنائية.'
                  : 'An AI-powered platform for analyzing customer feedback, measuring sentiment, and auto-classifying issues — helping you deliver exceptional customer service at scale.'}
              </p>

              <div className={`flex flex-col sm:flex-row gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:scale-105"
                >
                  <span>{isAr ? 'ابدأ تجربتك ' : 'Get Started'}</span>
                  <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <span>{isAr ? 'تسجيل الدخول' : 'Login'}</span>
                </Link>
              </div>

              {/* Social proof */}

            </div>

            {/* Image / Dashboard Preview */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
                <img
                  src={ANALYTICS_IMAGE}
                  alt="Ara2kom Analytics Dashboard"
                  className="w-full h-80 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent" />

                {/* Floating cards */}



              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ── ABOUT ── */}
      <section id="about" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={isAr ? 'text-right' : ''}>
            <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full">
              <span>{isAr ? 'من نحن' : 'About Us'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6">
              {isAr ? 'نُمكّن الشركات من فهم عملائها بعمق' : 'We Empower Businesses to Truly Understand Their Customers'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {isAr
                ? 'تأسست Ara2kom AI عام 2026 بهدف واحد: مساعدة الشركات على تحويل آراء العملاء من عبء إلى فرصة ذهبية للتحسين. نجمع بين الذكاء الاصطناعي المتقدم وخبرة عميقة في خدمة العملاء لتقديم منصة متكاملة تدعم فرق العمل في اتخاذ قرارات مبنية على البيانات.'
                : 'Founded in 2026, Ara2kom AI was built with one mission: to help businesses transform customer feedback from a burden into a golden opportunity for improvement. We combine cutting-edge AI with deep customer service expertise to deliver a platform that empowers teams to make data-driven decisions.'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {isAr
                ? 'نؤمن أن كل تعليق هو معلومة قيّمة. منصتنا تجعل هذه المعلومات في متناول يدك بشكل فوري وقابل للتطبيق، مما يحسن رضا عملائك ويقوي علاقتهم بعلامتك التجارية.'
                : 'We believe every feedback is a valuable data point. Our platform makes that data immediately actionable, helping you improve customer satisfaction and build stronger brand loyalty.'}
            </p>
            <ul className="space-y-3">
              {(isAr
                ? ['تحليل مشاعر بدقة 80%', 'دعم ثنائي اللغة عربي / إنجليزي', 'تكامل سهل مع أنظمتك الحالية', 'لوحة تحكم شاملة لكل الأدوار']
                : ['80% sentiment analysis accuracy', 'Full Arabic & English bilingual support', 'Easy integration with your existing systems', 'Comprehensive dashboards for all roles']
              ).map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-3xl mb-16 ${isAr ? 'text-right mr-auto' : 'text-left'}`}>
            <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full">
              <span>{isAr ? 'المميزات' : 'Features'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">
              {isAr ? 'كل ما تحتاجه لإدارة آراء العملاء' : 'Everything You Need to Manage Customer feedback'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isAr
                ? 'منصة متكاملة تجمع الذكاء الاصطناعي والتحليلات المتقدمة وإدارة الفريق في مكان واحد.'
                : 'An all-in-one platform combining AI, advanced analytics, and team management in one place.'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">

            {features.map((f, i) => (
              <div
                key={i}
                className="w-full sm:w-[46%] lg:w-[30%]"
              >
                <div className="group h-full bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">

                  <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {f.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>

                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-3xl mb-16 ${isAr ? 'text-right mr-auto' : ''}`}>
            <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full">
              <span>{isAr ? 'كيف يعمل' : 'How It Works'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6">
              {isAr ? 'كيف يعمل نظام Ara2kom AI' : 'How Ara2kom Works'}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 relative max-w-5xl mx-auto">            {/* Connector line */}
            {steps.map((s, i) => (
              <div key={i} className={`relative ${isAr ? 'text-right' : ''}`}>
                <div className="flex items-center justify-center mb-5">                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white font-black text-lg">{s.step}</span>
                </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {isAr ? 'ابدأ تحليل اراء عملائك اليوم' : 'Start Analyzing Your Customer feedback Today'}
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:shadow-xl transition-all hover:scale-105"
            >
              {isAr ? 'ابدأ معنا' : 'Start With US'}
              <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
            >
              {isAr ? 'تواصل معنا' : 'Contact Us'}
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Info */}
            <div className={isAr ? 'text-right' : ''}>
              <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full">
                <span>{isAr ? 'تواصل معنا' : 'Contact Us'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">
                {isAr ? 'هل لديك سؤال؟ نحن هنا' : "Have a Question? We're Here"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {isAr
                  ? 'فريقنا مستعد لمساعدتك في أي وقت. تواصل معنا لمعرفة المزيد عن منصتنا أو لطلب عرض تجريبي.'
                  : "Our team is ready to help you anytime. Reach out to learn more about our platform or to request a demo."}
              </p>

            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              {contactSent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {isAr ? 'تم الإرسال!' : 'Message Sent!'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {isAr ? 'سنتواصل معك في أقرب وقت.' : "We'll be in touch soon."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className={`space-y-5 ${isAr ? 'text-right' : ''}`}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    {isAr ? 'أرسل لنا رسالة' : 'Send Us a Message'}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'الاسم' : 'Name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder={isAr ? 'اسمك الكامل' : 'Your full name'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {isAr ? 'اسم الشركة' : 'Company'}
                    </label>
                    <input
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder={isAr ? 'شركتك' : 'Your company'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {isAr ? 'رسالتك' : 'Message'} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                      placeholder={isAr ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className={`w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2
  ${sending ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]"}`}
                  >
                    {sending
                      ? (isAr ? "جاري الإرسال..." : "جارٍ الإرسال...")
                      : (isAr ? "إرسال الرسالة" : "Send Message")}
                    <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 ${isAr ? 'text-right' : ''}`}>
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A2</span>
                </div>
                <span className="text-white font-bold text-lg">Ara2kom AI</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                {isAr
                  ? 'منصة ذكاء اصطناعي متكاملة لتحليل آراء العملاء وتحسين خدمة العملاء.'
                  : 'AI-powered platform for analyzing customer feedback and improving customer service excellence.'}
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">
                {isAr ? 'المنصة' : 'Platform'}
              </h4>

              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    {isAr ? 'المميزات' : 'Features'}
                  </a>
                </li>

                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    {isAr ? 'كيف يعمل' : 'How It Works'}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">
                {isAr ? 'الشركة' : 'Company'}
              </h4>

              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    {isAr ? 'من نحن' : 'About'}
                  </a>
                </li>

                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    {isAr ? 'تواصل معنا' : 'Contact'}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className={`border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${isAr ? 'text-right sm:flex-row-reverse' : ''}`}>
            <p className="text-sm">
              © 2026 Ara2kom AI.{' '}
              {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-gray-800">
                {isAr ? 'تسجيل الدخول' : 'Log In'}
              </Link>
              <Link to="/signup" className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                {isAr ? 'ابدأ مجاناً' : 'Get Started'}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
