(function (root) {
  'use strict';
  function calculate(principal, annualRate, months, mode) {
    if (!Number.isSafeInteger(principal) || principal < 0 || principal > 100000000000) throw new RangeError('대출 원금은 0원부터 1,000억원까지 정수로 입력하세요.');
    if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 30) throw new RangeError('금리는 0%부터 30%까지 입력하세요.');
    if (!Number.isInteger(months) || months < 1 || months > 600) throw new RangeError('대출 기간은 1개월부터 600개월까지 입력하세요.');
    if (!['equal', 'principal', 'bullet'].includes(mode)) throw new RangeError('상환 방식을 선택하세요.');
    const rate = annualRate / 1200;
    const fixed = rate === 0 ? principal / months : principal * rate / -Math.expm1(-months * Math.log1p(rate));
    let balance = principal, totalInterest = 0, totalPrincipal = 0;
    const schedule = [];
    for (let month = 1; month <= months; month++) {
      const interest = balance * rate;
      let paidPrincipal = mode === 'bullet' ? 0 : mode === 'principal' ? principal / months : fixed - interest;
      if (month === months) paidPrincipal = balance;
      paidPrincipal = Math.min(balance, Math.max(0, paidPrincipal));
      balance = Math.max(0, balance - paidPrincipal);
      totalInterest += interest;
      totalPrincipal += paidPrincipal;
      schedule.push({month, principal: paidPrincipal, interest, payment: paidPrincipal + interest, balance, cumulativeInterest: totalInterest});
    }
    return {schedule, first: schedule[0].payment, last: schedule[months - 1].payment, totalInterest, totalPrincipal, totalPayment: principal + totalInterest};
  }
  function atMonth(result, month) {
    if (!Number.isInteger(month) || month < 0 || month > 600) throw new RangeError('비교 시점은 0~600개월 정수로 입력하세요.');
    if (month === 0) return {balance: result.totalPrincipal, cumulativeInterest: 0, month: 0};
    return result.schedule[Math.min(month, result.schedule.length) - 1];
  }
  const api = {calculate, atMonth};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LoanCalculator = api;
})(globalThis);
