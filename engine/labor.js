/**
 * labor.js
 * Labor dispute compensation engine.
 *
 * Legal source: Moroccan Labor Code (Law 65.99)
 */

const MONTHLY_HOURS = 191;
const MAX_DI_MONTHS = 36;

const PREAVIS_RULES = {
  cadre: [
    { maxYears: 1,        days: 30 },
    { maxYears: 5,        days: 60 },
    { maxYears: Infinity, days: 90 }
  ],
  employe: [
    { maxYears: 1,        days: 8  },
    { maxYears: 5,        days: 30 },
    { maxYears: Infinity, days: 60 }
  ],
  ouvrier: [
    { maxYears: 1,        days: 8  },
    { maxYears: 5,        days: 30 },
    { maxYears: Infinity, days: 60 }
  ]
};

const PRIME_PHASES = [
  { phaseNumber: 1, start: 3,  end: 5,        rate: 0.05 },
  { phaseNumber: 2, start: 6,  end: 12,       rate: 0.10 },
  { phaseNumber: 3, start: 13, end: 20,       rate: 0.15 },
  { phaseNumber: 4, start: 21, end: 25,       rate: 0.20 },
  { phaseNumber: 5, start: 26, end: Infinity, rate: 0.25 }
];

function validatePositiveNumber(value, errorCode) {
  if (typeof value !== "number" || isNaN(value) || value <= 0) throw new Error(errorCode);
}

function validateNonNegativeNumber(value, errorCode) {
  if (typeof value !== "number" || isNaN(value) || value < 0) throw new Error(errorCode);
}

function validateCategory(value) {
  if (!["cadre", "employe", "ouvrier"].includes(value)) throw new Error("INVALID_CATEGORY");
}

function normalizeCategory(category) {
  const normalized = String(category).trim().toLowerCase();
  validateCategory(normalized);
  return normalized;
}

function validateSalary(value) {
  validatePositiveNumber(value, "INVALID_SALARY");
}

function validateYears(value) {
  validateNonNegativeNumber(value, "INVALID_YEARS");
}

function normalizeYears(yearsOfService) {
  return Math.floor(yearsOfService);
}

function calcIndemnite(monthlySalary, yearsOfService) {
  monthlySalary = Number(monthlySalary);
  yearsOfService = Number(yearsOfService);
  validateSalary(monthlySalary);
  validateYears(yearsOfService);

  const years = normalizeYears(yearsOfService);
  const hourlyWage = monthlySalary / MONTHLY_HOURS;
  const years_1_5 = Math.min(years, 5);
  const years_6_10 = Math.max(0, Math.min(years - 5, 5));
  const years_11_15 = Math.max(0, Math.min(years - 10, 5));
  const years_15plus = Math.max(0, years - 15);

  const hours_1_5 = years_1_5 * 96;
  const hours_6_10 = years_6_10 * 144;
  const hours_11_15 = years_11_15 * 192;
  const hours_15plus = years_15plus * 240;
  const totalHours = hours_1_5 + hours_6_10 + hours_11_15 + hours_15plus;
  const indemnity = Math.floor(totalHours * hourlyWage);

  return {
    monthlySalary,
    completedYears: years,
    hourlyWage,
    brackets: {
      years_1_5,
      hours_1_5,
      years_6_10,
      hours_6_10,
      years_11_15,
      hours_11_15,
      years_15plus,
      hours_15plus
    },
    totalHours,
    indemnity,
    source: "المواد 52-55 — مدونة الشغل"
  };
}

function calcDommagesInterets(monthlySalary, yearsOfService) {
  monthlySalary = Number(monthlySalary);
  yearsOfService = Number(yearsOfService);
  validateSalary(monthlySalary);
  validateYears(yearsOfService);

  const years = normalizeYears(yearsOfService);
  const uncapped = monthlySalary * 1.5 * years;
  const cap = monthlySalary * MAX_DI_MONTHS;
  const capped = uncapped > cap;
  const result = Math.floor(Math.min(uncapped, cap));

  return {
    monthlySalary,
    completedYears: years,
    uncapped,
    cap,
    capped,
    result,
    source: "المادة 41 — مدونة الشغل"
  };
}

function calcPrejudice(monthlySalary, yearsOfService) {
  monthlySalary = Number(monthlySalary);
  yearsOfService = Number(yearsOfService);
  validateSalary(monthlySalary);
  validateYears(yearsOfService);

  const years = normalizeYears(yearsOfService);
  const months = years * 1.5;
  const capped = months > MAX_DI_MONTHS;
  const monthsUsed = Math.min(months, MAX_DI_MONTHS);
  const result = Math.floor(monthlySalary * monthsUsed);

  return {
    monthlySalary,
    completedYears: years,
    months,
    capped,
    monthsUsed,
    result,
    source: "المادة 41 — مدونة الشغل"
  };
}

function calcPreavis(monthlySalary, category, yearsOfService) {
  monthlySalary = Number(monthlySalary);
  yearsOfService = Number(yearsOfService);
  validateSalary(monthlySalary);
  validateYears(yearsOfService);

  const years = normalizeYears(yearsOfService);
  category = normalizeCategory(category);
  const rule = PREAVIS_RULES[category].find(function(entry) {
    return years < entry.maxYears;
  });
  const noticeDays = rule.days;
  const indemnity = Math.floor((monthlySalary / 30) * noticeDays);

  return {
    monthlySalary,
    category,
    completedYears: years,
    noticeDays,
    indemnity,
    source: "المادة 51 — مدونة الشغل + المرسوم 2-04-469"
  };
}

function daysForYear(year) {
  if (year <= 0) return 0;
  return Math.min(18 + Math.floor(year / 5) * 1.5, 30);
}

function calcCongesTotal(monthlySalary, yearsOfService) {
  monthlySalary = Number(monthlySalary);
  yearsOfService = Number(yearsOfService);
  validateSalary(monthlySalary);
  validateYears(yearsOfService);

  const years = normalizeYears(yearsOfService);
  const dailyRate = monthlySalary / 26;
  const brackets = [];

  const y1 = Math.min(years, 4);
  if (y1 > 0) brackets.push({ label: "السنوات 1-4", daysPerYear: 18, years: y1, days: y1 * 18 });

  const y2 = Math.max(0, Math.min(years - 4, 5));
  if (y2 > 0) brackets.push({ label: "السنوات 5-9", daysPerYear: 19.5, years: y2, days: y2 * 19.5 });

  const y3 = Math.max(0, Math.min(years - 9, 5));
  if (y3 > 0) brackets.push({ label: "السنوات 10-14", daysPerYear: 21, years: y3, days: y3 * 21 });

  const y4 = Math.max(0, Math.min(years - 14, 5));
  if (y4 > 0) brackets.push({ label: "السنوات 15-19", daysPerYear: 22.5, years: y4, days: y4 * 22.5 });

  const y5 = Math.max(0, Math.min(years - 19, 5));
  if (y5 > 0) brackets.push({ label: "السنوات 20-24", daysPerYear: 24, years: y5, days: y5 * 24 });

  const y6 = Math.max(0, Math.min(years - 24, 5));
  if (y6 > 0) brackets.push({ label: "السنوات 25-29", daysPerYear: 25.5, years: y6, days: y6 * 25.5 });

  const y7 = Math.max(0, years - 29);
  if (y7 > 0) brackets.push({ label: "السنوات 30+", daysPerYear: 27, years: y7, days: y7 * 27 });

  const totalDays = brackets.reduce(function(sum, bracket) {
    return sum + bracket.days;
  }, 0);
  const indemnityFull = Math.floor(totalDays * dailyRate);
  const lastBracketDays = brackets.length > 0 ? brackets[brackets.length - 1].daysPerYear : 18;
  const prescriptionDays = lastBracketDays * 2;
  const indemnityPrescription = Math.floor(prescriptionDays * dailyRate);

  return {
    monthlySalary,
    completedYears: years,
    dailyRate,
    brackets,
    totalDays,
    indemnityFull,
    prescriptionDays,
    indemnityPrescription,
    source: "المادتان 231-232 — مدونة الشغل"
  };
}

function calcPrimeAnciennete(monthlySalary, yearsOfService) {
  monthlySalary = Number(monthlySalary);
  yearsOfService = Number(yearsOfService);
  validateSalary(monthlySalary);
  validateYears(yearsOfService);

  const annualSalary = monthlySalary * 12;
  const years = normalizeYears(yearsOfService);
  const phases = [];
  let previousBonuses = 0;
  let currentAnnualBonus = 0;
  let totalAccumulated = 0;

  PRIME_PHASES.forEach(function(phase) {
    if (years >= phase.start) {
      const phaseEnd = Math.min(years, phase.end);
      const yearsInPhase = phaseEnd - phase.start + 1;
      const phaseBase = annualSalary + previousBonuses;
      const phaseBonus = phaseBase * phase.rate;
      const phaseContribution = phaseBonus * yearsInPhase;
      totalAccumulated += phaseContribution;
      previousBonuses = phaseBonus;
      currentAnnualBonus = phaseBonus;

      phases.push({
        phaseNumber: phase.phaseNumber,
        start: phase.start,
        end: phase.end,
        rate: phase.rate,
        yearsInPhase,
        phaseBase,
        phaseBonus,
        phaseContribution
      });
    }
  });

  return {
    monthlySalary,
    annualSalary,
    completedYears: years,
    phases,
    currentAnnualBonus,
    currentMonthlyBonus: Math.floor(currentAnnualBonus / 12),
    totalAccumulated,
    source: "المادة 350 — مدونة الشغل"
  };
}

module.exports = {
  calcDommagesInterets,
  calcPrejudice,
  calcPreavis,
  calcIndemnite,
  calcCongesTotal,
  calcPrimeAnciennete
};
