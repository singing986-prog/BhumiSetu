const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const newModals = `      {activeModal === "profile" && (
        <Modal title={t("profile.myProfile", "My Profile")} icon={User} onClose={() => { setActiveModal(null); setIsEditingProfile(false); }}>
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-graticule-teal/10 flex items-center justify-center text-4xl text-registry-ink border border-graticule-teal/30">
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            
            {passwordState.error && activeModal === "profile" && <div className="text-alluvium-red text-xs">{passwordState.error}</div>}
            {passwordState.success && activeModal === "profile" && <div className="text-cultivated-green text-xs">Profile updated successfully.</div>}
            
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
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Role & Jurisdiction</label>
                  <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm opacity-70">{profile.role} • {profile.district}</div>
                </div>
                <button onClick={() => { setEditProfileForm({name: profile.name, email: profile.email}); setIsEditingProfile(true); setPasswordState({error: "", success: false}); }} className="w-full px-4 py-2 border border-registry-ink text-registry-ink rounded-sm text-sm font-medium hover:bg-graticule-teal/5 transition-colors mt-4">
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Full Name</label>
                  <input type="text" value={editProfileForm.name} onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} className="w-full px-3 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Email</label>
                  <input type="email" value={editProfileForm.email} onChange={e => setEditProfileForm({...editProfileForm, email: e.target.value})} className="w-full px-3 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-registry-ink/60 mb-1">Role & Jurisdiction (Read Only)</label>
                  <div className="px-3 py-2 bg-survey-paper/50 border border-graticule-teal/30 rounded-sm text-sm opacity-50">{profile.role} • {profile.district}</div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditingProfile(false)} className="flex-1 px-4 py-2 border border-registry-ink text-registry-ink rounded-sm text-sm font-medium hover:bg-graticule-teal/5 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => {
                    fetch('/api/profile', {
                      method: 'POST', headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ name: editProfileForm.name, email: editProfileForm.email })
                    }).then(r => r.json()).then(data => {
                      setProfile(data);
                      setIsEditingProfile(false);
                      setPasswordState({error: "", success: true});
                    }).catch(e => setPasswordState({error: "Failed to save profile.", success: false}));
                  }} className="flex-1 px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {activeModal === "settings" && (
        <Modal title={t("profile.settings", "Account Settings")} icon={Settings} onClose={() => { setActiveModal(null); setPasswordState({error: "", success: false}); setPasswordForm({current: "", newPass: "", confirm: ""}); }}>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Preferences</h3>
              <label className="flex items-center justify-between p-3 border border-graticule-teal/30 rounded-sm cursor-pointer hover:bg-graticule-teal/5 transition-colors">
                <span className="text-sm">Email Notifications</span>
                <input type="checkbox" checked={notifPrefs.email} onChange={e => {
                  setNotifPrefs({...notifPrefs, email: e.target.checked});
                  fetch('/api/profile', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ notifEmail: e.target.checked }) });
                }} className="accent-tilled-earth w-4 h-4" />
              </label>
              <label className="flex items-center justify-between p-3 border border-graticule-teal/30 rounded-sm cursor-pointer hover:bg-graticule-teal/5 transition-colors mt-2">
                <span className="text-sm">SMS Alerts</span>
                <input type="checkbox" checked={notifPrefs.sms} onChange={e => {
                  setNotifPrefs({...notifPrefs, sms: e.target.checked});
                  fetch('/api/profile', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ notifSms: e.target.checked }) });
                }} className="accent-tilled-earth w-4 h-4" />
              </label>
            </div>
            
            <div className="pt-2 border-t border-graticule-teal/10">
              <h3 className="text-sm font-semibold mb-3">Change Password</h3>
              {passwordState.error && <div className="text-alluvium-red text-xs mb-2">{passwordState.error}</div>}
              {passwordState.success && <div className="text-cultivated-green text-xs mb-2">Password changed successfully. Please log in again.</div>}
              
              <div className="space-y-3">
                <input type="password" placeholder="Current Password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full px-3 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal" />
                <input type="password" placeholder="New Password" value={passwordForm.newPass} onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} className="w-full px-3 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal" />
                <input type="password" placeholder="Confirm New Password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full px-3 py-2 border border-graticule-teal/30 rounded-sm text-sm focus:outline-none focus:border-graticule-teal" />
                <button onClick={() => {
                  if (passwordForm.newPass !== passwordForm.confirm) {
                    setPasswordState({error: "Passwords do not match", success: false});
                    return;
                  }
                  fetch('/api/password', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ current: passwordForm.current, newPass: passwordForm.newPass })
                  }).then(r => r.json()).then(data => {
                    if (data.error) setPasswordState({error: data.error, success: false});
                    else {
                      setPasswordState({error: "", success: true});
                      setPasswordForm({current: "", newPass: "", confirm: ""});
                      setTimeout(() => setIsAuthenticated(false), 2000); // Logout after change
                    }
                  }).catch(e => setPasswordState({error: "Server error", success: false}));
                }} className="w-full px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors mt-2">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}`;

const startIdx = content.indexOf('{activeModal === "profile"');
const endIdx = content.lastIndexOf(')}    </div>  );}');

content = content.slice(0, startIdx) + newModals + "\n    </div>\n  );\n}\n";
fs.writeFileSync('src/App.tsx', content);
