(function () {
  'use strict';
  const config = window.TIN_HOC_QUIZ;
  const root = document.getElementById('quiz');
  if (!config || !Array.isArray(config.questions) || !config.questions.length || !root) return;
  let index = 0, score = 0, answered = false;
  function el(tag, cls, content) {const node = document.createElement(tag);if(cls) node.className=cls;if(content!==undefined) node.textContent=String(content);return node;}
  function render() {
    answered = false;
    const item = config.questions[index];
    root.replaceChildren();
    const header=el('div','quiz-head');
    header.append(el('span','quiz-topic',(config.icon||'🎮')+' '+(config.topic||'Tin học')),el('span','quiz-count',`Câu ${index+1} / ${config.questions.length}`));
    const progress=el('div','progress');progress.setAttribute('role','progressbar');progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax',String(config.questions.length));progress.setAttribute('aria-valuenow',String(index));
    const fill=el('span');fill.style.width=`${index/config.questions.length*100}%`;progress.append(fill);
    const title=el('h1','quiz-title',item.question);
    const options=el('div','options');
    const feedback=el('div','feedback');feedback.setAttribute('aria-live','polite');
    const bottom=el('div','quiz-bottom');const scoreEl=el('span','score',`⭐ Điểm: ${score}`);const next=el('button','next',index===config.questions.length-1?'Xem kết quả →':'Câu tiếp theo →');next.type='button';next.disabled=true;
    item.options.forEach((answer,i)=>{
      const btn=el('button','option');btn.type='button';const label=el('span','letter',String.fromCharCode(65+i));btn.append(label,el('span','',answer));
      btn.addEventListener('click',()=>{
        if(answered) return;answered=true;const right=i===item.answer;if(right) score++;scoreEl.textContent=`⭐ Điểm: ${score}`;
        options.querySelectorAll('button').forEach((opt,j)=>{opt.disabled=true;if(j===item.answer)opt.classList.add('correct');else if(j===i)opt.classList.add('incorrect');});
        feedback.textContent=(right?'✅ Chính xác! ':'💡 Cùng ghi nhớ nhé! ')+(item.explanation||'');next.disabled=false;next.focus();
      });options.append(btn);
    });
    next.addEventListener('click',()=>{index++;if(index<config.questions.length)render();else finish();});
    bottom.append(scoreEl,next);root.append(header,progress,title,options,feedback,bottom);
  }
  function finish(){
    root.replaceChildren();const box=el('div','finish');
    const max=config.questions.length;box.append(el('div','finish-icon',score===max?'🏆':'🌟'),el('h1','',score===max?'Em thật xuất sắc!':'Em đã hoàn thành!'),el('p','',score===max?'Em đã trả lời đúng tất cả các câu hỏi!':'Rất tốt! Hãy thử lại để hiểu thêm và ghi nhớ kiến thức nhé.'),el('div','finish-score',`${score} / ${max} điểm`));
    const replay=el('button','','↻ Chơi lại từ đầu');replay.type='button';replay.addEventListener('click',()=>{index=0;score=0;render();});box.append(replay);root.append(box);
  }
  render();
}());
