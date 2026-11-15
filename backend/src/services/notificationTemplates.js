/**
 * Localized notification templates across 6 languages:
 * en (English), hi (Hindi), te (Telugu), ta (Tamil), kn (Kannada), ml (Malayalam)
 */

export const NOTIFICATION_TEMPLATES = {
  booking_confirmed: {
    en: {
      title: 'Booking Confirmed! 🎫',
      message: (p) => `Your bus trip from ${p.from} to ${p.to} on ${p.date} is confirmed. Seats: ${p.seats}. Have a safe journey!`,
    },
    hi: {
      title: 'बुकिंग की पुष्टि हुई! 🎫',
      message: (p) => `${p.date} को ${p.from} से ${p.to} तक की आपकी बस यात्रा कन्फर्म हो गई है। सीटें: ${p.seats}। आपकी यात्रा मंगलमय हो!`,
    },
    te: {
      title: 'బుకింగ్ నిర్ధారించబడింది! 🎫',
      message: (p) => `${p.date} తేదీన ${p.from} నుండి ${p.to} వరకు మీ బస్ ప్రయాణం ఖరారైంది. సీట్లు: ${p.seats}. సురక్షిత ప్రయాణం కావాలని కోరుకుంటున్నాము!`,
    },
    ta: {
      title: 'முன்பதிவு உறுதி செய்யப்பட்டது! 🎫',
      message: (p) => `${p.date} அன்று ${p.from} முதல் ${p.to} வரையிலான உங்கள் பஸ் பயணம் உறுதி செய்யப்பட்டது. இருக்கைகள்: ${p.seats}. இனிய பயணம் அமையட்டும்!`,
    },
    kn: {
      title: 'ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ! 🎫',
      message: (p) => `${p.date} ರಂದು ${p.from} ನಿಂದ ${p.to} ವರೆಗಿನ ನಿಮ್ಮ ಬಸ್ ಪ್ರಯಾಣ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಸೀಟುಗಳು: ${p.seats}. ನಿಮ್ಮ ಪ್ರಯಾಣ ಸುಖಕರವಾಗಿರಲಿ!`,
    },
    ml: {
      title: 'ബുക്കിംഗ് സ്ഥിരീകരിച്ചു! 🎫',
      message: (p) => `${p.date} തീയതിയിൽ ${p.from} മുതൽ ${p.to} വരെയുള്ള നിങ്ങളുടെ ബസ് യാത്ര സ്ഥിരീകരിച്ചു. സീറ്റുകൾ: ${p.seats}. സുരക്ഷിതമായ യാത്ര ആശംസിക്കുന്നു!`,
    },
  },

  booking_cancelled: {
    en: {
      title: 'Booking Cancelled ℹ️',
      message: (p) => `Your booking for ${p.from} to ${p.to} has been cancelled. Refund processing initiated as per policy.`,
    },
    hi: {
      title: 'बुकिंग रद्द कर दी गई ℹ️',
      message: (p) => `${p.from} से ${p.to} के लिए आपकी बुकिंग रद्द कर दी गई है। नियमानुसार रिफंड प्रक्रिया शुरू कर दी गई है।`,
    },
    te: {
      title: 'బుకింగ్ రద్దు చేయబడింది ℹ️',
      message: (p) => `${p.from} నుండి ${p.to} వరకు మీ బుకింగ్ రద్దు చేయబడింది. నిబంధనల ప్రకారం రీఫండ్ ప్రారంభించబడింది.`,
    },
    ta: {
      title: 'முன்பதிவு ரத்து செய்யப்பட்டது ℹ️',
      message: (p) => `${p.from} முதல் ${p.to} வரையிலான உங்கள் முன்பதிவு ரத்து செய்யப்பட்டது. ரீஃபண்ட் செயல்முறை தொடங்கப்பட்டுள்ளது.`,
    },
    kn: {
      title: 'ಬುಕಿಂಗ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ ℹ️',
      message: (p) => `${p.from} ನಿಂದ ${p.to} ವರೆಗಿನ ನಿಮ್ಮ ಬುಕಿಂಗ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ನಿಯಮಾವಳಿ ಪ್ರಕಾರ ಮರುಪಾವತಿ ಪ್ರಕ್ರಿಯೆ ಪ್ರಾರಂಭವಾಗಿದೆ.`,
    },
    ml: {
      title: 'ബുക്കിംഗ് റദ്ദാക്കി ℹ️',
      message: (p) => `${p.from} മുതൽ ${p.to} വരെയുള്ള നിങ്ങളുടെ ബുക്കിംഗ് റദ്ദാക്കി. റീഫണ്ട് നടപടികൾ ആരംഭിച്ചു.`,
    },
  },

  schedule_changed: {
    en: {
      title: 'Schedule Change Alert ⚠️',
      message: (p) => `Notice for your trip from ${p.from} to ${p.to} on ${p.date}: Departure schedule updated to ${p.newTime} (previous: ${p.oldTime}). Operator: ${p.operatorName}.`,
    },
    hi: {
      title: 'समय-सारणी परिवर्तन सूचना ⚠️',
      message: (p) => `${p.date} को ${p.from} से ${p.to} की आपकी यात्रा के समय में बदलाव: नया समय ${p.newTime} (पिछला: ${p.oldTime}) है। ऑपरेटर: ${p.operatorName}।`,
    },
    te: {
      title: 'షెడ్యూల్ మార్పు హెచ్చరిక ⚠️',
      message: (p) => `${p.date} తేదీన ${p.from} నుండి ${p.to} వరకు మీ ప్రయాణ సమయం మారింది: కొత్త సమయం ${p.newTime} (పాత సమయం: ${p.oldTime}). ఆపరేటర్: ${p.operatorName}.`,
    },
    ta: {
      title: 'பயண அட்டவணை மாற்ற எச்சரிக்கை ⚠️',
      message: (p) => `${p.date} அன்று ${p.from} முதல் ${p.to} வரையிலான உங்கள் பயண நேரம் மாற்றப்பட்டுள்ளது: புதிய நேரம் ${p.newTime} (முந்தையது: ${p.oldTime}). ஆபரேட்டர்: ${p.operatorName}.`,
    },
    kn: {
      title: 'ವೇಳಾಪಟ್ಟಿ ಬದಲಾವಣೆ ಮಾಹಿತಿ ⚠️',
      message: (p) => `${p.date} ರಂದು ${p.from} ನಿಂದ ${p.to} ಪ್ರಯಾಣದ ಸಮಯ ಬದಲಾಗಿದೆ: ಹೊಸ ಸಮಯ ${p.newTime} (ಹಿಂದಿನ ಸಮಯ: ${p.oldTime}). ಆಪರೇಟರ್: ${p.operatorName}.`,
    },
    ml: {
      title: 'യാത്രാ സമയമാറ്റ അറിയിപ്പ് ⚠️',
      message: (p) => `${p.date} തീയതിയിൽ ${p.from} മുതൽ ${p.to} യാത്രയുടെ സമയത്തിൽ മാറ്റം: പുതിയ സമയം ${p.newTime} (പഴയ സമയം: ${p.oldTime}). ഓപ്പറേറ്റർ: ${p.operatorName}.`,
    },
  },

  journey_reminder: {
    en: {
      title: 'Upcoming Journey Reminder 🚌',
      message: (p) => `Reminder: Your bus to ${p.to} departs in ${p.hoursLeft} hours at ${p.departureTime} from ${p.boardingPoint}. Carry a valid government ID.`,
    },
    hi: {
      title: 'आगामी यात्रा अनुस्मारक 🚌',
      message: (p) => `याद दिलाना: ${p.to} के लिए आपकी बस ${p.hoursLeft} घंटे में ${p.departureTime} बजे ${p.boardingPoint} से रवाना होगी। कृपया पहचान पत्र साथ रखें।`,
    },
    te: {
      title: 'రాబోయే ప్రయాణ రిమైండర్ 🚌',
      message: (p) => `రిమైండర్: ${p.to} కి మీ బస్సు ${p.hoursLeft} గంటల్లో ${p.departureTime} గంటలకు ${p.boardingPoint} నుండి బయలుదేరుతుంది. గుర్తింపు కార్డు వెంట ఉంచుకోండి.`,
    },
    ta: {
      title: 'வரவிருக்கும் பயண நினைவூட்டல் 🚌',
      message: (p) => `நினைவூட்டல்: ${p.to} நோக்கி செல்லும் உங்கள் பஸ் இன்னும் ${p.hoursLeft} மணி நேரத்தில் ${p.boardingPoint} இலிருந்து ${p.departureTime} மணிக்கு புறப்படும்.`,
    },
    kn: {
      title: 'ಮುಂಬರುವ ಪ್ರಯಾಣದ ನೆನಪೋಲೆ 🚌',
      message: (p) => `ನೆನಪೋಲೆ: ${p.to} ಕಡೆಗೆ ಹೊರಡುವ ನಿಮ್ಮ ಬಸ್ ಇನ್ನೇನು ${p.hoursLeft} ಗಂಟೆಗಳಲ್ಲಿ ${p.departureTime} ಕ್ಕೆ ${p.boardingPoint} ನಿಂದ ಹೊರಡಲಿದೆ.`,
    },
    ml: {
      title: 'യാത്രാ ഓർമ്മപ്പെടുത്തൽ 🚌',
      message: (p) => `ഓർമ്മപ്പെടുത്തൽ: ${p.to} ലേക്കുള്ള നിങ്ങളുടെ ബസ് ${p.hoursLeft} മണിക്കൂറിനുള്ളിൽ ${p.departureTime}-ന് ${p.boardingPoint}-ൽ നിന്ന് പുറപ്പെടും.`,
    },
  },

  promotional_offer: {
    en: {
      title: (p) => p.title || 'Special Travel Offer! 🏷️',
      message: (p) => p.message || `Use code ${p.code} to get ${p.discount} off on your next intercity bus booking! Valid across top routes.`,
    },
    hi: {
      title: (p) => p.title || 'विशेष यात्रा ऑफर! 🏷️',
      message: (p) => p.message || `अपनी अगली बस बुकिंग पर ${p.discount} की छूट पाने के लिए कोड ${p.code} का उपयोग करें!`,
    },
    te: {
      title: (p) => p.title || 'ప్రత్యేక ప్రయాణ ఆఫర్! 🏷️',
      message: (p) => p.message || `మీ తదుపరి బస్ టికెట్ బుకింగ్‌పై ${p.discount} రాయితీని పొందడానికి ${p.code} కోడ్‌ను ఉపయోగించండి!`,
    },
    ta: {
      title: (p) => p.title || 'சிறப்பு பயண சலுகை! 🏷️',
      message: (p) => p.message || `உங்கள் அடுத்த பஸ் முன்பதிவில் ${p.discount} தள்ளுபடி பெற ${p.code} குறியீட்டைப் பயன்படுத்தவும்!`,
    },
    kn: {
      title: (p) => p.title || 'ವಿಶೇಷ ಪ್ರಯಾಣ ಕೊಡುಗೆ! 🏷️',
      message: (p) => p.message || `ನಿಮ್ಮ ಮುಂದಿನ ಬಸ್ ಬುಕಿಂಗ್‌ನಲ್ಲಿ ${p.discount} ರಿಯಾಯಿತಿ ಪಡೆಯಲು ${p.code} ಕೋಡ್ ಬಳಸಿ!`,
    },
    ml: {
      title: (p) => p.title || 'പ്രത്യേക യാത്രാ ഓഫർ! 🏷️',
      message: (p) => p.message || `നിങ്ങളുടെ അടുത്ത ബസ് ബുക്കിംഗിൽ ${p.discount} ഇളവ് ലഭിക്കുന്നതിന് ${p.code} ഉപയോഗിക്കുക!`,
    },
  },

  community_interaction: {
    en: {
      comment: (p) => ({ title: 'New Comment on Your Story 💬', message: `${p.actorName} commented on your travel post: "${p.postTitle}"` }),
      reply: (p) => ({ title: 'New Reply to Your Comment 💬', message: `${p.actorName} replied to your comment on "${p.postTitle}"` }),
      like: (p) => ({ title: 'Someone Liked Your Story ❤️', message: `${p.actorName} liked your travel post: "${p.postTitle}"` }),
    },
    hi: {
      comment: (p) => ({ title: 'आपकी पोस्ट पर नई टिप्पणी 💬', message: `${p.actorName} ने आपकी पोस्ट "${p.postTitle}" पर टिप्पणी की।` }),
      reply: (p) => ({ title: 'आपकी टिप्पणी पर नया उत्तर 💬', message: `${p.actorName} ने "${p.postTitle}" पर आपकी टिप्पणी का उत्तर दिया।` }),
      like: (p) => ({ title: 'किसी ने आपकी पोस्ट पसंद की ❤️', message: `${p.actorName} ने आपकी यात्रा पोस्ट "${p.postTitle}" को पसंद किया।` }),
    },
    te: {
      comment: (p) => ({ title: 'మీ పోస్ట్‌పై కొత్త కామెంట్ 💬', message: `${p.actorName} మీ ప్రయాణ పోస్ట్ "${p.postTitle}" పై కామెంట్ చేసారు.` }),
      reply: (p) => ({ title: 'మీ కామెంట్‌కు సమాధానం 💬', message: `${p.actorName} "${p.postTitle}" పై మీ కామెంట్‌కు ప్రత్యుత్తరం ఇచ్చారు.` }),
      like: (p) => ({ title: 'మీ కథనాన్ని ఇష్టపడ్డారు ❤️', message: `${p.actorName} మీ ప్రయాణ పోస్ట్ "${p.postTitle}" ను లైక్ చేసారు.` }),
    },
    ta: {
      comment: (p) => ({ title: 'உங்கள் பதிவில் புதிய கருத்து 💬', message: `${p.actorName} உங்கள் "${p.postTitle}" பதிவில் கருத்து தெரிவித்துள்ளார்.` }),
      reply: (p) => ({ title: 'உங்கள் கருத்துக்கு பதில் 💬', message: `${p.actorName} "${p.postTitle}" பதிவில் உங்கள் கருத்துக்கு பதிலளித்துள்ளார்.` }),
      like: (p) => ({ title: 'உங்கள் பதிவை ஒருவர் விரும்பினார் ❤️', message: `${p.actorName} உங்கள் "${p.postTitle}" பதிவை விரும்பினார்.` }),
    },
    kn: {
      comment: (p) => ({ title: 'ನಿಮ್ಮ ಪೋಸ್ಟ್‌ಗೆ ಹೊಸ ಕಮೆಂಟ್ 💬', message: `${p.actorName} ನಿಮ್ಮ ಪೋಸ್ಟ್ "${p.postTitle}" ಮೇಲೆ ಕಮೆಂಟ್ ಮಾಡಿದ್ದಾರೆ.` }),
      reply: (p) => ({ title: 'ನಿಮ್ಮ ಕಮೆಂಟ್‌ಗೆ ಉತ್ತರ 💬', message: `${p.actorName} "${p.postTitle}" ನಲ್ಲಿ ನಿಮ್ಮ ಕಮೆಂಟ್‌ಗೆ ಉತ್ತರಿಸಿದ್ದಾರೆ.` }),
      like: (p) => ({ title: 'ನಿಮ್ಮ ಪೋಸ್ಟ್ ಇಷ್ಟಪಟ್ಟಿದ್ದಾರೆ ❤️', message: `${p.actorName} ನಿಮ್ಮ ಪೋಸ್ಟ್ "${p.postTitle}" ಅನ್ನು ಲೈಕ್ ಮಾಡಿದ್ದಾರೆ.` }),
    },
    ml: {
      comment: (p) => ({ title: 'നിങ്ങളുടെ പോസ്റ്റിൽ പുതിയ അഭിപ്രായം 💬', message: `${p.actorName} നിങ്ങളുടെ "${p.postTitle}" പോസ്റ്റിൽ അഭിപ്രായം രേഖപ്പെടുത്തി.` }),
      reply: (p) => ({ title: 'നിങ്ങളുടെ അഭിപ്രായത്തിന് മറുപടി 💬', message: `${p.actorName} "${p.postTitle}" എന്നതിലെ നിങ്ങളുടെ കമന്റിന് മറുപടി നൽകി.` }),
      like: (p) => ({ title: 'നിങ്ങളുടെ പോസ്റ്റ് ഒരാൾ ഇഷ്ടപ്പെട്ടു ❤️', message: `${p.actorName} നിങ്ങളുടെ "${p.postTitle}" പോസ്റ്റ് ലൈക്ക് ചെയ്തു.` }),
    },
  },
};

export function getLocalizedContent(templateKey, lang = 'en', params = {}) {
  const language = NOTIFICATION_TEMPLATES[templateKey]?.[lang] ? lang : 'en';
  const tmpl = NOTIFICATION_TEMPLATES[templateKey]?.[language] || NOTIFICATION_TEMPLATES[templateKey]?.['en'];

  if (!tmpl) {
    return {
      title: params.title || 'TedBus Notification',
      message: params.message || '',
    };
  }

  if (templateKey === 'community_interaction') {
    const fn = tmpl[params.type] || tmpl['comment'];
    return fn(params);
  }

  const title = typeof tmpl.title === 'function' ? tmpl.title(params) : tmpl.title;
  const message = typeof tmpl.message === 'function' ? tmpl.message(params) : tmpl.message;

  return { title, message };
}
