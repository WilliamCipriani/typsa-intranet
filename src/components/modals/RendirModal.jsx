import React, { useState, useEffect } from 'react';
import { ajustarFecha } from "@/utils/dateUtils";
import FormularioIngresoBoletas from '../FormularioIngresoBoletas';
import TablaRegistrosGuardados from '../TablaRegistrosGuardados';
import axios from 'axios';

const RendirModal = ({ isOpen, onClose, solicitud }) => {
  const [registros, setRegistros] = useState([]);
  const [selectedRegistroIndex, setSelectedRegistroIndex] = useState(null);
  const [registroEditable, setRegistroEditable] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rendicion-viaticos/${solicitud.SolicitudId}`);
        console.log("Datos de la API: ", response.data);
        setRegistros(response.data || []); // Cargar los registros anteriores
      } catch (error) {
        console.error("Error al obtener los datos: ", error);
      }
    };
  
    if (solicitud && solicitud.EstadoId === 9) {
      fetchData();
    }
  }, [solicitud]);  

  if (!isOpen) return null;

  const handleRegistroChange = (e, index, field) => {
    const newRegistros = [...registros];
    newRegistros[index][field] = e.target.value;
    setRegistros(newRegistros);
  };

  const handleRegistroClick = (index) => {
    setSelectedRegistroIndex(index);
    setRegistroEditable(registros[index]); // Pasar el registro seleccionado al formulario para editarlo
  };

  const handleUpdateRegistro = (updatedRegistro) => {
    const newRegistros = [...registros];
    newRegistros[selectedRegistroIndex] = updatedRegistro;
    setRegistros(newRegistros);
    setRegistroEditable(null); // Limpiar el formulario después de la edición
    setSelectedRegistroIndex(null); // Desselecciona el registro después de actualizarlo
  };

  const handleResetForm = () => {
    setRegistroEditable(null);
    setSelectedRegistroIndex(null);
  };

  const handleAddBoleta = (newBoleta) => {
    setRegistros([...registros, newBoleta]);
    handleResetForm(); // Resetea el formulario después de agregar la boleta
  };

  const handleSubmitRendicion = async () => {

    const confirmacion = window.confirm("¿Estás seguro de que deseas rendir esta solicitud de viático?");

    if (!confirmacion) {
      return;
    }

    const formData = new FormData();
    formData.append('solicitudId', solicitud.SolicitudId);
  
    // Usar un array para almacenar las boletas y luego convertirlo en JSON
    const boletas = registros.map((registro) => ({
      fecha: registro.Fecha, // Asegúrate de que los nombres de las claves coincidan con los campos de registro
      numero: registro.Numero,
      proveedor: registro.Proveedor,
      item: registro.Item,
      detalle: registro.Detalle,
      importe: parseFloat(registro.Importe), // Convertir a número si es necesario
      tipoComprobante: registro.TipoComprobante
    }));
  
    // Validar que los datos se están construyendo correctamente
    console.log("Boletas antes de enviar:", boletas);
  
    // Convertir el array de boletas en un string JSON
    const boletasJSON = JSON.stringify(boletas);
    formData.append('boletas', boletasJSON);
  
    // Agregar los archivos adjuntos
    registros.forEach((registro) => {
      if (registro.Adjunto) {
        formData.append('adjunto', registro.Adjunto); 
      }
    });
  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/rendir`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Rendición guardada con éxito', response.data);
      onClose(); // Cierra el modal o interfaz de rendición
    } catch (error) {
      console.error('Error al rendir', error);
    }
  };

  const handleSubmitCorrections = async () => {
    const formData = new FormData();
    formData.append('solicitudId', solicitud.SolicitudId);
    formData.append('boletas', JSON.stringify(registros));

    registros.forEach((registro) => {
      if (registro.Adjunto instanceof File) {
        formData.append(`adjunto`, registro.Adjunto); // Adjunta el archivo si es un File (nuevo archivo subido)
      }
    });

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/corregir-rendicion`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Corrección guardada con éxito', response.data);
      onClose(); // Cierra el modal o interfaz de corrección
    } catch (error) {
      console.error('Error al corregir', error);
    } 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] bg-white p-5 rounded-lg shadow-lg relative overflow-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Rendir Viático</h2>
          <button className="text-black w-10 h-10" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {solicitud.EstadoId === 5 && (
          <div>
            <div className="p-4 bg-gray-100 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Nro. de solicitud:</strong> {solicitud?.SolicitudId}</p>
                  <p><strong>Centro de Costo:</strong> {solicitud?.CodigoProyecto}</p>
                  <p><strong>Corresponsabilidad:</strong> {solicitud?.Codigo}</p>
                  <p><strong>Jefe de aprobación:</strong> {solicitud?.JefeAprobadorNombreCompleto}</p>
                  <p><strong>Motivo de viático:</strong> {solicitud?.NombreMotivo}</p>
                  <p><strong>Fecha de Inicio:</strong> {ajustarFecha(solicitud?.FechaInicio)}</p>
                  <p><strong>Fecha Final:</strong> {ajustarFecha(solicitud?.FechaFin)}</p>
                </div>
                <div>
                  <p><strong>Monto Solicitado:</strong> S/.{solicitud?.MontoNetoInicial}</p>
                  <p><strong>Monto Aprobado:</strong> S/.{solicitud?.MontoNetoAprobado}</p>
                  {solicitud.ComentariosUsuario && (
                    <p><strong>Comentario:</strong> {solicitud?.ComentariosUsuario}</p>
                  )}
                  {solicitud.ComentarioJefeMonto && (
                    <p><strong>Comentario del Jefe:</strong> {solicitud?.ComentarioJefeMonto}</p>
                  )}
                  
                </div>
              </div>
            </div>
            <FormularioIngresoBoletas
              registros={registros}
              setRegistros={setRegistros}
              registroEditable={registroEditable} 
              onUpdateRegistro={handleUpdateRegistro} 
              onAddBoleta={handleAddBoleta} 
            />
            <TablaRegistrosGuardados 
              registros={registros} 
              handleRegistroChange={handleRegistroChange} 
              handleRegistroClick={handleRegistroClick} 
              setSelectedRegistroIndex={setSelectedRegistroIndex} 
              selectedRegistroIndex={selectedRegistroIndex}
            />
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={handleSubmitRendicion} className="bg-blue-500 text-white py-2 px-4 rounded">
                Rendir
              </button>
            </div>
          </div>
        )}

        {solicitud.EstadoId === 9 && (
          <div className="flex flex-col gap-y-5 mt-4">
            <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-yellow-50 " role="alert">
                <svg className="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                </svg>
                <span className="sr-only">Info</span>
                <div>
                  <span className="font-medium">Observaciones de Contabilidad:</span> {solicitud.ComentariosContabilidad}
                  <p>Por favor, corrige los errores indicados y vuelve a enviar.</p>
                </div>
              </div>
            <div className="p-4 bg-gray-100 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Nro. de solicitud:</strong> {solicitud?.SolicitudId}</p>
                  <p><strong>Centro de Costo:</strong> {solicitud?.CodigoProyecto}</p>
                  <p><strong>Corresponsabilidad:</strong> {solicitud?.Codigo}</p>
                  <p><strong>Jefe de aprobación:</strong> {solicitud?.JefeAprobadorNombreCompleto}</p>
                  <p><strong>Motivo de viático:</strong> {solicitud?.NombreMotivo}</p>
                  <p><strong>Fecha de Inicio:</strong> {ajustarFecha(solicitud?.FechaInicio)}</p>
                  <p><strong>Fecha Final:</strong> {ajustarFecha(solicitud?.FechaFin)}</p>
                </div>
                <div>
                  <p><strong>Monto Solicitado:</strong> S/.{solicitud?.MontoNetoInicial}</p>
                  <p><strong>Monto Aprobado:</strong> S/.{solicitud?.MontoNetoAprobado}</p>
                  {solicitud.ComentariosUsuario && (
                    <p><strong>Comentario:</strong> {solicitud?.ComentariosUsuario}</p>
                  )}
                  {solicitud.ComentarioJefeMonto && (
                    <p><strong>Comentario del Jefe:</strong> {solicitud?.ComentarioJefeMonto}</p>
                  )}
                </div>
              </div>
            </div>

            <FormularioIngresoBoletas
              registros={registros}
              setRegistros={setRegistros}
              registroEditable={registroEditable} // Pasar el registro editable al formulario
              onUpdateRegistro={handleUpdateRegistro} // Método para actualizar el registro
            />

            <TablaRegistrosGuardados 
              registros={registros} 
              handleRegistroChange={handleRegistroChange} 
              handleRegistroClick={handleRegistroClick} // Pasar la función para manejar el clic en un registro
              setSelectedRegistroIndex={setSelectedRegistroIndex} 
              selectedRegistroIndex={selectedRegistroIndex}
            />

            <div className="flex justify-end gap-4 mt-4">
              <button onClick={handleSubmitCorrections} className="bg-green-500 text-white py-2 px-4 rounded">
                Enviar Correcciones
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RendirModal;
