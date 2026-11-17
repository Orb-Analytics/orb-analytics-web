// Shared ROI math for the history "ROI %" tile and the landing FAQ.
// ROI % = (sum of units / graded picks) * 100, where graded picks are
// wins + losses (pushes stay in the units total and out of the count).
// This is the same formula the history summary tile has always used.
(function (global) {
  function computeSummary(picks) {
    const list = Array.isArray(picks) ? picks : [];
    const wins = list.filter(p => p.result === 'Win').length;
    const losses = list.filter(p => p.result === 'Loss').length;
    const total_picks = wins + losses;
    const win_rate = total_picks ? ((wins / total_picks) * 100).toFixed(1) : '0.0';
    const total_units = parseFloat(list.reduce((a, b) => a + (b.units || 0), 0).toFixed(2));
    return { wins, losses, win_rate, total_units, total_picks };
  }

  // null when there is nothing graded, so callers can keep a fallback
  // instead of printing 0% or NaN.
  function roiFromSummary(summary) {
    if (!summary || !summary.total_picks) return null;
    const roi = (summary.total_units / summary.total_picks) * 100;
    return Number.isFinite(roi) ? roi : null;
  }

  function formatRoi(roi) {
    if (roi == null || !Number.isFinite(roi)) return null;
    return (roi >= 0 ? '+' : '') + roi.toFixed(2) + '%';
  }

  global.OrbModelRoi = { computeSummary, roiFromSummary, formatRoi };
})(window);
