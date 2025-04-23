
import { Dialog } from "@/components/ui/dialog";
import ProfessionalForm from "../../components/ProfessionalForm";
import React from "react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formData: any;
  errors: Record<string, string>;
  isEditing: boolean;
  onInputChange: (field: string, value: any) => void;
  onToggleDay: (d: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}
const ProfessionalDialog = ({
  open,
  onOpenChange,
  formData,
  errors,
  isEditing,
  onInputChange,
  onToggleDay,
  onSubmit,
  onReset,
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <ProfessionalForm
      formData={formData}
      errors={errors}
      isEditing={isEditing}
      onInputChange={onInputChange}
      onToggleDay={onToggleDay}
      onSubmit={onSubmit}
      onReset={onReset}
    />
  </Dialog>
);

export default ProfessionalDialog;
