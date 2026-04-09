import{t as e}from"./chunk-DtRyYLXJ.js";import{t}from"./foundation-C9ak9BLo.js";var n=e({Text:()=>r}),r=class extends t{constructor(e={},t={}){super({...e,componentType:`text`},t),this.variant=e.variant??`body`,this.content=e.content??``,this.level=e.level??2,this.statusType=e.statusType??`info`,this.label=e.label??``,this.value=e.value??``,this.unit=e.unit??``,this.precision=e.precision??2,this.contentEl=null,this.valueEl=null}render(){if(this.element)return this.element;let{F:e,F2:t}=this.getF();switch(this.variant){case`heading`:return this._renderHeading(e,t);case`markdown`:return this._renderMarkdown(e);case`status`:return this._renderStatus(e,t);case`value`:return this._renderValue(e,t);default:return this._renderBody(e,t)}}_renderHeading(e,t){let n=`h${Math.max(1,Math.min(6,this.level))}`;this.element=document.createElement(n),this.element.className=`text text-heading component`;let r={1:e*2,2:e*1.5,3:e,4:e,5:e,6:e};return this.element.style.cssText=`
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${r[this.level]??e}px;
            font-weight: bold;
            color: var(--c-text);
            margin: 0;
            text-transform: uppercase;
        `,this.element.textContent=this.content,this.element}_parseMarkdown(e){let t=e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`),n=e=>t(e).replace(/`([^`]+)`/g,`<code>$1</code>`).replace(/\*\*([^*]+)\*\*/g,`<strong>$1</strong>`).replace(/\*([^*]+)\*/g,`<em>$1</em>`),r=e.split(`
`),i=[],a=0;for(;a<r.length;){let e=r[a];if(/^## /.test(e)){i.push(`<h4 style="margin:0.75em 0 0.25em;font-size:inherit;font-weight:bold;">${n(e.slice(3))}</h4>`),a++;continue}if(/^# /.test(e)){i.push(`<h3 style="margin:0.75em 0 0.25em;font-size:inherit;font-weight:bold;">${n(e.slice(2))}</h3>`),a++;continue}if(/^- /.test(e)){let e=[];for(;a<r.length&&/^- /.test(r[a]);)e.push(`<li>${n(r[a].slice(2))}</li>`),a++;i.push(`<ul style="margin:0.25em 0;padding-left:1.25em;">${e.join(``)}</ul>`);continue}if(e.trim()===``){i.push(`<br>`),a++;continue}i.push(`<p style="margin:0.25em 0;">${n(e)}</p>`),a++}return i.join(``)}_renderMarkdown(e){return this.element=this.createElement(`div`,`text text-markdown component`),this.element.style.cssText=`
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${e}px;
            color: var(--c-text);
            line-height: 1.5;
        `,this.element.innerHTML=this._parseMarkdown(this.content),this.element}_renderBody(e,t){return this.element=this.createElement(`p`,`text text-body component`),this.element.style.cssText=`
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${e}px;
            color: var(--c-text);
            margin: 0;
            line-height: 1.5;
        `,this.element.textContent=this.content,this.element}_renderStatus(e,t){this.element=this.createElement(`div`,`text text-status component`);let n={info:`var(--c-text)`,success:`var(--vga-green, #00AA00)`,warning:`var(--vga-yellow, #AAAA00)`,error:`var(--vga-red, #AA0000)`};return this.element.style.cssText=`
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${e}px;
            color: ${n[this.statusType]??n.info};
            padding: ${t}px ${e}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `,this.contentEl=this.createElement(`span`,`status-content`),this.contentEl.textContent=this.content,this.element.appendChild(this.contentEl),this.element}_renderValue(e,t){if(this.element=this.createElement(`div`,`text text-value component`),this.element.style.cssText=`
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${e}px;
            color: var(--c-text);
            gap: ${e}px;
        `,this.label){let e=this.createElement(`span`,`value-label`);e.textContent=this.label,e.style.opacity=`0.7`,this.element.appendChild(e)}let n=this.createElement(`span`,`value-wrapper`);if(this.valueEl=this.createElement(`span`,`value-content`),this.valueEl.textContent=this._formatValue(),n.appendChild(this.valueEl),this.unit){let e=this.createElement(`span`,`value-unit`);e.textContent=this.unit,e.style.opacity=`0.7`,e.style.marginLeft=`${t}px`,n.appendChild(e)}return this.element.appendChild(n),this.element}_formatValue(){return typeof this.value==`number`?Number.isInteger(this.value)?String(this.value):this.value.toFixed(this.precision):String(this.value??this.content)}setContent(e){this.content=e,this.variant===`status`&&this.contentEl?this.contentEl.textContent=e:this.element&&(this.element.textContent=e)}setValue(e){this.value=e,this.valueEl?this.valueEl.textContent=this._formatValue():this.setContent(String(e))}setStatus(e,t){if(this.statusType=e,t!==void 0&&(this.content=t),this.element&&this.variant===`status`){let t={info:`var(--c-text)`,success:`var(--vga-green, #00AA00)`,warning:`var(--vga-yellow, #AAAA00)`,error:`var(--vga-red, #AA0000)`};this.element.style.color=t[e]??t.info,this.contentEl&&(this.contentEl.textContent=this.content)}}};export{n,r as t};