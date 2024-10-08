import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";

const ViaticosMenu = () => {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(null);
  const [solicitudesCount, setSolicitudesCount] = useState(0);
  const [jefeProyectoSolicitudesCount, setJefeProyectoSolicitudesCount] = useState({
    observadas: 0,
    porRevisar: 0
  });
  const [rendicionesCount, setRendicionesCount] = useState({
    observadas: 0,
    porRevisar: 0
  });
  const [constanciasCount, setConstanciasCount] = useState({
    observadas: 0,
    porRevisar: 0
  });
  const [contabilidadSolicitudesCount, setContabilidadSolicitudesCount] = useState({
    pagos: 0,
    devoluciones: 0
  });

  useEffect(() => {
    const fetchSolicitudesPorAprobar = async () => {
      if (session?.user?.empleadoId) {
        const jefeAprobadorId = session.user.empleadoId;
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitud-viaticos/jefe/${jefeAprobadorId}`);
          const solicitudesPorAprobar = response.data.filter(solicitud => solicitud.EstadoId === 1);
          setSolicitudesCount(solicitudesPorAprobar.length);
        } catch (error) {
          console.error("Error al obtener las solicitudes por aprobar", error);
        }
      }
    };

    const fetchContabilidadSolicitudesPorAprobar = async () => {
      if (session?.user?.roles?.includes('Administracion')) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitud-viaticos-presupuesto`);
        
          const pagos = response.data.filter(solicitud => solicitud.EstadoId === 2);
          const devoluciones = response.data.filter(solicitud => solicitud.EstadoId === 3);
          setContabilidadSolicitudesCount({
            pagos: pagos.length,
            devoluciones: devoluciones.length
          });
        } catch (error) {
          console.error("Error al obtener las solicitudes por aprobar para el administrador", error);
        }
      }
    };

    const fetchRendicionesCount = async () => {
      if (session?.user?.roles?.includes('Administracion')) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitud-viaticos-presupuesto`);
          const observadas = response.data.filter(rendicion => rendicion.EstadoId === 9); 
          const porRevisar = response.data.filter(rendicion => rendicion.EstadoId === 6); 
          setRendicionesCount({
            observadas: observadas.length,
            porRevisar: porRevisar.length
          });
        } catch (error) {
          console.error("Error al obtener las rendiciones", error);
        }
      }
    };
  
    const fetchConstanciasCount = async () => {
      if (session?.user?.roles?.includes('Administracion')) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitud-viaticos-presupuesto`);
          const observadas = response.data.filter(constancia => constancia.EstadoId === 11); 
          const porRevisar = response.data.filter(constancia => constancia.EstadoId === 8);
          setConstanciasCount({
            observadas: observadas.length,
            porRevisar: porRevisar.length
          });
        } catch (error) {
          console.error("Error al obtener las constancias", error);
        }
      }
    };

    const fetchJefeProyectoSolicitudesPorAprobar = async () => {

      if (session?.user?.roles?.includes('JefeProyecto')) {
        const jefeProyectoId = session.user.empleadoId;
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/solicitud-viaticos/proyecto/${jefeProyectoId}`);
          const observadas = response.data.filter(constancia => constancia.EstadoId === 14); 
          const porRevisar = response.data.filter(constancia => constancia.EstadoId === 12); 
          setJefeProyectoSolicitudesCount({
            observadas: observadas.length,
            porRevisar: porRevisar.length
          });
        } catch (error) {
          console.error("Error al obtener las solicitudes del Jefe de Proyecto por aprobar", error);
        }
      }
    };

    fetchSolicitudesPorAprobar();
    fetchContabilidadSolicitudesPorAprobar();
    fetchRendicionesCount();
    fetchConstanciasCount();
    fetchJefeProyectoSolicitudesPorAprobar();
  }, [session]);

  const handleToggleMenu = (menu) => {
    setShowMenu(showMenu === menu ? null : menu);
  };

  const allowedRoles = ["JefeDepartamento", "Direccion", "SuperAdmin"];
  const JefeProyectoRoles = ["JefeProyecto"];
  const contabilidadRoles = ["Administracion"];

  return (
    <>
      <div className="w-full flex flex-col md:flex-row justify-center gap-4 mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/inicio/gestion-viaticos/solicitar-viaticos"
          className="shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)] bg-white w-full md:w-2/5 h-14 rounded-md text-left flex items-center"
        >
          <span className="ml-5 text-lg text-zinc-600 font-semibold">Solicitar Nuevo Viático</span>
        </Link>

        <div className="relative w-full md:w-2/5 shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)] rounded-md">
          <button
            onClick={() => handleToggleMenu("misViaticos")}
            className="shadow-lg bg-white w-full h-14 rounded-md text-left flex justify-between items-center"
          >
            <span className="ml-5 text-lg text-zinc-600 font-semibold">Mis Viáticos</span>
          </button>
          {showMenu === "misViaticos" && (
            <div className="absolute left-0 top-14 mt-2 w-full bg-white shadow-lg ring-1 ring-white z-10">
              <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <Link
                  href="/inicio/gestion-viaticos/mis-viaticos/viaticos-denegados"
                  className="block px-4 py-2 bg-gray-100 text-sm text-gray-500 font-medium hover:bg-gray-300 border-b-2"
                  role="menuitem"
                >
                  Viáticos denegados
                </Link>
                <Link
                  href="/inicio/gestion-viaticos/mis-viaticos/viaticos-procesos"
                  className="flex px-4 py-2 bg-gray-100 text-sm text-gray-500 font-medium hover:bg-gray-300 justify-between"
                  role="menuitem"
                >
                  Viáticos en proceso
                  {solicitudesCount > 0 && <div className="w-2 h-2 rounded-full bg-red-700 mt-1"></div>}
                </Link>
              </div>
            </div>
          )}
        </div>

        {session?.user?.roles?.some((role) => allowedRoles.includes(role)) && (
          <div className="relative w-full md:w-2/5 shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)] rounded-md">
            <button
              onClick={() => handleToggleMenu("aprobaciones")}
              className="shadow-lg bg-white w-full h-14 rounded-md text-left flex justify-between items-center"
            >
              <span className="ml-5 text-lg text-zinc-600 font-semibold">Aprobaciones</span>
              <span className="rounded-full bg-red-800 text-xs text-white w-5 h-5 flex items-center justify-center mr-5">
                {solicitudesCount}
              </span>
            </button>
            {showMenu === "aprobaciones" && (
              <div className="absolute left-0 top-14 mt-2 w-full bg-white shadow-lg ring-1 ring-white z-10">
                <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <Link
                    href="/inicio/gestion-viaticos/jefe/viaticos-rechazados"
                    className="block px-4 py-2 bg-gray-100 text-sm text-gray-500 font-medium hover:bg-gray-300 border-b-2"
                    role="menuitem"
                  >
                    Viáticos Rechazados
                  </Link>
                  <Link
                    href="/inicio/gestion-viaticos/jefe/viaticos-aprobados"
                    className="block px-4 py-2 bg-gray-100 text-sm text-gray-500 font-medium hover:bg-gray-300 border-b-2"
                    role="menuitem"
                  >
                    Viáticos aprobados
                  </Link>
                  <Link
                    href="/inicio/gestion-viaticos/jefe/viaticos-por-aprobar"
                    className="block px-4 py-2 bg-gray-100 text-sm text-gray-500 font-medium hover:bg-gray-300 border-b-2"
                    role="menuitem"
                  >
                    Viáticos por aprobar
                    {solicitudesCount > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-700 mt-1"></div>
                    )}
                  </Link>
                  <Link
                    href="/inicio/gestion-viaticos/jefe/rendiciones-por-aprobar"
                    className="flex px-4 py-2 bg-gray-100 text-sm text-gray-500 font-medium hover:bg-gray-300 justify-between"
                    role="menuitem"
                  >
                    Rendiciones por aprobar
                    {solicitudesCount > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-700 mt-1"></div>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {session?.user?.roles?.some((role) => JefeProyectoRoles.includes(role)) && (
          <div className="relative w-full md:w-2/5 shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)] rounded-md">
            <button
              onClick={() => handleToggleMenu("aprobacionesJP")}
              className="shadow-lg bg-white w-full h-14 rounded-md text-left flex justify-between items-center"
            >
              <span className="ml-5 text-lg text-zinc-600 font-semibold">Aprobaciones JP</span>
              <span className="rounded-full bg-red-800 text-xs text-white w-5 h-5 flex items-center justify-center mr-5">
                {jefeProyectoSolicitudesCount.observadas + jefeProyectoSolicitudesCount.porRevisar}
              </span>
            </button>
            {showMenu === "aprobacionesJP" && (
              <div className="absolute left-0 top-14 mt-2 w-full bg-white shadow-lg ring-1 ring-white z-10">
                <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <Link
                    href="/inicio/gestion-viaticos/jefe-proyecto/viaticos-rechazados-jp"
                    className="flex px-4 py-2 bg-gray-100 text-sm text-gray-500 font-medium hover:bg-gray-300 justify-between"
                    role="menuitem"
                  >
                    Viáticos Rechazados
                  </Link>
                  <Link
                    href="/inicio/gestion-viaticos/jefe/viaticos-aprobados"
                    className="flex px-4 py-2 bg-gray-100 text-sm text-gray-500 font-medium hover:bg-gray-300 justify-between"
                    role="menuitem"
                  >
                    Viáticos aprobados
                  </Link>
                  <Link
                    href="/inicio/gestion-viaticos/jefe-proyecto/viaticos-por-aprobar-jp"
                    className="flex px-4 py-2 bg-gray-100 text-sm text-gray-500 font-medium hover:bg-gray-300 justify-between"
                    role="menuitem"
                  >
                    Viáticos por aprobar
                    {jefeProyectoSolicitudesCount.porRevisar > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-700 mt-1"></div>
                    )}
                  </Link>
                  
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full flex flex-wrap justify-center gap-4 mt-16 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {session?.user?.roles?.some((role) => contabilidadRoles.includes(role)) && (
          <div className="relative w-full sm:w-2/3 md:w-1/4 lg:w-1/5">
            <button
              onClick={() => handleToggleMenu("registroPagos")}
              className="shadow-lg bg-white w-full h-14 rounded-md text-left flex justify-between items-center"
            >
              <span className="ml-5 text-sm text-zinc-600 font-semibold">
                Registro de pagos
              </span>
              {contabilidadSolicitudesCount.pagos > 0 && (
                <span className="rounded-full bg-red-800 text-xs text-white w-5 h-5 flex items-center justify-center mr-5">
                  {contabilidadSolicitudesCount.pagos}
                </span>
              )}
            </button>
            {showMenu === "registroPagos" && (
              <div className="absolute left-0 top-14 mt-2 w-full bg-white shadow-lg ring-1 ring-white z-10">
                <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <Link
                    href="/inicio/gestion-viaticos/contabilidad/registro-pagos"
                    className="flex px-4 py-2 bg-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-300 justify-between"
                    role="menuitem"
                  >
                    Registro de pagos de viaticos
                    {contabilidadSolicitudesCount.pagos > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-700 mt-1"></div>
                    )}
                  </Link>
                  <Link
                    href="/inicio/gestion-viaticos/contabilidad/registro-devolucion-pagos"
                    className="flex px-4 py-2 bg-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-300 justify-between"
                    role="menuitem"
                  >
                    Registro de devolución de pagos
                    {contabilidadSolicitudesCount.devoluciones > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-700 mt-1"></div>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {session?.user?.roles?.some((role) => contabilidadRoles.includes(role)) && (
          <div className="relative w-full sm:w-2/3 md:w-1/4 lg:w-1/5">
            <button
              onClick={() => handleToggleMenu("revisionRendiciones")}
              className="shadow-lg bg-white w-full h-14 rounded-md text-left flex justify-between items-center"
            >
              <span className="ml-5 text-sm text-zinc-600 font-semibold">
                Revisión de rendiciones
              </span>
              {(rendicionesCount.observadas > 0 || rendicionesCount.porRevisar > 0) && (
                <span className="rounded-full bg-red-800 text-xs text-white w-5 h-5 flex items-center justify-center mr-5">
                  {rendicionesCount.observadas + rendicionesCount.porRevisar}
                </span>
              )}
            </button>

            {showMenu === "revisionRendiciones" && (
              <div className="absolute left-0 top-14 mt-2 w-full bg-white shadow-lg ring-1 ring-white z-10">
                <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <Link
                    href="/inicio/gestion-viaticos/contabilidad/rendiciones-observadas"
                    className="flex px-4 py-2 bg-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-300 justify-between"
                    role="menuitem"
                  >
                    Rendiciones observadas
                    {rendicionesCount.observadas > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-700 mt-1"></div>
                    )}
                  </Link>
                  <Link
                    href="/inicio/gestion-viaticos/contabilidad/revision-rendicion"
                    className="flex px-4 py-2 bg-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-300 justify-between"
                    role="menuitem"
                  >
                    Rendiciones por revisar
                    {rendicionesCount.porRevisar > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-700 mt-1"></div>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {session?.user?.roles?.some((role) => contabilidadRoles.includes(role)) && (
          <div className="relative w-full sm:w-2/3 md:w-1/4 lg:w-1/4">
            <button
              onClick={() => handleToggleMenu("revisionConstancias")}
              className="shadow-lg bg-white w-full h-14 rounded-md text-left flex justify-between items-center"
            >
              <span className="ml-5 text-sm text-zinc-600 font-semibold">
                Revisión de constancias de saldos
              </span>
              {(constanciasCount.observadas > 0 || constanciasCount.porRevisar > 0) && (
                <span className="rounded-full bg-red-800 text-xs text-white w-5 h-5 flex items-center justify-center mr-5">
                  {constanciasCount.observadas + constanciasCount.porRevisar}
                </span>
              )}
            </button>
            {showMenu === "revisionConstancias" && (
              <div className="absolute left-0 top-14 mt-2 w-full bg-white shadow-lg ring-1 ring-white z-10">
                <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <Link
                    href="/inicio/gestion-viaticos/contabilidad/constancias-observadas"
                    className="flex px-4 py-2 bg-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-300 justify-between"
                    role="menuitem"
                  >
                    Constancia observadas
                    {constanciasCount.observadas > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-700 mt-1"></div>
                    )}
                  </Link>
                  <Link
                    href="/inicio/gestion-viaticos/contabilidad/constancias-por-revisar"
                    className="flex px-4 py-2 bg-gray-100 text-xs text-gray-500 font-medium hover:bg-gray-300 justify-between"
                    role="menuitem"
                  >
                    Constancia por revisar
                    {constanciasCount.porRevisar > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-700 mt-1"></div>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {session?.user?.roles?.some((role) => contabilidadRoles.includes(role)) && (
          <div className="relative w-full sm:w-2/3 md:w-1/4 lg:w-1/5">
            <Link
              href="/inicio/gestion-viaticos/contabilidad/historial-viaticos"
              className="shadow-lg bg-white w-full h-14 rounded-md text-left flex justify-between items-center"
            >
              <span className="ml-5 text-sm text-zinc-600 font-semibold">Histórico de viáticos</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default ViaticosMenu;
