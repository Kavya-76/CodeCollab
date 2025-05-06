import React from 'react';
import { Button } from '@/components/ui/button.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.js';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string, languageId:number) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const languages = [
    { id: 'javascript', name: 'JavaScript', languageId: 63 },
    { id: 'python', name: 'Python', languageId: 71 },
    { id: 'cpp', name: 'C++', languageId: 54 },
    { id: 'c', name: 'C', languageId: 50 },
    { id: 'java', name: 'Java', languageId: 62 },
  ];

  const currentLanguageName = languages.find(lang => lang.id === currentLanguage)?.name || currentLanguage;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Languages className="h-4 w-4" />
          {currentLanguageName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map(language => (
          <DropdownMenuItem
            key={language.id}
            onClick={() => onLanguageChange(language.id, language.languageId)}
            className={currentLanguage === language.id ? 'bg-accent text-accent-foreground' : ''}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;