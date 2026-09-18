const {test}=require('node:test');
const assert=require('node:assert/strict');
const {calculate,atMonth}=require('./calculator.js');
const close=(a,b,t=.001)=>assert.ok(Math.abs(a-b)<t, a+' != '+b);
test('one hundred million, 4.5 percent, thirty years',()=>{
 const a=calculate(100000000,4.5,360,'equal'),b=calculate(100000000,4.5,360,'principal'),c=calculate(100000000,4.5,360,'bullet');
 close(a.first,506685.30982588);close(a.totalInterest,82406711.537317);
 close(atMonth(a,60).balance,91157917.163043);close(atMonth(a,60).cumulativeInterest,21559035.752596);
 close(b.first,652777.777778);close(b.totalInterest,100000000*(.045/12)*361/2);
 close(atMonth(b,60).balance,100000000*(1-60/360));
 close(c.first,375000);close(c.last,100375000);close(c.totalInterest,135000000);
});
test('zero rate and zero principal in every repayment mode',()=>{
 for(const mode of ['equal','principal','bullet']){
  const r=calculate(120000,0,12,mode);
  assert.equal(r.totalInterest,0);assert.equal(r.totalPayment,120000);
  assert.equal(r.first,mode==='bullet'?0:10000);assert.equal(r.last,mode==='bullet'?120000:10000);
  assert.equal(calculate(0,4.5,12,mode).totalPayment,0);
 }
});
test('full schedules conserve principal and clear the final balance',()=>{
 for(const mode of ['equal','principal','bullet'])for(const months of [1,12,360,600])for(const rate of [0,1e-9,4.5,30]){
  const r=calculate(987654321,rate,months,mode);
  assert.equal(r.schedule.length,months);assert.equal(r.schedule.at(-1).balance,0);
  close(r.totalPrincipal,987654321,.01);
  close(r.schedule.reduce((s,row)=>s+row.payment,0),r.totalPayment,.1);
  assert.ok(r.schedule.every(row=>row.principal>=0&&row.interest>=0&&Number.isFinite(row.payment)));
  assert.equal(atMonth(r,600).balance,0);close(atMonth(r,0).balance,987654321,.01);
 }
});
test('invalid and fractional terms are rejected',()=>{
 for(const args of [[-1,4,12,'equal'],[1,NaN,12,'equal'],[1,31,12,'equal'],[1,4,0,'equal'],[1,4,1.5,'equal'],[1,4,601,'equal'],[1,4,12,'bad']])assert.throws(()=>calculate(...args),RangeError);
 for(const n of [-1,1.1,601,NaN])assert.throws(()=>atMonth(calculate(1,0,1,'equal'),n),RangeError);
});
