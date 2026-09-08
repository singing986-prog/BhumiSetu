const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />',
  '<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />'
);

content = content.replace(
  '<TopNav \n        setActiveTab={setActiveTab} \n        selectedState={selectedState}\n        setSelectedState={setSelectedState}\n        selectedDistrict={selectedDistrict}\n        setSelectedDistrict={setSelectedDistrict}\n        setIsAuthenticated={setIsAuthenticated}\n        openModal={setActiveModal}\n      />',
  '<TopNav \n        setActiveTab={setActiveTab} \n        setIsAuthenticated={setIsAuthenticated}\n        openModal={setActiveModal}\n        profile={profile}\n      />'
);
// In case the old props string differs
content = content.replace(
  '<TopNav \n        setActiveTab={setActiveTab} \n        selectedState={selectedState}\n        setSelectedState={setSelectedState}\n        selectedDistrict={selectedDistrict}\n        setSelectedDistrict={setSelectedDistrict}\n        setIsAuthenticated={setIsAuthenticated}\n        openModal={setActiveModal}\n      />',
  '<TopNav setActiveTab={setActiveTab} setIsAuthenticated={setIsAuthenticated} openModal={setActiveModal} profile={profile} />'
);

fs.writeFileSync('src/App.tsx', content);
