// src/config/integrationGuides.ts

export interface GuideStep {
  title: string;
  description: string;
  image?: string; // URL or imported image
  code?: string; // API key example or code snippet
  tip?: string;
}

export interface IntegrationGuide {
  channel: string;
  icon: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  steps: GuideStep[];
  requirements: string[];
}

export const integrationGuides: Record<string, IntegrationGuide> = {
  twitter: {
    channel: 'twitter',
    icon: 'twitter',
    title: 'Twitter / X Integration Guide',
    description: 'Connect your Twitter account to automatically collect mentions, replies, and direct messages as feedback.',
    difficulty: 'medium',
    estimatedTime: '5-10 min',
    requirements: ['Twitter Developer Account', 'Phone number verified on Twitter'],
    steps: [
      {
        title: 'Create a Twitter Developer Account',
        description: 'Go to developer.twitter.com and sign in with your Twitter account. Apply for a developer account if you don\'t have one.',
        image: '/guides/twitter/step1-developer-portal.png',
        tip: 'Choose "Hobbyist" or "Student" as your use case for faster approval.'
      },
      {
        title: 'Create a New Project & App',
        description: 'Click "Projects & Apps" → "Overview" → "Create App". Give your app a name like "Ara2kom Feedback Collector".',
        image: '/guides/twitter/step2-create-app.png',
      },
      {
        title: 'Get Your Bearer Token',
        description: 'In your app settings, go to "Keys and Tokens" tab. Under "Authentication Tokens", click "Generate" next to Bearer Token.',
        image: '/guides/twitter/step3-bearer-token.png',
        code: 'AAAAAAAAAAAAAAAAAAAAA...',
      },
      {
        title: 'Copy the Bearer Token',
        description: 'Copy the generated Bearer Token. It starts with "AAAAAAAA...". Keep it secure — you won\'t be able to see it again!',
        image: '/guides/twitter/step4-copy-token.png',
        tip: 'Store it in a password manager. If you lose it, you\'ll need to regenerate.'
      },
      {
        title: 'Paste in Ara2kom',
        description: 'Go back to Ara2kom, select "Twitter / X" from the channel dropdown, and paste your Bearer Token in the API Key field.',
        image: '/guides/twitter/step5-paste-ara2kom.png',
      },
      {
        title: 'Enter Target Account',
        description: 'Enter the Twitter username you want to monitor (without @). Set how many posts and comments to fetch.',
        image: '/guides/twitter/step6-scrape-settings.png',
      },
      {
        title: 'Test Connection',
        description: 'Click "Scrape" to test. If successful, you\'ll see a count of fetched replies. Then click "Connect" to save.',
        image: '/guides/twitter/step7-test.png',
      }
    ]
  },

  facebook: {
    channel: 'facebook',
    icon: 'facebook',
    title: 'Facebook Page Integration Guide',
    description: 'Connect your Facebook Page to collect comments, reviews, and messages automatically.',
    difficulty: 'easy',
    estimatedTime: '3-5 min',
    requirements: ['Facebook Business Page', 'Admin access to the page'],
    steps: [
      {
        title: 'Go to Facebook Developers',
        description: 'Visit developers.facebook.com and log in with your Facebook account.',
        image: '/guides/facebook/step1-dev-portal.png',
      },
      {
        title: 'Create a New App',
        description: 'Click "Create App" → Select "Other" → Choose "Business". Name it "Ara2kom Feedback".',
        image: '/guides/facebook/step2-create-app.png',
      },
      {
        title: 'Add Facebook Login',
        description: 'In the app dashboard, click "Add Product" → Find "Facebook Login" → Click "Set Up".',
        image: '/guides/facebook/step3-add-login.png',
      },
      {
        title: 'Get Page Access Token',
        description: 'Use the Graph API Explorer. Select your app, get a User Token with "pages_read_engagement" permission, then exchange it for a Page Token.',
        image: '/guides/facebook/step4-page-token.png',
        code: 'EAAH2ZAN...',
        tip: 'The token must include pages_read_engagement and pages_read_user_content permissions.'
      },
      {
        title: 'Paste Token in Ara2kom',
        description: 'Copy the Page Access Token and paste it in the API Key field in Ara2kom. Click "Auto Connect" or "Connect".',
        image: '/guides/facebook/step5-paste.png',
      }
    ]
  },

  gmail: {
    channel: 'gmail',
    icon: 'gmail',
    title: 'Gmail Integration Guide',
    description: 'Connect your Gmail to collect customer feedback emails automatically.',
    difficulty: 'easy',
    estimatedTime: '3-5 min',
    requirements: ['Gmail account', '2-Step Verification enabled'],
    steps: [
      {
        title: 'Enable 2-Step Verification',
        description: 'Go to myaccount.google.com → Security → 2-Step Verification. Enable it if not already on.',
        image: '/guides/gmail/step1-2fa.png',
        tip: 'You cannot create app passwords without 2-Step Verification enabled.'
      },
      {
        title: 'Generate App Password',
        description: 'In Google Account → Security → App passwords. Select "Mail" and "Other (Custom name)". Name it "Ara2kom".',
        image: '/guides/gmail/step2-app-password.png',
      },
      {
        title: 'Copy the 16-Character Password',
        description: 'Google will show a 16-character password like "abcd efgh ijkl mnop". Copy it without spaces.',
        image: '/guides/gmail/step3-copy-password.png',
        code: 'abcdefghijklmnop',
      },
      {
        title: 'Enter in Ara2kom',
        description: 'In Ara2kom, select Gmail. Enter your full Gmail address and paste the 16-character app password.',
        image: '/guides/gmail/step4-enter-ara2kom.png',
      }
    ]
  },

  freshdesk: {
    channel: 'freshdesk',
    icon: 'freshdesk',
    title: 'Freshdesk Integration Guide',
    description: 'Connect Freshdesk to import tickets as feedback for analysis.',
    difficulty: 'medium',
    estimatedTime: '5 min',
    requirements: ['Freshdesk account', 'Admin or Agent API access'],
    steps: [
      {
        title: 'Get Your API Key',
        description: 'In Freshdesk, click your profile (top right) → "Profile Settings". Your API key is on the right sidebar.',
        image: '/guides/freshdesk/step1-api-key.png',
        code: 'your-api-key-here',
      },
      {
        title: 'Get Your Domain',
        description: 'Your domain is the first part of your Freshdesk URL. If your URL is "company.freshdesk.com", your domain is "company".',
        image: '/guides/freshdesk/step2-domain.png',
        code: 'company.freshdesk.com',
      },
      {
        title: 'Enter in Ara2kom',
        description: 'Select Freshdesk in Ara2kom. Enter your domain (without https://) and paste your API key.',
        image: '/guides/freshdesk/step3-enter.png',
      }
    ]
  },

  webform: {
    channel: 'webform',
    icon: 'webform',
    title: 'Web Form Integration Guide',
    description: 'Create a branded feedback form that you can embed on your website or share via link.',
    difficulty: 'easy',
    estimatedTime: '1 min',
    requirements: ['None — just click create!'],
    steps: [
      {
        title: 'Click "Create Web Form"',
        description: 'On the Integrations page, simply click the "Create Web Form" button. No API key needed!',
        image: '/guides/webform/step1-click.png',
      },
      {
        title: 'Copy the Form URL',
        description: 'A unique URL will be generated instantly. Click "Copy link" to copy it to your clipboard.',
        image: '/guides/webform/step2-copy.png',
        code: 'https://yourdomain.com/feedback/form/abc123',
      },
      {
        title: 'Share or Embed',
        description: 'Send the link to customers via email, WhatsApp, or social media. Or embed it in your website as an iframe.',
        image: '/guides/webform/step3-share.png',
        tip: 'You can also add the link to your email signature or QR code menus.'
      }
    ]
  }
};