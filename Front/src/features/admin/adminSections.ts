import type { IconName } from "../../components/Icon";
export const adminSections: {
  slug: string;
  label: string;
  icon: IconName;
  description: string;
}[] = [
  { slug: "", label: "Dashboard", icon: "home", description: "Resumen general de la operación del negocio." },
  { slug: "productos", label: "Productos", icon: "receipt", description: "Administra el catálogo de productos de la carta." },
  { slug: "promociones", label: "Promociones", icon: "heart", description: "Crea y gestiona las promociones de temporada." },
  { slug: "clientes", label: "Clientes", icon: "user", description: "Consulta y administra los clientes registrados." },
  { slug: "usuarios", label: "Usuarios", icon: "lock", description: "Gestiona el personal y sus roles de acceso." },
  { slug: "inventario", label: "Inventario", icon: "pin", description: "Controla el stock de los productos." },
  { slug: "reportes", label: "Reportes", icon: "card", description: "Revisa ventas y estadísticas del negocio." },
  { slug: "configuracion", label: "Configuración", icon: "bell", description: "Ajusta los datos y parámetros del negocio." },
  { slug: "cerrar-sesion", label: "Cerrar sesión", icon: "logout", description: "Salir del panel de administración." },
];
export const adminPath = (slug: string) => `/admin${slug ? `/${slug}` : ""}`;