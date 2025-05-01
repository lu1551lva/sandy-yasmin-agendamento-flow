
import { useState, useEffect } from "react";
import { getWhatsAppTemplates, formatWhatsAppTemplate } from "@/lib/whatsappUtils";

export function useWhatsAppTemplates() {
  const [templates, setTemplates] = useState(() => getWhatsAppTemplates());

  // Format message with provided variables
  const formatMessage = (
    templateKey: string,
    variables: Record<string, string>
  ): string => {
    const template = templates[templateKey as keyof typeof templates] || "";
    return formatWhatsAppTemplate(template, variables);
  };

  return {
    templates,
    formatMessage
  };
}
