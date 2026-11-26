import {el,node} from '../common.js';
const bank = {
  Python: [
    ['How do lists and tuples differ?', ['mutable','immutable']],
    ['How do you handle an exception?', ['try','except']],
    ['How does a generator work?', ['yield','lazy']],
    ['How does a dictionary store data?', ['key','value']],
    ['What does a context manager do?', ['with','cleanup']]
  ],
  Java: [
    ['How does method overloading work?', ['same name','different parameter']],
    ['What does an interface define?', ['contract','implement']],
    ['How does a HashMap store data?', ['key','value']],
    ['How does garbage collection work?', ['memory','unreachable']],
    ['What does finally do?', ['exception','cleanup']]
  ]
};
let index = 0;
let reviews = [];
const questions = () => bank[el('track').value];
function render() {
  const complete = index >= questions().length;
  el('prompt').textContent = complete ? 'Practice complete.' : questions()[index][0];
  el('progress').textContent = reviews.length + ' of 5 reviewed';
  el('history').replaceChildren(...reviews.map((review,i)=>node('p','Question '+(i+1)+' · '+review,'line')));
  el('answer').value = '';
  el('answer').disabled = complete;
  el('run').disabled = complete;
  el('next').disabled = !complete;
  el('next').textContent = complete ? 'Restart' : 'Next question';
  el('result').replaceChildren();
}
function reset() {
  index = 0;
  reviews = [];
  render();
}
el('track').onchange = reset;
el('run').onclick = () => {
  const answer = el('answer').value.trim().toLowerCase();
  if (!answer) {
    el('result').textContent = 'Type your answer first.';
    return;
  }
  const criteria = questions()[index][1];
  const found = criteria.filter(point=>answer.includes(point) && (point !== 'mutable' || /\bmutable\b/.test(answer)));
  const missing = criteria.filter(point=>!found.includes(point));
  reviews[index] = found.length+' / '+criteria.length+' concepts detected';
  el('progress').textContent = reviews.length + ' of 5 reviewed';
  el('history').replaceChildren(...reviews.map((review,i)=>node('p','Question '+(i+1)+' · '+review,'line')));
  el('result').replaceChildren(node('strong',reviews[index]),node('p','Detected · '+(found.join(', ') || 'None')),node('p',missing.length ? 'Follow-up · Can you explain '+missing.join(' and ')+' with an example?' : 'Follow-up · Can you demonstrate your answer with a short code example?'),node('small','Feedback uses rubric phrase matching.'));
  el('next').disabled = false;
};
el('next').onclick = () => {
  if (index === questions().length) reset();
  else {
    index++;
    render();
  }
};
render();
