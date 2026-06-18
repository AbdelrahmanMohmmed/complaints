// src/config/integrationGuides.ts

export interface GuideStep {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  image?: string;
  code?: string;
  tip?: string;
  tipAr?: string;
}

export interface IntegrationGuide {
  channel: string;
  icon: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  steps: GuideStep[];
  requirements: string[];
  requirementsAr: string[];
}

export const integrationGuides: Record<string, IntegrationGuide> = {
  twitter: {
    channel: 'twitter',
    icon: 'twitter',
    title: 'Twitter / X Integration Guide',
    titleAr: 'دليل ربط تويتر / إكس',
    description: 'Connect your Twitter account to automatically collect mentions, replies, and direct messages as feedback.',
    descriptionAr: 'اربط حساب تويتر لجمع الإشارات والردود والرسائل الخاصة تلقائياً كتعليقات.',
    difficulty: 'medium',
    estimatedTime: '5-10 min',
    requirements: ['Twitter Developer Account', 'Phone number verified on Twitter'],
    requirementsAr: ['حساب مطور تويتر', 'رقم هاتف مُفعّل على تويتر'],
    steps: [
      {
        title: 'Create a Twitter Developer Account',
        titleAr: 'إنشاء حساب مطور تويتر',
        description: 'Go to developer.twitter.com and sign in with your Twitter account. Apply for a developer account if you don\'t have one.',
        descriptionAr: 'اذهب إلى developer.twitter.com وسجّل الدخول بحساب تويتر. قدّم طلب حساب مطور إذا لم يكن لديك.',
        image: '/guides/twitter/step1-developer-portal.png',
        tip: 'Choose "Hobbyist" or "Student" as your use case for faster approval.',
        tipAr: 'اختر "هواة" أو "طالب" كحالة استخدامك للحصول على موافقة أسرع.'
      },
      {
        title: 'Create a New Project & App',
        titleAr: 'إنشاء مشروع وتطبيق جديد',
        description: 'Click "Projects & Apps" → "Overview" → "Create App". Give your app a name like "Ara2kom Feedback Collector".',
        descriptionAr: 'اضغط "المشاريع والتطبيقات" → "نظرة عامة" → "إنشاء تطبيق". سمِّ تطبيقك مثل "مجمّع تعليقات Ara2kom".',
        image: '/guides/twitter/step2-create-app.png',
      },
      {
        title: 'Get Your Bearer Token',
        titleAr: 'الحصول على رمز Bearer',
        description: 'In your app settings, go to "Keys and Tokens" tab. Under "Authentication Tokens", click "Generate" next to Bearer Token.',
        descriptionAr: 'في إعدادات التطبيق، اذهب إلى تبويب "المفاتيح والرموز". ضمن "رموز المصادقة"، اضغط "إنشاء" بجانب رمز Bearer.',
        image: '/guides/twitter/step3-bearer-token.png',
        code: 'AAAAAAAAAAAAAAAAAAAAA...',
      },
      {
        title: 'Copy the Bearer Token',
        titleAr: 'نسخ رمز Bearer',
        description: 'Copy the generated Bearer Token. It starts with "AAAAAAAA...". Keep it secure — you won\'t be able to see it again!',
        descriptionAr: 'انسخ رمز Bearer المُنشأ. يبدأ بـ "AAAAAAAA...". احتفظ به بأمان — لن تتمكن من رؤيته مرة أخرى!',
        image: '/guides/twitter/step4-copy-token.png',
        tip: 'Store it in a password manager. If you lose it, you\'ll need to regenerate.',
        tipAr: 'احتفظ به في مدير كلمات المرور. إذا فقدته، ستحتاج إلى إعادة إنشائه.'
      },
      {
        title: 'Paste in Ara2kom',
        titleAr: 'لصق في Ara2kom',
        description: 'Go back to Ara2kom, select "Twitter / X" from the channel dropdown, and paste your Bearer Token in the API Key field.',
        descriptionAr: 'ارجع إلى Ara2kom، اختر "تويتر / إكس" من قائمة القنوات، والصق رمز Bearer في حقل مفتاح API.',
        image: '/guides/twitter/step5-paste-ara2kom.png',
      },
      {
        title: 'Enter Target Account',
        titleAr: 'إدخال الحساب المستهدف',
        description: 'Enter the Twitter username you want to monitor (without @). Set how many posts and comments to fetch.',
        descriptionAr: 'أدخل اسم مستخدم تويتر الذي تريد مراقبته (بدون @). حدد عدد المنشورات والتعليقات المراد جلبها.',
        image: '/guides/twitter/step6-scrape-settings.png',
      },
      {
        title: 'Test Connection',
        titleAr: 'اختبار الاتصال',
        description: 'Click "Scrape" to test. If successful, you\'ll see a count of fetched replies. Then click "Connect" to save.',
        descriptionAr: 'اضغط "سحب" للاختبار. إذا نجح، ستظهر لك عدد الردود المجلوبة. ثم اضغط "اتصال" للحفظ.',
        image: '/guides/twitter/step7-test.png',
      }
    ]
  },

  facebook: {
    channel: 'facebook',
    icon: 'facebook',
    title: 'Facebook Page Integration Guide',
    titleAr: 'دليل ربط صفحة فيسبوك',
    description: 'Connect your Facebook Page to collect comments, reviews, and messages automatically.',
    descriptionAr: 'اربط صفحة فيسبوك لجمع التعليقات والمراجعات والرسائل تلقائياً.',
    difficulty: 'easy',
    estimatedTime: '3-5 min',
    requirements: ['Facebook Business Page', 'Admin access to the page'],
    requirementsAr: ['صفحة أعمال فيسبوك', 'صلاحية مدير للصفحة'],
    steps: [
      {
        title: 'Go to Facebook Developers',
        titleAr: 'الذهاب إلى مطوري فيسبوك',
        description: 'Visit developers.facebook.com and log in with your Facebook account.',
        descriptionAr: 'زُر developers.facebook.com وسجّل الدخول بحساب فيسبوك.',
        image: '/guides/facebook/step1-dev-portal.png',
      },
      {
        title: 'Create a New App',
        titleAr: 'إنشاء تطبيق جديد',
        description: 'Click "Create App" → Select "Other" → Choose "Business". Name it "Ara2kom Feedback".',
        descriptionAr: 'اضغط "إنشاء تطبيق" → اختر "أخرى" → اختر "أعمال". سمِّه "تعليقات Ara2kom".',
        image: '/guides/facebook/step2-create-app.png',
      },
      {
        title: 'Add Facebook Login',
        titleAr: 'إضافة تسجيل دخول فيسبوك',
        description: 'In the app dashboard, click "Add Product" → Find "Facebook Login" → Click "Set Up".',
        descriptionAr: 'في لوحة التحكم، اضغط "إضافة منتج" → ابحث عن "تسجيل دخول فيسبوك" → اضغط "إعداد".',
        image: '/guides/facebook/step3-add-login.png',
      },
      {
        title: 'Get Page Access Token',
        titleAr: 'الحصول على رمز وصول الصفحة',
        description: 'Use the Graph API Explorer. Select your app, get a User Token with "pages_read_engagement" permission, then exchange it for a Page Token.',
        descriptionAr: 'استخدم مستكشف Graph API. اختر تطبيقك، احصل على رمز مستخدم بصلاحية "pages_read_engagement"، ثم استبدله برمز صفحة.',
        image: '/guides/facebook/step4-page-token.png',
        code: 'EAAH2ZAN...',
        tip: 'The token must include pages_read_engagement and pages_read_user_content permissions.',
        tipAr: 'يجب أن يتضمن الرمز صلاحيتي pages_read_engagement و pages_read_user_content.'
      },
      {
        title: 'Paste Token in Ara2kom',
        titleAr: 'لصق الرمز في Ara2kom',
        description: 'Copy the Page Access Token and paste it in the API Key field in Ara2kom. Click "Auto Connect" or "Connect".',
        descriptionAr: 'انسخ رمز وصول الصفحة والصقه في حقل مفتاح API في Ara2kom. اضغط "ربط تلقائي" أو "اتصال".',
        image: '/guides/facebook/step5-paste.png',
      }
    ]
  },

  gmail: {
    channel: 'gmail',
    icon: 'gmail',
    title: 'Gmail Integration Guide',
    titleAr: 'دليل ربط Gmail',
    description: 'Connect your Gmail to collect customer feedback emails automatically.',
    descriptionAr: 'اربط Gmail لجمع رسائل تعليقات العملاء تلقائياً.',
    difficulty: 'easy',
    estimatedTime: '3-5 min',
    requirements: ['Gmail account', '2-Step Verification enabled'],
    requirementsAr: ['حساب Gmail', 'تفعيل المصادقة الثنائية'],
    steps: [
      {
        title: 'Enable 2-Step Verification',
        titleAr: 'تفعيل المصادقة الثنائية',
        description: 'Go to myaccount.google.com → Security → 2-Step Verification. Enable it if not already on.',
        descriptionAr: 'اذهب إلى myaccount.google.com → الأمان → المصادقة الثنائية. فعّلها إذا لم تكن مُفعّلة.',
        image: '/guides/gmail/step1-2fa.png',
        tip: 'You cannot create app passwords without 2-Step Verification enabled.',
        tipAr: 'لا يمكنك إنشاء كلمات مرور التطبيقات بدون تفعيل المصادقة الثنائية.'
      },
      {
        title: 'Generate App Password',
        titleAr: 'إنشاء كلمة مرور تطبيق',
        description: 'In Google Account → Security → App passwords. Select "Mail" and "Other (Custom name)". Name it "Ara2kom".',
        descriptionAr: 'في حساب Google → الأمان → كلمات مرور التطبيقات. اختر "البريد" و"أخرى (اسم مخصص)". سمِّه "Ara2kom".',
        image: '/guides/gmail/step2-app-password.png',
      },
      {
        title: 'Copy the 16-Character Password',
        titleAr: 'نسخ كلمة المرور المؤلفة من 16 حرفاً',
        description: 'Google will show a 16-character password like "abcd efgh ijkl mnop". Copy it without spaces.',
        descriptionAr: 'ستعرض Google كلمة مرور من 16 حرفاً مثل "abcd efgh ijkl mnop". انسخها بدون مسافات.',
        image: '/guides/gmail/step3-copy-password.png',
        code: 'abcdefghijklmnop',
      },
      {
        title: 'Enter in Ara2kom',
        titleAr: 'الإدخال في Ara2kom',
        description: 'In Ara2kom, select Gmail. Enter your full Gmail address and paste the 16-character app password.',
        descriptionAr: 'في Ara2kom، اختر Gmail. أدخل عنوان Gmail الكامل والصق كلمة مرور التطبيق المؤلفة من 16 حرفاً.',
        image: '/guides/gmail/step4-enter-ara2kom.png',
      }
    ]
  },

  freshdesk: {
    channel: 'freshdesk',
    icon: 'freshdesk',
    title: 'Freshdesk Integration Guide',
    titleAr: 'دليل ربط Freshdesk',
    description: 'Connect Freshdesk to import tickets as feedback for analysis.',
    descriptionAr: 'اربط Freshdesk لاستيراد التذاكر كتعليقات للتحليل.',
    difficulty: 'medium',
    estimatedTime: '5 min',
    requirements: ['Freshdesk account', 'Admin or Agent API access'],
    requirementsAr: ['حساب Freshdesk', 'صلاحية مدير أو وكيل API'],
    steps: [
      {
        title: 'Get Your API Key',
        titleAr: 'الحصول على مفتاح API',
        description: 'In Freshdesk, click your profile (top right) → "Profile Settings". Your API key is on the right sidebar.',
        descriptionAr: 'في Freshdesk، اضغط ملفك الشخصي (أعلى اليمين) → "إعدادات الملف الشخصي". مفتاح API في الشريط الجانبي الأيمن.',
        image: '/guides/freshdesk/step1-api-key.png',
        code: 'your-api-key-here',
      },
      {
        title: 'Get Your Domain',
        titleAr: 'الحصول على النطاق',
        description: 'Your domain is the first part of your Freshdesk URL. If your URL is "company.freshdesk.com", your domain is "company".',
        descriptionAr: 'نطاقك هو الجزء الأول من رابط Freshdesk. إذا كان رابطك "company.freshdesk.com"، فنطاقك هو "company".',
        image: '/guides/freshdesk/step2-domain.png',
        code: 'company.freshdesk.com',
      },
      {
        title: 'Enter in Ara2kom',
        titleAr: 'الإدخال في Ara2kom',
        description: 'Select Freshdesk in Ara2kom. Enter your domain (without https://) and paste your API key.',
        descriptionAr: 'اختر Freshdesk في Ara2kom. أدخل نطاقك (بدون https://) والصق مفتاح API.',
        image: '/guides/freshdesk/step3-enter.png',
      }
    ]
  },

  webform: {
    channel: 'webform',
    icon: 'webform',
    title: 'Web Form Integration Guide',
    titleAr: 'دليل ربط نموذج الويب',
    description: 'Create a branded feedback form that you can embed on your website or share via link.',
    descriptionAr: 'أنشئ نموذج تعليقات مخصص يمكنك تضمينه في موقعك أو مشاركته عبر رابط.',
    difficulty: 'easy',
    estimatedTime: '1 min',
    requirements: ['None — just click create!'],
    requirementsAr: ['لا شيء — فقط اضغط إنشاء!'],
    steps: [
      {
        title: 'Click "Create Web Form"',
        titleAr: 'اضغط "إنشاء نموذج ويب"',
        description: 'On the Integrations page, simply click the "Create Web Form" button. No API key needed!',
        descriptionAr: 'في صفحة التكاملات، اضغط ببساطة "إنشاء نموذج ويب". لا يحتاج لمفتاح API!',
        image: '/guides/webform/step1-click.png',
      },
      {
        title: 'Copy the Form URL',
        titleAr: 'نسخ رابط النموذج',
        description: 'A unique URL will be generated instantly. Click "Copy link" to copy it to your clipboard.',
        descriptionAr: 'سيتم إنشاء رابط فريد فوراً. اضغط "نسخ الرابط" لنسخه إلى الحافظة.',
        image: '/guides/webform/step2-copy.png',
        code: 'https://yourdomain.com/feedback/form/abc123',
      },
      {
        title: 'Share or Embed',
        titleAr: 'مشاركة أو تضمين',
        description: 'Send the link to customers via email, WhatsApp, or social media. Or embed it in your website as an iframe.',
        descriptionAr: 'أرسل الرابط للعملاء عبر البريد أو واتساب أو وسائل التواصل. أو ضمّنه في موقعك كـ iframe.',
        image: '/guides/webform/step3-share.png',
        tip: 'You can also add the link to your email signature or QR code menus.',
        tipAr: 'يمكنك أيضاً إضافة الرابط إلى توقيع بريدك أو قوائم رمز QR.'
      }
    ]
  }
};
