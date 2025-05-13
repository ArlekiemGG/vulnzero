
import { Request, Response } from 'express';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: Request, res: Response) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Se requiere el ID del usuario' });
  }

  try {
    // Comprobar el rol del usuario desde la tabla profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    // Verificar si el rol es admin
    const isAdmin = data?.role === 'admin';

    return res.status(200).json({ data: { isAdmin } });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ error: 'Error al verificar el estado de administrador' });
  }
}
