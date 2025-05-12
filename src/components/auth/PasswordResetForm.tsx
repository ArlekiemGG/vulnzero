
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type PasswordResetFormProps = {
  onSuccess?: () => void;
};

const PasswordResetForm = ({ onSuccess }: PasswordResetFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth?reset=true",
      });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description: "Si existe una cuenta con este correo, recibirás instrucciones para restablecer tu contraseña.",
      });
      setShowVerification(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al procesar tu solicitud.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // En un entorno real, usaríamos el token del correo
      // Este es un placeholder para la demo
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido restablecida correctamente.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al restablecer tu contraseña.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-cybersec-neongreen">Verifica tu identidad</h2>
          <p className="text-sm text-gray-400 mt-1">
            Introduce el código que enviamos a tu correo y establece una nueva contraseña
          </p>
        </div>

        <form onSubmit={handleVerifyAndReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Código de verificación</Label>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-cybersec-neongreen hover:bg-cybersec-neongreen/80 text-black"
            disabled={loading || otp.length < 6 || !newPassword}
          >
            {loading ? "Procesando..." : "Restablecer contraseña"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-cybersec-neongreen">¿Olvidaste tu contraseña?</h2>
        <p className="text-sm text-gray-400 mt-1">
          Te enviaremos instrucciones para restablecer tu contraseña
        </p>
      </div>

      <form onSubmit={handleResetRequest} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="bg-gray-800 border-gray-700"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-cybersec-neongreen hover:bg-cybersec-neongreen/80 text-black"
          disabled={loading || !email}
        >
          {loading ? "Enviando..." : "Enviar instrucciones"}
        </Button>
      </form>
    </div>
  );
};

export default PasswordResetForm;
