import { useState } from 'react';
import axios from 'axios';

export default function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Aquí hacemos la solicitud al backend de Node.js para enviar el correo
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/request-password-reset-viaticos`, { email });
      setMessage('Correo de restablecimiento enviado. Verifica tu bandeja de entrada.');
      setIsLoading(false);
    } catch (error) {
      setMessage(error.response?.data || 'Error al solicitar el restablecimiento de la contraseña.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Restablecer Contraseña</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Correo electrónico:
            </label>
            <input 
              type="email" 
              id="email" 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Enviar enlace de restablecimiento'}
          </button>
        </form>
        {message && (
          <div className="mt-4 p-4 text-center rounded bg-green-100 border border-green-400 text-green-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
