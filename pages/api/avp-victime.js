const TABLE = require("../../data/capital_table.json");
const { sendSuccess, sendError } = require("../../lib/apiResponse");
const { calcIPP } = require("../../engine/ipp.js");
const { calcITT } = require("../../engine/itt.js");
const {
  calcTiercePersonne,
  calcPretiumDoloris,
  calcPrejudiceEsthetique,
  calcChangementProfession,
  calcInterruptionEtudes,
} = require("../../engine/supplements.js");
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
const VALID_DEGREES = ["important", "majeur", "tres_majeur"];
const VALID_CHANGEMENT_CASES = ["retraite_anticipee", "perte_promotion", "privation_heures"];
const VALID_INTERRUPTION_TYPES = ["definitif", "quasi_definitif"];

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

function resultAmount(result) {
  if (!result) return 0;
  if (typeof result.net === "number") return result.net;
  if (typeof result.netIPP === "number") return result.netIPP;
  return 0;
}

function fail(res, status, message, code) {
  const envelopeCode = status === 405
    ? "METHOD_NOT_ALLOWED"
    : status === 400
      ? "VALIDATION_ERROR"
      : "INTERNAL_ERROR";
  return sendError(res, "avp-victime", status, envelopeCode, message);
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
    NaN_DAYS: "عدد أيام العجز يجب أن يكون صفراً أو أكثر",
    INVALID_DAYS: "عدد أيام العجز يجب أن يكون صفراً أو أكثر",
    NaN_IPP_RATE: "نسبة العجز الدائم يجب أن تكون بين 0 و 100",
    INVALID_IPP_RATE: "نسبة العجز الدائم يجب أن تكون بين 0 و 100",
    INVALID_DEGREE: "درجة أو نوع الضرر التكميلي غير صالح",
    INVALID_SUBCASE: "درجة أو نوع الضرر التكميلي غير صالح",
    INVALID_TYPE: "درجة أو نوع الضرر التكميلي غير صالح",
  };
  return map[code] || "حدث خطأ داخلي أثناء الحساب";
}

function normalizeEnum(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function validateVictime(body) {
  if (!body.dateNaissance || !body.dateAccident) return "تاريخ غير صالح";
  const birth = new Date(body.dateNaissance);
  const accident = new Date(body.dateAccident);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(accident.getTime())) return "تاريخ غير صالح";
  if (accident <= birth) return "يجب أن يكون تاريخ الحادثة بعد تاريخ الازدياد";

  const salary = Number(body.salaryAmount);
  if (!Number.isFinite(salary) || salary <= 0) return "يجب أن يكون الراتب عدداً موجباً";

  if (!body.salaryPeriod || !VALID_SALARY_PERIODS.includes(body.salaryPeriod)) return "دورية الراتب غير صالحة";

  const days = Number(body.ittDays);
  if (!Number.isFinite(days) || days < 0) return "عدد أيام العجز يجب أن يكون صفراً أو أكثر";

  const ipp = Number(body.ippRate);
  if (!Number.isFinite(ipp) || ipp < 0 || ipp > 100) return "نسبة العجز الدائم يجب أن تكون بين 0 و 100";

  if (body.responsibilityRate !== undefined) {
    const responsibility = Number(body.responsibilityRate);
    if (!Number.isFinite(responsibility) || responsibility < 0 || responsibility > 1) return "نسبة المسؤولية يجب أن تكون بين 0 و 1";
  }

  const supplements = body.supplements || {};
  if (supplements.pretiumDoloris && supplements.pretiumDoloris.active) {
    if (!VALID_DEGREES.includes(normalizeEnum(supplements.pretiumDoloris.degree))) return "درجة أو نوع الضرر التكميلي غير صالح";
  }
  if (supplements.prejudiceEsthetique && supplements.prejudiceEsthetique.active) {
    if (!VALID_DEGREES.includes(normalizeEnum(supplements.prejudiceEsthetique.degree))) return "درجة أو نوع الضرر التكميلي غير صالح";
  }
  if (supplements.changementProfession && supplements.changementProfession.active) {
    if (!VALID_CHANGEMENT_CASES.includes(normalizeEnum(supplements.changementProfession.subCase))) return "درجة أو نوع الضرر التكميلي غير صالح";
  }
  if (supplements.interruptionEtudes && supplements.interruptionEtudes.active) {
    if (!VALID_INTERRUPTION_TYPES.includes(normalizeEnum(supplements.interruptionEtudes.type))) return "درجة أو نوع الضرر التكميلي غير صالح";
  }

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
      ittDays,
      ippRate,
      supplements = {},
    } = body;

    const err = validateVictime(body);
    if (err) return fail(res, 400, err, "VALIDATION_ERROR");

    const birthDate = parseDate(dateNaissance);
    const accidentDate = parseDate(dateAccident);
    const age = calculateAgeAtAccident(birthDate, accidentDate);
    const normalizedPeriod = PERIOD_MAP[salaryPeriod];
    if (!normalizedPeriod) return fail(res, 400, "دورية الراتب غير صالحة", "INVALID_SALARY_PERIOD");

    const salary = toNumber(salaryAmount, "INVALID_SALARY_AMOUNT");
    const annualSalary = annualizeSalary(salary, normalizedPeriod);
    const resp = responsibilityRate === undefined ? 1 : toNumber(responsibilityRate, "NaN_RESP");
    const days = toNumber(ittDays, "NaN_DAYS");
    const ipp = toNumber(ippRate, "NaN_IPP_RATE");

    const itt = calcITT(annualSalary, days, resp);
    const ippResult = calcIPP(TABLE, age, annualSalary, ipp, resp);
    const supplementResults = {};

    if (supplements.tiercePersonne === true) {
      supplementResults.tiercePersonne = calcTiercePersonne(TABLE, age, annualSalary, resp);
    }

    if (supplements.pretiumDoloris && supplements.pretiumDoloris.active) {
      supplementResults.pretiumDoloris = calcPretiumDoloris(
        TABLE,
        age,
        annualSalary,
        supplements.pretiumDoloris.degree,
        resp
      );
    }

    if (supplements.prejudiceEsthetique && supplements.prejudiceEsthetique.active) {
      supplementResults.prejudiceEsthetique = calcPrejudiceEsthetique(
        TABLE,
        age,
        annualSalary,
        Boolean(supplements.prejudiceEsthetique.hasProfessionalImpact),
        supplements.prejudiceEsthetique.degree,
        ipp,
        resp
      );
    }

    if (supplements.changementProfession && supplements.changementProfession.active) {
      supplementResults.changementProfession = calcChangementProfession(
        TABLE,
        age,
        annualSalary,
        supplements.changementProfession.subCase,
        ipp,
        resp
      );
    }

    if (supplements.interruptionEtudes && supplements.interruptionEtudes.active) {
      supplementResults.interruptionEtudes = calcInterruptionEtudes(
        TABLE,
        age,
        annualSalary,
        supplements.interruptionEtudes.type,
        resp
      );
    }

    const total = Object.values(supplementResults).reduce(
      (sum, result) => sum + resultAmount(result),
      resultAmount(itt) + resultAmount(ippResult)
    );

    return sendSuccess(res, "avp-victime", {
      inputs: {
        dateNaissance,
        dateAccident,
        salaryAmount: salary,
        salaryPeriod,
        responsibilityRate: resp,
        ittDays: days,
        ippRate: ipp,
      },
      age,
      annualSalary,
      itt,
      ipp: ippResult,
      supplements: supplementResults,
      total,
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
      "NaN_DAYS",
      "INVALID_DAYS",
      "NaN_IPP_RATE",
      "INVALID_IPP_RATE",
      "INVALID_DEGREE",
      "INVALID_SUBCASE",
      "INVALID_TYPE",
    ];
    const status = knownInputErrors.includes(code) ? 400 : 500;
    const message = arabicMessage(code);
    return fail(res, status, message, code);
  }
}
