const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// I need to add state for profile
content = content.replace(
  'const [activeModal, setActiveModal] = useState<string | null>(null);',
  `const [activeModal, setActiveModal] = useState<string | null>(null);
  const [profile, setProfile] = useState({ name: "Ramesh Kumar", email: "ramesh.k@bhoomisetu.gov.in", role: "District LAO", district: "New Delhi" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordState, setPasswordState] = useState({ error: "", success: false });
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: true });`
);

// I need to replace the static profile modal
const profileModalOld = /\{activeModal === "profile" && \([\s\S]*?<\/Modal>\n      \}\}/;
const profileModalNew = `{activeModal === "profile" && (
        <Modal title={t("profile.myProfile", "My Profile")} icon={User} onClose={() => { setActiveModal(null); setIsEditingProfile(false); }}>
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-graticule-teal/10 flex items-center justify-center text-4xl text-registry-ink border border-graticule-teal/30">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            
            {!isEditingProfile ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Full Name</label>
                  <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm">{profile.name}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Email</label>
                  <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm">{profile.email}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Role (Read-only)</label>
                  <div className="px-3 py-2 bg-registry-ink/5 border border-graticule-teal/20 rounded-sm text-sm text-registry-ink/80">{profile.role} • {profile.district}</div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button onClick={() => { setEditProfileForm({name: profile.name, email: profile.email}); setIsEditingProfile(true); }} className="px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors">Edit Profile</button>
                </div>
              </>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setProfile({ ...profile, name: editProfileForm.name, email: editProfileForm.email }); setIsEditingProfile(false); }}>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Full Name</label>
                  <input type="text" required value={editProfileForm.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-graticule-teal/30 rounded-sm text-sm outline-none focus:border-graticule-teal" />
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Email</label>
                  <input type="email" required value={editProfileForm.email} onChange={e => setEditProfileForm({...editProfileForm, email: e.target.value})} className="w-full px-3 py-2 bg-white border border-graticule-teal/30 rounded-sm text-sm outline-none focus:border-graticule-teal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1 mt-4">Role (Read-only)</label>
                  <div className="px-3 py-2 bg-registry-ink/5 border border-graticule-teal/20 rounded-sm text-sm text-registry-ink/80 cursor-not-allowed">{profile.role} • {profile.district}</div>
                  <p className="text-[10px] text-registry-ink/50 mt-1">Role and jurisdiction are managed by the administrator.</p>
                </div>
                <div className="pt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-registry-ink border border-graticule-teal/30 rounded-sm text-sm font-medium hover:bg-graticule-teal/5 transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors">Save Changes</button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}`;

content = content.replace(profileModalOld, profileModalNew);

// Replace settings modal
const settingsModalOld = /\{activeModal === "settings" && \([\s\S]*?<\/Modal>\n      \}\}/;
const settingsModalNew = `{activeModal === "settings" && (
        <Modal title={t("profile.settings", "Account Settings")} icon={Settings} onClose={() => { setActiveModal(null); setPasswordState({error:"", success:false}); setPasswordForm({current:"", newPass:"", confirm:""}); }}>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Preferences</h3>
              <label className="flex items-center justify-between p-3 border border-graticule-teal/30 rounded-sm cursor-pointer hover:bg-graticule-teal/5 transition-colors">
                <span className="text-sm">Email Notifications</span>
                <input type="checkbox" checked={notifPrefs.email} onChange={e => setNotifPrefs({...notifPrefs, email: e.target.checked})} className="accent-tilled-earth w-4 h-4" />
              </label>
              <label className="flex items-center justify-between p-3 border border-graticule-teal/30 rounded-sm cursor-pointer hover:bg-graticule-teal/5 transition-colors mt-2">
                <span className="text-sm">SMS Alerts</span>
                <input type="checkbox" checked={notifPrefs.sms} onChange={e => setNotifPrefs({...notifPrefs, sms: e.target.checked})} className="accent-tilled-earth w-4 h-4" />
              </label>
            </div>
            <div className="border-t border-graticule-teal/10 pt-4">
              <h3 className="text-sm font-semibold mb-3">Security & Password</h3>
              {passwordState.success ? (
                <div className="p-4 bg-cultivated-green/10 border border-cultivated-green/30 text-cultivated-green text-sm rounded-sm text-center">
                  Password updated successfully. You will need to re-authenticate on your next session.
                </div>
              ) : (
                <form onSubmit={e => {
                  e.preventDefault();
                  if (passwordForm.newPass.length < 8) return setPasswordState({ error: "Password must be at least 8 characters", success: false });
                  if (passwordForm.newPass !== passwordForm.confirm) return setPasswordState({ error: "New passwords do not match", success: false });
                  if (passwordForm.current === passwordForm.newPass) return setPasswordState({ error: "New password must be different from current", success: false });
                  // Simulate backend success
                  setPasswordState({ error: "", success: true });
                }}>
                  <div className="space-y-3">
                    <input type="password" required placeholder="Current Password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full px-3 py-2 bg-white border border-graticule-teal/30 rounded-sm text-sm outline-none focus:border-graticule-teal" />
                    <input type="password" required placeholder="New Password (min 8 chars)" value={passwordForm.newPass} onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} className="w-full px-3 py-2 bg-white border border-graticule-teal/30 rounded-sm text-sm outline-none focus:border-graticule-teal" />
                    <input type="password" required placeholder="Confirm New Password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full px-3 py-2 bg-white border border-graticule-teal/30 rounded-sm text-sm outline-none focus:border-graticule-teal" />
                    {passwordState.error && <div className="text-xs text-alluvium-red">{passwordState.error}</div>}
                    <button type="submit" className="w-full px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors mt-2">
                      Change Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Modal>
      )}`;

content = content.replace(settingsModalOld, settingsModalNew);
fs.writeFileSync('src/App.tsx', content);
