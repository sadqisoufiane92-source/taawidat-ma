const TABLE = require("../../data/capital_table.json");
const { sendSuccess, sendError } = require("../../lib/apiResponse");
const { calcAyantsDroit } = require("../../engine/ayants_droit.js");
const {
  calculateAgeAtAccident,
  annualizeSalary,
} = require("../../engine/lookup.js");

const PERIOD_MAP = {
  daily: "daily",
  monthly: "monthly",
  yearly: "annual",
  annual: "annual",
};

const VALID_SALARY_PERIODS = ["daily", "monthly", "yearly"];
const MIN_SALARY = 14270;

function parseDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new Error("INVALID_DATE");
  return date;
}

function toNumber(value, code) {
  const number = Number(value);
  if (Number.isNaN(number)) throw new Error(code);
  return number;
}

function fail(res, status, message, code) {
  const envelopeCode = status === 405
    ? "METHOD_NOT_ALLOWED"
    : status === 400
      ? "VALIDATION_ERROR"
      : "INTERNAL_ERROR";
  return sendError(res, "avp-ayants-droit", status, envelopeCode, message);
}

function arabicMessage(code) {
  const map = {
    INVALID_DATE: "تاريخ غير صالح",
    DATE_ORDER: "يجب أن يكون تاريخ الحادثة بعد تاريخ الازدياد",
    INVALID_DATES: "تاريخ غير صالح",
    INVALID_INPUT: "المعطيات المدخلة غير مكتملة",
    ERR_INVALID_INPUT: "المعطيات المدخلة غير مكتملة",
    INVALID_SALARY_AMOUNT: "يجب أن يكون الراتب عدداً موجباً",
    INVALID_SALARY_PERIOD: "دورية الراتب غير صالحة",
    ERR_INVALID_DATE: "تاريخ غير صالح",
    NaN_RESP: "نسبة المسؤولية يجب أن تكون بين 0 و 1",
    INVALID_RESP: "نسبة المسؤولية يجب أن تكون بين 0 و 1",
    INVALID_COUNT: "عدد المستفيدين يجب أن يكون صفراً أو أكثر",
    NaN_AGE: "تاريخ غير صالح",
    NaN_SALARY: "يجب أن يكون الراتب عدداً موجباً",
    NEGATIVE_SALARY: "يجب أن يكون الراتب عدداً موجباً",
  };
  return map[code] || "حدث خطأ داخلي أثناء الحساب";
}

function moneyGroup(key, label, count, rate, grossAmount, adjustedAmount, netAmount) {
  return {
    key,
    label,
    count,
    rate,
    grossAmount,
    adjustedAmount,
    netAmount,
  };
}

function flattenBeneficiaries(result) {
  const referenceCapital = result.referenceCapital;
  const b = result.beneficiaries;
  const rows = [];

  if (b.spouse.count > 0) {
    rows.push(moneyGroup(
      "spouse",
      "الزوج أو الزوجة",
      b.spouse.count,
      b.spouse.rateEach,
      b.spouse.grossEach * b.spouse.count,
      b.spouse.adjustedEach * b.spouse.count,
      b.spouse.netTotal
    ));
  }

  [
    ["age_0_5", "الأبناء 0-5 سنة"],
    ["age_6_10", "الأبناء 6-10 سنة"],
    ["age_11_16", "الأبناء 11-16 سنة"],
    ["age_17_plus", "الأبناء 17 سنة فأكثر"],
    ["disabled", "الأبناء في وضعية إعاقة"],
  ].forEach(([key, label]) => {
    const child = b.children[key];
    if (child.count > 0) {
      rows.push(moneyGroup(
        `child_${key}`,
        label,
        child.count,
        child.rate,
        child.grossEach * child.count,
        child.adjustedEach * child.count,
        child.netTotal
      ));
    }
  });

  if (b.father.present) {
    rows.push(moneyGroup(
      "father",
      b.father.disabled ? "الأب معاق" : "الأب",
      1,
      referenceCapital > 0 ? b.father.grossShare / referenceCapital : 0,
      b.father.grossShare,
      b.father.adjustedShare,
      b.father.netShare
    ));
  }

  if (b.mother.present) {
    rows.push(moneyGroup(
      "mother",
      b.mother.disabled ? "الأم معاقة" : "الأم",
      1,
      referenceCapital > 0 ? b.mother.grossShare / referenceCapital : 0,
      b.mother.grossShare,
      b.mother.adjustedShare,
      b.mother.netShare
    ));
  }

  if (b.otherObligatory.count > 0) {
    rows.push(moneyGroup(
      "otherObligatory",
      "ذوو النفقة الإجبارية",
      b.otherObligatory.count,
      referenceCapital > 0 ? b.otherObligatory.grossEach / referenceCapital : 0,
      b.otherObligatory.grossEach * b.otherObligatory.count,
      b.otherObligatory.adjustedEach * b.otherObligatory.count,
      b.otherObligatory.netTotal
    ));
  }

  if (b.otherVoluntary.count > 0) {
    rows.push(moneyGroup(
      "otherVoluntary",
      "ذوو النفقة الاختيارية",
      b.otherVoluntary.count,
      referenceCapital > 0 ? b.otherVoluntary.grossTotal / referenceCapital : 0,
      b.otherVoluntary.grossTotal,
      b.otherVoluntary.grossTotal,
      b.otherVoluntary.netTotal
    ));
  }

  return rows.filter((row) => row.netAmount > 0 || row.grossAmount > 0 || row.adjustedAmount > 0);
}

function computeDommagesMoraux(beneficiaries) {
  const children = beneficiaries.children || {};
  const spouseCount = Number(beneficiaries.spouseCount || 0);
  const totalChildren =
    Number(children.age_0_5 || 0) +
    Number(children.age_6_10 || 0) +
    Number(children.age_11_16 || 0) +
    Number(children.age_17_plus || 0) +
    Number(children.disabled || 0);
  const fatherCount = beneficiaries.father && beneficiaries.father.present ? 1 : 0;
  const motherCount = beneficiaries.mother && beneficiaries.mother.present ? 1 : 0;
  const damages = {};
  let total = 0;

  // المادة الرابعة — قانون 70.24
  // Not subject to نسبة المسؤولية per المادة الأولى مكررة مرتين.
  if (spouseCount > 0) {
    damages.spouse = { count: spouseCount, multiplier: 2, amount: spouseCount * 2 * MIN_SALARY };
    total += damages.spouse.amount;
  }
  if (totalChildren > 0) {
    damages.children = { count: totalChildren, multiplier: 1.5, amount: totalChildren * 1.5 * MIN_SALARY };
    total += damages.children.amount;
  }
  if (fatherCount > 0) {
    damages.father = { count: fatherCount, multiplier: 1.5, amount: fatherCount * 1.5 * MIN_SALARY };
    total += damages.father.amount;
  }
  if (motherCount > 0) {
    damages.mother = { count: motherCount, multiplier: 1.5, amount: motherCount * 1.5 * MIN_SALARY };
    total += damages.mother.amount;
  }

  damages.total = total;
  return damages;
}

function validateAyantsDroit(body) {
  if (!body.dateNaissance || !body.dateAccident) return "تاريخ غير صالح";
  const birth = new Date(body.dateNaissance);
  const accident = new Date(body.dateAccident);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(accident.getTime())) return "تاريخ غير صالح";
  if (accident <= birth) return "يجب أن يكون تاريخ الحادثة بعد تاريخ الازدياد";

  const salary = Number(body.salaryAmount);
  if (!Number.isFinite(salary) || salary <= 0) return "يجب أن يكون الراتب عدداً موجباً";

  if (!body.salaryPeriod || !VALID_SALARY_PERIODS.includes(body.salaryPeriod)) return "دورية الراتب غير صالحة";

  if (body.responsibilityRate !== undefined) {
    const r = Number(body.responsibilityRate);
    if (!Number.isFinite(r) || r < 0 || r > 1) return "نسبة المسؤولية يجب أن تكون بين 0 و 1";
  }

  const b = body.beneficiaries;
  if (!b || typeof b !== "object") return "المعطيات المدخلة غير مكتملة";

  const spouseCount = Number(b.spouseCount || 0);
  if (!Number.isInteger(spouseCount) || spouseCount < 0) return "عدد المستفيدين يجب أن يكون صفراً أو أكثر";

  const children = b.children || {};
  for (const k of ["age_0_5", "age_6_10", "age_11_16", "age_17_plus", "disabled"]) {
    if (children[k] !== undefined) {
      const n = Number(children[k]);
      if (!Number.isInteger(n) || n < 0) return "عدد المستفيدين يجب أن يكون صفراً أو أكثر";
    }
  }

  if (b.otherObligatory !== undefined) {
    const n = Number(b.otherObligatory);
    if (!Number.isInteger(n) || n < 0) return "عدد المستفيدين يجب أن يكون صفراً أو أكثر";
  }

  if (b.otherVoluntary !== undefined) {
    const n = Number(b.otherVoluntary);
    if (!Number.isInteger(n) || n < 0) return "عدد المستفيدين يجب أن يكون صفراً أو أكثر";
  }

  if (b.father && typeof b.father.present !== "boolean") return "المعطيات المدخلة غير مكتملة";
  if (b.mother && typeof b.mother.present !== "boolean") return "المعطيات المدخلة غير مكتملة";

  return null;
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return fail(res, 405, "طريقة الطلب غير مسموح بها", "METHOD_NOT_ALLOWED");
  }

  try {
    const body = req.body || {};
    const {
      dateNaissance,
      dateAccident,
      salaryAmount,
      salaryPeriod,
      responsibilityRate,
      beneficiaries,
    } = body;

    const err = validateAyantsDroit(body);
    if (err) return fail(res, 400, err, "VALIDATION_ERROR");

    const birthDate = parseDate(dateNaissance);
    const accidentDate = parseDate(dateAccident);
    const age = calculateAgeAtAccident(birthDate, accidentDate);
    const normalizedPeriod = PERIOD_MAP[salaryPeriod];
    if (!normalizedPeriod) return fail(res, 400, "دورية الراتب غير صالحة", "INVALID_SALARY_PERIOD");

    const salary = toNumber(salaryAmount, "INVALID_SALARY_AMOUNT");
    const annualSalary = annualizeSalary(salary, normalizedPeriod);
    const resp = responsibilityRate === undefined ? 1 : toNumber(responsibilityRate, "NaN_RESP");

    const result = calcAyantsDroit(TABLE, age, annualSalary, beneficiaries, resp);
    const dommagesMoraux = computeDommagesMoraux(beneficiaries);

    return sendSuccess(res, "avp-ayants-droit", {
      inputs: {
        dateNaissance,
        dateAccident,
        salaryAmount: salary,
        salaryPeriod,
        responsibilityRate: resp,
        beneficiaries,
      },
      age,
      annualSalary,
      referenceCapital: result.referenceCapital,
      beneficiaries: flattenBeneficiaries(result),
      adjustment: result.adjustment,
      dommagesMoraux,
      grandTotal: result.grandTotal,
    });
  } catch (error) {
    const code = error && error.message ? error.message : "UNKNOWN_ERROR";
    const knownInputErrors = [
      "INVALID_DATE",
      "DATE_ORDER",
      "INVALID_SALARY_AMOUNT",
      "INVALID_SALARY_PERIOD",
      "NaN_RESP",
      "INVALID_RESP",
      "INVALID_COUNT",
      "NaN_AGE",
      "NaN_SALARY",
      "NEGATIVE_SALARY",
    ];
    const status = knownInputErrors.includes(code) ? 400 : 500;
    const message = arabicMessage(code);
    return fail(res, status, message, code);
  }
}
