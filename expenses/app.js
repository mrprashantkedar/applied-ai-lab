import {el,node,words} from '../common.js';
const training = {
  Food:['cafe coffee restaurant','swiggy zomato takeaway','bakery pizza meal'],
  Travel:['uber ola cab','metro railway train','fuel petrol parking'],
  Shopping:['amazon online store','flipkart clothes shoes','mall electronics retail'],
  Utilities:['electricity water bill','mobile airtel recharge','internet broadband service']
};
const categories = [...Object.keys(training),'Review'];
const vocabulary = new Set(Object.values(training).flatMap(examples=>examples.flatMap(words)));
const models = Object.entries(training).map(([category,examples])=>{
  const tokens = examples.flatMap(words);
  const count = new Map();
  tokens.forEach(token=>count.set(token,(count.get(token) ?? 0)+1));
  return {category,count,total:tokens.length};
});
function predict(description) {
  const tokens = words(description).filter(token=>vocabulary.has(token));
  if (!tokens.length) return 'Review';
  const scores = models.map(({category,count,total})=>({
    category,
    score:tokens.reduce((sum,word)=>sum+Math.log(((count.get(word) ?? 0)+1)/(total+vocabulary.size)),0)
  })).sort((a,b)=>b.score-a.score);
  return scores[0].score === scores[1].score ? 'Review' : scores[0].category;
}
function parse(source) {
  const grid = [];
  let row = [], field = '', quoted = false;
  for (let i=0;i<source.length;i++) {
    const c = source[i];
    if (c === '"') {
      if (quoted && source[i+1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && c === ',') {
      row.push(field);
      field = '';
    } else if (!quoted && c === '\n') {
      grid.push([...row,field.replace(/\r$/,'')]);
      row = [];
      field = '';
    } else field += c;
  }
  if (quoted) throw Error('The CSV contains an unclosed quote.');
  if (row.length || field) grid.push([...row,field.replace(/\r$/,'')]);
  const header = grid.shift()?.map(value=>value.trim().toLowerCase()) ?? [];
  const desc = header.indexOf('description'), amount = header.indexOf('amount');
  if (desc < 0 || amount < 0) throw Error('Include description and amount headers.');
  return grid.filter(values=>values.some(value=>value.trim())).map((values,index)=>{
    const description = values[desc]?.trim();
    const raw = values[amount]?.trim();
    if (!description || !raw || !Number.isFinite(Number(raw))) throw Error('Invalid description or amount on data row '+(index+1)+'.');
    return {description,amount:Number(raw),category:predict(description)};
  });
}
let rows = [];
function totals() {
  el('totals').replaceChildren(...categories.map(category=>{
    const amount = rows.filter(row=>row.category===category).reduce((sum,row)=>sum+row.amount,0);
    return node('p',category+' · '+amount.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}),'line');
  }));
}
function render() {
  el('rows').replaceChildren(...rows.map(row=>{
    const item = node('div',row.description+' · '+row.amount,'line row');
    const select = node('select','');
    select.setAttribute('aria-label','Category for '+row.description);
    select.append(...categories.map(category=>node('option',category)));
    select.value = row.category;
    select.onchange = () => {
      row.category = select.value;
      totals();
    };
    item.append(select);
    return item;
  }));
  el('export').disabled = !rows.length;
  totals();
}
function load(source) {
  try {
    const parsed = parse(source);
    if (parsed.length>500) throw Error('Use a CSV with up to 500 transactions.');
    rows = parsed;
    render();
    el('result').textContent = rows.length+' transactions loaded.';
  } catch (error) {
    el('result').textContent = error.message;
  }
}
el('sample').onclick = () => load('description,amount\nCorner Coffee,120\nMetro Recharge,500\nAmazon Electronics,2400\nElectricity Bill,780\nUnknown Merchant,100');
el('csv').onchange = async () => {
  const file = el('csv').files[0];
  if (!file) return;
  if (file.size>1e6) {
    el('result').textContent = 'Use a CSV under 1 MB.';
    return;
  }
  load(await file.text());
};
el('export').onclick = () => {
  const quote = value => '"'+String(value).replaceAll('"','""')+'"';
  const data = ['description,amount,category',...rows.map(row=>[quote(/^[=+@-]/.test(row.description) ? "'"+row.description : row.description),row.amount,quote(row.category)].join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([data],{type:'text/csv'}));
  const link = node('a','');
  link.href = url;
  link.download = 'categorized-transactions.csv';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
el('sample').click();
