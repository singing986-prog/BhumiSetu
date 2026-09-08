const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  '  const { t } = useTranslation();',
  `  const { t } = useTranslation();
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/profile').then(r => r.json()).then(data => {
        setProfile(data);
        setNotifPrefs({ email: data.notifEmail, sms: data.notifSms });
      });
    }
  }, [isAuthenticated]);`
);
fs.writeFileSync('src/App.tsx', content);
