const {
  calcDommagesInterets,
  calcPrejudice,
  calcPreavis,
  calcIndemnite,
  calcCongesTotal,
  calcPrimeAnciennete
} = require("../../engine/labor.js");
const { sendSuccess, sendError } = require("../../lib/apiResponse");

const CATEGORY_MAP = {
  "إطار": "cadre",
  "موظف": "employe",
  "عامل": "ouvrier",
  cadre: "cadre",
  employe: "employe",
  ouvrier: "ouvrier"
};

function normalizeCategory(category) {
  return CATEGORY_MAP[String(category || "").trim()];
}

function pickResult(result, fields) {
  return fields.reduce(function(out, field) {
    if (Object.prototype.hasOwnProperty.call(result, field)) {
      out[field] = result[field];
    }
    return out;
  }, {});
}

function calcYearsOfService(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let exactYears = end.getFullYear() - start.getFullYear();
  const m = end.getMonth() - start.getMonth();
  const d = end.getDate() - start.getDate();
  if (m < 0 || (m === 0 && d < 0)) exactYears--;
  
  // Check if there is any remainder beyond exact years
  const exactAnniversary = new Date(start);
  exactAnniversary.setFullYear(start.getFullYear() + exactYears);
  
  const hasRemainder = end > exactAnniversary;
  
  // Any fraction = full year
  return hasRemainder ? exactYears + 1 : exactYears;
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return sendError(res, "labor", 405, "METHOD_NOT_ALLOWED", "طريقة الطلب غير مسموح بها");
  }

  try {
    const body = req.body || {};
    const monthlySalary = Number(body.monthlySalary);
    const startDate = `${body.startDate}T00:00:00`;
    const endDate = `${body.endDate}T00:00:00`;
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    const category = normalizeCategory(body.category);
    const selected = Array.isArray(body.selected) ? body.selected : [];

    const ALLOWED_SELECTED = [
      "dommages", "prejudice", "preavis", "indemnite",
      "conges", "conges_prescription", "prime"
    ];

    if (!Number.isFinite(monthlySalary) || monthlySalary <= 0 || monthlySalary > 500000) {
      return sendError(res, "labor", 400, "VALIDATION_ERROR", "يجب أن يكون الراتب عدداً موجباً");
    }

    if (!Array.isArray(selected) || selected.length === 0) {
      return sendError(res, "labor", 400, "VALIDATION_ERROR", "المعطيات المدخلة غير مكتملة");
    }

    const invalidItems = selected.filter(s => !ALLOWED_SELECTED.includes(s));
    if (invalidItems.length > 0) {
      return sendError(res, "labor", 400, "VALIDATION_ERROR", "نوع الحساب المحدد غير صالح");
    }

    if (!category) {
      throw new Error("INVALID_INPUT");
    }
    if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime()) || parsedEndDate <= parsedStartDate) {
      throw new Error("INVALID_DATES");
    }

    const yearsOfService = calcYearsOfService(startDate, endDate);
    const results = {};

    if (selected.includes("dommages")) {
      results.dommages = pickResult(
        calcDommagesInterets(monthlySalary, yearsOfService),
        ["result", "monthlySalary", "completedYears", "capped"]
      );
    }

    if (selected.includes("prejudice")) {
      const r = calcPrejudice(monthlySalary, yearsOfService);
      results.prejudice = {
        result: r.result,
        completedYears: r.completedYears,
        monthlySalary: r.monthlySalary,
        months: r.months,
        monthsUsed: r.monthsUsed,
        capped: r.capped
      };
    }

    if (selected.includes("preavis")) {
      const r = calcPreavis(monthlySalary, category, yearsOfService);
      results.preavis = {
        indemnity: r.indemnity,
        noticeDays: r.noticeDays,
        category: r.category,
        completedYears: r.completedYears,
        monthlySalary: monthlySalary
      };
    }

    if (selected.includes("indemnite")) {
      const r = calcIndemnite(monthlySalary, yearsOfService);
      results.indemnite = {
        indemnity: r.indemnity,
        completedYears: r.completedYears,
        hourlyWage: r.hourlyWage,
        totalHours: r.totalHours,
        brackets: r.brackets
      };
    }

    if (selected.includes("conges")) {
      const r = calcCongesTotal(monthlySalary, yearsOfService);
      results.conges = {
        indemnityFull: r.indemnityFull,
        totalDays: r.totalDays,
        dailyRate: r.dailyRate,
        brackets: r.brackets
      };
    }

    if (selected.includes("conges_prescription")) {
      const r = calcCongesTotal(monthlySalary, yearsOfService);
      results.conges_prescription = {
        indemnityPrescription: r.indemnityPrescription,
        prescriptionDays: r.prescriptionDays,
        dailyRate: r.dailyRate
      };
    }

    if (selected.includes("prime")) {
      const r = calcPrimeAnciennete(monthlySalary, yearsOfService);
      results.prime = {
        currentAnnualBonus: r.currentAnnualBonus,
        currentMonthlyBonus: r.currentMonthlyBonus,
        completedYears: r.completedYears,
        totalAccumulated: r.totalAccumulated,
        annualSalary: r.annualSalary,
        monthlySalary: monthlySalary,
        phases: r.phases
      };
    }

    return sendSuccess(res, "labor", {
      yearsOfService,
      results
    });
  } catch (error) {
    if (error.message === "INVALID_INPUT") {
      return sendError(res, "labor", 400, "VALIDATION_ERROR", "المعطيات المدخلة غير مكتملة");
    }
    if (error.message === "INVALID_DATES") {
      return sendError(res, "labor", 400, "VALIDATION_ERROR", "تاريخ غير صالح");
    }
    return sendError(res, "labor", 500, "INTERNAL_ERROR", "حدث خطأ داخلي أثناء الحساب");
  }
}
