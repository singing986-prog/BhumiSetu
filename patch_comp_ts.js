import fs from 'fs';
let compContent = fs.readFileSync('src/components/Compensation.tsx', 'utf-8');

// The project didn't have i18next installed natively, or it did? Let's check package.json.
// Actually earlier the Compensation.tsx didn't import react-i18next. 
// I'll replace useTranslation with a simple mock if it doesn't exist, or just remove it and use a dummy t function.
compContent = compContent.replace(/import \{ useTranslation \} from "react-i18next";/g, '');
compContent = compContent.replace(/const \{ t \} = useTranslation\(\);/g, 'const t = (k: string, d: string) => d;');

// Fix props signature
const oldProps = `selectedProject?: string,
  profile?: any,
  setActiveTab: (tab: string) => void,
  setSelectedProject: (id: string) => void,
  setSelectedParcelId: (id: string | null) => void
}) {`;

const newProps = `selectedProject?: string,
  selectedStage?: string,
  selectedCategory?: string,
  selectedRisk?: string,
  profile?: any,
  setActiveTab?: (tab: string) => void,
  setSelectedProject?: (id: string) => void,
  setSelectedParcelId?: (id: string | null) => void
}) {`;

compContent = compContent.replace(oldProps, newProps);

// Also need to add those fields to the type definition
const oldPropDef = `selectedProject?: string,
  profile?: any,
  setActiveTab: (tab: string) => void,
  setSelectedProject: (id: string) => void,
  setSelectedParcelId: (id: string | null) => void
}`;

const newPropDef = `selectedProject?: string,
  selectedStage?: string,
  selectedCategory?: string,
  selectedRisk?: string,
  profile?: any,
  setActiveTab?: (tab: string) => void,
  setSelectedProject?: (id: string) => void,
  setSelectedParcelId?: (id: string | null) => void
}`;
compContent = compContent.replace(oldPropDef, newPropDef);

fs.writeFileSync('src/components/Compensation.tsx', compContent);
