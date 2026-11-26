import {el,node,busy,ai} from '../common.js';
const labels = ['plastic beverage bottle','paper or cardboard','metal drink can','unrelated object'];
let model;
let imageUrl;
el('photo').onchange = () => {
  const photo = el('photo').files[0];
  if (!photo) return;
  if (photo.size > 12e6 || !photo.type.startsWith('image/')) {
    el('result').textContent = 'Choose an image under 12 MB.';
    return;
  }
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = URL.createObjectURL(photo);
  el('preview').src = imageUrl;
  el('preview').hidden = false;
  el('empty').hidden = true;
  el('run').disabled = false;
  el('result').replaceChildren();
};
el('run').onclick = () => {
  el('photo').disabled = true;
  busy(el('run'),'Loading vision model and analyzing image…',async ()=>{
    try {
      if (!model) {
        const {pipeline} = await ai();
        model = await pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32',{dtype:'q8'});
      }
      const results = await model(imageUrl,labels);
      const [best,second] = [...results].sort((a,b)=>b.score-a.score);
      const unsure = best.label === labels[3] || best.score < .65 || best.score-second.score < .15;
      el('result').replaceChildren(node('strong',unsure ? 'Unsure' : best.label),node('p',unsure ? 'Try a closer photo of one item in brighter light.' : 'Check your local sorting rules for this material.'));
    } finally {
      el('photo').disabled = false;
    }
  });
};
