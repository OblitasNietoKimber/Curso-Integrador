import type { IconName } from '../../components/caja/OperationsVisuals';
export const adminSections: {slug: string; label: string; icon: IconName; description: string}[] = [
 {slug:'',label:'Dashboard',icon:'home',description:'Resumen de ventas, pedidos y desempeño de tu restaurante.'},
 {slug:'productos',label:'Productos',icon:'box',description:'Administra productos, precios y disponibilidad del menú.'},
 {slug:'promociones',label:'Promociones',icon:'tag',description:'Crea y edita las promociones que aparecen en la carta.'},
 {slug:'clientes',label:'Clientes',icon:'users',description:'Conoce y administra los perfiles de tus clientes.'},
 {slug:'usuarios',label:'Usuarios',icon:'user',description:'Administra las cuentas y los roles de tu equipo.'},
 {slug:'pedidos',label:'Pedidos',icon:'receipt',description:'Supervisa los pedidos registrados por Caja.'},
 {slug:'reportes',label:'Reportes',icon:'chart',description:'Convierte tus datos en decisiones para hacer crecer el negocio.'},
 {slug:'configuracion',label:'Configuración',icon:'settings',description:'Administra los datos y reglas de tu negocio.'},
];
export const adminPath=(slug:string)=>'/admin'+(slug?'/'+slug:'');
