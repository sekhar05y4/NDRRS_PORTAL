/**
 * NDRRS AI Intelligence Service
 * Provides severity indexing, routing optimization, and ETA predictions.
 */

function predictSeverityScore(details) {
    if (!details) return 0.5;
    const txt = details.toLowerCase();
    
    // Critical tags
    if (txt.includes('drowning') || txt.includes('trapped') || txt.includes('unconscious') || txt.includes('cardiac') || txt.includes('bleeding')) {
        return parseFloat((0.85 + Math.random() * 0.13).toFixed(2));
    }
    // High tags
    if (txt.includes('flood') || txt.includes('fire') || txt.includes('broken') || txt.includes('injury')) {
        return parseFloat((0.65 + Math.random() * 0.18).toFixed(2));
    }
    // Medium tags
    if (txt.includes('food') || txt.includes('water') || txt.includes('blanket')) {
        return parseFloat((0.35 + Math.random() * 0.25).toFixed(2));
    }
    return 0.5;
}

function predictETA(distMeters, teamType) {
    if (distMeters < 50) return 'Arrived';
    
    // Speed estimation in m/s
    const speeds = {
        'Vehicle': 12.0,      // ~45 km/h
        'Boat': 5.0,          // ~18 km/h
        'Foot Patrol': 1.5,   // ~5 km/h
        'Helicopter': 35.0    // ~125 km/h
    };
    
    const speed = speeds[teamType] || 10.0;
    const durationSeconds = distMeters / speed;
    const minutes = Math.max(1, Math.round(durationSeconds / 60));
    
    return `${minutes} mins`;
}

function recommendRescueTeam(distressLat, distressLon, teams) {
    let bestTeam = null;
    let minScore = Infinity;
    
    teams.forEach(t => {
        if (t.status !== 'Idle') return;
        
        // Simple distance calculation
        const dx = t.lat - distressLat;
        const dy = t.lon - distressLon;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Adjust score depending on capability (e.g. helicopters are faster but consume battery)
        let weight = 1.0;
        if (t.type === 'Helicopter') weight = 0.5;
        if (t.type === 'Foot Patrol') weight = 1.8;
        
        const score = dist * weight;
        if (score < minScore) {
            minScore = score;
            bestTeam = t.id;
        }
    });
    
    return bestTeam;
}

module.exports = {
    predictSeverityScore,
    predictETA,
    recommendRescueTeam
};
