const fs = require('fs');
let content = fs.readFileSync('src/i18n.tsx', 'utf8');

content = content.replace(
  'const [language, setLanguage] = useState<Language>("EN");',
  `const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("bhoomisetu_lang") as Language) || "EN";
  });
  
  const setLanguage = (lang: Language) => {
    localStorage.setItem("bhoomisetu_lang", lang);
    setLanguageState(lang);
  };`
);

fs.writeFileSync('src/i18n.tsx', content);
