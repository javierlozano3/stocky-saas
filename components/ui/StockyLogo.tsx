
import React from 'react';

export const StockyLogo = ({ className = "", size = 32 }: { className?: string, size?: number }) => {
    // Proporciones basadas en el grid 32x32
    // Left col width: ~10px. Right col width: ~10px. Gap: 4px.
    // Total dim: ~24px wide.
    // Scales with 'size' prop.

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Left Column */}
            {/* Top Tall */}
            <rect x="4" y="2" width="10" height="16" rx="3" stroke="#DC2626" strokeWidth="3" />
            {/* Bottom Short */}
            <rect x="4" y="22" width="10" height="8" rx="2" stroke="#DC2626" strokeWidth="3" />

            {/* Right Column */}
            {/* Top Short */}
            <rect x="18" y="2" width="10" height="8" rx="2" stroke="#DC2626" strokeWidth="3" />
            {/* Bottom Tall */}
            <rect x="18" y="14" width="10" height="16" rx="3" stroke="#DC2626" strokeWidth="3" />
        </svg>
    );
};
