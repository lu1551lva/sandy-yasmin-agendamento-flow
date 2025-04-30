
import { supabase } from "@/lib/supabase";

// This is a one-time script to add the "Retoque micropigmentação" service
const addRetoqueService = async () => {
  try {
    // Prepare the service data
    const serviceData = {
      nome: "Retoque micropigmentação",
      valor: 150.00,
      duracao_em_minutos: 90, // 1h30
      descricao: "Serviço de retoque de micropigmentação",
      ativo: true
    };
    
    console.log("Creating new service:", serviceData);
    
    const { data, error } = await supabase
      .from("servicos")
      .insert(serviceData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating service:", error);
      return { success: false, error };
    }
    
    console.log("Service created successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Exception while creating service:", error);
    return { success: false, error };
  }
};

// Execute the function
addRetoqueService().then(result => {
  console.log("Result:", result);
});

// Export for potential reuse
export { addRetoqueService };
