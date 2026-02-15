
"use client";

import React from 'react';
import { Plus } from 'lucide-react';

interface MenuRowProps {
    variety: {
        id: string;
        name: string;
        price: number;
        available: boolean;
    };
    onAdd: (quantity: number) => void;
}

export const MenuRow = ({ variety, onAdd }: MenuRowProps) => {
    return (
        <div className={`p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md ${!variety.available ? 'opacity-50 grayscale pointer-events-none' : ''}`}>

            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{variety.name}</h3>
                <p className="text-sm text-gray-500 font-medium">${variety.price} / docena</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                    onClick={() => onAdd(6)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium rounded-lg transition-colors active:scale-95"
                    disabled={!variety.available}
                >
                    <Plus size={16} /> ½ Doz.
                </button>

                <button
                    onClick={() => onAdd(12)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm shadow-red-200 transition-colors active:scale-95"
                    disabled={!variety.available}
                >
                    <Plus size={16} /> 1 Doz.
                </button>
            </div>
        </div>
    );
};
