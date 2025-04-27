
import { useState, useEffect } from 'react';
import { supabase, Salon } from "@/lib/supabase";

export const useRecentSalons = () => {
  const [recentSalons, setRecentSalons] = useState<Salon[]>([]);

  useEffect(() => {
    const fetchRecentSalons = async () => {
      try {
        const { data: saloes } = await supabase
          .from('saloes')
          .select('*');

        const recentOnes = [...saloes || []].sort((a, b) => {
          return new Date(b.data_cadastro).getTime() - new Date(a.data_cadastro).getTime();
        }).slice(0, 5);

        setRecentSalons(recentOnes);
      } catch (error) {
        console.error('Error fetching recent salons:', error);
      }
    };
    
    fetchRecentSalons();
  }, []);

  return recentSalons;
};
