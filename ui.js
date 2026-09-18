'use strict';
let mode='equal', resultA=null, resultB=null;
const fmt=n=>Math.round(n).toLocaleString('ko-KR')+'원';
const names={equal:'원리금균등',principal:'원금균등',bullet:'만기일시상환'};
function setP(v){document.getElementById('principal').value=v;calc();}
function setR(v){document.getElementById('rate').value=v;calc();}
function setY(v){document.getElementById('years').value=v;calc();}
function switchMode(m){mode=m;document.querySelectorAll('.tab-btn').forEach((b,i)=>{const active=['equal','principal','bullet'][i]===m;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});calc();}
function number(id){const raw=document.getElementById(id).value;if(!raw.trim())throw new Error('금액, 금리와 기간을 모두 입력하세요.');return Number(raw);}
function readLoan(suffix, selectedMode){const years=number('years'+suffix);if(!Number.isFinite(years)||Math.abs(years*12-Math.round(years*12))>1e-7)throw new Error('대출 기간은 월 단위로 환산 가능한 연수여야 합니다.');return LoanCalculator.calculate(number('principal'+suffix),number('rate'+suffix),Math.round(years*12),selectedMode);}
function renderSchedule(){
  const selected=document.getElementById('scheduleChoice').value;
  const result=selected==='A'?resultA:resultB;
  document.getElementById('downloadCsv').disabled=!result;
  document.getElementById('scheduleBody').innerHTML=result?result.schedule.map(s=>'<tr><td>'+s.month+'</td><td>'+fmt(s.principal)+'</td><td>'+fmt(s.interest)+'</td><td>'+fmt(s.payment)+'</td><td>'+fmt(s.balance)+'</td></tr>').join(''):'';
}
function calc(){
  try {
    resultA=readLoan('',mode);
    document.getElementById('inputError').textContent='';
    document.getElementById('resultMain').textContent=fmt(resultA.first);
    document.getElementById('resultSub').textContent='조건 A 첫 회차 상환액 · '+names[mode];
    document.getElementById('totalPayment').textContent=fmt(resultA.totalPayment);
    document.getElementById('totalInterest').textContent=fmt(resultA.totalInterest);
    document.getElementById('avgPayment').textContent=fmt(resultA.last);
  } catch(e){
    resultA=null;document.getElementById('inputError').textContent=e.message;
    ['resultMain','totalPayment','totalInterest','avgPayment'].forEach(id=>document.getElementById(id).textContent='-');
    document.getElementById('resultSub').textContent='조건 A를 확인하세요.';
  }
  try {resultB=readLoan('B',document.getElementById('modeB').value);document.getElementById('compareError').textContent='';}
  catch(e){resultB=null;document.getElementById('compareError').textContent=e.message;}
  document.getElementById('comparisonBody').innerHTML='';
  document.getElementById('comparisonSummary').textContent='';
  try {
    const month=number('checkpoint');
    if(!resultA||!resultB)throw new Error('조건 A와 B가 모두 유효할 때 비교 결과가 표시됩니다.');
    const a=LoanCalculator.atMonth(resultA,month),b=LoanCalculator.atMonth(resultB,month);
    const rows=[['첫 회차 납입액',resultA.first,resultB.first],['마지막 회차 납입액',resultA.last,resultB.last],['전체 기간 총이자',resultA.totalInterest,resultB.totalInterest],[month+'개월 후 잔액',a.balance,b.balance],[month+'개월까지 낸 이자',a.cumulativeInterest,b.cumulativeInterest]];
    document.getElementById('comparisonBody').innerHTML=rows.map(([label,a,b])=>'<tr><th scope="row">'+label+'</th><td>'+fmt(a)+'</td><td>'+fmt(b)+'</td><td>'+(Math.round(b-a)>0?'+':'')+fmt(b-a)+'</td></tr>').join('');
    const difference=resultB.totalInterest-resultA.totalInterest;
    document.getElementById('comparisonSummary').textContent='총이자: '+(Math.abs(difference)<.5?'두 조건이 같습니다.':(difference>0?'조건 A':'조건 B')+'가 '+fmt(Math.abs(difference))+' 적습니다.')+' 비교 시점이 만기를 넘으면 만기까지의 이자와 잔액 0원을 표시합니다. 수수료와 금리 변경은 제외됩니다.';
  }catch(e){document.getElementById('comparisonSummary').textContent=e.message;}
  renderSchedule();
}
function copyA(){document.getElementById('principalB').value=document.getElementById('principal').value;document.getElementById('rateB').value=document.getElementById('rate').value;document.getElementById('yearsB').value=document.getElementById('years').value;document.getElementById('modeB').value=mode;calc();}
function downloadCsv(){
  const result=document.getElementById('scheduleChoice').value==='A'?resultA:resultB;
  if(!result)return;
  const rows=[['회차','원금(원)','이자(원)','납입액(원)','잔액(원)'],...result.schedule.map(s=>[s.month,...[s.principal,s.interest,s.payment,s.balance].map(Math.round)])];
  const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='jway-loan-'+document.getElementById('scheduleChoice').value+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function toggleFaq(el) { const open = el.parentElement.classList.toggle("open"); el.setAttribute("aria-expanded", String(open)); }
['principal','rate','years','principalB','rateB','yearsB','checkpoint'].forEach(id=>document.getElementById(id).addEventListener('input',calc));
document.getElementById('modeB').addEventListener('change',calc);
document.getElementById('scheduleChoice').addEventListener('change',renderSchedule);
document.getElementById('copyA').addEventListener('click',copyA);
document.getElementById('downloadCsv').addEventListener('click',downloadCsv);
calc();
