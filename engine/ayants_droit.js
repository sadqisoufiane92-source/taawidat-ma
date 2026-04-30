/**
 * ayants_droit.js
 * Compensation des ayants droit en cas de deces — Law 70.24, Articles 4, 11 & 12
 */

const { getReferenceCapital } = require("./lookup.js");

const MIN_SALARY = 14270;

const BENEFICIARY_RATES = {
  spouse_single       : 0.25,
  spouse_multiple_each: 0.20,
  spouse_cap          : 0.40,
  child_0_5           : 0.25,
  child_6_10          : 0.20,
  child_11_16         : 0.15,
  child_17_plus       : 0.10,
  child_disabled      : 0.30,
  parent              : 0.10,
  parent_disabled     : 0.30,
  parent_both_disabled: 0.25,
  other_obligatory    : 0.10,
  other_voluntary     : 0.15,
  individual_cap      : 0.50
};

const SOURCE = "المواد 4 و11 و12 — القانون رقم 70.24";
const VOLUNTARY_NOTE = "additionnel — Article 12 — non soumis au plafonnement";

function validateResponsibilityRate(rate) {
  if (typeof rate !== "number" || isNaN(rate)) throw new Error("NaN_RESP");
  if (rate < 0 || rate > 1)                    throw new Error("INVALID_RESP");
}

function validCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function validateBeneficiaries(input) {
  const children = input && input.children ? input.children : {};
  const counts = [
    Number(input && input.spouseCount),
    Number(children.age_0_5),
    Number(children.age_6_10),
    Number(children.age_11_16),
    Number(children.age_17_plus),
    Number(children.disabled),
    Number(input && input.otherObligatory),
    Number(input && input.otherVoluntary)
  ];

  if (!counts.every(validCount)) throw new Error("INVALID_COUNT");
}

function normalizeBeneficiaries(input) {
  const children = input.children;
  return {
    spouseCount: Number(input.spouseCount),
    children: {
      age_0_5    : Number(children.age_0_5),
      age_6_10   : Number(children.age_6_10),
      age_11_16  : Number(children.age_11_16),
      age_17_plus: Number(children.age_17_plus),
      disabled   : Number(children.disabled)
    },
    father: {
      present : Boolean(input.father && input.father.present),
      disabled: Boolean(input.father && input.father.disabled)
    },
    mother: {
      present : Boolean(input.mother && input.mother.present),
      disabled: Boolean(input.mother && input.mother.disabled)
    },
    otherObligatory: Number(input.otherObligatory),
    otherVoluntary : Number(input.otherVoluntary)
  };
}

function childResult(count, rate, referenceCapital, adjustedEach, responsibilityRate) {
  const grossEach = referenceCapital * rate;
  const netEach = Math.floor(adjustedEach * responsibilityRate);
  return {
    count,
    rate,
    grossEach,
    adjustedEach,
    netEach,
    netTotal: netEach * count
  };
}

function buildShares(input, referenceCapital) {
  const shares = [];

  if (input.spouseCount === 1) {
    shares.push({
      key: "spouse",
      count: 1,
      rate: BENEFICIARY_RATES.spouse_single,
      grossEach: referenceCapital * BENEFICIARY_RATES.spouse_single
    });
  } else if (input.spouseCount > 1) {
    const totalRate = Math.min(
      input.spouseCount * BENEFICIARY_RATES.spouse_multiple_each,
      BENEFICIARY_RATES.spouse_cap
    );
    shares.push({
      key: "spouse",
      count: input.spouseCount,
      rate: totalRate / input.spouseCount,
      grossEach: (referenceCapital * totalRate) / input.spouseCount
    });
  }

  [
    ["child_age_0_5",     input.children.age_0_5,     BENEFICIARY_RATES.child_0_5],
    ["child_age_6_10",    input.children.age_6_10,    BENEFICIARY_RATES.child_6_10],
    ["child_age_11_16",   input.children.age_11_16,   BENEFICIARY_RATES.child_11_16],
    ["child_age_17_plus", input.children.age_17_plus, BENEFICIARY_RATES.child_17_plus],
    ["child_disabled",    input.children.disabled,    BENEFICIARY_RATES.child_disabled]
  ].forEach(function(row) {
    if (row[1] > 0) {
      shares.push({
        key: row[0],
        count: row[1],
        rate: row[2],
        grossEach: referenceCapital * row[2]
      });
    }
  });

  const fatherRate = parentRate(input.father, input.mother);
  const motherRate = parentRate(input.mother, input.father);
  if (input.father.present) {
    shares.push({ key: "father", count: 1, rate: fatherRate, grossEach: referenceCapital * fatherRate });
  }
  if (input.mother.present) {
    shares.push({ key: "mother", count: 1, rate: motherRate, grossEach: referenceCapital * motherRate });
  }

  if (input.otherObligatory > 0) {
    shares.push({
      key: "otherObligatory",
      count: input.otherObligatory,
      rate: BENEFICIARY_RATES.other_obligatory,
      grossEach: referenceCapital * BENEFICIARY_RATES.other_obligatory
    });
  }

  return shares;
}

function parentRate(parent, otherParent) {
  if (!parent.present) return 0;
  if (!otherParent.present) return parent.disabled ? BENEFICIARY_RATES.parent_disabled : BENEFICIARY_RATES.parent;
  if (parent.disabled && otherParent.disabled) return BENEFICIARY_RATES.parent_both_disabled;
  return parent.disabled ? BENEFICIARY_RATES.parent_disabled : BENEFICIARY_RATES.parent;
}

function adjustShares(shares, referenceCapital) {
  const total14Gross = shares.reduce(function(sum, share) {
    return sum + (share.grossEach * share.count);
  }, 0);

  if (total14Gross === 0) {
    return { total14Gross, adjustmentFactor: 1, capApplied: false, adjustedByKey: {} };
  }

  const adjustmentFactor = referenceCapital / total14Gross;
  const adjustedByKey = {};
  shares.forEach(function(share) {
    adjustedByKey[share.key] = share.grossEach * adjustmentFactor;
  });

  if (total14Gross >= referenceCapital) {
    return { total14Gross, adjustmentFactor, capApplied: false, adjustedByKey };
  }

  const individualCap = referenceCapital * BENEFICIARY_RATES.individual_cap;
  const capped = {};
  let capApplied = false;

  for (let i = 0; i < shares.length; i++) {
    const newCaps = shares.filter(function(share) {
      return !capped[share.key] && adjustedByKey[share.key] > individualCap;
    });

    if (newCaps.length === 0) break;

    capApplied = true;
    newCaps.forEach(function(share) {
      capped[share.key] = true;
      adjustedByKey[share.key] = individualCap;
    });

    const uncapped = shares.filter(function(share) { return !capped[share.key]; });
    if (uncapped.length === 0) break;

    const cappedTotal = shares.reduce(function(sum, share) {
      return capped[share.key] ? sum + (adjustedByKey[share.key] * share.count) : sum;
    }, 0);
    const remainder = referenceCapital - cappedTotal;
    const uncappedGrossTotal = uncapped.reduce(function(sum, share) {
      return sum + (share.grossEach * share.count);
    }, 0);
    const factor = uncappedGrossTotal > 0 ? remainder / uncappedGrossTotal : 0;

    uncapped.forEach(function(share) {
      adjustedByKey[share.key] = share.grossEach * factor;
    });
  }

  return { total14Gross, adjustmentFactor, capApplied, adjustedByKey };
}

function getAdjusted(adjustedByKey, key) {
  return adjustedByKey[key] || 0;
}

function calcAyantsDroit(table, age, annualSalary, beneficiariesInput, responsibilityRate) {
  validateResponsibilityRate(responsibilityRate);
  validateBeneficiaries(beneficiariesInput);

  const input = normalizeBeneficiaries(beneficiariesInput);
  const referenceCapital = getReferenceCapital(table, age, annualSalary).referenceCapital;
  const shares = buildShares(input, referenceCapital);
  const adjustment = adjustShares(shares, referenceCapital);
  const adjustedByKey = adjustment.adjustedByKey;

  const spouseShare = shares.find(function(share) { return share.key === "spouse"; });
  const spouseAdjustedEach = getAdjusted(adjustedByKey, "spouse");
  const spouseNetEach = Math.floor(spouseAdjustedEach * responsibilityRate);

  const fatherAdjusted = getAdjusted(adjustedByKey, "father");
  const motherAdjusted = getAdjusted(adjustedByKey, "mother");
  const otherObligatoryAdjustedEach = getAdjusted(adjustedByKey, "otherObligatory");
  const otherObligatoryGrossEach = referenceCapital * BENEFICIARY_RATES.other_obligatory;
  const otherObligatoryNetEach = Math.floor(otherObligatoryAdjustedEach * responsibilityRate);

  const grossVoluntaryTotal = referenceCapital * BENEFICIARY_RATES.other_voluntary;
  const grossVoluntaryEach = input.otherVoluntary > 0 ? grossVoluntaryTotal / input.otherVoluntary : 0;
  const voluntaryNetEach = Math.floor(grossVoluntaryEach * responsibilityRate);

  const beneficiaries = {
    spouse: {
      count       : input.spouseCount,
      rateEach    : spouseShare ? spouseShare.rate : 0,
      grossEach   : spouseShare ? spouseShare.grossEach : 0,
      adjustedEach: spouseAdjustedEach,
      netEach     : spouseNetEach,
      netTotal    : spouseNetEach * input.spouseCount
    },
    children: {
      age_0_5    : childResult(input.children.age_0_5,     BENEFICIARY_RATES.child_0_5,     referenceCapital, getAdjusted(adjustedByKey, "child_age_0_5"),     responsibilityRate),
      age_6_10   : childResult(input.children.age_6_10,    BENEFICIARY_RATES.child_6_10,    referenceCapital, getAdjusted(adjustedByKey, "child_age_6_10"),    responsibilityRate),
      age_11_16  : childResult(input.children.age_11_16,   BENEFICIARY_RATES.child_11_16,   referenceCapital, getAdjusted(adjustedByKey, "child_age_11_16"),   responsibilityRate),
      age_17_plus: childResult(input.children.age_17_plus, BENEFICIARY_RATES.child_17_plus, referenceCapital, getAdjusted(adjustedByKey, "child_age_17_plus"), responsibilityRate),
      disabled   : childResult(input.children.disabled,    BENEFICIARY_RATES.child_disabled,referenceCapital, getAdjusted(adjustedByKey, "child_disabled"),    responsibilityRate)
    },
    father: {
      present      : input.father.present,
      disabled     : input.father.disabled,
      grossShare   : input.father.present ? referenceCapital * parentRate(input.father, input.mother) : 0,
      adjustedShare: fatherAdjusted,
      netShare     : Math.floor(fatherAdjusted * responsibilityRate)
    },
    mother: {
      present      : input.mother.present,
      disabled     : input.mother.disabled,
      grossShare   : input.mother.present ? referenceCapital * parentRate(input.mother, input.father) : 0,
      adjustedShare: motherAdjusted,
      netShare     : Math.floor(motherAdjusted * responsibilityRate)
    },
    otherObligatory: {
      count       : input.otherObligatory,
      grossEach   : input.otherObligatory > 0 ? otherObligatoryGrossEach : 0,
      adjustedEach: otherObligatoryAdjustedEach,
      netEach     : otherObligatoryNetEach,
      netTotal    : otherObligatoryNetEach * input.otherObligatory
    },
    otherVoluntary: {
      count     : input.otherVoluntary,
      grossTotal: grossVoluntaryTotal,
      grossEach : grossVoluntaryEach,
      netEach   : voluntaryNetEach,
      netTotal  : voluntaryNetEach * input.otherVoluntary,
      note      : VOLUNTARY_NOTE
    }
  };

  const grandTotal =
    beneficiaries.spouse.netTotal +
    beneficiaries.children.age_0_5.netTotal +
    beneficiaries.children.age_6_10.netTotal +
    beneficiaries.children.age_11_16.netTotal +
    beneficiaries.children.age_17_plus.netTotal +
    beneficiaries.children.disabled.netTotal +
    beneficiaries.father.netShare +
    beneficiaries.mother.netShare +
    beneficiaries.otherObligatory.netTotal +
    beneficiaries.otherVoluntary.netTotal;

  return {
    referenceCapital,
    responsibilityRate,
    beneficiaries,
    adjustment: {
      total14Gross    : adjustment.total14Gross,
      adjustmentFactor: adjustment.adjustmentFactor,
      capApplied      : adjustment.capApplied
    },
    grandTotal,
    source: SOURCE
  };
}

module.exports = { calcAyantsDroit };
