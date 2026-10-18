/**
 * Dynamic Analytics & Calculation Engine for People Atlas Insights
 * All metrics, percentages, and observations are dynamically calculated
 * from the user's localStorage contact records.
 */

const CATEGORY_COLORS = {
  College: '#7A3E2B',  // Terracotta
  Work: '#263F3A',     // Forest Green
  Family: '#3B4B59',   // Slate Blue
  Personal: '#9E6B38', // Warm Ochre
  Other: '#5C5549'     // Muted Ink
};

/**
 * Calculates category/group distribution with percentages and editorial colors.
 */
export function getGroupStats(contacts = []) {
  if (!contacts || contacts.length === 0) return [];
  const total = contacts.length;
  const counts = {};

  contacts.forEach((c) => {
    const raw = c.category && c.category.trim() ? c.category.trim() : 'Other';
    const key = raw.toLowerCase();
    if (!counts[key]) {
      counts[key] = { label: raw, count: 0 };
    }
    counts[key].count++;
  });

  return Object.values(counts)
    .map(({ label, count }) => ({
      category: label,
      count,
      percentage: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[label] || CATEGORY_COLORS[Object.keys(CATEGORY_COLORS).find((k) => k.toLowerCase() === label.toLowerCase())] || '#5C5549'
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculates top locations by contact count.
 */
export function getPlaceStats(contacts = []) {
  if (!contacts || contacts.length === 0) return { topPlaces: [], totalPlaces: 0 };
  
  const counts = {};
  contacts.forEach((c) => {
    const raw = (c.location && c.location.trim()) ? c.location.trim() : 'Unspecified';
    const key = raw.toLowerCase();
    if (!counts[key]) {
      counts[key] = { label: raw, count: 0 };
    }
    counts[key].count++;
  });

  const allPlaces = Object.values(counts)
    .map(({ label, count }) => ({
      location: label,
      count,
      percentage: Math.round((count / contacts.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const totalPlaces = Object.keys(counts).filter((l) => l !== 'unspecified').length;
  const topPlaces = allPlaces.slice(0, 6);

  return { topPlaces, totalPlaces };
}

/**
 * Calculates relationship distribution, ignoring empty values.
 */
export function getRelationshipStats(contacts = []) {
  if (!contacts || contacts.length === 0) return [];
  
  const counts = {};
  let totalWithRelationship = 0;

  contacts.forEach((c) => {
    const rel = c.relationship && c.relationship.trim();
    if (rel) {
      const key = rel.toLowerCase();
      if (!counts[key]) {
        counts[key] = { label: rel, count: 0 };
      }
      counts[key].count++;
      totalWithRelationship++;
    }
  });

  if (totalWithRelationship === 0) return [];

  return Object.values(counts)
    .map(({ label, count }) => ({
      relationship: label,
      count,
      percentage: Math.round((count / totalWithRelationship) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);
}

/**
 * Calculates close contact statistics.
 */
export function getCloseContactStats(contacts = []) {
  if (!contacts || contacts.length === 0) {
    return { total: 0, closeCount: 0, closePercentage: 0 };
  }
  const total = contacts.length;
  const closeCount = contacts.filter((c) => Boolean(c.favorite)).length;
  const closePercentage = Math.round((closeCount / total) * 100);

  return { total, closeCount, closePercentage };
}

/**
 * Calculates completeness percentage for each contact field.
 */
export function getDataCompleteness(contacts = []) {
  if (!contacts || contacts.length === 0) return [];

  const total = contacts.length;
  let phone = 0, email = 0, location = 0, org = 0, relationship = 0, notes = 0;

  contacts.forEach((c) => {
    if (c.phone && c.phone.trim()) phone++;
    if (c.email && c.email.trim()) email++;
    if (c.location && c.location.trim()) location++;
    if (c.organization && c.organization.trim()) org++;
    if (c.relationship && c.relationship.trim()) relationship++;
    if (c.notes && c.notes.trim()) notes++;
  });

  return [
    { field: 'PHONE', count: phone, percentage: Math.round((phone / total) * 100) },
    { field: 'EMAIL', count: email, percentage: Math.round((email / total) * 100) },
    { field: 'LOCATION', count: location, percentage: Math.round((location / total) * 100) },
    { field: 'ORGANIZATION', count: org, percentage: Math.round((org / total) * 100) },
    { field: 'RELATIONSHIP', count: relationship, percentage: Math.round((relationship / total) * 100) },
    { field: 'NOTES', count: notes, percentage: Math.round((notes / total) * 100) }
  ];
}

/**
 * Generates 3-5 dynamic, deterministic observations from contact data.
 */
export function generateInsights(contacts = []) {
  if (!contacts || contacts.length === 0) return [];

  const insights = [];
  const groupStats = getGroupStats(contacts);
  const { topPlaces, totalPlaces } = getPlaceStats(contacts);
  const closeStats = getCloseContactStats(contacts);
  const completeness = getDataCompleteness(contacts);

  // 1. Group / Category Concentration Observation
  if (groupStats.length > 0) {
    const topGroup = groupStats[0];
    if (topGroup.percentage >= 40) {
      insights.push(`Most of your network is concentrated in ${topGroup.category}, representing ${topGroup.percentage}% of all contacts.`);
    } else {
      insights.push(`${topGroup.category} is your largest network group, representing ${topGroup.percentage}% of your contacts.`);
    }
  }

  // 2. Top Location Observation
  if (topPlaces.length > 0 && topPlaces[0].location !== 'Unspecified') {
    const topLoc = topPlaces[0];
    if (topLoc.percentage >= 30) {
      insights.push(`Your network is strongly concentrated around ${topLoc.location} with ${topLoc.count} contacts (${topLoc.percentage}%).`);
    } else {
      insights.push(`${topLoc.location} has the highest number of contacts with ${topLoc.count} people.`);
    }
  }

  // 3. Geographic Spread
  if (totalPlaces > 1) {
    insights.push(`Your network spans across ${totalPlaces} different places.`);
  }

  // 4. Close Circle Ratio
  if (closeStats.closePercentage >= 50) {
    insights.push(`More than half of your network (${closeStats.closePercentage}%) is marked as close.`);
  } else if (closeStats.closePercentage <= 20 && closeStats.closePercentage > 0) {
    insights.push(`Your close circle represents a tight ${closeStats.closePercentage}% of your total network (${closeStats.closeCount} people).`);
  } else {
    insights.push(`${closeStats.closePercentage}% of your contacts are marked as people you keep close.`);
  }

  // 5. Data Health Observation
  const phoneComp = completeness.find(c => c.field === 'PHONE')?.percentage || 0;
  const emailComp = completeness.find(c => c.field === 'EMAIL')?.percentage || 0;
  const notesComp = completeness.find(c => c.field === 'NOTES')?.percentage || 0;

  if (emailComp < phoneComp) {
    insights.push(`Your contact records contain more phone numbers (${phoneComp}%) than email addresses (${emailComp}%).`);
  } else if (notesComp < 50) {
    insights.push(`Many contact records could benefit from additional field notes (${100 - notesComp}% currently empty).`);
  } else {
    insights.push(`Your network records have excellent information completeness across phone and email fields.`);
  }

  return insights.slice(0, 5);
}

/**
 * Calculates network balance ratings.
 */
export function getNetworkBalance(contacts = []) {
  if (!contacts || contacts.length === 0) {
    return {
      groupDiversity: 'NONE',
      placeDiversity: 'NONE',
      closeCircle: '0%',
      dataCompleteness: 'NONE'
    };
  }

  const groupStats = getGroupStats(contacts);
  const { totalPlaces } = getPlaceStats(contacts);
  const closeStats = getCloseContactStats(contacts);
  const completeness = getDataCompleteness(contacts);

  // Group Diversity rating
  const groupCount = groupStats.length;
  const groupDiversity = groupCount >= 4 ? 'HIGH' : groupCount >= 2 ? 'MODERATE' : 'CONCENTRATED';

  // Place Diversity rating
  const placeDiversity = totalPlaces >= 10 ? 'HIGH' : totalPlaces >= 5 ? 'MODERATE' : 'CONCENTRATED';

  // Average Data Completeness
  const avgComp = Math.round(completeness.reduce((acc, curr) => acc + curr.percentage, 0) / completeness.length);
  const dataCompleteness = avgComp >= 80 ? 'EXCELLENT' : avgComp >= 60 ? 'GOOD' : 'PARTIAL';

  return {
    groupDiversity,
    placeDiversity,
    closeCircle: `${closeStats.closePercentage}%`,
    dataCompleteness
  };
}
