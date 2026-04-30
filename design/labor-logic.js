// Local mock of /api/labor — implements the standard Moroccan labor compensation
// formulas referenced by the source React page. Pure UI prototype helper.

(function () {
  function diffYearsMonthsDays(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    let years = e.getFullYear() - s.getFullYear();
    let months = e.getMonth() - s.getMonth();
    let days = e.getDate() - s.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(e.getFullYear(), e.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalDays = Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
    const totalYears = totalDays / 365.25;
    return { years, months, days, totalDays, totalYears };
  }

  function calcPrejudice(monthlySalary, completedYears) {
    const months = completedYears * 1.5;
    const capped = months > 36;
    const monthsUsed = capped ? 36 : months;
    const result = monthsUsed * monthlySalary;
    return { result, monthlySalary, completedYears, months, capped, monthsUsed };
  }

  function calcPreavis(monthlySalary, completedYears, category) {
    // Standard notice periods (days) by completed years and category.
    // cadre = 1mo / 2mo / 3mo, employe/ouvrier scaled similarly.
    let noticeDays;
    if (completedYears < 1) noticeDays = category === "cadre" ? 30 : 8;
    else if (completedYears < 5) noticeDays = category === "cadre" ? 60 : 30;
    else noticeDays = category === "cadre" ? 90 : 60;
    const months = noticeDays / 30;
    const indemnity = months * monthlySalary;
    return { indemnity, monthlySalary, noticeDays, completedYears };
  }

  function calcIndemnite(monthlySalary, completedYears) {
    const hourlyWage = monthlySalary / 191;
    const y15 = Math.min(5, completedYears);
    const y610 = Math.max(0, Math.min(5, completedYears - 5));
    const y1115 = Math.max(0, Math.min(5, completedYears - 10));
    const y15p = Math.max(0, completedYears - 15);
    const h15 = y15 * 96;
    const h610 = y610 * 144;
    const h1115 = y1115 * 192;
    const h15p = y15p * 240;
    const totalHours = h15 + h610 + h1115 + h15p;
    const indemnity = totalHours * hourlyWage;
    return {
      indemnity,
      hourlyWage,
      totalHours,
      brackets: {
        years_1_5: y15, hours_1_5: h15,
        years_6_10: y610, hours_6_10: h610,
        years_11_15: y1115, hours_11_15: h1115,
        years_15plus: y15p, hours_15plus: h15p,
      },
    };
  }

  function calcConges(monthlySalary, completedYears, isMinor) {
    const dailyRate = monthlySalary / 26;
    const baseDaysPerYear = isMinor ? 2 : 1.5;
    const baseYears = completedYears;
    const extraYears = Math.floor(completedYears / 5);
    const extraDays = extraYears * 1.5;
    const baseDays = baseYears * baseDaysPerYear;
    const brackets = [
      { label: "العطلة الأساسية", years: baseYears, daysPerYear: baseDaysPerYear, days: baseDays },
    ];
    if (extraYears > 0) {
      brackets.push({ label: "أيام إضافية (لكل 5 سنوات)", years: extraYears, daysPerYear: 1.5, days: extraDays });
    }
    const totalDays = baseDays + extraDays;
    const indemnityFull = totalDays * dailyRate;
    return { indemnityFull, dailyRate, totalDays, brackets };
  }

  function calcPrime(monthlySalary, completedYears) {
    const annualSalary = monthlySalary * 12;
    const phaseDefs = [
      { phaseNumber: 1, start: 2, end: 5, rate: 0.05 },
      { phaseNumber: 2, start: 5, end: 12, rate: 0.10 },
      { phaseNumber: 3, start: 12, end: 20, rate: 0.15 },
      { phaseNumber: 4, start: 20, end: 25, rate: 0.20 },
      { phaseNumber: 5, start: 25, end: Infinity, rate: 0.25 },
    ];
    const phases = [];
    let prevBonus = 0;
    for (let i = 0; i < phaseDefs.length; i++) {
      const def = phaseDefs[i];
      const yearsInPhase = Math.max(0, Math.min(completedYears, def.end) - def.start);
      if (yearsInPhase <= 0 && completedYears < def.start) break;
      const phaseBase = i === 0 ? annualSalary : annualSalary + prevBonus;
      const phaseBonus = phaseBase * def.rate;
      const phaseContribution = phaseBonus * yearsInPhase;
      phases.push({
        phaseNumber: def.phaseNumber,
        start: def.start,
        end: def.end,
        rate: def.rate,
        yearsInPhase,
        phaseBase,
        phaseBonus,
        phaseContribution,
      });
      prevBonus = phaseBonus;
      if (yearsInPhase === 0) break;
    }
    const totalAccumulated = phases.reduce((s, p) => s + p.phaseContribution, 0);
    const lastPhase = phases[phases.length - 1];
    const currentRate = lastPhase ? lastPhase.rate : 0;
    const currentMonthlyBonus = (monthlySalary * currentRate);
    const currentAnnualBonus = currentMonthlyBonus * 12;
    return { totalAccumulated, phases, currentMonthlyBonus, currentAnnualBonus, annualSalary };
  }

  window.computeLabor = function (input) {
    const { monthlySalary, startDate, endDate, category, isMinor, selected } = input;
    const diff = diffYearsMonthsDays(startDate, endDate);
    const completedYears = diff.years;
    const results = {};
    if (selected.includes("prejudice")) results.prejudice = calcPrejudice(monthlySalary, completedYears);
    if (selected.includes("preavis")) results.preavis = Object.assign(calcPreavis(monthlySalary, completedYears, category), { completedYears });
    if (selected.includes("indemnite")) results.indemnite = Object.assign(calcIndemnite(monthlySalary, completedYears), { completedYears });
    if (selected.includes("conges")) results.conges = Object.assign(calcConges(monthlySalary, completedYears, isMinor), { completedYears });
    if (selected.includes("prime")) results.prime = Object.assign(calcPrime(monthlySalary, completedYears), { completedYears });
    return { results, completedYears, diff };
  };
})();
