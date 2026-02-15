// types/index.ts

export interface Variety {
    id: string;
    nombre: string;     // Cambiado de 'name' para coincidir con tu Firebase
    precio: number;     // Cambiado de 'priceDozen' para coincidir con tu Firebase
    precioMedia?: number; // Para la lógica de ClientPage
    stock: number;
    disponible: boolean; // Cambiado de 'available'
    categoria: string;   // Cambiado de 'category'
}

export interface OrderItem {
    id: string;         // Usamos 'id' en lugar de 'varietyId'
    nombre: string;     // Usamos 'nombre' en lugar de 'name'
    cantidad: number;   // Usamos 'cantidad' en lugar de 'quantity'
    precio?: number;      // Propiedad opcional para cálculos
    precioMedia?: number; // Propiedad opcional para cálculos
}

export interface Order {
    id: string;
    codigo: string;     // Campo 'codigo' que usas en el admin
    cliente: string;    // Cambiado de 'customerName'
    telefono: string;   // Cambiado de 'customerPhone'
    items: OrderItem[];
    total: number;
    estado: 'Pendiente' | 'PAGADO EFECTIVO' | 'PAGADO TRANSF' | 'CANCELADO';
    createdAt: unknown;
    motivoAudit?: string;
}

export type CartItem = OrderItem;