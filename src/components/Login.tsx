import React, { useState } from "react";
import { Shield, Lock, Map as MapIcon } from "lucide-react";
import { useTranslation } from "../i18n";

export function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { t, language, setLanguage } = useTranslation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "ramesh.k@bhoomisetu.gov.in" && password === "admin123") {
      onLogin();
    } else {
      setError(language === "HI" ? "अमान्य ईमेल या पासवर्ड।" : "Invalid email or password.");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "HI" : "EN");
  };

  return (
    <div className="min-h-screen bg-survey-paper flex items-center justify-center p-4 font-sans">
      <div className="absolute top-6 right-8">
        <button onClick={toggleLanguage} className="text-registry-ink hover:text-graticule-teal text-sm font-medium transition-colors cursor-pointer outline-none">
          {language === "EN" ? (
            <span><strong>EN</strong> <span className="text-graticule-teal/50 font-normal">/ HI</span></span>
          ) : (
            <span><span className="text-graticule-teal/50 font-normal">EN / </span><strong>HI</strong></span>
          )}
        </button>
      </div>
      
      <div className="max-w-md w-full bg-white p-8 border border-graticule-teal/30 shadow-sm rounded-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-registry-ink text-white rounded-sm flex items-center justify-center mb-4 shadow-sm">
            <MapIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-registry-ink mb-1">{t("header.title")}</h1>
          <p className="text-sm text-graticule-teal font-mono uppercase tracking-widest">{language === "HI" ? "भूमि संसाधन विभाग" : "Dept. of Land Resources"}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30 text-sm rounded-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-registry-ink mb-2">
              {language === "HI" ? "आधिकारिक ईमेल" : "Official Email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white text-registry-ink transition-colors"
              placeholder="ramesh.k@bhoomisetu.gov.in"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-registry-ink mb-2">
              {language === "HI" ? "पासवर्ड" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graticule-teal/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white text-registry-ink transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors shadow-sm rounded-sm"
          >
            <Shield className="w-4 h-4" />
            {language === "HI" ? "सुरक्षित लॉगिन" : "Secure Login"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-graticule-teal/10 text-center">
          <p className="text-xs text-registry-ink/60 leading-relaxed">
            {language === "HI" ? "यह एक सुरक्षित सरकारी पोर्टल है। अनधिकृत पहुँच सख्त वर्जित है।" : "This is a secure government portal. Unauthorized access is strictly prohibited."}
            <br />
            Demo credentials: ramesh.k@bhoomisetu.gov.in / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
