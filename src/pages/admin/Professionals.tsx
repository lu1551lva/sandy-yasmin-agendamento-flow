import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfessionalTable from "./components/ProfessionalTable";
import ProfessionalDialog from "./profissionais/ProfessionalDialog";
import DeleteProfessionalDialog from "./profissionais/DeleteProfessionalDialog";
import { useProfessionals } from "./profissionais/useProfessionals";

// Mapear dias abreviados (em português)
const DIAS_ABREV = {
  segunda: "Seg",
  terca: "Ter",
  quarta: "Qua",
  quinta: "Qui",
  sexta: "Sex",
  sabado: "Sáb",
  domingo: "Dom",
};

const formatDiasAtendimento = (dias: string[]) => {
  if (dias.length === 0) return "Sem dias definidos";
  if (dias.length === 7) return "Todos os dias";
  return dias.map((dia) => DIAS_ABREV[dia] || dia).join(", ");
};

const Professionals = () => {
  const {
    professionals,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditing,
    currentProfessional,
    formData,
    setFormData,
    errors,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    toggleDay,
    openNewProfessionalDialog,
    deleteProfessionalMutation,
  } = useProfessionals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie os profissionais do salão
          </p>
        </div>
        <Button onClick={openNewProfessionalDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nova Profissional
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <ProfessionalTable
          professionals={professionals || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          formatDiasAtendimento={formatDiasAtendimento}
          onAddProfessional={openNewProfessionalDialog}
        />
      </div>

      <ProfessionalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        errors={errors}
        isEditing={isEditing}
        onInputChange={(field, value) =>
          setFormData((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        onToggleDay={toggleDay}
        onSubmit={handleSubmit}
        onReset={resetForm}
      />

      <DeleteProfessionalDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        professional={currentProfessional}
        onDelete={() => {
          if (currentProfessional) {
            deleteProfessionalMutation.mutate(currentProfessional.id);
          }
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default Professionals;
