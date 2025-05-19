import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconLanguage } from "@tabler/icons-react";

export function LanguageSwitch() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <Select
      value={currentLanguage}
      onValueChange={(value) => i18n.changeLanguage(value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <IconLanguage /> EN
        </SelectItem>
        <SelectItem value="es">
          <IconLanguage /> ES
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
