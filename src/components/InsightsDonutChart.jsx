import React, { useState } from 'react';

/**
 * Clean Editorial SVG Donut Chart for Network Composition
 * Uses exact SVG stroke-dasharray calculations with custom editorial hover tooltips.
 */
export default function InsightsDonutChart({ groupStats = [] }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  if (!groupStats || groupStats.length === 0) return null;

  const R = 40;
  const C = 2 * Math.PI * R; // ~251.327

  const totalCount = groupStats.reduce((acc, curr) => acc + curr.count, 0);

  let runningOffset = 0;
  const slices = groupStats.map((item) => {
    const fraction = totalCount > 0 ? item.count / totalCount : 0;
    const sliceLength = fraction * C;
    const offset = runningOffset;
    runningOffset += sliceLength;

    return {
      ...item,
      fraction,
      sliceLength,
      offset
    };
  });

  return (
    <div className="insights-donut-container">
      <div className="insights-donut-graphic">
        <svg viewBox="0 0 120 120" className="insights-donut-svg">
          {slices.map((slice) => {
            const isHovered = hoveredSlice?.category === slice.category;
            return (
              <circle
                key={slice.category}
                cx="60"
                cy="60"
                r={R}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? '18' : '14'}
                strokeDasharray={`${slice.sliceLength} ${C - slice.sliceLength}`}
                strokeDashoffset={-slice.offset}
                transform="rotate(-90 60 60)"
                style={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  opacity: hoveredSlice && !isHovered ? 0.6 : 1
                }}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}
          {/* Donut Center Display */}
          <text x="60" y="56" textAnchor="middle" className="donut-center-num mono-font">
            {hoveredSlice ? hoveredSlice.count : totalCount}
          </text>
          <text x="60" y="70" textAnchor="middle" className="donut-center-label mono-font">
            {hoveredSlice ? hoveredSlice.category.toUpperCase() : 'CONTACTS'}
          </text>
        </svg>
      </div>

      {/* Editorial Legend */}
      <div className="insights-donut-legend">
        {slices.map((slice) => {
          const isHovered = hoveredSlice?.category === slice.category;
          return (
            <div
              key={slice.category}
              className={`legend-item-row ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredSlice(slice)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <span className="legend-swatch" style={{ backgroundColor: slice.color }} />
              <span className="legend-name">{slice.category}</span>
              <span className="legend-count mono-font">{slice.count}</span>
              <span className="legend-pct mono-font">{slice.percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
